import { StyleSheet, Text, ScrollView } from "react-native";
import React from "react";
import { Colors } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";

const currency = () => {
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors["dark"].background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.content}>ini currency page</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default currency;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors["dark"].background,
  },
  content: {
    fontFamily: "PlusJakartaSans",
    color: "#fbf1c7",
    fontSize: 16,
    padding: 10,
  },
});
