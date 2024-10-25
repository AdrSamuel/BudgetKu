import React, { useEffect } from "react";
import { StyleSheet, Text, View, Switch, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useStore from "@/store/store";
import * as Notifications from "expo-notifications";
import { scheduleDailyReminder } from "@/components/NotifHandler";

const Notif = () => {
  const insets = useSafeAreaInsets();
  const { notificationSettings, updateNotificationSettings } = useStore();

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const toggleNotification = (key: keyof typeof notificationSettings) => {
    updateNotificationSettings({ [key]: !notificationSettings[key] });
  };

  const registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
  };
  // const testNotification = async () => {
  //   await scheduleDailyReminder();
  // };

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Notification Settings</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Daily Spending Reminder</Text>
          <Switch
            value={notificationSettings.dailyReminder}
            onValueChange={() => toggleNotification("dailyReminder")}
            trackColor={{ false: "#767577", true: "#b8bb26" }}
            thumbColor={
              notificationSettings.dailyReminder ? "#fbf1c7" : "#f4f3f4"
            }
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Overspending Warning</Text>
          <Switch
            value={notificationSettings.overspendingWarning}
            onValueChange={() => toggleNotification("overspendingWarning")}
            trackColor={{ false: "#767577", true: "#b8bb26" }}
            thumbColor={
              notificationSettings.overspendingWarning ? "#fbf1c7" : "#f4f3f4"
            }
          />
        </View>
        {/* <View style={styles.settingItem}>
          <Text style={styles.settingText}>Weekly Spending Report</Text>
          <Switch
            value={notificationSettings.weeklyReport}
            onValueChange={() => toggleNotification("weeklyReport")}
            trackColor={{ false: "#767577", true: "#b8bb26" }}
            thumbColor={
              notificationSettings.weeklyReport ? "#fbf1c7" : "#f4f3f4"
            }
          />
        </View> */}
        {/* <TouchableOpacity style={styles.testButton} onPress={testNotification}>
          <Text style={styles.testButtonText}>Test Notification</Text>
        </TouchableOpacity> */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#282828",
  },
  header: {
    padding: 20,
  },
  title: {
    fontFamily: "PlusJakartaSans",
    fontSize: 24,
    color: "#fbf1c7",
    marginBottom: 20,
  },
  content: {
    padding: 20,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#fbf1c7",
  },
  settingText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: "#fbf1c7",
  },
  testButton: {
    backgroundColor: "#b8bb26",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
  },
  testButtonText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: "#282828",
  },
});

export default Notif;
