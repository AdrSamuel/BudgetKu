import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  ScrollView,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import useStore from "@/store/store";
import { Ionicons } from "@expo/vector-icons";
import { PieChart } from "react-native-chart-kit";

type Period = "day" | "week" | "month";

const Header = ({
  currentDate,
  setCurrentDate,
  selectedPeriod,
  setSelectedPeriod,
}: {
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  selectedPeriod: Period;
  setSelectedPeriod: React.Dispatch<React.SetStateAction<Period>>;
}) => {
  const { getAnalytics, selectedCurrency, setCurrency, transactions } =
    useStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const data = getAnalytics(selectedPeriod, currentDate.toISOString());
      setAnalyticsData(data);
    } catch (err) {
      setError("Failed to fetch analytics data");
    }
  }, [getAnalytics, selectedPeriod, currentDate, transactions]);

  useEffect(() => {
    if (!selectedCurrency) {
      setCurrency("IDR");
    }
  }, [selectedCurrency, setCurrency]);

  const getWeekDates = (date: Date) => {
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(date);
    monday.setDate(monday.getDate() + diff);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    return { monday, sunday };
  };

  const formatDate = (date: Date, period: Period) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      weekday: "short",
      day: "numeric",
    };

    if (period === "week") {
      const { monday, sunday } = getWeekDates(new Date(date));
      return `${monday.toLocaleDateString("en-US", options)} - 
${sunday.toLocaleDateString("en-US", options)}`;
    }

    return date.toLocaleDateString(
      "en-US",
      period === "month" ? { year: "numeric", month: "long" } : options
    );
  };

  const currencyFormatters = {
    IDR: new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }),
    USD: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
  };

  const formatter =
    currencyFormatters[selectedCurrency as "IDR" | "USD"] ||
    currencyFormatters["USD"];

  const changeDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    switch (selectedPeriod) {
      case "day":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
        break;
      case "week":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
        break;
    }
    setCurrentDate(newDate);
  };

  const periodOptions: Period[] = ["day", "week", "month"];

  return (
    <View style={styles.header}>
      <View style={styles.dateSelector}>
        <TouchableOpacity onPress={() => changeDate("prev")}>
          <Ionicons name="chevron-back" size={24} color="#fbf1c7" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.title}>
            {formatDate(currentDate, selectedPeriod)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => changeDate("next")}>
          <Ionicons name="chevron-forward" size={24} color="#fbf1c7" />
        </TouchableOpacity>
      </View>

      <View style={styles.periodSelector}>
        {periodOptions.map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodOption,
              selectedPeriod === period && styles.selectedPeriod,
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text
              style={[
                styles.periodOptionText,
                selectedPeriod === period && styles.selectedPeriodText,
              ]}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {analyticsData && (
        <View style={styles.analytics}>
          <View style={styles.detailsRow}>
            <Text style={styles.details}>Income:</Text>
            <Text style={styles.detailsGreen}>
              {formatter.format(analyticsData.totalIncome)}
            </Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.details}>Expense:</Text>
            <Text style={styles.detailsRed}>
              {formatter.format(analyticsData.totalExpense)}
            </Text>
          </View>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalBackButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="arrow-back" size={24} color="#fbf1c7" />
              </TouchableOpacity>
              <Text style={styles.modalHeaderText}>Format</Text>
            </View>
            <FlatList
              data={periodOptions}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedPeriod(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.details}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const ExpenseOverview = ({
  selectedPeriod,
  currentDate,
}: {
  selectedPeriod: Period;
  currentDate: Date;
}) => {
  const { getTransactionsByTag, selectedCurrency, getTagColor, tags } =
    useStore();
  const [expenseData, setExpenseData] = useState<{ [tag: string]: number }>({});
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    const startDate = new Date(currentDate);
    let endDate = new Date(currentDate);

    switch (selectedPeriod) {
      case "day":
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "week":
        startDate.setDate(startDate.getDate() - startDate.getDay());
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
        endDate.setHours(23, 59, 59, 999);
        break;
      case "month":
        startDate.setDate(1);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
        endDate.setHours(23, 59, 59, 999);
        break;
    }

    const expenseByTag: { [tag: string]: number } = {};
    let total = 0;

    tags.forEach((tag) => {
      const transactions = getTransactionsByTag(tag);
      const tagExpense = transactions
        .filter(
          (t) =>
            t.type === "expense" &&
            new Date(t.date) >= startDate &&
            new Date(t.date) <= endDate
        )
        .reduce((sum, t) => sum + t.amount, 0);

      if (tagExpense > 0) {
        expenseByTag[tag] = tagExpense;
        total += tagExpense;
      }
    });

    setExpenseData(expenseByTag);
    setTotalExpense(total);
  }, [getTransactionsByTag, selectedPeriod, currentDate, tags]);

  const currencyFormatters = {
    IDR: new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }),
    USD: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
  };

  const formatter =
    currencyFormatters[selectedCurrency as "IDR" | "USD"] ||
    currencyFormatters["USD"];

  const chartData = Object.entries(expenseData).map(([tag, amount]) => {
    const percentage = (amount / totalExpense) * 100;
    return {
      name: `${tag} (${percentage.toFixed(1)}%)`,
      amount,
      percentage,
      color: getTagColor(tag),
      legendFontColor: "#fbf1c7",
      legendFontSize: 12,
    };
  });

  return (
    <ScrollView style={styles.expenseOverviewContainer}>
      <Text style={styles.expenseOverviewTitle}>Expense Overview</Text>
      {totalExpense > 0 ? (
        <>
          <View style={styles.chartContainer}>
            <PieChart
              data={chartData}
              width={300}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
          <View style={styles.detailsContainer}>
            {chartData.map((item) => (
              <View key={item.name} style={styles.detailItem}>
                <View
                  style={[styles.colorDot, { backgroundColor: item.color }]}
                />
                <Text style={styles.detailText}>{item.name}</Text>
                <Text style={styles.detailText}>
                  {formatter.format(item.amount)}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>
              Total Expenses: {formatter.format(totalExpense)}
            </Text>
          </View>
        </>
      ) : (
        <Text style={styles.noExpensesText}>
          No expenses recorded for this period.
        </Text>
      )}
    </ScrollView>
  );
};

const AnalyticPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("month");

  return (
    <SafeAreaProvider style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header
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
  header: {
    padding: 20,
  },
  dateSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  periodSelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  periodOption: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#fbf1c7",
  },
  selectedPeriod: {
    backgroundColor: "#fbf1c7",
  },
  periodOptionText: {
    color: "#fbf1c7",
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
  },
  selectedPeriodText: {
    color: "#282828",
  },
  analytics: {
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalHeader: {
    flexDirection: "row",
    gap: 2,
    alignItems: "center",
    marginBottom: 20,
  },
  modalHeaderText: {
    color: "#fbf1c7",
    gap: 2,
    fontSize: 20,
    fontFamily: "PlusJakartaSans",
    flex: 1,
    textAlign: "center",
  },
  modalContent: {
    backgroundColor: "#282828",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalBackButton: {
    marginBottom: 10,
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#fbf1c7",
  },
  title: {
    fontFamily: "PlusJakartaSans",
    fontSize: 24,
    paddingVertical: 10,
    paddingTop: 0,
    color: "#fbf1c7",
  },
  details: {
    fontFamily: "PlusJakartaSans",
    fontSize: 20,
    padding: 10,
    paddingTop: 0,
    color: "#fbf1c7",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  detailsRed: {
    fontFamily: "PlusJakartaSans",
    fontSize: 20,
    padding: 10,
    paddingTop: 0,
    color: "#fb4934",
  },
  detailsGreen: {
    fontFamily: "PlusJakartaSans",
    fontSize: 20,
    padding: 10,
    paddingTop: 0,
    color: "#b8bb26",
  },
  // New styles for Expense Overview
  expenseOverviewContainer: {
    flex: 1,
    padding: 20,
  },
  expenseOverviewTitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 24,
    color: "#fbf1c7",
    marginBottom: 20,
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    marginBottom: 10,
  },
  colorBox: {
    width: 20,
    height: 20,
    marginRight: 5,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: "#fbf1c7",
  },
  detailsContainer: {
    marginTop: 20,
  },
  detailItem: {
    marginBottom: 15,
  },
  detailText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: "#fbf1c7",
    marginBottom: 5,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  barContainer: {
    height: 10,
    backgroundColor: "#3c3836",
    borderRadius: 5,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 5,
  },
  totalContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#fbf1c7",
    paddingTop: 8,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fbf1c7",
  },
  noExpensesText: {
    fontSize: 16,
    color: "#fbf1c7",
    textAlign: "center",
    marginTop: 20,
  },
});

export default AnalyticPage;
