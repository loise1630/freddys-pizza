import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const AdminDashboard = (props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Panel 🛠️</Text>
      
      <View style={styles.menuContainer}>
        
        {/* DITO MO ILALAGAY YUNG PINAPALAGAY MO */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => props.navigation.navigate("AdminProducts")}
        >
          <Text style={styles.buttonText}>Manage Products</Text>
        </TouchableOpacity>

        {/* Button para sa pag-add ng bagong Pizza */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: "#4CAF50" }]} 
          onPress={() => props.navigation.navigate("ProductForm")}
        >
          <Text style={styles.buttonText}>Add New Pizza</Text>
        </TouchableOpacity>

        {/* Logout Button */}
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
    paddingTop: 50 
  },
  title: { 
    fontSize: 30, 
    fontWeight: "bold", 
    color: "#e61e1e" 
  },
  menuContainer: { 
    width: "100%", 
    alignItems: "center", 
    marginTop: 40 
  },
  button: { 
    width: "80%", 
    backgroundColor: "#e61e1e", 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 15, 
    alignItems: "center" 
  },
  buttonText: { 
    color: "white", 
    fontWeight: "bold", 
    fontSize: 16 
  }
});

export default AdminDashboard;