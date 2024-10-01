import { create, StateCreator } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, PersistOptions, createJSONStorage } from "zustand/middleware";

// Define types
type TransactionType = "income" | "expense";
type Period = "day" | "week" | "month";

interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  tags: string[];
}

interface Budget {
  [month: string]: number;
}

interface Analytics {
  totalIncome: number;
  totalExpense: number;
  expenseByCategory: { [category: string]: number };
}

interface BudgetProgress {
  budget: number;
  spent: number;
  remaining: number;
}

// Define the store state
interface StoreState {
  transactions: Transaction[];
  budgets: Budget;
  tags: string[];
  currentDate: string;
  selectedCurrency: string;
  selectedPeriod: Period;

  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  editTransaction: (
    id: number,
    updatedTransaction: Partial<Transaction>
  ) => void;
  deleteTransaction: (id: number) => void;
  setBudget: (month: string, amount: number) => void;
  setCurrency: (currency: string) => void;
  setSelectedPeriod: (period: Period) => void;
  addTag: (tag: string) => void;
  editTag: (oldTag: string, newTag: string) => void;
  deleteTag: (tag: string) => void;
  getTags: () => string[];
  getTransactionsByPeriod: (
    period: Period,
    currentDate: string
  ) => Transaction[];
  getAnalytics: (period: Period, currentDate: string) => Analytics;
  getBudgetProgress: (month: string) => BudgetProgress;
  getTransactionsByTag: (tag: string) => Transaction[];
}

type StoreActions = Pick<
  StoreState,
  | "addTransaction"
  | "editTransaction"
  | "deleteTransaction"
  | "setBudget"
  | "addTag"
  | "editTag"
  | "deleteTag"
  | "getTags"
  | "getTransactionsByPeriod"
  | "getAnalytics"
  | "getBudgetProgress"
  | "getTransactionsByTag"
  | "setCurrency"
>;

// Persist options type
type BudgetPersist = (
  config: StateCreator<StoreState>,
  options: PersistOptions<StoreState>
) => StateCreator<StoreState>;

// Create the store
const useStore = create<StoreState>()(
  (persist as unknown as BudgetPersist)(
    (set, get) => ({
      transactions: [],
      budgets: {},
      tags: [],
      currentDate: new Date().toISOString(),
      selectedCurrency: "",
      selectedPeriod: "month",

      setCurrency: (currency) => set({ selectedCurrency: currency }),
      setSelectedPeriod: (period) => set({ selectedPeriod: period }),

      addTransaction: (transaction: Omit<Transaction, "id">) =>
        set((state) => ({
          transactions: [
            ...state.transactions,
            { ...transaction, id: Date.now() },
          ],
        })),

      setBudget: (month: string, amount: number) =>
        set((state) => ({
          budgets: { ...state.budgets, [month]: amount },
        })),

      addTag: (tag: string) =>
        set((state) => ({
          tags: [...state.tags, tag],
        })),

      editTag: (oldTag: string, newTag: string) =>
        set((state) => ({
          tags: state.tags.map((t) => (t === oldTag ? newTag : t)),
          transactions: state.transactions.map((transaction) => ({
            ...transaction,
            tags: transaction.tags.map((t) => (t === oldTag ? newTag : t)),
          })),
        })),

      deleteTag: (tag: string) =>
        set((state) => ({
          tags: state.tags.filter((t) => t !== tag),
          transactions: state.transactions.map((transaction) => ({
            ...transaction,
            tags: transaction.tags.filter((t) => t !== tag),
          })),
        })),

      getTags: () => get().tags,

      getTransactionsByPeriod: (period: Period, currentDate: string) => {
        const { transactions } = get();
        const startDate = new Date(currentDate);
        let endDate = new Date(currentDate);

        switch (period) {
          case "day":
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            break;
          case "week":
            const { monday, sunday } = getWeekDates(startDate);
            startDate.setHours(0, 0, 0, 0);
            startDate.setDate(monday.getDate());
            endDate.setDate(sunday.getDate());
            break;
          case "month":
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(
              startDate.getFullYear(),
              startDate.getMonth() + 1,
              0,
              23,
              59,
              59,
              999
            );
            break;
        }

        return transactions.filter((t) => {
          const transactionDate = new Date(t.date);
          return transactionDate >= startDate && transactionDate <= endDate;
        });
      },

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      editTransaction: (id, updatedTransaction) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updatedTransaction } : t
          ),
        })),

      getAnalytics: (period: Period, currentDate: string) => {
        const transactions = get().getTransactionsByPeriod(period, currentDate);
        const totalIncome = transactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);
        const expenseByCategory = transactions
          .filter((t) => t.type === "expense")
          .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
          }, {} as { [category: string]: number });

        return { totalIncome, totalExpense, expenseByCategory };
      },

      getBudgetProgress: (month: string) => {
        const { budgets, transactions } = get();
        const budget = budgets[month] || 0;
        const expenses = transactions
          .filter((t) => t.type === "expense" && t.date.startsWith(month))
          .reduce((sum, t) => sum + t.amount, 0);
        return { budget, spent: expenses, remaining: budget - expenses };
      },

      getTransactionsByTag: (tag: string) => {
        const { transactions } = get();
        return transactions.filter((t) => t.tags.includes(tag));
      },
    }),
    {
      name: "budgetku",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
// Helper function to get the start and end dates of the week
function getWeekDates(date: Date) {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(date.setDate(diff));
  const sunday = new Date(date.setDate(diff + 6));
  return { monday, sunday };
}

export default useStore;
