import React from "react";
import { View, Text } from "react-native";
import useStore from "@/store/store";
import { StyleSheet } from "react-native";

const Header = () => {
  const { transactions, addTransaction, getAnalytics, selectedCurrency } =
    useStore() as {
      transactions: any;
      addTransaction: (transaction: any) => void;
      getAnalytics: (period: string) => any;
      selectedCurrency: "IDR" | "USD";
    };
  const now = new Date();
  const month = now.toLocaleString("default", { month: "long" }); // e.g., "September"
  const year = now.getFullYear(); // e.g., 2024

  const analytics = getAnalytics("month");

  // Define formatters for supported currencies
  const currencyFormatters = {
    IDR: new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }),
    USD: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
    // Add more currencies if needed
  };

  const formatter =
    currencyFormatters[selectedCurrency] || currencyFormatters["IDR"];

  return (
    <View style={styles.content}>
      <Text style={styles.title}>
        {month}, {year}
      </Text>
      <View style={styles.titleBott}>
        <View style={styles.detailsRow}>
          <Text style={styles.details}>Income : </Text>
          <Text style={styles.detailsGreen}>
            {formatter.format(analytics.totalIncome)}
          </Text>
        </View>
        <View style={styles.detailsRow}>
          <Text style={styles.details}>Expense : </Text>
          <Text style={styles.detailsRed}>
            {formatter.format(analytics.totalExpense)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  title: {
    fontFamily: "PlusJakartaSans",
    fontSize: 24,
    padding: 10,
    paddingTop: 0,
    color: "#fbf1c7",
  },
  titleBott: {
    flex: 1,
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
    alignItems: "center", // Align the text vertically in the center
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
  content: {
    fontFamily: "PlusJakartaSans",
    color: "#fbf1c7",
    fontSize: 16,
    padding: 10,
    paddingTop: 0,
  },
});
