import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useStore from "@/store/store";
import { Ionicons } from "@expo/vector-icons";

type BudgetItem = {
  tag: string;
  limit: number;
  spent: number;
};

const BudgetPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const { getAnalytics, selectedCurrency, setCurrency } = useStore();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    { tag: "Food", limit: 500, spent: 300 },
    { tag: "Transportation", limit: 200, spent: 150 },
    { tag: "Entertainment", limit: 100, spent: 80 },
  ]);

  const [tagsWithoutBudget, setTagsWithoutBudget] = useState<string[]>([
    "Shopping",
    "Utilities",
    "Health",
  ]);

  const fetchAnalytics = () => {
    try {
      const data = getAnalytics("month", currentDate.toISOString());
      setAnalyticsData(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to fetch analytics data");
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [currentDate]);

  useEffect(() => {
    if (!selectedCurrency) {
      setCurrency("IDR");
    }
  }, [selectedCurrency, setCurrency]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };

  const changeMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

  const currencyFormatters = {
    IDR: new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }),
    USD: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
  };
  const formatter =
    currencyFormatters[selectedCurrency as "IDR" | "USD"] ||
    currencyFormatters["USD"];

  const renderBudgetItem = ({ item }: { item: BudgetItem }) => {
    const progress = (item.spent / item.limit) * 100;
    const remaining = item.limit - item.spent;

    return (
      <View style={styles.budgetItem}>
        <Text style={styles.tagText}>{item.tag}</Text>
        <View style={styles.budgetDetails}>
          <Text style={styles.detailText}>
            Limit: {formatter.format(item.limit)}
          </Text>
          <Text style={styles.detailText}>
            Spent: {formatter.format(item.spent)}
          </Text>
          <Text style={styles.detailText}>
            Remaining: {formatter.format(remaining)}
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
      </View>
    );
  };

  const renderTagWithoutBudget = ({ item }: { item: string }) => (
    <View style={styles.tagItem}>
      <Text style={styles.tagText}>{item}</Text>
      <TouchableOpacity style={styles.setBudgetButton}>
        <Text style={styles.setBudgetButtonText}>SET BUDGET</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.dateSelector}>
          <TouchableOpacity onPress={() => changeMonth("prev")}>
            <Ionicons name="chevron-back" size={24} color="#fbf1c7" />
          </TouchableOpacity>
          <Text style={styles.title}>{formatDate(currentDate)}</Text>
          <TouchableOpacity onPress={() => changeMonth("next")}>
            <Ionicons name="chevron-forward" size={24} color="#fbf1c7" />
          </TouchableOpacity>
        </View>

        {analyticsData && (
          <View style={styles.analytics}>
            <View style={styles.detailsRow}>
              <Text style={styles.details}>Total Budget:</Text>
              <Text style={styles.detailsGreen}>
                {formatter.format(analyticsData.totalBudget)}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.details}>Total Spent:</Text>
              <Text style={styles.detailsRed}>
                {formatter.format(analyticsData.totalSpent)}
              </Text>
            </View>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>Budgeted Categories</Text>
      <FlatList
        data={budgetItems}
        renderItem={renderBudgetItem}
        keyExtractor={(item) => item.tag}
        style={styles.list}
      />

      <Text style={styles.sectionTitle}>Categories Without Budget</Text>
      <FlatList
        data={tagsWithoutBudget}
        renderItem={renderTagWithoutBudget}
        keyExtractor={(item) => item}
        style={styles.list}
      />
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
  },
  dateSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  analytics: {
    marginTop: 10,
  },
  title: {
    fontFamily: "PlusJakartaSans",
    fontSize: 24,
    color: "#fbf1c7",
  },
  details: {
    fontFamily: "PlusJakartaSans",
    fontSize: 20,
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
    color: "#fb4934",
  },
  detailsGreen: {
    fontFamily: "PlusJakartaSans",
    fontSize: 20,
    color: "#b8bb26",
  },
  sectionTitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 22,
    color: "#fbf1c7",
    padding: 20,
    paddingBottom: 10,
  },
  list: {
    flex: 1,
  },
  budgetItem: {
    backgroundColor: "#3c3836",
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
  },
  tagItem: {
    backgroundColor: "#3c3836",
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tagText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 18,
    color: "#fbf1c7",
  },
  budgetDetails: {
    marginTop: 5,
  },
  detailText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: "#d5c4a1",
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: "#504945",
    borderRadius: 5,
    marginTop: 10,
  },
  progressBar: {
    height: 10,
    backgroundColor: "#b8bb26",
    borderRadius: 5,
  },
  setBudgetButton: {
    backgroundColor: "#d79921",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  setBudgetButtonText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: "#282828",
  },
});

export default BudgetPage;
