import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import axios from "axios";
import { BASE_URL } from "../../../config";

const Register = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) return Alert.alert("Error", "Please fill in all fields");
    if (!agreed) return Alert.alert("Terms", "Please agree to the Terms & Conditions");
    try {
      const { status } = await axios.post(`${BASE_URL}/api/users/register`, {
        name, email: email.toLowerCase().trim(), password, phone,
      });
      if (status === 201) {
        Alert.alert("Success", "Account created! 🍕");
        navigation.navigate("Login");
      }
    } catch (error) {
      Alert.alert("Registration Failed", error.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.topBar} />

        <View style={s.headerWrap}>
          <Text style={s.heading}>Register &</Text>
          <Text style={[s.heading, s.headingAccent]}>Get Started!</Text>
        </View>

        {[
          { label: "Full Name", value: name, setter: setName, placeholder: "Juan Dela Cruz" },
          { label: "Email Address", value: email, setter: setEmail, placeholder: "mail@mail.com", keyboardType: "email-address", autoCapitalize: "none" },
          { label: "Phone Number", value: phone, setter: setPhone, placeholder: "09xx xxx xxxx", keyboardType: "numeric" },
        ].map(({ label, value, setter, placeholder, ...rest }) => (
          <View key={label} style={s.field}>
            <Text style={s.label}>{label}</Text>
            <TextInput style={s.input} placeholder={placeholder} placeholderTextColor="#bbb"
              value={value} onChangeText={setter} {...rest} />
          </View>
        ))}

        <View style={s.field}>
          <Text style={s.label}>Create Password</Text>
          <View style={s.passRow}>
            <TextInput style={[s.input, { flex: 1 }]} placeholder="••••••••" placeholderTextColor="#bbb"
              secureTextEntry={!showPass} value={password} onChangeText={setPassword} />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={s.eyeBtn}>
              <Text style={s.eyeTxt}>{showPass ? "🙈" : "👁"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={s.termsRow} onPress={() => setAgreed(!agreed)} activeOpacity={0.7}>
          <View style={[s.checkbox, agreed && s.checkboxOn]}>
            {agreed && <Text style={s.checkMark}>✓</Text>}
          </View>
          <Text style={s.termsTxt}>By Clicking Register, I agree with <Text style={s.termsLink}>Terms & Conditions</Text></Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.primaryBtn} onPress={handleRegister} activeOpacity={0.85}>
          <Text style={s.primaryBtnTxt}>Register</Text>
        </TouchableOpacity>

        <View style={s.divider}>
          <View style={s.divLine} /><Text style={s.divTxt}>or</Text><View style={s.divLine} />
        </View>

        <TouchableOpacity style={[s.socialBtn, { marginBottom: 10 }]}>
          <Text style={s.socialIcon}>f</Text><Text style={s.socialTxt}>Register with Facebook</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.socialBtn}>
          <Text style={s.socialIcon}>G</Text><Text style={s.socialTxt}>Register with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")} style={s.footerWrap}>
          <Text style={s.footerTxt}>Already have an account? <Text style={s.footerLink}>Login</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  topBar: { height: 5, backgroundColor: "#E8441A", borderBottomLeftRadius: 4, borderBottomRightRadius: 4, marginBottom: 32 },
  container: { paddingHorizontal: 28, paddingBottom: 40 },

  headerWrap: { marginBottom: 26 },
  heading: { fontSize: 26, fontWeight: "700", color: "#1a1a1a", lineHeight: 32 },
  headingAccent: { color: "#E8441A" },

  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: "600", color: "#555", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { borderWidth: 1.5, borderColor: "#e8e8e8", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: "#1a1a1a", backgroundColor: "#fafafa" },
  passRow: { flexDirection: "row", alignItems: "center" },
  eyeBtn: { position: "absolute", right: 12 },
  eyeTxt: { fontSize: 16 },

  termsRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 20, marginTop: 4 },
  checkbox: { width: 18, height: 18, borderWidth: 1.5, borderColor: "#ccc", borderRadius: 4, marginRight: 10, alignItems: "center", justifyContent: "center", marginTop: 1 },
  checkboxOn: { backgroundColor: "#E8441A", borderColor: "#E8441A" },
  checkMark: { color: "#fff", fontSize: 11, fontWeight: "700" },
  termsTxt: { fontSize: 12, color: "#888", flex: 1, lineHeight: 18 },
  termsLink: { color: "#E8441A", fontWeight: "600" },

  primaryBtn: {
    backgroundColor: "#E8441A", borderRadius: 12, paddingVertical: 14, alignItems: "center",
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

export default Register;