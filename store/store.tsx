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
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  editTransaction: (
    id: number,
    updatedTransaction: Partial<Transaction>
  ) => void;
  deleteTransaction: (id: number) => void;
  setBudget: (month: string, amount: number) => void;
  addTag: (tag: string) => void;
  getTransactionsByPeriod: (period: Period) => Transaction[];
  getAnalytics: (period: Period) => Analytics;
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
  | "getTransactionsByPeriod"
  | "getAnalytics"
  | "getBudgetProgress"
  | "getTransactionsByTag"
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

      addTransaction: (transaction: Omit<Transaction, "id">) =>
        set((state) => ({
          transactions: [
            ...state.transactions,
            { ...transaction, id: Date.now() },
          ],
        })),

      editTransaction: (id: number, updatedTransaction: Partial<Transaction>) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updatedTransaction } : t
          ),
        })),

      deleteTransaction: (id: number) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      setBudget: (month: string, amount: number) =>
        set((state) => ({
          budgets: { ...state.budgets, [month]: amount },
        })),

      addTag: (tag: string) =>
        set((state) => ({
          tags: [...state.tags, tag],
        })),

      getTransactionsByPeriod: (period: Period) => {
        const { transactions } = get();
        const now = new Date();
        let startDate: Date;

        switch (period) {
          case "day":
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case "week":
            startDate = new Date(now.setDate(now.getDate() - now.getDay()));
            break;
          case "month":
            startDate = new Date(now.setDate(1));
            break;
          default:
            return transactions;
        }

        return transactions.filter((t) => new Date(t.date) >= startDate);
      },

      getAnalytics: (period: Period) => {
        const transactions = get().getTransactionsByPeriod(period);
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

export default useStore;
