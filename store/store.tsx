import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";

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
  [month: string]: { [tag: string]: number };
}

interface Analytics {
  totalIncome: number;
  totalExpense: number;
  expenseByCategory: { [category: string]: number };
  totalBudget: number;
  totalSpent: number;
}

interface BudgetProgress {
  budget: number;
  spent: number;
  remaining: number;
}

const DEFAULT_TAGS = [
  "Groceries",
  "Rent/Mortgage",
  "Utilities",
  "Transportation",
  "Healthcare",
  "Insurance",
  "Dining Out",
  "Entertainment",
  "Subscriptions",
  "Shopping",
  "Hobbies",
];

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
  setBudget: (month: string, tagBudgets: { [tag: string]: number }) => void;
  removeBudget: (month: string, tag: string) => void;
  setCurrency: (currency: string) => void;
  setSelectedPeriod: (period: Period) => void;
  addTag: (tag: string) => void;
  editTag: (oldTag: string, newTag: string) => void;
  deleteTag: (tag: string) => void;
  getTags: () => string[];
  initializeTags: () => void;
  getTransactionsByPeriod: (
    period: Period,
    currentDate: string
  ) => Transaction[];
  getAnalytics: (period: Period, currentDate: string) => Analytics;
  getBudgetProgress: (month: string) => BudgetProgress;
  getTransactionsByTag: (tag: string) => Transaction[];
  getTagsWithoutBudget: (month: string) => string[];
}

// Create the store
const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      transactions: [],
      budgets: {},
      tags: [],
      currentDate: new Date().toISOString(),
      selectedCurrency: "",
      selectedPeriod: "month",

      setCurrency: (currency) => set({ selectedCurrency: currency }),
      setSelectedPeriod: (period) => set({ selectedPeriod: period }),

      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [
            ...state.transactions,
            { ...transaction, id: Date.now() },
          ],
        })),

      editTransaction: (id, updatedTransaction) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updatedTransaction } : t
          ),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      setBudget: (month, tagBudgets: { [tag: string]: number }) =>
        set((state) => ({
          budgets: {
            ...state.budgets,
            [month]: { ...state.budgets[month], ...tagBudgets },
          },
        })),

      addTag: (tag) =>
        set((state) => ({
          tags: [...state.tags, tag],
        })),

      editTag: (oldTag, newTag) =>
        set((state) => ({
          tags: state.tags.map((t) => (t === oldTag ? newTag : t)),
          transactions: state.transactions.map((transaction) => ({
            ...transaction,
            tags: transaction.tags.map((t) => (t === oldTag ? newTag : t)),
          })),
        })),

      deleteTag: (tag) =>
        set((state) => ({
          tags: state.tags.filter((t) => t !== tag),
          transactions: state.transactions.map((transaction) => ({
            ...transaction,
            tags: transaction.tags.filter((t) => t !== tag),
          })),
        })),

      getTags: () => get().tags,

      initializeTags: () => {
        const { tags } = get();
        if (tags.length === 0) {
          set({ tags: DEFAULT_TAGS });
        }
      },

      getTransactionsByPeriod: (period, currentDate) => {
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
            startDate.setTime(monday.getTime());
            endDate.setTime(sunday.getTime());
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

      getAnalytics: (period, currentDate) => {
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

        const month = new Date(currentDate).toISOString().slice(0, 7);
        const { budget: totalBudget } = get().getBudgetProgress(month);

        return {
          totalIncome,
          totalExpense,
          expenseByCategory,
          totalBudget,
          totalSpent: totalExpense,
        };
      },

      removeBudget: (month, tag) =>
        set((state) => {
          const newMonthBudgets = { ...state.budgets[month] };
          delete newMonthBudgets[tag];
          return {
            budgets: {
              ...state.budgets,
              [month]: newMonthBudgets,
            },
          };
        }),

      getBudgetProgress: (month) => {
        const { budgets, transactions } = get();
        const monthBudgets = budgets[month] || {};
        const budget = Object.values(monthBudgets).reduce(
          (sum, amount) => sum + amount,
          0
        );
        const spent = transactions
          .filter(
            (t) =>
              t.type === "expense" &&
              t.date.startsWith(month) &&
              t.tags.some((tag) => tag in monthBudgets)
          )
          .reduce((sum, t) => sum + t.amount, 0);
        return { budget, spent, remaining: budget - spent };
      },

      getTransactionsByTag: (tag) => {
        const { transactions } = get();
        return transactions.filter((t) => t.tags.includes(tag));
      },

      getTagsWithoutBudget: (month) => {
        const { tags, budgets } = get();
        const monthBudgets = budgets[month] || {};
        return tags.filter((tag) => !(tag in monthBudgets));
      },
    }),
    {
      name: "budgetku",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.initializeTags();
        }
      },
    }
  )
);

// Helper function to get the start and end dates of the week
function getWeekDates(date: Date) {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(date);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
}

export default useStore;
