import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, ActivityIndicator, Image, TouchableOpacity,
  FlatList, ScrollView, StatusBar, Dimensions, Platform
} from 'react-native';
import { Text, Searchbar, Modal, Portal, PaperProvider, Divider, Menu, IconButton } from 'react-native-paper';
import axios from 'axios';
import { BASE_URL } from '../../../config';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartSql } from '../../database/db';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;
const CATEGORIES = ['All', 'Pizza', 'Drinks', 'Sides'];

const ProductContainer = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [fetchingReviews, setFetchingReviews] = useState(false);
  
  // State for the Profile Menu Dropdown
  const [menuVisible, setMenuVisible] = useState(false);

  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cartItems?.cartItems || []);
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  useEffect(() => { fetchPizzas(); }, [searchQuery, selectedCategory]);
  useEffect(() => {
    if (selectedProduct?._id && visible) fetchProductReviews(selectedProduct._id);
  }, [selectedProduct, visible]);

  const fetchPizzas = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}/api/products`, {
        params: { search: searchQuery, category: selectedCategory }
      });
      setPizzas(data);
    } catch (e) {
      console.error('Fetch Products Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductReviews = async (id) => {
    try {
      setFetchingReviews(true);
      const { data } = await axios.get(`${BASE_URL}/api/reviews/product/${id}`);
      setProductReviews(data);
    } catch {
      setProductReviews([]);
    } finally {
      setFetchingReviews(false);
    }
  };

  const addToCart = (item) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
    try { addToCartSql(item); } catch (e) { console.log(e); }
  };

  const closeModal = () => { setVisible(false); setProductReviews([]); };
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={s.card} onPress={() => { setSelectedProduct(item); setVisible(true); }} activeOpacity={0.92}>
      <View>
        <Image source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }} style={s.pizzaImage} resizeMode="cover" />
        {item.isNew && <View style={s.newBadge}><Text style={s.newBadgeText}>NEW</Text></View>}
      </View>
      <View style={s.cardBody}>
        <Text style={s.pizzaName} numberOfLines={2}>{item.name}</Text>
        <Text style={s.pizzaDesc} numberOfLines={1}>{item.description}</Text>
        <View style={s.cardFooter}>
          <Text style={s.pizzaPrice}>₱{item.price.toFixed(2)}</Text>
          <TouchableOpacity style={s.addBtn} onPress={() => addToCart(item)} activeOpacity={0.8}>
            <Text style={s.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <PaperProvider>
      <StatusBar backgroundColor="#FF6B35" barStyle="light-content" />
      <View style={s.container}>

        {/* --- CUSTOM HEADER WITH DROPDOWN --- */}
        <View style={s.header}>
          <View>
            <Text style={s.headerGreeting}>Good day! 👋</Text>
            <Text style={s.headerTitle}>Freddy's Pizza 🍕</Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Cart Button */}
            <TouchableOpacity style={s.cartBtn} onPress={() => navigation?.navigate('Cart')}>
              <Text style={{ fontSize: 20 }}>🛒</Text>
              {cartCount > 0 && (
                <View style={s.cartBadge}><Text style={s.cartBadgeText}>{cartCount}</Text></View>
              )}
            </TouchableOpacity>

            {/* Profile Dropdown Menu */}
            <Menu
              visible={menuVisible}
              onDismiss={closeMenu}
              anchor={
                <TouchableOpacity style={[s.cartBtn, { marginLeft: 10 }]} onPress={openMenu}>
                  <Text style={{ fontSize: 20 }}>👤</Text>
                </TouchableOpacity>
              }
              contentStyle={{ backgroundColor: '#fff', borderRadius: 12 }}
            >
              <Menu.Item 
                onPress={() => { closeMenu(); navigation.navigate('UserProfile'); }} 
                title="My Profile" 
                leadingIcon="account" 
              />
              <Divider />
              <Menu.Item 
                onPress={() => { closeMenu(); navigation.navigate('MyOrders'); }} 
                title="My Orders" 
                leadingIcon="clipboard-list" 
              />
              <Divider />
              <Menu.Item 
                onPress={() => { closeMenu(); navigation.navigate('Login'); }} 
                title="Logout" 
                leadingIcon="logout" 
                titleStyle={{ color: '#e61e1e' }}
              />
            </Menu>
          </View>
        </View>

        {/* Search */}
        <View style={s.searchWrapper}>
          <Searchbar
            placeholder="Search deliciousness..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={s.search}
            inputStyle={{ fontSize: 14, color: '#222' }}
            iconColor="#FF6B35"
            placeholderTextColor="#aaa"
          />
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }} contentContainerStyle={s.categoryContent}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat} onPress={() => setSelectedCategory(cat)}
              style={[s.catChip, selectedCategory === cat && s.activeCat]} activeOpacity={0.8}>
              <Text style={[s.catText, selectedCategory === cat && { color: '#fff' }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Section Label */}
        <View style={s.sectionRow}>
          <Text style={s.sectionLabel}>{selectedCategory === 'All' ? 'Menu' : selectedCategory}</Text>
          <Text style={s.sectionCount}>{pizzas.length} items found</Text>
        </View>

        {/* Grid List */}
        {loading ? (
          <View style={s.loaderWrap}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={s.loadingText}>Loading menu...</Text>
          </View>
        ) : (
          <FlatList
            data={pizzas}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            numColumns={2}
            contentContainerStyle={s.listContainer}
            columnWrapperStyle={s.columnWrapper}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Product Modal */}
        <Portal>
          <Modal visible={visible} onDismiss={closeModal} contentContainerStyle={s.modalOverlay}>
            {selectedProduct && (
              <View style={s.modalCard}>
                <Image source={{ uri: selectedProduct.images?.[0] }} style={s.modalImage} resizeMode="cover" />
                <TouchableOpacity style={s.modalClose} onPress={closeModal}>
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>✕</Text>
                </TouchableOpacity>

                <ScrollView style={s.modalBody} showsVerticalScrollIndicator={false}>
                  <Text style={s.modalTitle}>{selectedProduct.name}</Text>
                  <Text style={s.modalDesc}>{selectedProduct.description}</Text>

                  <TouchableOpacity style={s.addToCartBtn} onPress={() => { addToCart(selectedProduct); closeModal(); }} activeOpacity={0.85}>
                    <Text style={s.addToCartText}>Add to Cart — ₱{selectedProduct.price.toFixed(2)}</Text>
                  </TouchableOpacity>

                  <Text style={s.reviewTitle}>Reviews</Text>
                  {fetchingReviews ? <ActivityIndicator color="#FF6B35" /> : productReviews.map((rev, i) => (
                    <View key={i} style={{ marginBottom: 12 }}>
                      <Text style={s.reviewUser}>{rev.userName} {'⭐'.repeat(rev.rating)}</Text>
                      <Text style={s.reviewText}>{rev.comment}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </Modal>
        </Portal>
      </View>
    </PaperProvider>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 54,
    paddingBottom: 18, paddingHorizontal: 20,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  headerGreeting: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '500' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  cartBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute', top: 2, right: 2,
    backgroundColor: '#FFD700', borderRadius: 9, minWidth: 18, height: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  cartBadgeText: { color: '#222', fontSize: 10, fontWeight: '800' },
  searchWrapper: { paddingHorizontal: 16, paddingTop: 16 },
  search: { borderRadius: 12, backgroundColor: '#fff', elevation: 2 },
  categoryContent: { paddingHorizontal: 16 },
  catChip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', marginRight: 8, borderWidth: 1, borderColor: '#eee' },
  activeCat: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  catText: { color: '#666', fontWeight: '600', fontSize: 13 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 16 },
  sectionLabel: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  sectionCount: { fontSize: 12, color: '#999' },
  listContainer: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 20 },
  columnWrapper: { gap: 12, marginBottom: 12 },
  card: { width: CARD_WIDTH, backgroundColor: '#fff', borderRadius: 16, elevation: 3, overflow: 'hidden' },
  pizzaImage: { width: '100%', height: 120 },
  cardBody: { padding: 10 },
  pizzaName: { fontWeight: '700', fontSize: 14 },
  pizzaDesc: { color: '#999', fontSize: 11, marginVertical: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pizzaPrice: { color: '#FF6B35', fontWeight: '800', fontSize: 14 },
  addBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  newBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#FF6B35', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  newBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#FF6B35', fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', margin: 0 },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', maxHeight: '90%' },
  modalImage: { width: '100%', height: 250 },
  modalClose: { position: 'absolute', top: 15, right: 15, backgroundColor: 'rgba(0,0,0,0.5)', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  modalBody: { padding: 20 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#1A1A1A' },
  modalDesc: { color: '#666', lineHeight: 22, marginVertical: 15 },
  addToCartBtn: { backgroundColor: '#FF6B35', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginBottom: 20 },
  addToCartText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  reviewTitle: { fontSize: 18, fontWeight: '800', marginBottom: 10 },
  reviewUser: { fontWeight: '700', fontSize: 14 },
  reviewText: { color: '#555', fontSize: 13, marginTop: 4 }
});

export default ProductContainer;