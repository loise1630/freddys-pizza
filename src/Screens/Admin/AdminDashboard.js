import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const AdminDashboard = (props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Panel 🛠️</Text>
      
      <View style={styles.menuContainer}>
        
        {/* MANAGE PRODUCTS HUB */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => props.navigation.navigate("AdminProducts")}
        >
          <Text style={styles.buttonText}>Manage Products</Text>
        </TouchableOpacity>

        {/* VIEW ORDERS - Connected na sa AdminOrders screen */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: "#2196F3" }]} 
          onPress={() => props.navigation.navigate("AdminOrders")}
        >
          <Text style={styles.buttonText}>View Orders</Text>
        </TouchableOpacity>

        {/* LOGOUT */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: "#333" }]} 
          onPress={() => props.navigation.navigate("Login")}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8f9fa", 
    alignItems: "center", 
    paddingTop: 80 
  },
  title: { 
    fontSize: 32, 
    fontWeight: "bold", 
    color: "#e61e1e",
    marginBottom: 20
  },
  menuContainer: { 
    width: "100%", 
    alignItems: "center", 
    marginTop: 20 
  },
  button: { 
    width: "85%", 
    backgroundColor: "#e61e1e", 
    padding: 18, 
    borderRadius: 12, 
    marginBottom: 20, 
    alignItems: "center",
    elevation: 3, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: { 
    color: "white", 
    fontWeight: "bold", 
    fontSize: 18 
  }
});

export default AdminDashboard;