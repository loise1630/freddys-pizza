import React, { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../../../config';
import { clearCartSql } from '../../database/db';

const Checkout = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cartItems.cartItems);
  const user = useSelector(state => state.cartItems.user);

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);

  const confirmOrder = async () => {
    if (!cartItems.length) return Alert.alert('Empty Cart', 'Magdagdag muna ng pizza sa cart!');

    const outOfStockItems = cartItems.filter(item => item.stock <= 0 || item.quantity > item.stock);
    if (outOfStockItems.length > 0) {
      const names = outOfStockItems.map(i => i.name).join(', ');
      return Alert.alert(
        'Out of Stock',
        `Ang mga sumusunod ay wala nang sapat na stock: ${names}. Pakibawasan o alisin sila sa cart.`,
        [{ text: 'Bumalik sa Cart', onPress: () => navigation.goBack() }]
      );
    }

    if (!user?.address || user.address.trim() === '') {
      return Alert.alert(
        'Missing Address',
        'Please set your address.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Profile', onPress: () => navigation.navigate('UserProfile') }
        ]
      );
    }

    const items = cartItems.map(item => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
    }));

    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/orders`, {
        userName: user?.name || 'Guest',
        userAddress: user?.address,
        items,
        totalAmount: totalPrice,
      });

      if (res.status === 201) {
        clearCartSql();
        dispatch({ type: 'CLEAR_CART' });
        Alert.alert('Success! 🍕', 'Order placed successfully!', [
          { text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Main' }] }) }
        ]);
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || 'Check server connection.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <StatusBar backgroundColor="#FF6B35" barStyle="light-content" />

      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.headerTitle}>Checkout</Text>
          <Text style={s.headerSub}>Review your order</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        <View style={s.customerTag}>
          <Text style={s.customerIcon}>👤</Text>
          <Text style={s.customerText}>
            Ordering as <Text style={s.customerName}>{user?.name || 'Guest'}</Text>
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Order Summary 📝</Text>
          <Divider style={s.divider} />

          <View style={s.addressContainer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={s.sectionLabel}>Delivery Address 📍</Text>
              <TouchableOpacity onPress={() => navigation.navigate('UserProfile')}>
                <Text style={s.editLink}>Edit</Text>
              </TouchableOpacity>
            </View>
            {user?.address ? (
              <Text style={s.addressText}>{user.address}</Text>
            ) : (
              <Text style={s.noAddressText}>⚠️ Please set your address in Profile.</Text>
            )}
          </View>

          <Divider style={s.divider} />

          {cartItems.map((item, i) => {
            const noStock = item.stock <= 0 || item.quantity > item.stock;
            return (
              <View key={i} style={s.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.itemName, noStock && { color: '#e74c3c' }]}>
                    {item.name} {noStock && '(Out of Stock!)'}
                  </Text>
                  <Text style={s.itemQty}>x{item.quantity || 1}</Text>
                </View>
                <Text style={[s.itemPrice, noStock && { textDecorationLine: 'line-through', color: '#bdc3c7' }]}>
                  ₱{(item.price * (item.quantity || 1)).toFixed(2)}
                </Text>
              </View>
            );
          })}

          <Divider style={s.divider} />

          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Subtotal</Text>
            <Text style={s.summaryValue}>₱{totalPrice.toFixed(2)}</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Delivery Fee</Text>
            <Text style={[s.summaryValue, { color: '#4CAF50' }]}>FREE</Text>
          </View>

          <Divider style={s.divider} />

          <View style={s.summaryRow}>
            <Text style={s.totalLabel}>Total Amount</Text>
            <Text style={s.totalPrice}>₱{totalPrice.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={s.footer}>
        {loading ? (
          <ActivityIndicator size="large" color="#FF6B35" style={{ flex: 1 }} />
        ) : (
          <TouchableOpacity
            style={[
              s.confirmBtn,
              (!user?.address || cartItems.some(item => item.stock <= 0)) && { backgroundColor: '#bdc3c7' }
            ]}
            onPress={confirmOrder}
            activeOpacity={0.85}
          >
            <Text style={s.confirmText}>✓ Confirm Order</Text>
          </TouchableOpacity>
        )}
      </View>
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
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  scroll: { padding: 16, paddingBottom: 30 },
  customerTag: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0EB',
    padding: 12, borderRadius: 14, gap: 8, marginBottom: 14,
  },
  customerIcon: { fontSize: 16 },
  customerText: { fontSize: 13, color: '#888', fontWeight: '500' },
  customerName: { color: '#FF6B35', fontWeight: '800' },
  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 18,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginBottom: 5 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#888', marginBottom: 4 },
  editLink: { fontSize: 12, fontWeight: '800', color: '#FF6B35' },
  addressContainer: { paddingVertical: 5 },
  addressText: { fontSize: 14, color: '#1A1A1A', fontWeight: '600', lineHeight: 20 },
  noAddressText: { fontSize: 13, color: '#e74c3c', fontWeight: '700' },
  divider: { backgroundColor: '#F0F0F0', marginVertical: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  itemName: { fontSize: 13.5, fontWeight: '700', color: '#1A1A1A' },
  itemQty: { fontSize: 12, color: '#999', marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: '#FF6B35' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  summaryLabel: { fontSize: 13.5, color: '#888', fontWeight: '500' },
  summaryValue: { fontSize: 13.5, color: '#1A1A1A', fontWeight: '700' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  totalPrice: { fontSize: 20, fontWeight: '800', color: '#FF6B35' },
  footer: {
    backgroundColor: '#fff', paddingHorizontal: 20,
    paddingVertical: 16, paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  confirmBtn: {
    backgroundColor: '#FF6B35', borderRadius: 16, paddingVertical: 15, alignItems: 'center',
    elevation: 4,
  },
  confirmText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});

export default Checkout;