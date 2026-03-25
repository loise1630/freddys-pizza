import React, { useState } from "react";
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, 
  ScrollView, Image, StatusBar, Platform, Dimensions 
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import axios from "axios";
import { BASE_URL } from "../../../config";

const CATEGORIES = ["Pizza", "Drinks", "Sides"];

const ProductForm = ({ navigation }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState(""); // 
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState("Pizza");
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ['images'], 
      allowsMultipleSelection: true, 
      quality: 0.4 
    });
    if (!result.canceled) setImages([...images, ...result.assets.map(a => a.uri)]);
  };

  const handleSubmit = async () => {
    // Validation: Kasama na ang stock sa check
    if (!name || !price || !description || !stock) {
      return Alert.alert("Error", "Please fill in all text fields including Stock");
    }
    if (!images.length) {
      return Alert.alert("Photo Required", "Please add at least one photo 🍕");
    }

    setLoading(true);
    try {
      const payload = { 
        name, 
        price: Number(price), 
        stock: Number(stock), // <-- Ipinapadala sa Backend
        description, 
        category, 
        images 
      };

      const { status } = await axios.post(`${BASE_URL}/api/products`, payload);
      
      if (status === 201) { 
        Alert.alert("Success", `${name} added to inventory!`); 
        navigation.goBack(); // Babalik sa ManageProducts para ma-refresh ang listahan
      }
    } catch (e) { 
      console.error(e);
      Alert.alert("Error", "Failed to save product. Check your server."); 
    } finally {
      setLoading(false);
    }
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
          <Text style={s.headerSub}>Inventory Management</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        {/* Product Name */}
        <Text style={s.label}>Product Name</Text>
        <TextInput 
          style={s.input} 
          value={name} 
          onChangeText={setName} 
          placeholder="e.g. Pepperoni Feast" 
          placeholderTextColor="#bbb" 
        />

        {/* Price and Stock Row */}
        <View style={s.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={s.label}>Price (₱)</Text>
            <TextInput 
              style={s.input} 
              value={price} 
              onChangeText={setPrice} 
              placeholder="0.00" 
              keyboardType="numeric" 
              placeholderTextColor="#bbb" 
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Stock Quantity</Text>
            <TextInput 
              style={s.input} 
              value={stock} 
              onChangeText={setStock} 
              placeholder="0" 
              keyboardType="numeric" 
              placeholderTextColor="#bbb" 
            />
          </View>
        </View>

        {/* Category Selection */}
        <Text style={s.label}>Category</Text>
        <View style={s.categoryRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[s.catBtn, category === cat && s.activeCatBtn]} 
              onPress={() => setCategory(cat)}
            >
              <Text style={[s.catText, category === cat && { color: '#fff' }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <Text style={s.label}>Description</Text>
        <TextInput 
          style={[s.input, { height: 100, textAlignVertical: 'top' }]} 
          value={description} 
          onChangeText={setDescription}
          placeholder="Write something delicious about this product..." 
          multiline 
          placeholderTextColor="#bbb" 
        />

        {/* Image Uploader */}
        <Text style={s.label}>Photos ({images.length})</Text>
        <View style={s.imageContainer}>
          {images.map((uri, i) => (
            <TouchableOpacity key={i} onPress={() => setImages(images.filter((_, j) => j !== i))}>
              <Image source={{ uri }} style={s.thumbnail} />
              <View style={s.deleteBadge}><Text style={s.deleteText}>×</Text></View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={s.addBtn} onPress={pickImage}>
            <Text style={s.addBtnText}>+</Text>
            <Text style={{ fontSize: 10, color: '#999' }}>Add Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[s.saveBtn, loading && { opacity: 0.7 }]} 
          onPress={handleSubmit} 
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={s.saveBtnText}>{loading ? "Saving..." : "Save Product"}</Text>
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
    paddingBottom: 20, paddingHorizontal: 20,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: '#fff', fontSize: 22, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 1 },

  body: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '700', color: '#444', marginBottom: 8, marginLeft: 4 },
  input: { 
    backgroundColor: '#fff', padding: 14, borderRadius: 15, marginBottom: 18, 
    borderWidth: 1.5, borderColor: '#EEE', color: '#1A1A1A', fontSize: 15 
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  
  categoryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  catBtn: { 
    flex: 1, padding: 12, backgroundColor: '#fff', borderRadius: 12, 
    alignItems: 'center', borderWidth: 1.5, borderColor: '#EEE' 
  },
  activeCatBtn: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  catText: { fontWeight: '700', color: '#666', fontSize: 13 },

  imageContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 30, gap: 12 },
  thumbnail: { width: 75, height: 75, borderRadius: 15, borderWidth: 1, borderColor: '#DDD' },
  deleteBadge: { 
    position: 'absolute', top: -5, right: -5, backgroundColor: '#FF6B35', 
    width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' 
  },
  deleteText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  
  addBtn: { 
    width: 75, height: 75, borderRadius: 15, backgroundColor: '#F0F0F0', 
    justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#BBB' 
  },
  addBtnText: { fontSize: 28, color: '#AAA', marginBottom: -5 },

  saveBtn: {
    backgroundColor: '#FF6B35', padding: 18, borderRadius: 18, alignItems: 'center',
    elevation: 4, shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 17 },
});

export default ProductForm; 