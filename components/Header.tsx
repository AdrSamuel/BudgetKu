import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import useStore from "@/store/store";
import { Ionicons } from "@expo/vector-icons";
import AddIncomeExpense from "./AddIncomeExpense";
import History from "./History";

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
  const { getAnalytics, selectedCurrency, setCurrency } = useStore();
  const [modalVisible, setModalVisible] = useState(false);
  // const [currentDate, setCurrentDate] = useState(new Date());
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = () => {
    try {
      const data = getAnalytics(selectedPeriod, currentDate.toISOString());
      setAnalyticsData(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to fetch analytics data");
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod, currentDate]);

  useEffect(() => {
    if (!selectedCurrency) {
      setCurrency("IDR");
    }
  }, [selectedCurrency, setCurrency]);

  const getWeekDates = (date: Date) => {
    const day = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const diff = day === 0 ? -6 : 1 - day; // Adjust for Sunday
    const monday = new Date(date);
    monday.setDate(monday.getDate() + diff); // Set to Monday
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6); // Set to Sunday
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

const IndexPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("month");

  return (
    <SafeAreaView style={styles.container}>
      <Header
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
      />
      <AddIncomeExpense />
      <History currentDate={currentDate} selectedPeriod={selectedPeriod} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#282828",
  },
  header: {
    padding: 20,
    // paddingBottom: 10,
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
});

export default IndexPage;
