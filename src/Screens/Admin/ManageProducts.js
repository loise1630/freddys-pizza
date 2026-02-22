import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Image, Alert, ScrollView } from 'react-native';
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.5,
    });
    if (!result.canceled) {
      const selectedUris = result.assets.map(asset => asset.uri);
      setImages([...images, ...selectedUris]);
    }
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
    } catch (e) { Alert.alert("Error", "Save failed"); }
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
            <ScrollView>
              <Text style={styles.modalTitle}>{isEditing ? "Edit Pizza" : "Add Pizza"}</Text>
              <TextInput label="Name" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
              <TextInput label="Price" value={price} onChangeText={setPrice} keyboardType="numeric" mode="outlined" style={styles.input} />
              <TextInput label="Description" value={description} onChangeText={setDescription} multiline mode="outlined" style={styles.input} />
              <Button mode="outlined" onPress={pickImage} style={styles.input}>Pick Photos ({images.length})</Button>
              <Button mode="contained" onPress={handleSubmit} style={{backgroundColor: 'red'}}>Save</Button>
              <Button onPress={closeModal}>Cancel</Button>
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
  modal: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  input: { marginBottom: 10 }
});

export default ManageProducts;