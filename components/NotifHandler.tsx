import * as Notifications from "expo-notifications";
import useStore from "@/store/store";

export const scheduleDailyReminder = async () => {
  const { notificationSettings } = useStore.getState();
  if (!notificationSettings.dailyReminder) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Daily Spending Reminder",
      body: "Have you tracked all your expenses for today? Stay within your daily limit to meet your monthly budget!",
    },
    trigger: {
      hour: 20, // 8 PM
      minute: 0,
      repeats: true,
    },
  });
};

// export const checkOverspending = async () => {
//   const { notificationSettings, getAnalytics, currentDate, selectedPeriod } =
//     useStore.getState();
//   if (!notificationSettings.overspendingWarning) return;

//   const { totalExpense, totalBudget } = getAnalytics(
//     selectedPeriod,
//     currentDate
//   );
//   if (totalExpense > totalBudget * 0.9) {
//     // 90% of budget
//     await Notifications.scheduleNotificationAsync({
//       content: {
//         title: "Budget Alert: Overspending",
//         body: "You've exceeded 90% of your budget for this period! Adjust your spending to stay on track.",
//       },
//       trigger: null,
//     });
//   }
// };

// export const scheduleWeeklyReport = async () => {
//   const { notificationSettings } = useStore.getState();
//   if (!notificationSettings.weeklyReport) return;

//   await Notifications.scheduleNotificationAsync({
//     content: {
//       title: "Weekly Spending Report",
//       body: "Your weekly spending report is ready. Open the app to review your progress!",
//     },
//     trigger: {
//       weekday: 1, // Monday
//       hour: 9, // 9 AM
//       minute: 0,
//       repeats: true,
//     },
//   });
// };

export const setupNotifications = async () => {
  await Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  await scheduleDailyReminder();
};
