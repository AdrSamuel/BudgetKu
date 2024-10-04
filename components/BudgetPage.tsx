import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
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
    getTransactionsByTag,
    setBudget,
    budgets,
    removeBudget,
    getTagsWithoutBudget,
  } = useStore();

  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [tagsWithoutBudget, setTagsWithoutBudget] = useState<string[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTag, setSelectedTag] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const fetchBudgetData = useCallback(() => {
    const monthString = currentDate.toISOString().slice(0, 7); // YYYY-MM
    const monthBudgets = budgets[monthString] || {};

    const budgetItemsData: BudgetItem[] = [];
    let totalSpentAmount = 0;
    let totalBudgetAmount = 0;

    Object.entries(monthBudgets).forEach(([tag, limit]) => {
      const tagTransactions = getTransactionsByTag(tag);
      const tagSpent = tagTransactions
        .filter((t) => t.type === "expense" && t.date.startsWith(monthString))
        .reduce((sum, t) => sum + t.amount, 0);

      budgetItemsData.push({
        tag,
        limit,
        spent: tagSpent,
      });

      totalSpentAmount += tagSpent;
      totalBudgetAmount += limit;
    });

    setBudgetItems(budgetItemsData);
    setTagsWithoutBudget(getTagsWithoutBudget(monthString));
    setTotalSpent(totalSpentAmount);
    setTotalBudget(totalBudgetAmount);
  }, [currentDate, budgets, getTransactionsByTag, getTagsWithoutBudget]);

  useFocusEffect(
    useCallback(() => {
      fetchBudgetData();
    }, [fetchBudgetData])
  );

  const handleSetBudget = () => {
    const monthString = currentDate.toISOString().slice(0, 7);
    const amount = Number(budgetAmount);
    if (!isNaN(amount) && amount > 0) {
      setBudget(monthString, { [selectedTag]: amount });
      fetchBudgetData();
      setModalVisible(false);
      setBudgetAmount("");
      setIsEditing(false);
    }
  };

  const handleDeleteBudget = (tag: string) => {
    Alert.alert(
      "Delete Budget",
      `Are you sure you want to delete the budget for ${tag}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const monthString = currentDate.toISOString().slice(0, 7);
            removeBudget(monthString, tag);

            setBudgetItems((prevItems) => {
              const updatedItems = prevItems.filter((item) => item.tag !== tag);
              const deletedItem = prevItems.find((item) => item.tag === tag);

              if (deletedItem) {
                // setTotalBudget((prevTotal) =>
                //   Math.max(prevTotal - deletedItem.limit, 0)
                // );
                setTotalSpent((prevTotal) =>
                  Math.max(prevTotal - deletedItem.spent, 0)
                );
              }

              return updatedItems;
            });

            // setTagsWithoutBudget((prevTags) => [...prevTags, tag]);
          },
        },
      ]
    );
  };

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

  const getProgressBarColor = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return "#fb4934";
    if (percentage >= 75) return "#fe8019";
    if (percentage >= 50) return "#fabd2f";
    return "#b8bb26";
  };

  const renderBudgetItem = ({ item }: { item: BudgetItem }) => {
    const progress = Math.min((item.spent / item.limit) * 100, 100);
    const remaining = item.limit - item.spent;

    return (
      <View style={styles.budgetItem}>
        <View style={styles.budgetItemHeader}>
          <Text style={styles.tagText}>{item.tag}</Text>
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "Budget Options",
                `Choose an action for ${item.tag}`,
                [
                  {
                    text: "Edit",
                    onPress: () => {
                      setSelectedTag(item.tag);
                      setBudgetAmount(item.limit.toString());
                      setIsEditing(true);
                      setModalVisible(true);
                    },
                  },
                  {
                    text: "Delete",
                    onPress: () => handleDeleteBudget(item.tag),
                    style: "destructive",
                  },
                  { text: "Cancel", style: "cancel" },
                ]
              )
            }
          >
            <Ionicons
              name="ellipsis-horizontal-circle"
              size={24}
              color="#fbf1c7"
            />
          </TouchableOpacity>
        </View>
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
          <View
            style={[
              styles.progressBar,
              {
                width: `${progress}%`,
                backgroundColor: getProgressBarColor(item.spent, item.limit),
              },
            ]}
          />
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
          setSelectedTag(item);
          setBudgetAmount("");
          setIsEditing(false);
          setModalVisible(true);
        }}
      >
        <Text style={styles.setBudgetButtonText}>SET BUDGET</Text>
      </TouchableOpacity>
    </View>
  );

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

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>
                {isEditing ? "Edit" : "Set"} Budget for {selectedTag}
              </Text>
            </View>
            <TextInput
              style={styles.input}
              onChangeText={setBudgetAmount}
              value={budgetAmount}
              placeholder="Enter budget amount"
              keyboardType="numeric"
              placeholderTextColor="#fbf1c7"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setModalVisible(false);
                  setIsEditing(false);
                  setBudgetAmount("");
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleSetBudget}
              >
                <Text style={styles.modalButtonText}>
                  {isEditing ? "Update" : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#282828",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  modalHeaderText: {
    color: "#fbf1c7",
    fontSize: 20,
    fontFamily: "PlusJakartaSans",
    flex: 1,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#fbf1c7",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    color: "#fbf1c7",
    fontFamily: "PlusJakartaSans",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    backgroundColor: "#fbf1c7",
    padding: 10,
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#282828",
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
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
  budgetItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
});

export default BudgetPage;
