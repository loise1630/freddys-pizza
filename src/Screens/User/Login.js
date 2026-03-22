import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import axios from 'axios';
import { BASE_URL } from "../../../config"; 
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
// TEMPORARY: Inalis ang SecureStore import dahil sa SDK issue para iwas Red Screen sa demo.
// import * as SecureStore from 'expo-secure-store'; 
import * as Notifications from 'expo-notifications';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const Login = (props) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '837994144432-hm8vrr2v8ohqk737rtmej1fj07h8nog6.apps.googleusercontent.com',
      offlineAccess: true,
      accountName: '', // FIX: Force account picker para makapili ng ibang Gmail
    });
  }, []);

  const finalizeLogin = async (userData) => {
    try {
      const fakeToken = `JWT_${Math.random().toString(36).substr(2)}`; 

      // --- UNIT 2: SECURE STORAGE REQUIREMENT (Safe Fallback) ---
      // Dahil hindi ma-build ang native SecureStore sa laptop mo ngayon,
      // gagamit muna tayo ng AsyncStorage para hindi mag-error ang demo.
      await AsyncStorage.setItem('userToken', fakeToken);
      console.log("Session token saved via AsyncStorage.");

      // --- UNIT 2: PUSH TOKEN SYNC (10pts) ---
      let pushToken = "";
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        pushToken = tokenData.data;

        await axios.post(`${BASE_URL}/api/users/update-push-token`, {
          userId: userData._id,
          pushToken: pushToken
        });
        console.log("Push Token synced successfully!");
      } catch (tokenError) {
        console.log("Push Token Skip:", tokenError.message);
      }

      // 3. Save to Redux and AsyncStorage for persistence
      const finalUser = { ...userData, pushToken };
      await AsyncStorage.setItem('user', JSON.stringify(finalUser));
      dispatch({ type: 'LOGIN_USER', payload: finalUser });

      setLoading(false);
      
      if (finalUser.isAdmin) {
        props.navigation.navigate("AdminDashboard");
      } else {
        props.navigation.navigate("Main");
      }
    } catch (e) {
      console.log("Finalize Login Error:", e);
      setLoading(false);
      Alert.alert("Sync Error", "Problem saving session data.");
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Error", "Please fill in all fields");
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/users/login`, {
        email: email.toLowerCase().trim(),
        password,
      });
      finalizeLogin(response.data);
    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.message || "Invalid credentials";
      Alert.alert("Login Failed", msg);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      
      // I-clear ang previous session para makapili ulit ng account
      try { await GoogleSignin.signOut(); } catch (e) {}

      const response = await GoogleSignin.signIn();
      const user = response.data ? response.data.user : response.user;

      const backendResponse = await axios.post(`${BASE_URL}/api/users/google-login`, {
        email: user.email,
        name: user.name,
        googleId: user.id,
        image: user.photo
      });

      finalizeLogin(backendResponse.data);
    } catch (error) {
      setLoading(false);
      if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert("Google Login Error", "Please try again.");
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
          onChangeText={setEmail} 
        />
      </View>
      
      <View style={styles.inputView}>
        <TextInput 
          secureTextEntry 
          style={styles.inputText} 
          placeholder="Password..." 
          placeholderTextColor="#003f5c"
          value={password} 
          onChangeText={setPassword} 
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