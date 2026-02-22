import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import axios from 'axios';
import { BASE_URL } from "../../../config"; 

const Login = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (email === "" || password === "") {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // FIX: Dinagdagan ng /api/ sa URL
      const response = await axios.post(`${BASE_URL}/api/users/login`, {
        email: email.toLowerCase().trim(),
        password: password,
      });

      console.log("Full Server Response:", response.data);

      const userData = response.data.user ? response.data.user : response.data;
      
      setLoading(false);

      if (userData.isAdmin === true || userData.isAdmin === "true") {
        Alert.alert("Welcome Admin", "Redirecting to Dashboard... 🛠️");
        props.navigation.navigate("AdminDashboard"); 
      } else {
        Alert.alert("Success", "Login Successful! 🍕");
        props.navigation.navigate("Main"); 
      }

    } catch (error) {
      setLoading(false);
      console.log("Login Error Details:", error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.message || "Invalid email or password";
      Alert.alert("Login Failed", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍕 Freddy's Pizza</Text>
      
      <View style={styles.inputView}>
        <TextInput
          style={styles.inputText}
          placeholder="Email..."
          placeholderTextColor="#003f5c"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
      </View>

      <View style={styles.inputView}>
        <TextInput
          secureTextEntry
          style={styles.inputText}
          placeholder="Password..."
          placeholderTextColor="#003f5c"
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
      </View>

      <TouchableOpacity 
        style={styles.loginBtn}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.loginText}>LOGIN</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => props.navigation.navigate("Register")}>
        <Text style={styles.actionsText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  title: { fontWeight: "bold", fontSize: 40, color: "#e61e1e", marginBottom: 40 },
  inputView: { width: "80%", backgroundColor: "#f2f2f2", borderRadius: 25, height: 50, marginBottom: 20, justifyContent: "center", padding: 20 },
  inputText: { height: 50, color: "black" },
  loginBtn: { width: "80%", backgroundColor: "#e61e1e", borderRadius: 25, height: 50, alignItems: "center", justifyContent: "center", marginTop: 20, marginBottom: 10 },
  loginText: { color: "white", fontWeight: "bold" },
  actionsText: { color: "#003f5c", marginTop: 10 }
});

export default Login;