import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from "react-native";
import * as ImagePicker from 'expo-image-picker'; 
import axios from "axios";
import { BASE_URL } from "../../../config"; 

const ProductForm = (props) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]); 
  const [category, setCategory] = useState("Pizza"); 

  const categories = ["Pizza", "Drinks", "Sides"];

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      allowsMultipleSelection: true, 
      quality: 0.4, 
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map(asset => asset.uri);
      setImages([...images, ...selectedUris]);
    }
  };

  const handleSubmit = async () => {
    if (name === "" || price === "" || description === "") {
      Alert.alert("Error", "Please fill in all text fields");
      return;
    }
    
    if (images.length === 0) {
      Alert.alert("Photo Required", "Please add at least one photo 🍕");
      return;
    }

    const newProduct = {
      name,
      price: Number(price),
      description,
      category, 
      images: images, 
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/products`, newProduct);
      if (response.status === 201) {
        Alert.alert("Success", `${name} added to ${category}! 🍕`);
        props.navigation.navigate("AdminDashboard");
      }
    } catch (error) {
      console.log("Submit Error:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to save product.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add New Product</Text>

      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Product Name" />
      <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="Price" keyboardType="numeric" />
      
      <Text style={styles.label}>Category Selection:</Text>
      <View style={styles.categoryRow}>
        {categories.map((cat) => (
          <TouchableOpacity 
            key={cat} 
            style={[styles.catButton, category === cat && styles.activeCatButton]} 
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.catText, category === cat && styles.activeCatText]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput style={[styles.input, { height: 80 }]} value={description} onChangeText={setDescription} placeholder="Description" multiline />

      <Text style={styles.label}>Photos ({images.length})</Text>
      <View style={styles.imageContainer}>
        {images.map((uri, index) => (
          <Image key={index} source={{ uri }} style={styles.thumbnail} />
        ))}
        <TouchableOpacity style={styles.addButton} onPress={pickImage}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
        <Text style={styles.saveButtonText}>Save Product</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: 'center', color: '#e61e1e' },
  input: { backgroundColor: "#f2f2f2", padding: 15, borderRadius: 10, marginBottom: 15 },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  catButton: { flex: 1, padding: 10, backgroundColor: '#eee', marginHorizontal: 5, borderRadius: 10, alignItems: 'center' },
  activeCatButton: { backgroundColor: '#e61e1e' },
  catText: { fontWeight: 'bold', color: '#666' },
  activeCatText: { color: '#fff' },
  imageContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  thumbnail: { width: 70, height: 70, borderRadius: 10, marginRight: 10, marginBottom: 10 },
  addButton: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
  addButtonText: { fontSize: 30, color: '#666' },
  saveButton: { backgroundColor: "#e61e1e", padding: 15, borderRadius: 10, alignItems: "center" },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 18 }
});

export default ProductForm;