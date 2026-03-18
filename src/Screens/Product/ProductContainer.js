import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Image, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { Text, Searchbar, Card, Modal, Portal, PaperProvider, IconButton, Badge, Button } from 'react-native-paper';
import axios from 'axios';
import { BASE_URL } from '../../../config';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartSql } from '../../database/db'; 

const ProductContainer = (props) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cartItems.cartItems); 

  const fetchPizzas = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/products`, {
        params: {
          search: searchQuery,
          category: selectedCategory,
          minPrice: minPrice,
          maxPrice: maxPrice
        }
      });
      setPizzas(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Fetch Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPizzas();
  }, [searchQuery, selectedCategory]);

  const addToCart = (item) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
    try {
      addToCartSql(item);
    } catch (error) {
      console.log("SQLite Error:", error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.gridItem}>
      <Card style={styles.card}>
        <TouchableOpacity onPress={() => { setSelectedProduct(item); setVisible(true); }}>
          <Image 
            source={{ uri: item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/150' }} 
            style={styles.pizzaImage} 
          />
        </TouchableOpacity>
        <View style={styles.cardContent}>
          <Text style={styles.pizzaName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.pizzaPriceText}>₱{item.price.toFixed(2)}</Text>
          <IconButton 
            icon="plus-circle" 
            size={24} 
            iconColor="#e61e1e" 
            onPress={() => addToCart(item)} 
            style={styles.absPlus} 
          />
        </View>
      </Card>
    </View>
  );

  return (
    <PaperProvider>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Freddy's Pizza 🍕</Text>
            <Text style={styles.headerSubtitle}>Filter & Search your favorites</Text>
          </View>
          <TouchableOpacity onPress={() => props.navigation.navigate("Cart")}>
            <View>
              <IconButton icon="cart" size={28} />
              {cartItems?.length > 0 && <Badge style={styles.badge}>{cartItems.length}</Badge>}
            </View>
          </TouchableOpacity>
        </View>

        <Searchbar
          placeholder="Search name..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.search}
        />

        {/* PRICE RANGE FILTER - GINAWANG SELF-CLOSING ANG TEXTINPUT PARA WALANG STRAY TEXT */}
        <View style={styles.filterContainer}>
          <TextInput
            placeholder="Min ₱"
            keyboardType="numeric"
            style={styles.priceInput}
            value={minPrice}
            onChangeText={setMinPrice}
          />
          <TextInput
            placeholder="Max ₱"
            keyboardType="numeric"
            style={styles.priceInput}
            value={maxPrice}
            onChangeText={setMaxPrice}
          />
          <Button 
            mode="contained" 
            onPress={fetchPizzas} 
            style={styles.filterBtn} 
            labelStyle={{fontSize: 12}}
          >
            Apply
          </Button>
        </View>

        <View style={styles.categoryRow}>
          {['All', 'Pizza', 'Drinks', 'Sides'].map((cat) => (
            <TouchableOpacity 
              key={cat} 
              onPress={() => setSelectedCategory(cat)}
              style={[styles.catChip, selectedCategory === cat && styles.activeCat]}
            >
              <Text style={{color: selectedCategory === cat ? 'white' : 'black'}}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#e61e1e" style={{marginTop: 20}} />
        ) : (
          <FlatList
            data={pizzas}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={<Text style={styles.emptyText}>No products found.</Text>}
          />
        )}

        <Portal>
          <Modal 
            visible={visible} 
            onDismiss={() => setVisible(false)} 
            contentContainerStyle={styles.modalContent}
          >
            {selectedProduct && (
              <View>
                <Image 
                  source={{ uri: selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images[0] : 'https://via.placeholder.com/150' }} 
                  style={styles.modalImage} 
                />
                <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
                <Text style={styles.modalDesc}>{selectedProduct.description}</Text>
                <Button 
                  mode="contained" 
                  onPress={() => { addToCart(selectedProduct); setVisible(false); }} 
                  buttonColor="#27ae60"
                >
                  <Text style={{color: 'white'}}>Add to Cart - ₱{selectedProduct.price}</Text>
                </Button>
              </View>
            )}
          </Modal>
        </Portal>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#e61e1e' },
  headerSubtitle: { fontSize: 12, color: '#666' },
  search: { margin: 15, borderRadius: 10, backgroundColor: '#f0f0f0' },
  filterContainer: { flexDirection: 'row', paddingHorizontal: 15, gap: 10, marginBottom: 10 },
  priceInput: { flex: 1, height: 40, borderBottomWidth: 1, borderColor: '#ccc', paddingLeft: 5, color: '#000' },
  filterBtn: { backgroundColor: '#e61e1e', height: 40, justifyContent: 'center' },
  categoryRow: { flexDirection: 'row', paddingHorizontal: 15, gap: 10, marginBottom: 15 },
  catChip: { paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#eee' },
  activeCat: { backgroundColor: '#e61e1e', borderColor: '#e61e1e' },
  listContainer: { paddingHorizontal: 10, paddingBottom: 20 },
  gridItem: { width: '50%', padding: 5 },
  card: { borderRadius: 10, elevation: 3, backgroundColor: '#fff' },
  pizzaImage: { width: '100%', height: 120, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  cardContent: { padding: 10 },
  pizzaName: { fontWeight: 'bold', fontSize: 14 },
  pizzaPriceText: { color: '#e61e1e', marginTop: 5, fontWeight: 'bold' },
  absPlus: { position: 'absolute', right: -5, bottom: -5 },
  modalContent: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 10 },
  modalImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  modalDesc: { marginVertical: 10, color: '#666' },
  badge: { position: 'absolute', top: 5, right: 5, backgroundColor: '#e61e1e' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888' }
});

export default ProductContainer;