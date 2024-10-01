import { StyleSheet } from "react-native";
import { ScrollView, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import BudgetPage from "@/components/BudgetPage";

export default function Analytic() {
  return (
    <SafeAreaProvider
      style={[styles.container, { backgroundColor: Colors["dark"].background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <BudgetPage />
      </ScrollView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors["dark"].background,
  },
});
