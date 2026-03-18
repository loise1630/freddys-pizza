import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Image, TouchableOpacity, FlatList, Dimensions, Alert } from 'react-native';
import { Text, Searchbar, Card, Modal, Portal, PaperProvider, IconButton, Badge } from 'react-native-paper';
import axios from 'axios';
import { BASE_URL } from '../../../config';
import { useDispatch, useSelector } from 'react-redux';

// SQLITE IMPORT
import { addToCartSql } from '../../database/db'; 

const { width } = Dimensions.get('window');

const ProductContainer = (props) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cartItems.cartItems); 
  const user = useSelector((state) => state.cartItems.user);

  const fetchPizzas = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/products`);
      setPizzas(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Fetch Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPizzas();
  }, []);

  // UPDATED ADD TO CART: Redux + SQLite
  const addToCart = (item) => {
    // 1. Save sa Redux (Instant UI update)
    dispatch({ type: 'ADD_TO_CART', payload: item });

    // 2. Save sa SQLite (Persistence - 20pts)
    try {
      addToCartSql(item);
      console.log("Pizza saved to SQLite! 🍕");
    } catch (error) {
      console.log("SQLite Save Error:", error);
    }
  };

  const showDetails = (item) => {
    setSelectedProduct(item);
    setVisible(true);
  };

  const hideModal = () => setVisible(false);

  const filteredPizzas = pizzas.filter((pizza) =>
    pizza.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.gridItem}>
      <Card style={styles.card}>
        <TouchableOpacity onPress={() => showDetails(item)}>
          <Image 
            source={{ uri: item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/150' }} 
            style={styles.pizzaImage} 
          />
          <View style={styles.plusButtonContainer}>
             <IconButton
                icon="plus"
                size={20}
                iconColor="black"
                style={styles.plusButton}
                onPress={() => addToCart(item)} 
              />
          </View>
        </TouchableOpacity>
        <View style={styles.cardContent}>
          <Text style={styles.pizzaName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.pizzaPriceText}>from ₱ {item.price.toFixed(2)}</Text>
        </View>
      </Card>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#e61e1e" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Welcome, {user ? user.name : 'Guest'}! 🍕</Text>
            <Text style={styles.headerSubtitle}>Most ordered right now.</Text>
          </View>
          <TouchableOpacity onPress={() => props.navigation.navigate("Cart")}>
            <View>
                <IconButton icon="cart-outline" size={28} />
                {cartItems && cartItems.length > 0 && (
                <Badge style={styles.badge}>{cartItems.length}</Badge>
                )}
            </View>
          </TouchableOpacity>
        </View>
        
        <Searchbar
          placeholder="Search Pizza..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.search}
        />

        <FlatList
          data={filteredPizzas}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No Pizza Found.</Text>}
        />

        <Portal>
          <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modalContent}>
            {selectedProduct && (
              <View>
                <Image source={{ uri: selectedProduct.images[0] }} style={styles.modalImage} />
                <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
                <Text style={styles.modalDesc}>{selectedProduct.description}</Text>
                <TouchableOpacity 
                    style={[styles.closeBtn, {backgroundColor: '#27ae60', marginBottom: 10}]} 
                    onPress={() => {
                        addToCart(selectedProduct);
                        hideModal();
                    }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Add to Cart - ₱{selectedProduct.price.toFixed(2)}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeBtn} onPress={hideModal}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
                </TouchableOpacity>
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, marginBottom: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#e61e1e' },
  headerSubtitle: { fontSize: 14, color: '#666' },
  badge: { position: 'absolute', top: 5, right: 5, backgroundColor: '#e61e1e' },
  search: { marginHorizontal: 15, marginBottom: 20, backgroundColor: '#f5f5f5', borderRadius: 25 },
  listContainer: { paddingHorizontal: 10, paddingBottom: 20 },
  gridItem: { width: '50%', padding: 5 },
  card: { backgroundColor: '#fff', borderRadius: 15, overflow: 'hidden', elevation: 2 },
  pizzaImage: { width: '100%', height: 160, borderRadius: 15 },
  plusButtonContainer: { position: 'absolute', bottom: 5, right: 5 },
  plusButton: { backgroundColor: '#fff', elevation: 3 },
  cardContent: { padding: 10 },
  pizzaName: { fontSize: 14, fontWeight: '700', color: '#333' },
  pizzaPriceText: { fontSize: 13, color: '#444' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888' },
  modalContent: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 20 },
  modalImage: { width: '100%', height: 200, borderRadius: 15, marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalDesc: { fontSize: 16, color: '#666', marginBottom: 20 },
  closeBtn: { padding: 12, borderRadius: 10, alignItems: 'center', backgroundColor: '#e61e1e' }
});

export default ProductContainer;