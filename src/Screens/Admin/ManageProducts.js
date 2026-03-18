import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Image, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { DataTable, Text, Searchbar, Portal, Modal, PaperProvider, TextInput, Button, FAB, IconButton, Chip } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { BASE_URL } from '../../../config';

const ManageProducts = () => {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // --- FILTER STATE (Para sa Table) ---
  const [filterCategory, setFilterCategory] = useState('All');

  // --- FORM STATES (Para sa Modal/Add/Edit) ---
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState('Pizza'); 

  const categories = ["Pizza", "Drinks", "Sides"];
  const filterOptions = ["All", "Pizza", "Drinks", "Sides"];

  useEffect(() => {
    fetchPizzas();
  }, []);

  const fetchPizzas = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/products`);
      setPizzas(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.4, 
    });
    if (!result.canceled) {
      const selectedUris = result.assets.map(asset => asset.uri);
      setImages([...images, ...selectedUris]);
    }
  };

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  const handleSubmit = async () => {
    if (!name || !price || !description || images.length === 0) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    const data = { name, price: Number(price), description, category, images };

    try {
      if (isEditing) {
        await axios.put(`${BASE_URL}/api/products/${currentId}`, data);
      } else {
        await axios.post(`${BASE_URL}/api/products`, data);
      }
      closeModal();
      fetchPizzas();
      Alert.alert("Success", "Product saved!");
    } catch (e) { 
      Alert.alert("Error", "Save failed"); 
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel" },
      { text: "Delete", onPress: async () => {
        await axios.delete(`${BASE_URL}/api/products/${id}`);
        fetchPizzas();
      }}
    ]);
  };

  const openEdit = (item) => {
    setIsEditing(true);
    setCurrentId(item._id);
    setName(item.name);
    setPrice(item.price.toString());
    setDescription(item.description);
    setImages(item.images || []);
    setCategory(item.category || "Pizza"); 
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setIsEditing(false);
    setName(''); setPrice(''); setDescription(''); setImages([]); setCategory('Pizza');
  };

  // --- 15PTS FILTER LOGIC ---
  const filtered = pizzas.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <ActivityIndicator style={{flex:1}} size="large" color="red" />;

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Searchbar 
          placeholder="Search name..." 
          value={searchQuery} 
          onChangeText={setSearchQuery} 
          style={styles.search} 
        />

        {/* --- MAIN FILTER CHIPS (Ito ang nagpapagana sa filter) --- */}
        <View style={styles.mainFilterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filterOptions.map((cat) => (
              <Chip 
                key={cat} 
                selected={filterCategory === cat} 
                onPress={() => setFilterCategory(cat)}
                style={[styles.filterChip, filterCategory === cat && styles.activeFilterChip]}
                textStyle={{ color: filterCategory === cat ? 'white' : 'black' }}
              >
                {cat}
              </Chip>
            ))}
          </ScrollView>
        </View>

        <ScrollView horizontal>
          <View>
            <DataTable style={styles.table}>
              <DataTable.Header style={styles.header}>
                <DataTable.Title style={{width: 60}}>Img</DataTable.Title>
                <DataTable.Title style={{width: 140}}>Name</DataTable.Title>
                <DataTable.Title style={{width: 90}}>Category</DataTable.Title>
                <DataTable.Title numeric style={{width: 80}}>Price</DataTable.Title>
                <DataTable.Title style={{width: 100}}>Actions</DataTable.Title>
              </DataTable.Header>

              <ScrollView>
                {filtered.map((item) => (
                  <DataTable.Row key={item._id} style={styles.row}>
                    <DataTable.Cell style={{width: 60}}>
                      <Image source={{uri: item.images[0]}} style={styles.thumb} />
                    </DataTable.Cell>
                    <DataTable.Cell style={{width: 140}}>{item.name}</DataTable.Cell>
                    <DataTable.Cell style={{width: 90}}>
                      <Text style={styles.categoryBadge}>{item.category || 'N/A'}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric style={{width: 80}}>₱{item.price}</DataTable.Cell>
                    <DataTable.Cell style={{width: 100}}>
                      <IconButton icon="pencil" size={18} onPress={() => openEdit(item)} />
                      <IconButton icon="trash-can" size={18} iconColor="red" onPress={() => handleDelete(item._id)} />
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </ScrollView>
            </DataTable>
          </View>
        </ScrollView>

        <FAB icon="plus" label="Add New" style={styles.fab} onPress={() => setModalVisible(true)} />

        <Portal>
          <Modal visible={modalVisible} onDismiss={closeModal} contentContainerStyle={styles.modal}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{isEditing ? "Edit Product" : "Add Product"}</Text>
              
              <Text style={styles.label}>Select Category for Product</Text>
              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                  <Chip 
                    key={cat} 
                    selected={category === cat} 
                    onPress={() => setCategory(cat)}
                    style={[styles.chip, category === cat && styles.activeChip]}
                    textStyle={{ color: category === cat ? 'white' : 'black', fontSize: 11 }}
                  >
                    {cat}
                  </Chip>
                ))}
              </View>

              <Text style={styles.label}>Product Images ({images.length})</Text>
              <ScrollView horizontal style={styles.imagePreviewList}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri }} style={styles.previewImage} />
                    <TouchableOpacity style={styles.deleteImageBtn} onPress={() => removeImage(index)}>
                      <IconButton icon="close-circle" iconColor="red" size={20} />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
                  <IconButton icon="camera-plus" size={30} />
                </TouchableOpacity>
              </ScrollView>

              <TextInput label="Name" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
              <TextInput label="Price" value={price} onChangeText={setPrice} keyboardType="numeric" mode="outlined" style={styles.input} />
              <TextInput label="Description" value={description} onChangeText={setDescription} multiline mode="outlined" style={styles.input} />
              
              <View style={styles.buttonRow}>
                <Button mode="contained" onPress={handleSubmit} style={styles.saveBtn}>
                  {isEditing ? "Update" : "Save"}
                </Button>
                <Button onPress={closeModal}>Cancel</Button>
              </View>
            </ScrollView>
          </Modal>
        </Portal>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, paddingTop: 40, backgroundColor: '#fff' },
  search: { marginBottom: 10, borderRadius: 10 },
  mainFilterContainer: { flexDirection: 'row', marginBottom: 15, paddingVertical: 5 },
  filterChip: { marginRight: 8, height: 40, justifyContent: 'center' },
  activeFilterChip: { backgroundColor: 'red' },
  table: { minWidth: 480 },
  header: { backgroundColor: '#f1f1f1' },
  row: { height: 75 },
  thumb: { width: 45, height: 45, borderRadius: 5 },
  categoryBadge: { fontSize: 11, color: 'red', fontWeight: 'bold' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: 'red' },
  modal: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 10, maxHeight: '85%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { marginBottom: 10 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  categoryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  chip: { flex: 1, marginHorizontal: 2 },
  activeChip: { backgroundColor: 'red' },
  imagePreviewList: { flexDirection: 'row', marginBottom: 15 },
  imageWrapper: { position: 'relative', marginRight: 10 },
  previewImage: { width: 70, height: 70, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  deleteImageBtn: { position: 'absolute', top: -15, right: -15 },
  addImageBtn: { width: 70, height: 70, borderRadius: 8, borderStyle: 'dashed', borderWidth: 1, borderColor: '#666', justifyContent: 'center', alignItems: 'center' },
  buttonRow: { marginTop: 10 },
  saveBtn: { backgroundColor: 'red', marginBottom: 5 },
});

export default ManageProducts;