import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
} from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Picker } from "@react-native-picker/picker";
import useStore from "@/store/store";

type TransactionType = "income" | "expense";
type Period = "day" | "week" | "month";

const History = ({
  currentDate,
  selectedPeriod,
}: {
  currentDate: Date;
  selectedPeriod: Period;
}) => {
  const {
    getTransactionsByPeriod,
    editTransaction,
    deleteTransaction,
    selectedCurrency,
    tags,
  } = useStore();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<{
    id: number;
    amount: number;
    tags: string[];
    date: string;
    type: TransactionType;
  } | null>(null);

  const [editedAmount, setEditedAmount] = useState("");
  const [editedTag, setEditedTag] = useState("");

  const transactions = getTransactionsByPeriod(
    selectedPeriod,
    currentDate.toISOString()
  );

  const handleEdit = (transaction: {
    id: number;
    amount: number;
    tags: string[];
    date: string;
    type: string;
  }) => {
    setSelectedTransaction({
      ...transaction,
      type: transaction.type as TransactionType,
    });
    setEditedAmount(transaction.amount.toString());
    setEditedTag(transaction.tags[0] || "");
    setEditModalVisible(true);
  };

  const handleDelete = (transaction: {
    id: number;
    amount: number;
    tags: string[];
    date: string;
    type: string;
  }) => {
    setSelectedTransaction({
      ...transaction,
      type: transaction.type as TransactionType,
    });
    setDeleteModalVisible(true);
  };

  const confirmEdit = () => {
    if (selectedTransaction) {
      const updatedTransaction = {
        ...selectedTransaction,
        amount: parseFloat(editedAmount), // Convert amount back to a number
        tags: [editedTag], // Ensure tags is an array
      };

      editTransaction(selectedTransaction.id, updatedTransaction);
      setEditModalVisible(false);
    }
  };

  const confirmDelete = () => {
    if (selectedTransaction) {
      deleteTransaction(selectedTransaction.id);
      setDeleteModalVisible(false);
    }
  };

  const renderTransaction = ({
    item,
  }: {
    item: {
      id: number;
      amount: number;
      tags: string[];
      date: string;
      type: string;
    };
  }) => (
    <TouchableOpacity style={styles.transactionItem}>
      <View style={styles.transactionContent}>
        <Text style={styles.transactionTime}>
          {new Date(item.date).toLocaleTimeString()}
        </Text>
        <Text style={styles.transactionType}>{item.type}</Text>
        <Text style={styles.transactionTags}>{item.tags.join(", ")}</Text>
        <Text
          style={[
            styles.transactionAmount,
            item.type === "income" ? styles.detailsGreen : styles.detailsRed,
          ]}
        >
          {selectedCurrency === "IDR" ? "Rp" : "$"}
          {item.amount.toFixed(2)}
        </Text>
      </View>
      <View style={styles.transactionActions}>
        <TouchableOpacity onPress={() => handleEdit(item)}>
          <FontAwesome6 name="pencil" size={20} color="#fbf1c7" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)}>
          <FontAwesome6 name="trash-can" size={20} color="#fb4934" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderDay = ({
    item,
  }: {
    item: {
      id: number;
      amount: number;
      tags: string[];
      date: string;
      type: string;
    }[];
  }) => (
    <View style={styles.dayContainer}>
      <Text style={styles.dayHeader}>
        {new Intl.DateTimeFormat("en-US", {
          weekday: "long", // e.g., Mon
          year: "numeric", // e.g., 2024
          month: "short", // e.g., Oct
          day: "numeric", // e.g., 2
        }).format(new Date(item[0].date))}
      </Text>
      <View style={styles.underline} />
      <FlatList
        data={item}
        renderItem={renderTransaction}
        keyExtractor={(transaction) => transaction.id.toString()}
      />
    </View>
  );

  const groupTransactionsByDay = (
    transactions: {
      id: number;
      amount: number;
      tags: string[];
      date: string;
      type: string;
    }[]
  ) => {
    const grouped = transactions.reduce(
      (
        acc: {
          [key: string]: {
            id: number;
            amount: number;
            tags: string[];
            date: string;
            type: string;
          }[];
        },
        transaction
      ) => {
        const date = new Date(transaction.date).toDateString();
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(transaction);
        return acc;
      },
      {}
    );

    // Sort transactions within each day in descending order
    Object.keys(grouped).forEach((day) => {
      grouped[day] = grouped[day].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });

    // Sort days in descending order
    return Object.entries(grouped).sort(
      (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={groupTransactionsByDay(transactions)}
        renderItem={({ item }) => renderDay({ item: item[1] })}
        keyExtractor={(item) => item[0]}
      />
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Transaction</Text>
            <TextInput
              style={styles.input}
              value={editedAmount}
              onChangeText={setEditedAmount}
              keyboardType="numeric"
              placeholder="Amount"
              placeholderTextColor="#fbf1c7"
            />
            {selectedTransaction?.type === "expense" && (
              <Picker
                selectedValue={editedTag}
                style={styles.picker}
                onValueChange={(itemValue) => setEditedTag(itemValue)}
              >
                {tags.map((tag) => (
                  <Picker.Item key={tag} label={tag} value={tag} />
                ))}
              </Picker>
            )}
            <TouchableOpacity style={styles.button} onPress={confirmEdit}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={deleteModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Delete</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete this transaction?
            </Text>
            <TouchableOpacity style={styles.button} onPress={confirmDelete}>
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setDeleteModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default History;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#282828",
    marginVertical: 20,
    marginBottom: 75,
    paddingHorizontal: 20,
  },
  dayContainer: {
    marginBottom: 20,
  },
  dayHeader: {
    fontFamily: "PlusJakartaSans",
    fontSize: 18,
    color: "#fbf1c7",
    marginBottom: 10,
  },
  underline: {
    height: 1,
    backgroundColor: "#fbf1c7",
    marginBottom: 10,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#fbf1c7",
  },
  transactionContent: {
    flex: 1,
  },
  transactionTime: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: "#fbf1c7",
  },
  transactionType: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: "#fbf1c7",
    textTransform: "capitalize",
  },
  transactionTags: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: "#d3869b",
    fontStyle: "italic",
  },
  transactionAmount: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
  },
  transactionActions: {
    flexDirection: "row",
    gap: 10,
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
  modalTitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 20,
    color: "#fbf1c7",
    marginBottom: 20,
    textAlign: "center",
  },
  modalText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: "#fbf1c7",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: "#fbf1c7",
    borderWidth: 1,
    borderColor: "#fbf1c7",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#fbf1c7",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: "#282828",
    textAlign: "center",
  },
  detailsRed: {
    color: "#fb4934",
  },
  detailsGreen: {
    color: "#b8bb26",
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#fbf1c7",
    backgroundColor: "#3c3836",
    marginBottom: 10,
  },
});
