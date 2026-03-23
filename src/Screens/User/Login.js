import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Alert,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Dimensions,
} from "react-native";
import axios from "axios";
import { BASE_URL } from "../../../config";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";

const { height } = Dimensions.get("window");

const Login = ({ navigation }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "837994144432-hm8vrr2v8ohqk737rtmej1fj07h8nog6.apps.googleusercontent.com",
      offlineAccess: true,
      accountName: "",
    });
  }, []);

  const finalizeLogin = async (userData) => {
    try {
      await AsyncStorage.setItem("userToken", `JWT_${Math.random().toString(36).substr(2)}`);
      let pushToken = "";
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        pushToken = tokenData.data;
        await axios.post(`${BASE_URL}/api/users/update-push-token`, { userId: userData._id, pushToken });
      } catch (e) { console.log("Push token skip:", e.message); }
      const finalUser = { ...userData, pushToken };
      await AsyncStorage.setItem("user", JSON.stringify(finalUser));
      dispatch({ type: "LOGIN_USER", payload: finalUser });
      setLoading(false);
      navigation.navigate(finalUser.isAdmin ? "AdminDashboard" : "Main");
    } catch {
      setLoading(false);
      Alert.alert("Sync Error", "Problem saving session data.");
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Error", "Please fill in all fields");
    setLoading(true);
    try {
      const { data } = await axios.post(`${BASE_URL}/api/users/login`, {
        email: email.toLowerCase().trim(), password,
      });
      finalizeLogin(data);
    } catch (error) {
      setLoading(false);
      Alert.alert("Login Failed", error.response?.data?.message || "Invalid credentials");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      try { await GoogleSignin.signOut(); } catch {}
      const response = await GoogleSignin.signIn();
      const user = response.data?.user || response.user;
      const { data } = await axios.post(`${BASE_URL}/api/users/google-login`, {
        email: user.email, name: user.name, googleId: user.id, image: user.photo,
      });
      finalizeLogin(data);
    } catch (error) {
      setLoading(false);
      if (error.code !== statusCodes.SIGN_IN_CANCELLED)
        Alert.alert("Google Login Error", "Please try again.");
    }
  };

  return (
    <View style={s.root}>
      {/* Hero */}
      <View style={s.hero}>
        <View style={s.heroOverlay} />
        <Text style={s.brandName}>Freddy's Pizza!</Text>
        <Text style={s.brandSub}>Satisfy your pizza cravings.</Text>
      </View>

      {/* Card */}
      <KeyboardAvoidingView style={s.cardWrap} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={s.card} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={s.heading}>Let's Get Started!</Text>

          <View style={s.field}>
            <Text style={s.label}>Email Address</Text>
            <TextInput style={s.input} placeholder="mail@mail.com" placeholderTextColor="#bbb"
              value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Password</Text>
            <View style={s.passRow}>
              <TextInput style={[s.input, { flex: 1 }]} placeholder="Enter password" placeholderTextColor="#bbb"
                value={password} onChangeText={setPassword} secureTextEntry={!showPass} />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={s.eyeBtn}>
                <Text style={s.eyeTxt}>{showPass ? "🙈" : "👁"}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={s.forgotWrap}>
              <Text style={s.forgotTxt}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.primaryBtn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnTxt}>Login</Text>}
          </TouchableOpacity>

          <View style={s.divider}>
            <View style={s.divLine} /><Text style={s.divTxt}>or</Text><View style={s.divLine} />
          </View>

          <TouchableOpacity style={s.socialBtn} onPress={handleGoogleLogin} disabled={loading}>
            <Text style={s.socialIcon}>G</Text><Text style={s.socialTxt}>Login with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Register")} style={s.footerWrap}>
            <Text style={s.footerTxt}>Don't have an account? <Text style={s.footerLink}>Register</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const HERO_H = height * 0.38;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },

  hero: {
    height: HERO_H, backgroundColor: "#E8441A",
    justifyContent: "flex-end", padding: 24,
  },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.15)" },
  brandName: { fontSize: 38, fontWeight: "800", color: "#fff", letterSpacing: 1 },
  brandSub: { fontSize: 13, color: "rgba(255,255,255,0.82)", marginTop: 4, marginBottom: 6 },

  cardWrap: { flex: 1 },
  card: { paddingHorizontal: 28, paddingTop: 28, paddingBottom: 36 },
  heading: { fontSize: 22, fontWeight: "700", color: "#1a1a1a", marginBottom: 22 },

  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: "600", color: "#555", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { borderWidth: 1.5, borderColor: "#e8e8e8", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: "#1a1a1a", backgroundColor: "#fafafa" },
  passRow: { flexDirection: "row", alignItems: "center" },
  eyeBtn: { position: "absolute", right: 12 },
  eyeTxt: { fontSize: 16 },
  forgotWrap: { alignSelf: "flex-end", marginTop: 6 },
  forgotTxt: { fontSize: 12, color: "#E8441A", fontWeight: "600" },

  primaryBtn: {
    backgroundColor: "#E8441A", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 6,
    shadowColor: "#E8441A", shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5,
  },
  primaryBtnTxt: { color: "#fff", fontWeight: "700", fontSize: 15, letterSpacing: 0.5 },

  divider: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  divLine: { flex: 1, height: 1, backgroundColor: "#ebebeb" },
  divTxt: { marginHorizontal: 12, color: "#aaa", fontSize: 12 },

  socialBtn: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderColor: "#e8e8e8", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 18, backgroundColor: "#fafafa" },
  socialIcon: { fontSize: 15, fontWeight: "800", color: "#333", width: 22 },
  socialTxt: { fontSize: 13, color: "#333", fontWeight: "500" },

  footerWrap: { alignItems: "center", marginTop: 24 },
  footerTxt: { fontSize: 13, color: "#888" },
  footerLink: { color: "#E8441A", fontWeight: "700" },
});

export default Login;