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
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/orders`, {
        userName: user?.name || 'Guest',
        items: cartItems.map(({ productId, _id, name, price, quantity }) => ({
          productId: productId || _id, name, price, quantity: quantity || 1
        })),
        totalAmount: totalPrice,
        status: 'Pending'
      });
      if (res.status === 201) {
        clearCartSql();
        dispatch({ type: 'CLEAR_CART' });
        Alert.alert('Success! 🍕', 'Order placed successfully!', [
          { text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Main' }] }) }
        ]);
      }
    } catch (e) {
      console.error('Checkout Error:', e);
      Alert.alert('Error', 'Check server connection.');
    } finally {
      setLoading(false);
    }
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
          <Text style={s.headerTitle}>Checkout</Text>
          <Text style={s.headerSub}>Review your order</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Customer Tag */}
        <View style={s.customerTag}>
          <Text style={s.customerIcon}>👤</Text>
          <Text style={s.customerText}>
            Ordering as <Text style={s.customerName}>{user?.name || 'Guest'}</Text>
          </Text>
        </View>

        {/* Order Items */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Order Summary 📝</Text>
          <Divider style={s.divider} />
          {cartItems.map((item, i) => (
            <View key={i} style={s.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.itemName}>{item.name}</Text>
                <Text style={s.itemQty}>x{item.quantity || 1}</Text>
              </View>
              <Text style={s.itemPrice}>₱{(item.price * (item.quantity || 1)).toFixed(2)}</Text>
            </View>
          ))}
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
            <Text style={s.totalLabel}>Total</Text>
            <Text style={s.totalPrice}>₱{totalPrice.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={s.footer}>
        {loading ? (
          <ActivityIndicator size="large" color="#FF6B35" style={{ flex: 1 }} />
        ) : (
          <TouchableOpacity style={s.confirmBtn} onPress={confirmOrder} activeOpacity={0.85}>
            <Text style={s.confirmText}>✓  Confirm Order</Text>
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
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500', marginTop: 1 },

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
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginBottom: 12 },
  divider: { backgroundColor: '#F0F0F0', marginVertical: 10 },

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
    flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 20,
    paddingVertical: 16, paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
    elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.06, shadowRadius: 8,
  },
  confirmBtn: {
    flex: 1, backgroundColor: '#FF6B35', borderRadius: 16, paddingVertical: 15, alignItems: 'center',
    elevation: 4, shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8,
  },
  confirmText: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 0.3 },
});

export default Checkout;