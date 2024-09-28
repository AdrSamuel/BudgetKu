import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import useStore from "@/store/store";

const AddIncomeExpense = () => {
  const { transactions, addTransaction } = useStore() as {
    transactions: any;
    addTransaction: (transaction: any) => void;
  };

  const handleAddIncome = () => {
    addTransaction({
      type: "income",
      amount: -100,
      category: "Salary",
      date: new Date().toISOString(),
      tags: ["work"],
    });
  };

  const handleAddExpense = () => {
    addTransaction({
      type: "expense",
      amount: -100,
      category: "Food",
      date: new Date().toISOString(),
      tags: ["work"],
    });
  };

  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity onPress={this._onPressButton}>
        <View style={styles.button}>
          <Text style={styles.buttonTextIncome}>Add Income</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={this._onPressButton}>
        <View style={styles.buttonExpense}>
          <Text style={styles.buttonTextExpense}>Add Expense</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default AddIncomeExpense;

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center", // Align buttons at the start
    marginVertical: 15, // Add vertical margin if needed
    gap: 30,
  },
  button: {
    width: 150,
    alignItems: "center",
    backgroundColor: "#b8bb26",
    borderRadius: 20,
  },
  buttonExpense: {
    width: 150,
    alignItems: "center",
    backgroundColor: "#fb4934",
    borderRadius: 20,
  },
  buttonTextIncome: {
    textAlign: "center",
    padding: 10,
    color: "#1d2021",
    fontFamily: "PlusJakartaSans",
  },
  buttonTextExpense: {
    textAlign: "center",
    padding: 10,
    color: "#1d2021",
    fontFamily: "PlusJakartaSans",
  },
});
