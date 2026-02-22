import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";

const AdminDashboard = (props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Panel 🛠️</Text>
      
      <View style={styles.menuContainer}>
        
        {/* ITO NA ANG MAIN HUB: Dito ka na mag-aadd, edit, at delete */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => props.navigation.navigate("AdminProducts")}
        >
          <Text style={styles.buttonText}>Manage Products</Text>
        </TouchableOpacity>

        {/* Inalis na natin ang 'Add New Pizza' dito para iwas gulo sa inventory */}

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: "#2196F3" }]} 
          onPress={() => Alert.alert("Orders", "Orders feature coming soon!")}
        >
          <Text style={styles.buttonText}>View Orders</Text>
        </TouchableOpacity>

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
    paddingTop: 80 // Tinaasan ko ng konti para mas maganda ang spacing
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
    width: "85%", // Mas malapad ng konti para mas clickable
    backgroundColor: "#e61e1e", 
    padding: 18, 
    borderRadius: 12, 
    marginBottom: 20, 
    alignItems: "center",
    elevation: 3, // Dagdag anino para sa Android
    shadowColor: "#000", // Dagdag anino para sa iOS
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