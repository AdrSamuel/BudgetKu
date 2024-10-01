import { StyleSheet } from "react-native";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import AddIncomeExpense from "@/components/AddIncomeExpense";
import Header from "@/components/Header";
import History from "@/components/History";

export default function Index() {
  return (
    <SafeAreaProvider
      style={[styles.container, { backgroundColor: Colors["dark"].background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header />
        <AddIncomeExpense />
        <History />
      </ScrollView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
