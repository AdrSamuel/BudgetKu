import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ScrollView,
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
  const {
    selectedCurrency,
    setCurrency,
    getAnalytics,
    getTags,
    getBudgetProgress,
    getTransactionsByTag,
    setBudget,
  } = useStore();

  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [tagsWithoutBudget, setTagsWithoutBudget] = useState<string[]>([]);

  const fetchBudgetData = () => {
    const monthString = currentDate.toISOString().slice(0, 7); // YYYY-MM
    const analytics = getAnalytics("month", currentDate.toISOString());
    const { budget, spent } = getBudgetProgress(monthString);
    const allTags = getTags();

    const budgetItemsData: BudgetItem[] = [];
    const tagsWithoutBudgetData: string[] = [];

    allTags.forEach((tag) => {
      const tagTransactions = getTransactionsByTag(tag);
      const tagSpent = tagTransactions
        .filter((t) => t.type === "expense" && t.date.startsWith(monthString))
        .reduce((sum, t) => sum + t.amount, 0);

      if (tagSpent > 0) {
        budgetItemsData.push({
          tag,
          limit: budget, // Note: This assumes a single budget for all tags
          spent: tagSpent,
        });
      } else {
        tagsWithoutBudgetData.push(tag);
      }
    });

    setBudgetItems(budgetItemsData);
    setTagsWithoutBudget(tagsWithoutBudgetData);
  };

  useEffect(() => {
    fetchBudgetData();
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
      <TouchableOpacity
        style={styles.setBudgetButton}
        onPress={() => {
          const monthString = currentDate.toISOString().slice(0, 7);
          setBudget(monthString, 0); // Set an initial budget of 0
          fetchBudgetData(); // Refresh the data
        }}
      >
        <Text style={styles.setBudgetButtonText}>SET BUDGET</Text>
      </TouchableOpacity>
    </View>
  );

  const monthString = currentDate.toISOString().slice(0, 7);
  const { budget: totalBudget, spent: totalSpent } =
    getBudgetProgress(monthString);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
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

          <View style={styles.analytics}>
            <View style={styles.detailsRow}>
              <Text style={styles.details}>Total Budget:</Text>
              <Text style={styles.detailsGreen}>
                {formatter.format(totalBudget)}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.details}>Total Spent:</Text>
              <Text style={styles.detailsRed}>
                {formatter.format(totalSpent)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Budgeted Tags</Text>
        <FlatList
          data={budgetItems}
          renderItem={renderBudgetItem}
          keyExtractor={(item) => item.tag}
          style={styles.list}
          nestedScrollEnabled
        />

        <Text style={styles.sectionTitle}>Tags Without Budget</Text>
        <FlatList
          data={tagsWithoutBudget}
          renderItem={renderTagWithoutBudget}
          keyExtractor={(item) => item}
          style={[styles.list, styles.lastList]}
          nestedScrollEnabled
        />
      </ScrollView>
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
  lastList: {
    marginBottom: 80,
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
