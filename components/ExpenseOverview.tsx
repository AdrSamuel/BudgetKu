import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { VictoryPie } from "victory-native";
import useStore from "@/store/store";

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
    try {
      const periodTransactions = getTransactionsByPeriod(
        selectedPeriod,
        currentDate.toISOString()
      );
      const expenseByTag: { [tag: string]: number } = {};
      let total = 0;

      periodTransactions.forEach((transaction) => {
        if (transaction.type === "expense" && transaction.amount > 0) {
          const transactionTags = transaction.tags?.length
            ? transaction.tags
            : ["Other"];

          const amountPerTag = transaction.amount / transactionTags.length;

          transactionTags.forEach((tag) => {
            expenseByTag[tag] = Math.round(
              (expenseByTag[tag] || 0) + amountPerTag
            );
          });
          total += transaction.amount;
        }
      });

      setExpenseData(expenseByTag);
      setTotalExpense(Math.round(total));
    } catch (error) {
      console.error("Error processing transactions:", error);
      setExpenseData({});
      setTotalExpense(0);
    }
  }, [getTransactionsByPeriod, selectedPeriod, currentDate, transactions]);

  const currencyFormatters = {
    IDR: new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
    USD: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  };

  const formatter =
    currencyFormatters[selectedCurrency as "IDR" | "USD"] ||
    currencyFormatters["USD"];

  // Prepare chart data
  const chartData = Object.entries(expenseData)
    .filter(([_, amount]) => amount > 0)
    .map(([tag, amount]) => {
      const percentage = ((amount || 0) / (totalExpense || 1)) * 100;
      return {
        x: tag,
        y: amount,
        label: `${tag}\n${percentage.toFixed(1)}%`,
        color: getTagColor(tag) || "#666666",
      };
    })
    .sort((a, b) => b.y - a.y);

  return (
    <ScrollView style={styles.expenseOverviewContainer}>
      <Text style={styles.expenseOverviewTitle}>Expense Overview</Text>
      {totalExpense > 0 ? (
        <>
          <View style={styles.chartContainer}>
            {chartData && chartData.length > 0 ? (
              <VictoryPie
                data={chartData}
                width={450}
                height={300}
                colorScale={chartData.map((d) => d.color)}
                innerRadius={65}
                padding={40}
              />
            ) : (
              <Text style={styles.noExpensesText}>
                No data available for chart
              </Text>
            )}
          </View>
          <View style={styles.detailsContainer}>
            {chartData.map((item) => (
              <View key={item.x} style={styles.detailItem}>
                <View
                  style={[styles.colorDot, { backgroundColor: item.color }]}
                />
                <Text style={styles.detailText}>{item.x}</Text>
                <Text style={styles.detailText}>
                  {formatter.format(item.y)}
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
  expenseOverviewContainer: {
    flex: 1,
    padding: 16,
    marginBottom: 75,
  },
  expenseOverviewTitle: {
    fontSize: 20,
    color: "#fbf1c7",
    marginBottom: 16,
    textAlign: "center",
    fontFamily: "PlusJakartaSans",
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  detailsContainer: {
    marginTop: 16,
    fontFamily: "PlusJakartaSans",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  detailText: {
    flex: 1,
    color: "#fbf1c7",
    fontSize: 14,
  },
  totalContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#45474a",
  },
  totalText: {
    fontSize: 16,
    color: "#fbf1c7",
    textAlign: "center",
    fontFamily: "PlusJakartaSans",
  },
  noExpensesText: {
    color: "#fbf1c7",
    fontSize: 16,
    textAlign: "center",
    marginTop: 32,
    fontFamily: "PlusJakartaSans",
  },
});

export default ExpenseOverview;
