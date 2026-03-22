import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Image, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { Text, Searchbar, Card, Modal, Portal, PaperProvider, IconButton, Badge, Button, Divider } from 'react-native-paper';
import axios from 'axios';
import { BASE_URL } from '../../../config';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartSql } from '../../database/db'; 

const ProductContainer = (props) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Review states
  const [productReviews, setProductReviews] = useState([]);
  const [fetchingReviews, setFetchingReviews] = useState(false);

  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cartItems.cartItems); 

  const fetchPizzas = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/products`, {
        params: { search: searchQuery, category: selectedCategory }
      });
      setPizzas(response.data);
    } catch (error) {
      console.error("Fetch Products Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // FINAL FIX: Dinagdag ang '/product/' sa endpoint
  const fetchProductReviews = async (id) => {
    try {
      setFetchingReviews(true);
      const response = await axios.get(`${BASE_URL}/api/reviews/product/${id}`);
      setProductReviews(response.data);
    } catch (error) {
      console.log("Review Fetch Error:", error.message);
      setProductReviews([]); // Clear reviews kung may error o wala pang reviews
    } finally {
      setFetchingReviews(false);
    }
  };

  useEffect(() => {
    fetchPizzas();
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    if (selectedProduct?._id && visible) {
      fetchProductReviews(selectedProduct._id);
    }
  }, [selectedProduct, visible]);

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
            source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }} 
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
            <Text style={styles.headerSubtitle}>Order your favorites</Text>
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
          />
        )}

        <Portal>
          <Modal 
            visible={visible} 
            onDismiss={() => { setVisible(false); setProductReviews([]); }} 
            contentContainerStyle={styles.modalContent}
          >
            {selectedProduct && (
              <ScrollView showsVerticalScrollIndicator={false}> 
                <Image 
                  source={{ uri: selectedProduct.images?.[0] || 'https://via.placeholder.com/150' }} 
                  style={styles.modalImage} 
                />
                <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
                <Text style={styles.modalDesc}>{selectedProduct.description}</Text>
                
                <Button 
                  mode="contained" 
                  onPress={() => { addToCart(selectedProduct); setVisible(false); }} 
                  buttonColor="#e61e1e"
                  style={{marginVertical: 10}}
                >
                  Add to Cart - ₱{selectedProduct.price.toFixed(2)}
                </Button>

                <Divider style={{ marginVertical: 15 }} />

                <Text style={styles.sectionTitle}>Customer Reviews ⭐</Text>
                
                {fetchingReviews ? (
                  <ActivityIndicator color="#e61e1e" style={{ marginVertical: 10 }} />
                ) : productReviews.length > 0 ? (
                  productReviews.map((rev, index) => (
                    <View key={index} style={styles.reviewItem}>
                      <View style={styles.reviewHeader}>
                        <Text style={styles.reviewUser}>{rev.userName}</Text>
                        <Text style={styles.reviewStars}>{"⭐".repeat(rev.rating)}</Text>
                      </View>
                      <Text style={styles.reviewText}>{rev.comment}</Text>
                      <Divider style={styles.innerDivider} />
                    </View>
                  ))
                ) : (
                  <Text style={styles.noReviews}>No reviews yet. Be the first to buy and rate!</Text>
                )}

                <Button mode="text" onPress={() => { setVisible(false); setProductReviews([]); }} textColor="#888">
                  Close
                </Button>
              </ScrollView>
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
  modalContent: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 10, maxHeight: '80%' },
  modalImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  modalDesc: { marginVertical: 10, color: '#666' },
  badge: { position: 'absolute', top: 5, right: 5, backgroundColor: '#e61e1e' },
  sectionTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  reviewItem: { marginBottom: 10 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewUser: { fontWeight: 'bold', fontSize: 13, color: '#333' },
  reviewStars: { fontSize: 10 },
  reviewText: { fontSize: 13, color: '#555', marginTop: 2 },
  innerDivider: { marginTop: 8, backgroundColor: '#f2f2f2' },
  noReviews: { textAlign: 'center', color: '#aaa', fontStyle: 'italic', marginVertical: 10, fontSize: 12 }
});

export default ProductContainer;