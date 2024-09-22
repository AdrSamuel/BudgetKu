import { Tabs } from "expo-router";
import React from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { Text, StyleSheet } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors["dark"].tint,
        tabBarStyle: {
          backgroundColor: "#3c3836",
          borderTopColor: "transparent",
          position: "absolute", // Make the tab bar float
          bottom: 20, // Adjust this value for vertical position
          left: 20, // Horizontal position (adjust for your liking)
          right: 20, // Horizontal position (adjust for your liking)
          elevation: 8, // Add shadow for Android
          shadowColor: "#000", // Add shadow for iOS
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          borderRadius: 40, // Round corners for floating effect
          height: 60, // Set height of the tab bar
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: ({ color }) => (
            <Text style={[styles.title, { color }]}>Home</Text>
          ),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          tabBarLabel: ({ color }) => (
            <Text style={[styles.title, { color }]}>Budget</Text>
          ),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "calculator" : "calculator-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="analytic"
        options={{
          tabBarLabel: ({ color }) => (
            <Text style={[styles.title, { color }]}>Analytic</Text>
          ),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "pie-chart" : "pie-chart-outline"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 12,
    marginBottom: 5,
    marginLeft: 3,
    fontFamily: "PlusJakartaSans",
  },
});
