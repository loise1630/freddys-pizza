import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from "react-native";

const MENU = [
  { label: "Manage Products", screen: "AdminProducts", color: "#FF6B35" },
  { label: "Add New Pizza", screen: "ProductForm", color: "#4CAF50" },
  { label: "View Orders", screen: "AdminOrders", color: "#2196F3" },
  { label: "Logout", screen: "Login", color: "#333" },
];

const AdminDashboard = ({ navigation }) => (
  <View style={s.container}>
    <StatusBar backgroundColor="#FF6B35" barStyle="light-content" />

    {/* Header */}
    <View style={s.header}>
      <Text style={s.headerTitle}>Admin Panel 🛠️</Text>
      <Text style={s.headerSub}>Manage your pizza store</Text>
    </View>

    <View style={s.menu}>
      {MENU.map(({ label, screen, color }) => (
        <TouchableOpacity key={label} style={[s.btn, { backgroundColor: color }]}
          onPress={() => navigation.navigate(screen)} activeOpacity={0.85}>
          <Text style={s.btnText}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },

  header: {
    backgroundColor: "#FF6B35",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 12 : 54,
    paddingBottom: 28, paddingHorizontal: 24,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  headerTitle: { color: "#fff", fontSize: 28, fontWeight: "800", letterSpacing: -0.3 },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "500", marginTop: 4 },

  menu: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 24 },
  btn: {
    width: "100%", padding: 18, borderRadius: 16, alignItems: "center",
    elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6,
  },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});

export default AdminDashboard;