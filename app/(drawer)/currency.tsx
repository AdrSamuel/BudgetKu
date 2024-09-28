import React, { useState } from "react";
import { SafeAreaView, ScrollView, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Colors } from "@/constants/Colors";
import useStore from "@/store/store";

const CurrencyChooser = () => {
  const { selectedCurrency, setCurrency } = useStore();
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors["dark"].background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.selectedCurrency}>
          Selected Currency: {selectedCurrency}
        </Text>
        <Text style={styles.content}>Change Currency :</Text>

        <Picker
          selectedValue={selectedCurrency}
          onValueChange={(itemValue) => setCurrency(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Indonesian Rupiah (IDR)" value="IDR" />
          <Picker.Item label="US Dollar (USD)" value="USD" />
          {/* <Picker.Item label="Euro (EUR)" value="EUR" /> */}
          {/* Add more currencies as needed */}
        </Picker>
      </ScrollView>
    </SafeAreaView>
  );
};

// Define your styles here
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    fontSize: 16,
    marginBottom: 20,
    color: "#fbf1c7",
    fontFamily: "PlusJakartaSans",
  },
  picker: {
    height: 50,
    width: "100%",
    // marginBottom: 16,
    color: "#fbf1c7",
    fontFamily: "PlusJakartaSans",
  },
  selectedCurrency: {
    fontSize: 20,
    color: "#fbf1c7",
    paddingBottom: 50,
    fontFamily: "PlusJakartaSans",
  },
});

export default CurrencyChooser;
