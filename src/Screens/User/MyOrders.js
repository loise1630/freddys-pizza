import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ScrollView, RefreshControl, Alert, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { Card, Chip, Button, ActivityIndicator, PaperProvider, SegmentedButtons } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../../../config';

const STATUS_TABS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Accepted', label: 'Accepted' },
  { value: 'Shipped', label: 'Shipped' },
  { value: 'Delivered', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
];

const STATUS_COLORS = {
  Accepted: '#2ecc71', Shipped: '#3498db',
  Delivered: '#8e44ad', Cancelled: '#e74c3c',
};

const MyOrders = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [orders, setOrders] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusTab, setStatusTab] = useState('Pending');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (route.params?.status) setStatusTab(route.params.status);
  }, [route.params?.status]);

  useEffect(() => {
    setFilteredOrders(orders.filter(o => o.status === statusTab));
  }, [statusTab, orders]);

  const getUserData = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const parsed = JSON.parse(user);
        setUserData(parsed);
        await Promise.all([fetchUserOrders(parsed.name), fetchUserReviews(parsed._id)]);
      }
    } catch (e) { console.log('Context Error:', e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const fetchUserOrders = async (name) => {
    try { const { data } = await axios.get(`${BASE_URL}/api/orders/user/${name}`); setOrders(data); }
    catch (e) { console.error('Fetch Orders Error:', e); }
  };

  const fetchUserReviews = async (userId) => {
    try { const { data } = await axios.get(`${BASE_URL}/api/reviews/user/${userId}`); setUserReviews(data); }
    catch (e) { console.log('Fetch User Reviews Error:', e.message); }
  };

  useFocusEffect(useCallback(() => { getUserData(); }, []));
  const onRefresh = useCallback(() => { setRefreshing(true); getUserData(); }, []);

  const renderOrderItem = ({ item }) => (
    <Card style={s.card}>
      <Card.Content>
        <View style={s.cardHeader}>
          <View>
            <Text style={s.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
            <Text style={s.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          <Chip textStyle={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}
            style={{ backgroundColor: STATUS_COLORS[item.status] || '#f39c12', height: 28 }}>
            {item.status === 'Delivered' ? 'Completed' : item.status}
          </Chip>
        </View>

        <View style={s.itemsList}>
          {item.items.map((pizza, i) => {
            const idToReview = pizza.productId || pizza._id;
            const existingReview = userReviews.find(r => r.productId === idToReview);
            return (
              <View key={i} style={s.pizzaRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.pizzaName}>{pizza.quantity}x {pizza.name}</Text>
                  <Text style={s.pizzaPrice}>₱{(pizza.price * pizza.quantity).toFixed(2)}</Text>
                </View>
                {item.status === 'Delivered' && (
                  <Button
                    mode={existingReview ? 'outlined' : 'contained'} compact
                    onPress={() => {
                      if (!userData?._id) return Alert.alert('Notice', 'Please login again.');
                      navigation.navigate('ProductReview', {
                        productId: idToReview, userId: userData._id,
                        userName: userData.name, productName: pizza.name, existingReview,
                      });
                    }}
                    style={[s.reviewBtn, existingReview && s.editBtnOutline]}
                    labelStyle={{ fontSize: 10, fontWeight: 'bold', color: existingReview ? '#FF6B35' : '#fff' }}
                  >
                    {existingReview ? 'Edit' : 'Rate'}
                  </Button>
                )}
              </View>
            );
          })}
        </View>

        <View style={s.divider} />
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Total Payment</Text>
          <Text style={s.totalValue}>₱{item.totalAmount.toFixed(2)}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <PaperProvider>
      <View style={s.container}>
        <StatusBar backgroundColor="#FF6B35" barStyle="light-content" />

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.headerTitle}>My Orders</Text>
            <Text style={s.headerSub}>{filteredOrders.length} {statusTab.toLowerCase()} order{filteredOrders.length !== 1 ? 's' : ''}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={s.tabContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <SegmentedButtons value={statusTab} onValueChange={setStatusTab}
              buttons={STATUS_TABS} style={s.segmentedButtons} />
          </ScrollView>
        </View>

        {loading ? (
          <View style={s.center}><ActivityIndicator color="#FF6B35" size="large" /></View>
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item._id}
            renderItem={renderOrderItem}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B35']} />}
            contentContainerStyle={{ padding: 10, paddingBottom: 30 }}
            ListEmptyComponent={
              <View style={s.emptyContainer}>
                <Text style={s.emptyEmoji}>🍕</Text>
                <Text style={s.emptyText}>No {statusTab.toLowerCase()} orders yet.</Text>
              </View>
            }
          />
        )}
      </View>
    </PaperProvider>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

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

  tabContainer: { paddingVertical: 10, backgroundColor: '#fff' },
  segmentedButtons: { paddingHorizontal: 10 },

  card: { marginVertical: 8, borderRadius: 16, elevation: 3, backgroundColor: '#fff', borderLeftWidth: 4, borderLeftColor: '#FF6B35' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  orderId: { fontWeight: '800', fontSize: 14, color: '#1A1A1A' },
  dateText: { fontSize: 12, color: '#888', marginTop: 2 },

  itemsList: { marginBottom: 10 },
  pizzaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingVertical: 5 },
  pizzaName: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  pizzaPrice: { fontSize: 12, color: '#999', marginTop: 2 },
  reviewBtn: { backgroundColor: '#FF6B35', borderRadius: 20, minWidth: 80, height: 35, justifyContent: 'center' },
  editBtnOutline: { backgroundColor: 'transparent', borderColor: '#FF6B35', borderWidth: 1 },

  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, color: '#888', fontWeight: '500' },
  totalValue: { fontSize: 16, fontWeight: '800', color: '#FF6B35' },

  emptyContainer: { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 15, color: '#aaa', fontWeight: '500' },
});

export default MyOrders;