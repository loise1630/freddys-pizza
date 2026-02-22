import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import axios from 'axios'; 
import { BASE_URL } from "../../../config"; 

const Register = (props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (name === "" || email === "" || password === "") {
      Alert.alert("Error", "Please fill in all fields");
      return; 
    }

    try {
      // FIX: Dinagdagan ng /api/ sa URL
      const response = await axios.post(`${BASE_URL}/api/users/register`, {
        name: name,
        email: email.toLowerCase().trim(),
        password: password,
        phone: phone 
      });

      if (response.status === 201) {
        Alert.alert("Success", "Account created successfully! 🍕");
        props.navigation.navigate("Login");
      }
    } catch (error) {
      console.log("Register Error Details:", error.response?.data || error.message);
      Alert.alert(
        "Registration Failed", 
        error.response?.data?.message || "Something went wrong."
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account 🍕</Text>
      
      <View style={styles.inputView}>
        <TextInput
          style={styles.inputText}
          placeholder="Full Name..."
          placeholderTextColor="#003f5c"
          onChangeText={(text) => setName(text)}
        />
      </View>

      <View style={styles.inputView}>
        <TextInput
          style={styles.inputText}
          placeholder="Email..."
          placeholderTextColor="#003f5c"
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(text) => setEmail(text)}
        />
      </View>

      <View style={styles.inputView}>
        <TextInput
          style={styles.inputText}
          placeholder="Phone Number..."
          placeholderTextColor="#003f5c"
          keyboardType="numeric"
          onChangeText={(text) => setPhone(text)}
        />
      </View>

      <View style={styles.inputView}>
        <TextInput
          secureTextEntry
          style={styles.inputText}
          placeholder="Password..."
          placeholderTextColor="#003f5c"
          onChangeText={(text) => setPassword(text)}
        />
      </View>

      <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
        <Text style={styles.text}>REGISTER</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => props.navigation.navigate("Login")}>
        <Text style={styles.actionsText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", paddingVertical: 50 },
  title: { fontWeight: "bold", fontSize: 35, color: "#e61e1e", marginBottom: 40 },
  inputView: { width: "80%", backgroundColor: "#f2f2f2", borderRadius: 25, height: 50, marginBottom: 20, justifyContent: "center", padding: 20 },
  inputText: { height: 50, color: "black" },
  registerBtn: { width: "80%", backgroundColor: "#e61e1e", borderRadius: 25, height: 50, alignItems: "center", justifyContent: "center", marginTop: 20, marginBottom: 10 },
  text: { color: "white", fontWeight: "bold" },
  actionsText: { color: "#003f5c", marginTop: 15 },
});

export default Register;