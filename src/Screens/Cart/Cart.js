import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, Platform } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { getCartItemsSql } from '../../database/db';

const Cart = ({ navigation }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cartItems.cartItems);
  const user = useSelector(state => state.cartItems.user);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
  const totalItems = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  useEffect(() => {
    try {
      const items = getCartItemsSql();
      if (items?.length > 0) dispatch({ type: 'SET_CART', payload: items });
    } catch (e) { console.log('SQLITE LOAD ERROR:', e); }
  }, []);

  const increaseQty = (i) => dispatch({ type: 'INCREASE_QTY', payload: i });
  const decreaseQty = (i) => {
    const action = (cartItems[i].quantity || 1) <= 1 ? 'REMOVE_FROM_CART' : 'DECREASE_QTY';
    dispatch({ type: action, payload: i });
  };

  return (
    <View style={s.container}>
      <StatusBar backgroundColor="#FF6B35" barStyle="light-content" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.headerTitle}>My Cart</Text>
          <Text style={s.headerSub}>{totalItems} item{totalItems !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      {/* Customer Tag */}
      <View style={s.customerTag}>
        <Text style={s.customerIcon}>👤</Text>
        <Text style={s.customerText}>
          Ordering as <Text style={s.customerName}>{user ? user.name : 'Guest'}</Text>
        </Text>
      </View>

      {cartItems?.length > 0 ? (
        <ScrollView style={s.itemList} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          {cartItems.map((item, i) => (
            <View key={i} style={s.cartCard}>
              <Image source={{ uri: item.images?.[0] || 'https://via.placeholder.com/80' }} style={s.itemImage} resizeMode="cover" />
              <View style={s.itemInfo}>
                <Text style={s.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={s.itemPrice}>₱{item.price.toFixed(2)}</Text>
                <View style={s.qtyRow}>
                  <TouchableOpacity style={s.qtyBtn} onPress={() => decreaseQty(i)}>
                    <Text style={s.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={s.qtyText}>{item.quantity || 1}</Text>
                  <TouchableOpacity style={[s.qtyBtn, s.qtyBtnActive]} onPress={() => increaseQty(i)}>
                    <Text style={[s.qtyBtnText, { color: '#fff' }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={s.itemRight}>
                <TouchableOpacity style={s.removeBtn} onPress={() => dispatch({ type: 'REMOVE_FROM_CART', payload: i })}>
                  <Text style={s.removeIcon}>✕</Text>
                </TouchableOpacity>
                <Text style={s.itemSubtotal}>₱{(item.price * (item.quantity || 1)).toFixed(2)}</Text>
              </View>
            </View>
          ))}

          {/* Order Summary */}
          <View style={s.summaryCard}>
            <Text style={s.summaryTitle}>Order Summary</Text>
            <Divider style={s.summaryDivider} />
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Subtotal ({totalItems} items)</Text>
              <Text style={s.summaryValue}>₱{totalPrice.toFixed(2)}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Delivery Fee</Text>
              <Text style={[s.summaryValue, { color: '#4CAF50' }]}>FREE</Text>
            </View>
            <Divider style={s.summaryDivider} />
            <View style={s.summaryRow}>
              <Text style={s.totalLabel}>Total</Text>
              <Text style={s.totalPrice}>₱{totalPrice.toFixed(2)}</Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={s.emptyState}>
          <Text style={s.emptyEmoji}>🍕</Text>
          <Text style={s.emptyTitle}>Your cart is empty</Text>
          <Text style={s.emptySubtitle}>Looks like you haven't added anything yet!</Text>
          <TouchableOpacity style={s.browseBtn} onPress={() => navigation.goBack()}>
            <Text style={s.browseBtnText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      )}

      {cartItems.length > 0 && (
        <View style={s.footer}>
          <View style={s.footerTotal}>
            <Text style={s.footerTotalLabel}>Total</Text>
            <Text style={s.footerTotalPrice}>₱{totalPrice.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={s.checkoutBtn} onPress={() => navigation.navigate('Checkout')} activeOpacity={0.85}>
            <Text style={s.checkoutText}>Proceed to Checkout  →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },

  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF6B35',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 54,
    paddingBottom: 18, paddingHorizontal: 20,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: -2 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500', marginTop: 1 },

  customerTag: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0EB',
    marginHorizontal: 16, marginTop: 14, marginBottom: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, gap: 8,
  },
  customerIcon: { fontSize: 16 },
  customerText: { fontSize: 13, color: '#888', fontWeight: '500' },
  customerName: { color: '#FF6B35', fontWeight: '800' },

  itemList: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },

  cartCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 18, padding: 12, marginBottom: 12,
    elevation: 3, shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, alignItems: 'center', gap: 12,
  },
  itemImage: { width: 78, height: 78, borderRadius: 14, backgroundColor: '#F5F5F5' },
  itemInfo: { flex: 1, gap: 4 },
  itemName: { fontSize: 13.5, fontWeight: '700', color: '#1A1A1A', lineHeight: 18 },
  itemPrice: { fontSize: 13, color: '#999', fontWeight: '500' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  qtyBtnActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  qtyBtnText: { fontSize: 16, fontWeight: '700', color: '#555', lineHeight: 19 },
  qtyText: { fontSize: 15, fontWeight: '800', color: '#1A1A1A', minWidth: 20, textAlign: 'center' },
  itemRight: { alignItems: 'flex-end', justifyContent: 'space-between', alignSelf: 'stretch', paddingVertical: 2 },
  removeBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFF0EB', justifyContent: 'center', alignItems: 'center' },
  removeIcon: { color: '#FF6B35', fontSize: 11, fontWeight: '800' },
  itemSubtotal: { fontSize: 15, fontWeight: '800', color: '#FF6B35' },

  summaryCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 18, marginTop: 4,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6,
  },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginBottom: 12 },
  summaryDivider: { backgroundColor: '#F0F0F0', marginVertical: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  summaryLabel: { fontSize: 13.5, color: '#888', fontWeight: '500' },
  summaryValue: { fontSize: 13.5, color: '#1A1A1A', fontWeight: '700' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  totalPrice: { fontSize: 20, fontWeight: '800', color: '#FF6B35' },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, gap: 10 },
  emptyEmoji: { fontSize: 64, marginBottom: 8 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  emptySubtitle: { fontSize: 13.5, color: '#aaa', textAlign: 'center', lineHeight: 20 },
  browseBtn: { marginTop: 10, backgroundColor: '#FF6B35', paddingHorizontal: 28, paddingVertical: 13, borderRadius: 14, elevation: 3 },
  browseBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  footer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    paddingHorizontal: 20, paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    borderTopWidth: 1, borderTopColor: '#F0F0F0', gap: 16,
    elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.06, shadowRadius: 8,
  },
  footerTotal: { flex: 1 },
  footerTotalLabel: { fontSize: 12, color: '#aaa', fontWeight: '600', marginBottom: 2 },
  footerTotalPrice: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  checkoutBtn: {
    flex: 2, backgroundColor: '#FF6B35', borderRadius: 16, paddingVertical: 15, alignItems: 'center',
    elevation: 4, shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8,
  },
  checkoutText: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 0.3 },
});

export default Cart;