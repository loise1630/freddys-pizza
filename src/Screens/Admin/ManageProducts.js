import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Image, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { DataTable, Text, Searchbar, Portal, Modal, PaperProvider, TextInput, Button, FAB, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { BASE_URL } from '../../../config';

const ManageProducts = () => {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form States
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);

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
      mediaTypes: ['images'], 
      allowsMultipleSelection: true,
      quality: 0.4, 
    });
    if (!result.canceled) {
      const selectedUris = result.assets.map(asset => asset.uri);
      // Pwede magdagdag sa existing images
      setImages([...images, ...selectedUris]);
    }
  };

  // IDINAGDAG: Function para mag-remove ng specific na image
  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  const handleSubmit = async () => {
    if (!name || !price || !description || images.length === 0) {
      Alert.alert("Error", "All fields are required!");
      return;
    }
    const data = { name, price: Number(price), description, images };
    try {
      if (isEditing) {
        await axios.put(`${BASE_URL}/api/products/${currentId}`, data);
      } else {
        await axios.post(`${BASE_URL}/api/products`, data);
      }
      closeModal();
      fetchPizzas();
      Alert.alert("Success", "Product saved successfully!");
    } catch (e) { 
      console.log(e);
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
    setImages(item.images);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setIsEditing(false);
    setName(''); setPrice(''); setDescription(''); setImages([]);
  };

  const filtered = pizzas.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <ActivityIndicator style={{flex:1}} size="large" color="red" />;

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Searchbar placeholder="Search pizza..." value={searchQuery} onChangeText={setSearchQuery} style={styles.search} />

        <ScrollView horizontal>
          <View>
            <DataTable style={styles.table}>
              <DataTable.Header style={styles.header}>
                <DataTable.Title style={{width: 60}}>Img</DataTable.Title>
                <DataTable.Title style={{width: 150}}>Name</DataTable.Title>
                <DataTable.Title numeric style={{width: 80}}>Price</DataTable.Title>
                <DataTable.Title style={{width: 120}}>Actions</DataTable.Title>
              </DataTable.Header>

              <ScrollView>
                {filtered.map((item) => (
                  <DataTable.Row key={item._id} style={styles.row}>
                    <DataTable.Cell style={{width: 60}}>
                      <Image source={{uri: item.images[0]}} style={styles.thumb} />
                    </DataTable.Cell>
                    <DataTable.Cell style={{width: 150}}>{item.name}</DataTable.Cell>
                    <DataTable.Cell numeric style={{width: 80}}>₱{item.price}</DataTable.Cell>
                    <DataTable.Cell style={{width: 120}}>
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
              <Text style={styles.modalTitle}>{isEditing ? "Edit Pizza" : "Add Pizza"}</Text>
              
              {/* IMAGE EDITING SECTION */}
              <Text style={styles.label}>Product Images ({images.length})</Text>
              <ScrollView horizontal style={styles.imagePreviewList}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri }} style={styles.previewImage} />
                    <TouchableOpacity 
                      style={styles.deleteImageBtn} 
                      onPress={() => removeImage(index)}
                    >
                      <IconButton icon="close-circle" iconColor="red" size={20} />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
                  <IconButton icon="camera-plus" size={30} />
                  <Text style={{fontSize: 10}}>Add</Text>
                </TouchableOpacity>
              </ScrollView>

              <TextInput label="Name" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
              <TextInput label="Price" value={price} onChangeText={setPrice} keyboardType="numeric" mode="outlined" style={styles.input} />
              <TextInput label="Description" value={description} onChangeText={setDescription} multiline mode="outlined" style={styles.input} />
              
              <View style={styles.buttonRow}>
                <Button mode="contained" onPress={handleSubmit} style={styles.saveBtn} contentStyle={{height: 50}}>
                  {isEditing ? "Update Product" : "Save Product"}
                </Button>
                <Button onPress={closeModal} style={styles.cancelBtn}>Cancel</Button>
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
  table: { minWidth: 410 },
  header: { backgroundColor: '#f1f1f1' },
  row: { height: 70, alignItems: 'center' },
  thumb: { width: 45, height: 45, borderRadius: 5 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: 'red' },
  modal: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 10, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { marginBottom: 10 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, color: '#666' },
  imagePreviewList: { flexDirection: 'row', marginBottom: 15 },
  imageWrapper: { position: 'relative', marginRight: 10 },
  previewImage: { width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  deleteImageBtn: { position: 'absolute', top: -15, right: -15 },
  addImageBtn: { 
    width: 80, height: 80, borderRadius: 8, borderStyle: 'dashed', 
    borderWidth: 1, borderColor: '#666', justifyContent: 'center', alignItems: 'center' 
  },
  buttonRow: { marginTop: 10 },
  saveBtn: { backgroundColor: 'red', marginBottom: 5 },
  cancelBtn: { marginTop: 5 }
});

export default ManageProducts;