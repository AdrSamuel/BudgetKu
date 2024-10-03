import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          drawerStyle: {
            backgroundColor: "#3c3836",
            width: 240,
          },
          drawerLabelStyle: {
            fontFamily: "PlusJakartaSans", // Custom font family
            fontSize: 12, // Optional: Font size
            color: "#fbf1c7", // Set the font color
          },
          drawerActiveTintColor: "#ebdbb2", // Color for active items
          headerStyle: {
            backgroundColor: "#3c3836",
          },
          headerTintColor: "#fbf1c7",
          headerTitleStyle: {
            fontFamily: "PlusJakartaSans", // Custom font family
            fontSize: 20, // Optional: Font size
            fontWeight: "bold",
          },
        }}
      >
        <Drawer.Screen
          name="(tabs)" // This is the name of the page and must match the url from root
          options={{
            drawerLabel: "Home",
            title: "BudgetKu",
          }}
        />
        <Drawer.Screen
          name="tags" // This is the name of the page and must match the url from root
          options={{
            drawerLabel: "Tags",
            title: "BudgetKu",
          }}
        />
        <Drawer.Screen
          name="currency"
          options={{
            drawerLabel: "Currency",
            title: "BudgetKu",
          }}
        />
        <Drawer.Screen
          name="notif" // This is the name of the page and must match the url from root
          options={{
            drawerLabel: "Notification",
            title: "BudgetKu",
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
