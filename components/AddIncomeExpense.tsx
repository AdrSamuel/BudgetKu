import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";

import { Picker } from "@react-native-picker/picker";
import useStore from "@/store/store";

type TransactionType = "income" | "expense";

const AddIncomeExpense = () => {
  const { addTransaction, tags } = useStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [transactionType, setTransactionType] =
    useState<TransactionType>("income");
  const [amount, setAmount] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  interface HandleOpenModal {
    (type: TransactionType): void;
  }

  const handleOpenModal: HandleOpenModal = (type) => {
    setTransactionType(type);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setAmount("");
    setSelectedTag("");
  };

  const handleAddTransaction = () => {
    if (!amount) return;

    if (transactionType === "expense" && !selectedTag) {
      Alert.alert("Error", "Please choose a tag for the expense.");
      return;
    }
    const transaction = {
      type: transactionType,
      amount: parseFloat(amount),
      category: transactionType === "income" ? "Income" : "Expense",
      date: new Date().toISOString(),
      tags: transactionType === "expense" ? [selectedTag] : [],
    };

    addTransaction(transaction);
    handleCloseModal();
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => handleOpenModal("income")}>
          <View style={[styles.button, styles.incomeButton]}>
            <Text style={styles.buttonText}>Add Income</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleOpenModal("expense")}>
          <View style={[styles.button, styles.expenseButton]}>
            <Text style={styles.buttonText}>Add Expense</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeaderText}>
                {transactionType === "income" ? "Add Income" : "Add Expense"}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Amount"
                placeholderTextColor="#fbf1c7"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              {transactionType === "expense" && (
                <Picker
                  selectedValue={selectedTag}
                  onValueChange={(itemValue) => setSelectedTag(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Choose a tag" value="" />
                  {tags.map((tag) => (
                    <Picker.Item key={tag} label={tag} value={tag} />
                  ))}
                </Picker>
              )}
              <Text style={styles.dateText}>
                Date: {new Date().toLocaleDateString()}
              </Text>
              <TouchableOpacity
                onPress={handleAddTransaction}
                style={styles.addButton}
              >
                <Text style={styles.addButtonText}>Add {transactionType}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#282828",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 15,
    gap: 30,
  },
  button: {
    width: 150,
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 10,
  },
  incomeButton: {
    backgroundColor: "#b8bb26",
  },
  expenseButton: {
    backgroundColor: "#fb4934",
  },
  buttonText: {
    color: "#282828",
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
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
  modalHeaderText: {
    color: "#fbf1c7",
    fontSize: 20,
    fontFamily: "PlusJakartaSans",
    textAlign: "center",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#fbf1c7",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    color: "#fbf1c7",
    fontFamily: "PlusJakartaSans",
  },
  picker: {
    marginBottom: 15,
    color: "#fbf1c7",
  },
  dateText: {
    marginBottom: 15,
    color: "#fbf1c7",
    fontFamily: "PlusJakartaSans",
  },
  addButton: {
    backgroundColor: "#b8bb26",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  addButtonText: {
    color: "#282828",
    fontFamily: "PlusJakartaSans",
  },
  cancelButton: {
    backgroundColor: "#fb4934",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#282828",
    fontFamily: "PlusJakartaSans",
  },
});

export default AddIncomeExpense;
