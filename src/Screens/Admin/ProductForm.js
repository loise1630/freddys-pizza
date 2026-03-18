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

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      // PINAKABAGO: In-update para sa Expo SDK 50+
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
      Alert.alert("Photo Required", "Please add at least one photo of the pizza 🍕");
      return;
    }

    const newProduct = {
      name,
      price: Number(price),
      description,
      images: images, 
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/products`, newProduct);
      if (response.status === 201) {
        Alert.alert("Success", "Pizza added with photos! 🍕");
        props.navigation.navigate("AdminDashboard");
      }
    } catch (error) {
      console.log("Submit Error:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to save product.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add New Pizza</Text>

      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Pizza Name" />
      <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="Price" keyboardType="numeric" />
      <TextInput style={[styles.input, { height: 80 }]} value={description} onChangeText={setDescription} placeholder="Description" multiline />

      <Text style={styles.label}>Photos ({images.length}) - Required</Text>
      <View style={styles.imageContainer}>
        {images.map((uri, index) => (
          <Image key={index} source={{ uri }} style={styles.thumbnail} />
        ))}
        <TouchableOpacity style={styles.addButton} onPress={pickImage}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
        <Text style={styles.saveButtonText}>Save Pizza</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: 'center', color: '#e61e1e' },
  input: { backgroundColor: "#f2f2f2", padding: 15, borderRadius: 10, marginBottom: 15 },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  imageContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  thumbnail: { width: 70, height: 70, borderRadius: 10, marginRight: 10, marginBottom: 10 },
  addButton: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1 },
  addButtonText: { fontSize: 30, color: '#666' },
  saveButton: { backgroundColor: "#e61e1e", padding: 15, borderRadius: 10, alignItems: "center" },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 18 }
});

export default ProductForm;