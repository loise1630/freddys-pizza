import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import axios from 'axios';
import { BASE_URL } from "../../../config"; 
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const Login = (props) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Configure Google Sign-In
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '837994144432-hm8vrr2v8ohqk737rtmej1fj07h8nog6.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  // --- MANUAL LOGIN LOGIC ---
  const handleLogin = async () => {
    if (email === "" || password === "") {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/users/login`, {
        email: email.toLowerCase().trim(),
        password: password,
      });
      
      const userData = response.data.user ? response.data.user : response.data;
      
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      dispatch({ type: 'LOGIN_USER', payload: userData });

      setLoading(false);
      if (userData.isAdmin) {
        props.navigation.navigate("AdminDashboard"); 
      } else {
        props.navigation.navigate("Main"); 
      }
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response?.data?.message || "Invalid email or password";
      Alert.alert("Login Failed", errorMessage);
    }
  };

  // --- GOOGLE LOGIN LOGIC (WITH DATABASE SYNC) ---
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      
      // I-check kung nasaan ang user object (para iwas 'id' of undefined error)
      const user = response.data ? response.data.user : response.user;

      if (!user) throw new Error("User data not found from Google");

      // SYNC SA BACKEND: Importante ito para magkaroon ng _id (Database ID) ang Google user
      // para makapag-rate sila sa Completed Tab.
      const backendResponse = await axios.post(`${BASE_URL}/api/users/google-login`, {
        email: user.email,
        name: user.name,
        googleId: user.id,
        image: user.photo
      });

      // Gamitin ang data mula sa database (may _id na ito)
      const userData = backendResponse.data;

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      dispatch({ type: 'LOGIN_USER', payload: userData });

      setLoading(false);
      Alert.alert("Success 🍕", `Welcome, ${userData.name}!`);
      props.navigation.navigate("Main");

    } catch (error) {
      setLoading(false);
      console.log("Google Auth Error:", error.response?.data || error.message);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert("Cancelled", "Login was cancelled.");
      } else {
        Alert.alert("Login Error", "Make sure your SHA-1 is in Firebase and Backend is running.");
      }
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

      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.loginText}>LOGIN</Text>}
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.loginBtn, { backgroundColor: "#4285F4", marginTop: 10 }]} 
        onPress={handleGoogleLogin}
        disabled={loading}
      >
        <Text style={styles.loginText}>SIGN IN WITH GOOGLE 🌐</Text>
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
  loginBtn: { width: "80%", backgroundColor: "#e61e1e", borderRadius: 25, height: 50, alignItems: "center", justifyContent: "center", marginTop: 20 },
  loginText: { color: "white", fontWeight: "bold" },
  actionsText: { color: "#003f5c", marginTop: 20 }
});

export default Login;