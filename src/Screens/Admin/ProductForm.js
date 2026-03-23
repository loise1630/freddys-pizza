import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, Image, StatusBar, Platform } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import axios from "axios";
import { BASE_URL } from "../../../config";

const CATEGORIES = ["Pizza", "Drinks", "Sides"];

const ProductForm = ({ navigation }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState("Pizza");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, quality: 0.4 });
    if (!result.canceled) setImages([...images, ...result.assets.map(a => a.uri)]);
  };

  const handleSubmit = async () => {
    if (!name || !price || !description) return Alert.alert("Error", "Please fill in all text fields");
    if (!images.length) return Alert.alert("Photo Required", "Please add at least one photo 🍕");
    try {
      const { status } = await axios.post(`${BASE_URL}/api/products`, { name, price: Number(price), description, category, images });
      if (status === 201) { Alert.alert("Success", `${name} added to ${category}! 🍕`); navigation.navigate("AdminDashboard"); }
    } catch (e) { Alert.alert("Error", "Failed to save product."); }
  };

  return (
    <View style={s.container}>
      <StatusBar backgroundColor="#FF6B35" barStyle="light-content" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.headerTitle}>Add New Product</Text>
          <Text style={s.headerSub}>Fill in the product details</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.body}>
        <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Product Name" placeholderTextColor="#bbb" />
        <TextInput style={s.input} value={price} onChangeText={setPrice} placeholder="Price" keyboardType="numeric" placeholderTextColor="#bbb" />

        <Text style={s.label}>Category</Text>
        <View style={s.categoryRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat} style={[s.catBtn, category === cat && s.activeCatBtn]} onPress={() => setCategory(cat)}>
              <Text style={[s.catText, category === cat && { color: '#fff' }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput style={[s.input, { height: 80 }]} value={description} onChangeText={setDescription}
          placeholder="Description" multiline placeholderTextColor="#bbb" />

        <Text style={s.label}>Photos ({images.length})</Text>
        <View style={s.imageContainer}>
          {images.map((uri, i) => (
            <TouchableOpacity key={i} onPress={() => setImages(images.filter((_, j) => j !== i))}>
              <Image source={{ uri }} style={s.thumbnail} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={s.addBtn} onPress={pickImage}>
            <Text style={s.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.saveBtn} onPress={handleSubmit} activeOpacity={0.85}>
          <Text style={s.saveBtnText}>Save Product</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF6B35',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 54,
    paddingBottom: 18, paddingHorizontal: 20,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: -2 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500', marginTop: 1 },

  body: { padding: 20 },
  input: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 14, borderWidth: 1.5, borderColor: '#E8E8E8', color: '#1A1A1A', fontSize: 14 },
  label: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 8 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, gap: 8 },
  catBtn: { flex: 1, padding: 10, backgroundColor: '#fff', borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: '#E8E8E8' },
  activeCatBtn: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  catText: { fontWeight: '700', color: '#666', fontSize: 13 },
  imageContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, gap: 10 },
  thumbnail: { width: 70, height: 70, borderRadius: 10 },
  addBtn: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#aaa' },
  addBtnText: { fontSize: 30, color: '#999' },
  saveBtn: {
    backgroundColor: '#FF6B35', padding: 16, borderRadius: 16, alignItems: 'center',
    elevation: 4, shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8,
  },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});

export default ProductForm;