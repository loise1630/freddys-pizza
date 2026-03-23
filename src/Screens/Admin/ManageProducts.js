import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Image, Alert, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { DataTable, Text, Searchbar, Portal, Modal, PaperProvider, TextInput, Button, FAB, IconButton, Chip } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { BASE_URL } from '../../../config';

const CATEGORIES = ['Pizza', 'Drinks', 'Sides'];
const FILTER_OPTIONS = ['All', ...CATEGORIES];

const ManageProducts = () => {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState('Pizza');

  useEffect(() => { fetchPizzas(); }, []);

  const fetchPizzas = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/products`);
      setPizzas(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.4 });
    if (!result.canceled) setImages([...images, ...result.assets.map(a => a.uri)]);
  };

  const handleSubmit = async () => {
    if (!name || !price || !description || !images.length) return Alert.alert('Error', 'All fields are required!');
    try {
      const data = { name, price: Number(price), description, category, images };
      isEditing ? await axios.put(`${BASE_URL}/api/products/${currentId}`, data)
                : await axios.post(`${BASE_URL}/api/products`, data);
      closeModal(); fetchPizzas(); Alert.alert('Success', 'Product saved!');
    } catch { Alert.alert('Error', 'Save failed'); }
  };

  const handleDelete = (id) => Alert.alert('Delete', 'Are you sure?', [
    { text: 'Cancel' },
    { text: 'Delete', onPress: async () => { await axios.delete(`${BASE_URL}/api/products/${id}`); fetchPizzas(); } },
  ]);

  const openEdit = ({ _id, name, price, description, images, category }) => {
    setIsEditing(true); setCurrentId(_id); setName(name);
    setPrice(price.toString()); setDescription(description);
    setImages(images || []); setCategory(category || 'Pizza'); setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false); setIsEditing(false);
    setName(''); setPrice(''); setDescription(''); setImages([]); setCategory('Pizza');
  };

  const filtered = pizzas.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (filterCategory === 'All' || p.category === filterCategory)
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#FF6B35" />;

  return (
    <PaperProvider>
      <View style={s.container}>
        <StatusBar backgroundColor="#FF6B35" barStyle="light-content" />

        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Manage Products 🍕</Text>
          <Text style={s.headerSub}>{pizzas.length} products total</Text>
        </View>

        <View style={s.controls}>
          <Searchbar placeholder="Search name..." value={searchQuery} onChangeText={setSearchQuery} style={s.search} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }} contentContainerStyle={{ gap: 8 }}>
            {FILTER_OPTIONS.map((cat) => (
              <Chip key={cat} selected={filterCategory === cat} onPress={() => setFilterCategory(cat)}
                style={[s.filterChip, filterCategory === cat && s.activeChip]}
                textStyle={{ color: filterCategory === cat ? '#fff' : '#555', fontSize: 12 }}>
                {cat}
              </Chip>
            ))}
          </ScrollView>
        </View>

        <ScrollView horizontal>
          <View>
            <DataTable style={s.table}>
              <DataTable.Header style={s.tableHeader}>
                <DataTable.Title style={{ width: 60 }}>Img</DataTable.Title>
                <DataTable.Title style={{ width: 140 }}>Name</DataTable.Title>
                <DataTable.Title style={{ width: 90 }}>Category</DataTable.Title>
                <DataTable.Title numeric style={{ width: 80 }}>Price</DataTable.Title>
                <DataTable.Title style={{ width: 100 }}>Actions</DataTable.Title>
              </DataTable.Header>
              <ScrollView>
                {filtered.map((item) => (
                  <DataTable.Row key={item._id} style={s.row}>
                    <DataTable.Cell style={{ width: 60 }}>
                      <Image source={{ uri: item.images[0] }} style={s.thumb} />
                    </DataTable.Cell>
                    <DataTable.Cell style={{ width: 140 }}>{item.name}</DataTable.Cell>
                    <DataTable.Cell style={{ width: 90 }}>
                      <Text style={s.categoryBadge}>{item.category || 'N/A'}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric style={{ width: 80 }}>₱{item.price}</DataTable.Cell>
                    <DataTable.Cell style={{ width: 100 }}>
                      <IconButton icon="pencil" size={18} onPress={() => openEdit(item)} />
                      <IconButton icon="trash-can" size={18} iconColor="#FF6B35" onPress={() => handleDelete(item._id)} />
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </ScrollView>
            </DataTable>
          </View>
        </ScrollView>

        <FAB icon="plus" label="Add New" style={s.fab} onPress={() => setModalVisible(true)} />

        <Portal>
          <Modal visible={modalVisible} onDismiss={closeModal} contentContainerStyle={s.modal}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.modalTitle}>{isEditing ? 'Edit Product' : 'Add Product'}</Text>

              <Text style={s.label}>Category</Text>
              <View style={s.categoryContainer}>
                {CATEGORIES.map((cat) => (
                  <Chip key={cat} selected={category === cat} onPress={() => setCategory(cat)}
                    style={[s.chip, category === cat && s.activeChip]}
                    textStyle={{ color: category === cat ? '#fff' : '#555', fontSize: 11 }}>
                    {cat}
                  </Chip>
                ))}
              </View>

              <Text style={s.label}>Images ({images.length})</Text>
              <ScrollView horizontal style={s.imagePreviewList}>
                {images.map((uri, i) => (
                  <View key={i} style={s.imageWrapper}>
                    <Image source={{ uri }} style={s.previewImage} />
                    <TouchableOpacity style={s.deleteImageBtn} onPress={() => setImages(images.filter((_, j) => j !== i))}>
                      <IconButton icon="close-circle" iconColor="#FF6B35" size={20} />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={s.addImageBtn} onPress={pickImage}>
                  <IconButton icon="camera-plus" size={30} />
                </TouchableOpacity>
              </ScrollView>

              <TextInput label="Name" value={name} onChangeText={setName} mode="outlined" style={s.input} />
              <TextInput label="Price" value={price} onChangeText={setPrice} keyboardType="numeric" mode="outlined" style={s.input} />
              <TextInput label="Description" value={description} onChangeText={setDescription} multiline mode="outlined" style={s.input} />

              <View style={s.buttonRow}>
                <Button mode="contained" onPress={handleSubmit} style={s.saveBtn}>{isEditing ? 'Update' : 'Save'}</Button>
                <Button onPress={closeModal}>Cancel</Button>
              </View>
            </ScrollView>
          </Modal>
        </Portal>
      </View>
    </PaperProvider>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    backgroundColor: '#FF6B35',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 54,
    paddingBottom: 18, paddingHorizontal: 20,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500', marginTop: 1 },
  controls: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 4 },
  search: { borderRadius: 12, backgroundColor: '#fff', elevation: 2 },
  filterChip: { height: 36, justifyContent: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E8E8E8' },
  activeChip: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  table: { minWidth: 480 },
  tableHeader: { backgroundColor: '#f8f9fa' },
  row: { height: 75 },
  thumb: { width: 45, height: 45, borderRadius: 8 },
  categoryBadge: { fontSize: 11, color: '#FF6B35', fontWeight: 'bold' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#FF6B35' },
  modal: { backgroundColor: '#fff', padding: 20, margin: 20, borderRadius: 16, maxHeight: '85%' },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 15, textAlign: 'center', color: '#1A1A1A' },
  input: { marginBottom: 10 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8, color: '#555' },
  categoryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, gap: 6 },
  chip: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E8E8E8' },
  imagePreviewList: { flexDirection: 'row', marginBottom: 15 },
  imageWrapper: { position: 'relative', marginRight: 10 },
  previewImage: { width: 70, height: 70, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  deleteImageBtn: { position: 'absolute', top: -15, right: -15 },
  addImageBtn: { width: 70, height: 70, borderRadius: 8, borderStyle: 'dashed', borderWidth: 1, borderColor: '#aaa', justifyContent: 'center', alignItems: 'center' },
  buttonRow: { marginTop: 10 },
  saveBtn: { backgroundColor: '#FF6B35', marginBottom: 5 },
});

export default ManageProducts;