import { StyleSheet } from "react-native";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";

export default function Analytic() {
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors["dark"].background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.content}>ini analityc page</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

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
