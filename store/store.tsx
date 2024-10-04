import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { persist, createJSONStorage } from "zustand/middleware";
import * as Notifications from "expo-notifications";

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

interface NotificationSettings {
  dailyReminder: boolean;
  overspendingWarning: boolean;
  weeklyReport: boolean;
}

const DEFAULT_TAGS = [
  { name: "Groceries", color: "#FF6B6B" },
  { name: "Rent/Mortgage", color: "#4ECDC4" },
  { name: "Utilities", color: "#45B7D1" },
  { name: "Transportation", color: "#FFA07A" },
  { name: "Healthcare", color: "#98D8C8" },
  { name: "Insurance", color: "#F7DC6F" },
  { name: "Dining Out", color: "#FF7F50" },
  { name: "Entertainment", color: "#9B59B6" },
  { name: "Subscriptions", color: "#3498DB" },
  { name: "Shopping", color: "#E74C3C" },
  { name: "Hobbies", color: "#2ECC71" },
];

interface TagColor {
  [tag: string]: string;
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
  setBudget: (month: string, tagBudgets: { [tag: string]: number }) => void;
  removeBudget: (month: string, tag: string) => void;
  setCurrency: (currency: string) => void;
  setSelectedPeriod: (period: Period) => void;
  addTag: (tag: string) => void;
  editTag: (oldTag: string, newTag: string) => void;
  deleteTag: (tag: string) => void;
  getTags: () => string[];
  getTagColor: (tag: string) => string;
  initializeTags: () => void;
  tagColors: TagColor;
  getTransactionsByPeriod: (
    period: Period,
    currentDate: string
  ) => Transaction[];
  getAnalytics: (period: Period, currentDate: string) => Analytics;
  getBudgetProgress: (month: string) => BudgetProgress;
  getTransactionsByTag: (tag: string) => Transaction[];
  getTagsWithoutBudget: (month: string) => string[];
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  checkOverspending: () => Promise<void>;
}

const generateRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Create the store
const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      transactions: [],
      budgets: {},
      tags: [],
      tagColors: {},
      currentDate: new Date().toISOString(),
      selectedCurrency: "",
      selectedPeriod: "month",

      checkOverspending: async () => {
        const { notificationSettings, transactions, budgets, currentDate } =
          get();
        const month = currentDate.slice(0, 7); // Format as "YYYY-MM" for the current month

        // Ensure overspending warning is enabled
        if (!notificationSettings.overspendingWarning) return;

        // Get budgets for the current month
        const monthBudgets = budgets[month] || {};

        // Track total spent for tags with budgets
        let totalSpent = 0;
        let totalBudget = 0;

        // Filter expenses for this month
        const currentMonthExpenses = transactions.filter(
          (t) => t.type === "expense" && t.date.startsWith(month)
        );

        // Sum up the budget and expenses for tags that have budgets
        currentMonthExpenses.forEach((expense) => {
          expense.tags.forEach((tag) => {
            if (monthBudgets[tag]) {
              totalSpent += expense.amount;
              totalBudget += monthBudgets[tag];
            }
          });
        });

        // Check if total spent exceeds 90% of total budget
        if (totalBudget > 0 && totalSpent > totalBudget * 0.9) {
          try {
            const notificationId =
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: "Budget Alert: Overspending",
                  body: "You've spent more than 90% of your budget for this period! Be careful with your remaining spending.",
                },
                trigger: null, // Send immediately
              });
            console.log(
              "Notification scheduled successfully. ID:",
              notificationId
            );
          } catch (error) {
            console.error("Error scheduling overspending notification:", error);
          }
        } else {
          console.log("No overspending detected.");
        }
      },

      setCurrency: (currency) => set({ selectedCurrency: currency }),
      setSelectedPeriod: (period) => set({ selectedPeriod: period }),

      addTransaction: (transaction) => {
        set((state) => ({
          transactions: [
            ...state.transactions,
            { ...transaction, id: Date.now() },
          ],
        }));
        get().checkOverspending();
      },

      editTransaction: (id, updatedTransaction) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updatedTransaction } : t
          ),
        }));
        get().checkOverspending();
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      setBudget: (month, tagBudgets: { [tag: string]: number }) => {
        set((state) => ({
          budgets: {
            ...state.budgets,
            [month]: { ...state.budgets[month], ...tagBudgets },
          },
        }));
        get().checkOverspending();
      },

      addTag: (tag) =>
        set((state) => {
          const newColor = generateRandomColor();
          return {
            tags: [...state.tags, tag],
            tagColors: { ...state.tagColors, [tag]: newColor },
          };
        }),

      editTag: (oldTag, newTag) =>
        set((state) => {
          const newTagColors = { ...state.tagColors };
          newTagColors[newTag] = newTagColors[oldTag];
          delete newTagColors[oldTag];
          return {
            tags: state.tags.map((t) => (t === oldTag ? newTag : t)),
            transactions: state.transactions.map((transaction) => ({
              ...transaction,
              tags: transaction.tags.map((t) => (t === oldTag ? newTag : t)),
            })),
            tagColors: newTagColors,
          };
        }),

      deleteTag: (tag) =>
        set((state) => {
          const newTagColors = { ...state.tagColors };
          delete newTagColors[tag];
          return {
            tags: state.tags.filter((t) => t !== tag),
            transactions: state.transactions.map((transaction) => ({
              ...transaction,
              tags: transaction.tags.filter((t) => t !== tag),
            })),
            tagColors: newTagColors,
          };
        }),

      getTags: () => get().tags,

      getTagColor: (tag: string) => {
        const { tagColors } = get();
        return tagColors[tag] || "#999999"; // Default color if not found
      },

      initializeTags: () => {
        const { tags, tagColors } = get();
        if (tags.length === 0) {
          set({
            tags: DEFAULT_TAGS.map((t) => t.name),
            tagColors: Object.fromEntries(
              DEFAULT_TAGS.map((t) => [t.name, t.color])
            ),
          });
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

      notificationSettings: {
        dailyReminder: true,
        overspendingWarning: true,
        weeklyReport: false,
      },

      updateNotificationSettings: (settings) =>
        set((state) => ({
          notificationSettings: { ...state.notificationSettings, ...settings },
        })),
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
