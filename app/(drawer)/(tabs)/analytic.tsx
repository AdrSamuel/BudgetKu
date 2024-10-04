import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AnalyticHeader from "@/components/AnalyticHeader";
import ExpenseOverview from "@/components/ExpenseOverview";

type Period = "day" | "week" | "month";

const AnalyticPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("month");

  return (
    <SafeAreaProvider style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AnalyticHeader
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
        />
        <ExpenseOverview
          selectedPeriod={selectedPeriod}
          currentDate={currentDate}
        />
      </ScrollView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#282828",
  },
});

export default AnalyticPage;
