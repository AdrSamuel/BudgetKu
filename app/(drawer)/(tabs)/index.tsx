import { Button, StyleSheet } from "react-native";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";

export default function Index() {
  const num = 500000;
  const rupiah = new Intl.NumberFormat("id-ID", {
    currency: "IDR",
    style: "currency",
    // currencyDisplay: "code",
  });
  const f = new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
    // currencyDisplay: "code",
  });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors["dark"].background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.top}>
            <Text style={styles.title}>September 2024</Text>
            <View style={styles.titleBott}>
              <View style={styles.detailsRow}>
                <Text style={styles.details}>Income : </Text>
                <Text style={styles.detailsGreen}>{f.format(num)}</Text>
              </View>
              <View style={styles.detailsRow}>
                <Text style={styles.details}>Expense : </Text>
                <Text style={styles.detailsRed}>{rupiah.format(200000)}</Text>
              </View>
            </View>
          </View>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors["dark"].background,
  },
  title: {
    fontFamily: "PlusJakartaSans",
    fontSize: 24,
    padding: 10,
    paddingTop: 0,
    color: "#fbf1c7",
  },
  titleBott: {
    flex: 1,
  },
  details: {
    fontFamily: "PlusJakartaSans",
    fontSize: 20,
    padding: 10,
    paddingTop: 0,
    color: "#fbf1c7",
  },
  detailsRow: {
    flexDirection: "row",
  },
  detailsRed: {
    fontFamily: "PlusJakartaSans",
    fontSize: 20,
    padding: 10,
    paddingTop: 0,
    color: "#fb4934",
  },
  detailsGreen: {
    fontFamily: "PlusJakartaSans",
    fontSize: 20,
    padding: 10,
    paddingTop: 0,
    color: "#b8bb26",
  },
  top: {
    // backgroundColor: "#665c54",
    // borderRadius: 15,
  },
  content: {
    fontFamily: "PlusJakartaSans",
    color: "#fbf1c7",
    fontSize: 16,
    padding: 10,
  },
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
