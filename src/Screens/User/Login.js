import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Alert,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Dimensions,
} from "react-native";
import axios from "axios";
import { BASE_URL } from "../../../config";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

const { height } = Dimensions.get("window");

const Login = ({ navigation }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const finalizeLogin = async (userData) => {
    try {
      await AsyncStorage.setItem("userToken", `JWT_${Math.random().toString(36).substr(2)}`);
      
      let pushToken = "";
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        pushToken = tokenData.data;
        
        await axios.post(`${BASE_URL}/api/users/update-push-token`, { 
          userId: userData._id, 
          pushToken 
        });
      } catch (e) { 
        console.log("Push token registration skipped (Normal for dev):", e.message); 
      }

      const finalUser = { ...userData, pushToken: pushToken || "" };
      
      await AsyncStorage.setItem("user", JSON.stringify(finalUser));
      dispatch({ type: "LOGIN_USER", payload: finalUser });
      
      setLoading(false);
      
      if (finalUser.isAdmin) {
        navigation.replace("AdminDashboard");
      } else {
        navigation.replace("Main");
      }
    } catch (error) {
      setLoading(false);
      console.error("Finalize Login Error:", error);
      Alert.alert("Sync Error", "Problem saving session. Please try again.");
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Please enter both email and password.");
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/users/login`, {
        email: email.toLowerCase().trim(), 
        password,
      });
      
      finalizeLogin(response.data);
    } catch (error) {
      setLoading(false);
      const errorMsg = error.response?.data?.message || "Invalid email or password.";
      Alert.alert("Login Failed", errorMsg);
    }
  };

  return (
    <View style={s.root}>
      <View style={s.hero}>
        <View style={s.heroOverlay} />
        <Text style={s.brandName}>Freddy's Pizza! 🍕</Text>
        <Text style={s.brandSub}>Your favorite pizza, just a tap away.</Text>
      </View>

      <KeyboardAvoidingView 
        style={s.cardWrap} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView 
          contentContainerStyle={s.card} 
          keyboardShouldPersistTaps="handled" 
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.heading}>Welcome Back!</Text>

          <View style={s.field}>
            <Text style={s.label}>Email Address</Text>
            <TextInput 
              style={s.input} 
              placeholder="example@mail.com" 
              placeholderTextColor="#bbb"
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address" 
              autoCapitalize="none" 
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Password</Text>
            <View style={s.passRow}>
              <TextInput 
                style={[s.input, { flex: 1 }]} 
                placeholder="••••••••" 
                placeholderTextColor="#bbb"
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry={!showPass} 
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={s.eyeBtn}>
                <Text style={s.eyeTxt}>{showPass ? "🙈" : "👁"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={s.primaryBtn} 
            onPress={handleLogin} 
            disabled={loading} 
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.primaryBtnTxt}>LOGIN</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Register")} style={s.footerWrap}>
            <Text style={s.footerTxt}>
              Don't have an account? <Text style={s.footerLink}>Register here</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const HERO_H = height * 0.35;
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  hero: { height: HERO_H, backgroundColor: "#E8441A", justifyContent: "flex-end", padding: 24 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.1)" },
  brandName: { fontSize: 36, fontWeight: "800", color: "#fff", letterSpacing: 1 },
  brandSub: { fontSize: 14, color: "rgba(255,255,255,0.9)", marginTop: 4 },
  cardWrap: { flex: 1 },
  card: { paddingHorizontal: 28, paddingTop: 30, paddingBottom: 40 },
  heading: { fontSize: 24, fontWeight: "700", color: "#1a1a1a", marginBottom: 25 },
  field: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: "600", color: "#555", marginBottom: 8, textTransform: "uppercase" },
  input: { borderWidth: 1.5, borderColor: "#eee", borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, fontSize: 15, color: "#1a1a1a", backgroundColor: "#fafafa" },
  passRow: { flexDirection: "row", alignItems: "center" },
  eyeBtn: { position: "absolute", right: 15 },
  eyeTxt: { fontSize: 18 },
  primaryBtn: { backgroundColor: "#E8441A", borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: 10, elevation: 4 },
  primaryBtnTxt: { color: "#fff", fontWeight: "700", fontSize: 16, letterSpacing: 1 },
  footerWrap: { alignItems: "center", marginTop: 30 },
  footerTxt: { fontSize: 14, color: "#777" },
  footerLink: { color: "#E8441A", fontWeight: "700" },
});

export default Login;