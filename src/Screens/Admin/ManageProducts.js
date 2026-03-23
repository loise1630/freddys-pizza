import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Image, Alert, ScrollView, TouchableOpacity, StatusBar, Platform, Dimensions } from 'react-native';
import { DataTable, Text, Searchbar, Portal, Modal, PaperProvider, IconButton, Chip } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { TextInput as RNTextInput } from 'react-native'; // Gagamit ng custom RN input para sa ProductForm style
import axios from 'axios';
import { BASE_URL } from '../../../config';

const CATEGORIES = ['Pizza', 'Drinks', 'Sides'];
const FILTER_OPTIONS = ['All', ...CATEGORIES];

const ManageProducts = ({ navigation }) => {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  // Form States
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
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
    const result = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ['images'], 
      allowsMultipleSelection: true, 
      quality: 0.4 
    });
    if (!result.canceled) setImages([...images, ...result.assets.map(a => a.uri)]);
  };

  const handleSubmit = async () => {
    if (!name || !price || !description || !images.length || !stock) {
      return Alert.alert('Error', 'Please fill all fields 🍕');
    }

    try {
      const payload = { 
        name, 
        price: Number(price), 
        stock: Number(stock),
        description, 
        category, 
        images 
      };

      if (isEditing) {
        await axios.put(`${BASE_URL}/api/products/${currentId}`, payload);
      } else {
        await axios.post(`${BASE_URL}/api/products`, payload);
      }

      closeModal(); 
      fetchPizzas(); 
      Alert.alert('Success', isEditing ? 'Product updated!' : 'Product added!');
    } catch { 
      Alert.alert('Error', 'Save failed. Check server connection.'); 
    }
  };

  const handleDelete = (id) => Alert.alert('Delete', 'Remove this item?', [
    { text: 'Cancel' },
    { text: 'Delete', onPress: async () => { 
        await axios.delete(`${BASE_URL}/api/products/${id}`); 
        fetchPizzas(); 
      } 
    },
  ]);

  const openEdit = (item) => {
    setIsEditing(true); 
    setCurrentId(item._id); 
    setName(item.name);
    setPrice(item.price.toString()); 
    setStock(item.stock ? item.stock.toString() : '0');
    setDescription(item.description);
    setImages(item.images || []); 
    setCategory(item.category || 'Pizza'); 
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false); 
    setIsEditing(false);
    setName(''); setPrice(''); setStock(''); setDescription(''); setImages([]); setCategory('Pizza');
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

        {/* Header - ProductForm UI Style */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.headerTitle}>Manage Inventory</Text>
            <Text style={s.headerSub}>{pizzas.length} total products</Text>
          </View>
        </View>

        {/* Search & Filter */}
        <View style={s.controls}>
          <Searchbar placeholder="Search..." value={searchQuery} onChangeText={setSearchQuery} style={s.search} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }} contentContainerStyle={{ gap: 8 }}>
            {FILTER_OPTIONS.map((cat) => (
              <Chip key={cat} selected={filterCategory === cat} onPress={() => setFilterCategory(cat)}
                style={[s.filterChip, filterCategory === cat && s.activeChip]}
                textStyle={{ color: filterCategory === cat ? '#fff' : '#555' }}>
                {cat}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Data Table */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <DataTable style={s.table}>
            <DataTable.Header style={s.tableHeader}>
              <DataTable.Title style={{ width: 60 }}>Img</DataTable.Title>
              <DataTable.Title style={{ width: 140 }}>Name</DataTable.Title>
              <DataTable.Title numeric style={{ width: 70 }}>Stock</DataTable.Title>
              <DataTable.Title numeric style={{ width: 80 }}>Price</DataTable.Title>
              <DataTable.Title style={{ width: 90 }}>Actions</DataTable.Title>
            </DataTable.Header>
            
            <ScrollView>
              {filtered.map((item) => (
                <DataTable.Row key={item._id} style={s.row}>
                  <DataTable.Cell style={{ width: 60 }}>
                    <Image source={{ uri: item.images[0] }} style={s.thumb} />
                  </DataTable.Cell>
                  <DataTable.Cell style={{ width: 140 }}>{item.name}</DataTable.Cell>
                  <DataTable.Cell numeric style={{ width: 70 }}>
                    <Text style={{ fontWeight: 'bold', color: item.stock <= 5 ? '#FF6B35' : '#333' }}>{item.stock || 0}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell numeric style={{ width: 80 }}>₱{item.price}</DataTable.Cell>
                  <DataTable.Cell style={{ width: 90 }}>
                    <IconButton icon="pencil" size={18} onPress={() => openEdit(item)} />
                    <IconButton icon="trash-can" size={18} iconColor="#FF6B35" onPress={() => handleDelete(item._id)} />
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </ScrollView>
          </DataTable>
        </ScrollView>

        <TouchableOpacity style={s.fab} onPress={() => setModalVisible(true)}>
          <Text style={s.fabText}>+ Add Product</Text>
        </TouchableOpacity>

        {/* Modal - ProductForm Layout Style */}
        <Portal>
          <Modal visible={modalVisible} onDismiss={closeModal} contentContainerStyle={s.modal}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.modalTitle}>{isEditing ? 'Update Product' : 'New Product'}</Text>

              <RNTextInput style={s.customInput} value={name} onChangeText={setName} placeholder="Product Name" placeholderTextColor="#bbb" />
              
              <View style={s.rowInput}>
                <RNTextInput style={[s.customInput, { flex: 1, marginRight: 10 }]} value={price} onChangeText={setPrice} placeholder="Price" keyboardType="numeric" placeholderTextColor="#bbb" />
                <RNTextInput style={[s.customInput, { flex: 1 }]} value={stock} onChangeText={setStock} placeholder="Stocks" keyboardType="numeric" placeholderTextColor="#bbb" />
              </View>

              <Text style={s.label}>Category</Text>
              <View style={s.categoryRow}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity key={cat} style={[s.catBtn, category === cat && s.activeCatBtn]} onPress={() => setCategory(cat)}>
                    <Text style={[s.catText, category === cat && { color: '#fff' }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <RNTextInput style={[s.customInput, { height: 70 }]} value={description} onChangeText={setDescription} placeholder="Description" multiline placeholderTextColor="#bbb" />

              <Text style={s.label}>Photos ({images.length})</Text>
              <View style={s.imageGrid}>
                {images.map((uri, i) => (
                  <TouchableOpacity key={i} onPress={() => setImages(images.filter((_, j) => j !== i))}>
                    <Image source={{ uri }} style={s.modalThumb} />
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={s.modalAddBtn} onPress={pickImage}>
                  <Text style={s.modalAddBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={s.saveBtn} onPress={handleSubmit}>
                <Text style={s.saveBtnText}>{isEditing ? 'Update Details' : 'Save Product'}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={closeModal} style={{ marginTop: 15, alignItems: 'center' }}>
                <Text style={{ color: '#888', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
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
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF6B35',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 54,
    paddingBottom: 20, paddingHorizontal: 20,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },

  controls: { padding: 15 },
  search: { borderRadius: 12, backgroundColor: '#fff', elevation: 2, height: 45 },
  filterChip: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E8E8E8' },
  activeChip: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },

  table: { minWidth: 500 },
  tableHeader: { backgroundColor: '#F5F5F5' },
  row: { height: 70, borderBottomWidth: 0.5, borderBottomColor: '#EEE' },
  thumb: { width: 45, height: 45, borderRadius: 8 },

  fab: { 
    position: 'absolute', bottom: 20, right: 20, 
    backgroundColor: '#FF6B35', paddingHorizontal: 20, paddingVertical: 12, 
    borderRadius: 25, elevation: 5, flexDirection: 'row', alignItems: 'center' 
  },
  fabText: { color: '#fff', fontWeight: '800' },

  modal: { backgroundColor: '#fff', padding: 25, margin: 15, borderRadius: 24, maxHeight: '90%' },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20, color: '#1A1A1A', textAlign: 'center' },
  customInput: { backgroundColor: '#FAFAFA', padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1.5, borderColor: '#EEE', color: '#333' },
  rowInput: { flexDirection: 'row' },
  label: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 8, marginTop: 5 },
  categoryRow: { flexDirection: 'row', gap: 8, marginBottom: 15 },
  catBtn: { flex: 1, padding: 10, backgroundColor: '#fff', borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: '#EEE' },
  activeCatBtn: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  catText: { fontWeight: '700', color: '#666', fontSize: 12 },

  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  modalThumb: { width: 65, height: 65, borderRadius: 12 },
  modalAddBtn: { width: 65, height: 65, borderRadius: 12, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#CCC' },
  modalAddBtnText: { fontSize: 24, color: '#999' },

  saveBtn: { backgroundColor: '#FF6B35', padding: 15, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});

export default ManageProducts;