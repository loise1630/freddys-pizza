import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, ActivityIndicator, Image, TouchableOpacity,
  FlatList, ScrollView, StatusBar, Dimensions, Platform, TextInput
} from 'react-native';
import { Text, Searchbar, Modal, Portal, PaperProvider, Divider, Menu } from 'react-native-paper';
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
  const [activeIndex, setActiveIndex] = useState(0); 
  
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);

  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cartItems?.cartItems || []);
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  useEffect(() => { 
    const delayDebounceFn = setTimeout(() => { fetchPizzas(); }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCategory, minPrice, maxPrice]);

  useEffect(() => {
    if (selectedProduct?._id && visible) fetchProductReviews(selectedProduct._id);
  }, [selectedProduct, visible]);

  const fetchPizzas = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}/api/products`, {
        params: { 
          search: searchQuery, 
          category: selectedCategory,
          minPrice: minPrice || 0,
          maxPrice: maxPrice || 999999
        }
      });
      setPizzas(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchProductReviews = async (id) => {
    try {
      setFetchingReviews(true);
      const { data } = await axios.get(`${BASE_URL}/api/reviews/product/${id}`);
      setProductReviews(data);
    } catch { setProductReviews([]); } finally { setFetchingReviews(false); }
  };

  const addToCart = (item) => {
    if (item.stock <= 0) return;
    dispatch({ type: 'ADD_TO_CART', payload: item });
    try { addToCartSql(item); } catch (e) { console.log(e); }
  };

  const closeModal = () => { 
    setVisible(false); 
    setProductReviews([]); 
    setActiveIndex(0); 
  };

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setActiveIndex(index);
  };

  const renderItem = ({ item }) => {
    // Dynamic Sold Out logic: If stock > 0, it is NOT sold out.
    const isSoldOut = item.stock <= 0;
    
    return (
      <TouchableOpacity 
        style={[s.card, isSoldOut && { opacity: 0.85 }]} 
        onPress={() => { setSelectedProduct(item); setVisible(true); }} 
        activeOpacity={0.92}
      >
        <View>
          <Image 
            source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }} 
            style={[s.pizzaImage, isSoldOut && { opacity: 0.6 }]} 
            resizeMode="cover" 
          />
          {item.isNew && !isSoldOut && <View style={s.newBadge}><Text style={s.newBadgeText}>NEW</Text></View>}
          {isSoldOut && (
            <View style={s.soldOutBadge}>
              <Text style={s.soldOutText}>OUT OF STOCK</Text>
            </View>
          )}
        </View>
        <View style={s.cardBody}>
          <Text style={[s.pizzaName, isSoldOut && { color: '#888' }]} numberOfLines={2}>{item.name}</Text>
          <Text style={s.pizzaDesc} numberOfLines={1}>{item.description}</Text>
          <View style={s.cardFooter}>
            <Text style={s.pizzaPrice}>₱{item.price.toFixed(2)}</Text>
            <TouchableOpacity 
              style={[s.addBtn, isSoldOut && { backgroundColor: '#bdc3c7' }]} 
              onPress={() => addToCart(item)} 
              disabled={isSoldOut}
            >
              <Text style={s.addBtnText}>{isSoldOut ? '✕' : '+'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <PaperProvider>
      <StatusBar backgroundColor="#FF6B35" barStyle="light-content" />
      <View style={s.container}>
        <View style={s.header}>
          <View>
            <Text style={s.headerGreeting}>Good day! 👋</Text>
            <Text style={s.headerTitle}>Freddy's Pizza 🍕</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={s.cartBtn} onPress={() => navigation?.navigate('Cart')}>
              <Text style={{ fontSize: 20 }}>🛒</Text>
              {cartCount > 0 && <View style={s.cartBadge}><Text style={s.cartBadgeText}>{cartCount}</Text></View>}
            </TouchableOpacity>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={<TouchableOpacity style={[s.cartBtn, { marginLeft: 10 }]} onPress={() => setMenuVisible(true)}><Text style={{ fontSize: 20 }}>👤</Text></TouchableOpacity>}
              contentStyle={{ backgroundColor: '#fff', borderRadius: 12 }}
            >
              <Menu.Item onPress={() => { setMenuVisible(false); navigation.navigate('UserProfile'); }} title="My Profile" leadingIcon="account" />
              <Divider />
              <Menu.Item onPress={() => { setMenuVisible(false); navigation.navigate('MyOrders'); }} title="My Orders" leadingIcon="clipboard-list" />
              <Divider />
              <Menu.Item onPress={() => { setMenuVisible(false); navigation.navigate('Login'); }} title="Logout" leadingIcon="logout" titleStyle={{ color: '#e61e1e' }} />
            </Menu>
          </View>
        </View>

        <View style={s.filterContainer}>
          <Searchbar placeholder="Search pizza..." onChangeText={setSearchQuery} value={searchQuery} style={s.search} inputStyle={{ fontSize: 14 }} iconColor="#FF6B35" />
          <View style={s.priceRangeRow}>
            <View style={s.priceInputWrap}>
              <Text style={s.priceLabel}>Min Price</Text>
              <TextInput style={s.priceInput} placeholder="₱ 0" keyboardType="numeric" value={minPrice} onChangeText={setMinPrice} />
            </View>
            <View style={s.priceInputWrap}>
              <Text style={s.priceLabel}>Max Price</Text>
              <TextInput style={s.priceInput} placeholder="₱ 1000+" keyboardType="numeric" value={maxPrice} onChangeText={setMaxPrice} />
            </View>
            {(minPrice !== '' || maxPrice !== '') && (
              <TouchableOpacity onPress={() => { setMinPrice(''); setMaxPrice(''); }} style={s.clearBtn}><Text style={s.clearBtnTxt}>Reset</Text></TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ height: 50 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.categoryContent}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat} onPress={() => setSelectedCategory(cat)} style={[s.catChip, selectedCategory === cat && s.activeCat]}>
                <Text style={[s.catText, selectedCategory === cat && { color: '#fff' }]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={s.sectionRow}>
          <Text style={s.sectionLabel}>{selectedCategory === 'All' ? 'Menu' : selectedCategory}</Text>
          <Text style={s.sectionCount}>{pizzas.length} items</Text>
        </View>

        {loading ? (
          <View style={s.loaderWrap}><ActivityIndicator size="large" color="#FF6B35" /></View>
        ) : (
          <FlatList data={pizzas} keyExtractor={(item) => item._id} renderItem={renderItem} numColumns={2} contentContainerStyle={s.listContainer} columnWrapperStyle={s.columnWrapper} />
        )}

        <Portal>
          <Modal visible={visible} onDismiss={closeModal} contentContainerStyle={s.modalOverlay}>
            {selectedProduct && (
              <View style={s.modalCard}>
                <View style={s.carouselContainer}>
                  <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={16}>
                    {selectedProduct.images?.map((img, index) => (
                      <Image key={index} source={{ uri: img }} style={s.modalImage} />
                    ))}
                  </ScrollView>
                  <View style={s.pagination}>
                    {selectedProduct.images?.map((_, index) => (
                      <View key={index} style={[s.dot, activeIndex === index ? s.activeDot : s.inactiveDot]} />
                    ))}
                  </View>
                  <TouchableOpacity style={s.modalClose} onPress={closeModal}><Text style={{ color: '#fff' }}>✕</Text></TouchableOpacity>
                </View>
                
                <ScrollView style={s.modalBody} showsVerticalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                     <Text style={s.modalTitle}>{selectedProduct.name}</Text>
                     <Text style={[s.stockText, { color: selectedProduct.stock > 0 ? '#2ecc71' : '#e74c3c' }]}>
                        {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : 'Out of stock'}
                     </Text>
                  </View>
                  <Text style={s.modalDesc}>{selectedProduct.description}</Text>
                  
                  {selectedProduct.stock > 0 ? (
                    <TouchableOpacity style={s.addToCartBtn} onPress={() => { addToCart(selectedProduct); closeModal(); }}>
                      <Text style={s.addToCartText}>Add to Cart — ₱{selectedProduct.price.toFixed(2)}</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={[s.addToCartBtn, { backgroundColor: '#bdc3c7' }]}>
                      <Text style={s.addToCartText}>Sold Out</Text>
                    </View>
                  )}
                  <Divider style={{ marginVertical: 15 }} />
                  <Text style={s.reviewTitle}>Customer Reviews</Text>
                  {fetchingReviews ? <ActivityIndicator color="#FF6B35" /> : productReviews.length > 0 ? (
                    productReviews.map((rev, i) => (
                      <View key={i} style={s.reviewItem}>
                        <Text style={s.reviewUser}>{rev.userName} <Text style={{color: '#FFD700'}}>{'⭐'.repeat(rev.rating)}</Text></Text>
                        <Text style={s.reviewText}>{rev.comment}</Text>
                      </View>
                    ))
                  ) : <Text style={s.noReviews}>No reviews yet for this product. 🍕</Text>}
                  <View style={{ height: 30 }} /> 
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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FF6B35',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 54,
    paddingBottom: 18, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  headerGreeting: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  cartBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  cartBadge: { position: 'absolute', top: 2, right: 2, backgroundColor: '#FFD700', borderRadius: 9, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  cartBadgeText: { color: '#222', fontSize: 10, fontWeight: '800' },
  filterContainer: { paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  search: { borderRadius: 12, backgroundColor: '#fff', elevation: 2, height: 45 },
  priceRangeRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  priceInputWrap: { flex: 1 },
  priceLabel: { fontSize: 10, fontWeight: '700', color: '#888', marginBottom: 4 },
  priceInput: { backgroundColor: '#fff', borderRadius: 10, height: 38, paddingHorizontal: 10, borderWidth: 1, borderColor: '#eee', fontSize: 12 },
  clearBtn: { paddingBottom: 10 },
  clearBtnTxt: { color: '#FF6B35', fontSize: 12, fontWeight: '700' },
  categoryContent: { paddingHorizontal: 16, alignItems: 'center' },
  catChip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', marginRight: 8, borderWidth: 1, borderColor: '#eee' },
  activeCat: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  catText: { color: '#666', fontWeight: '600', fontSize: 13 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 10 },
  sectionLabel: { fontSize: 18, fontWeight: '800' },
  sectionCount: { fontSize: 12, color: '#999' },
  listContainer: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 20 },
  columnWrapper: { gap: 12, marginBottom: 12 },
  card: { width: CARD_WIDTH, backgroundColor: '#fff', borderRadius: 16, elevation: 3, overflow: 'hidden' },
  pizzaImage: { width: '100%', height: 110 },
  cardBody: { padding: 10 },
  pizzaName: { fontWeight: '700', fontSize: 13 },
  pizzaDesc: { color: '#999', fontSize: 10, marginVertical: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pizzaPrice: { color: '#FF6B35', fontWeight: '800', fontSize: 13 },
  addBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  newBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#FF6B35', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  newBadgeText: { color: '#fff', fontSize: 8, fontWeight: '800' },
  soldOutBadge: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  soldOutText: { color: '#fff', fontWeight: '900', fontSize: 10, backgroundColor: '#e74c3c', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  loaderWrap: { flex: 1, justifyContent: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', margin: 0 },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', maxHeight: '90%' },
  carouselContainer: { width: '100%', height: 250 },
  modalImage: { width: width, height: 250 },
  pagination: { position: 'absolute', bottom: 15, flexDirection: 'row', width: '100%', justifyContent: 'center', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  activeDot: { backgroundColor: '#FF6B35', width: 20 },
  inactiveDot: { backgroundColor: 'rgba(255,255,255,0.5)' },
  modalClose: { position: 'absolute', top: 15, right: 15, backgroundColor: 'rgba(0,0,0,0.5)', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  modalBody: { padding: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A' },
  stockText: { fontSize: 12, fontWeight: '700' },
  modalDesc: { color: '#666', marginVertical: 12, lineHeight: 18 },
  addToCartBtn: { backgroundColor: '#FF6B35', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  addToCartText: { color: '#fff', fontWeight: '800' },
  reviewTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  reviewItem: { marginBottom: 12, backgroundColor: '#F9F9F9', padding: 10, borderRadius: 10 },
  reviewUser: { fontWeight: '700', fontSize: 14 },
  reviewText: { color: '#555', fontSize: 13, marginTop: 2 },
  noReviews: { color: '#999', fontStyle: 'italic', textAlign: 'center', marginVertical: 10 }
});

export default ProductContainer;