import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import useStore from "@/store/store";
import { PieChart } from "react-native-chart-kit";

type Period = "day" | "week" | "month";

const ExpenseOverview = ({
  selectedPeriod,
  currentDate,
}: {
  selectedPeriod: Period;
  currentDate: Date;
}) => {
  const {
    getTransactionsByPeriod,
    selectedCurrency,
    getTagColor,
    tags,
    transactions,
  } = useStore();
  const [expenseData, setExpenseData] = useState<{ [tag: string]: number }>({});
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    const periodTransactions = getTransactionsByPeriod(
      selectedPeriod,
      currentDate.toISOString()
    );
    const expenseByTag: { [tag: string]: number } = {};
    let total = 0;

    periodTransactions.forEach((transaction) => {
      if (transaction.type === "expense") {
        transaction.tags.forEach((tag) => {
          expenseByTag[tag] = (expenseByTag[tag] || 0) + transaction.amount;
        });
        total += transaction.amount;
      }
    });

    setExpenseData(expenseByTag);
    setTotalExpense(total);
  }, [getTransactionsByPeriod, selectedPeriod, currentDate, transactions]);

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
              width={350}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="0"
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

const styles = StyleSheet.create({
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
    marginBottom: 80,
  },
  totalText: {
    fontSize: 16,
    color: "#fbf1c7",
    fontFamily: "PlusJakartaSans",
  },
  noExpensesText: {
    fontSize: 16,
    color: "#fbf1c7",
    textAlign: "center",
    marginTop: 20,
  },
});

export default ExpenseOverview;
