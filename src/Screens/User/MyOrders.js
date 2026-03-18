import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Chip, SegmentedButtons, PaperProvider } from 'react-native-paper';
import axios from 'axios';
import { BASE_URL } from '../../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusTab, setStatusTab] = useState('Pending'); 
  const [userName, setUserName] = useState('');

  // 1. Kunin ang data ng user mula sa storage
  const getUserData = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const parsedUser = JSON.parse(user);
        console.log("Logged in user:", parsedUser.name);
        setUserName(parsedUser.name);
        await fetchUserOrders(parsedUser.name);
      } else {
        setLoading(false);
        console.log("No user found in storage");
      }
    } catch (error) {
      console.error("User storage error:", error);
      setLoading(false);
    }
  };

  // 2. Kunin ang orders mula sa backend
  const fetchUserOrders = async (name) => {
    try {
      // Inilagay ko sa console para ma-check mo sa terminal kung tama ang URL
      console.log(`Fetching: ${BASE_URL}/api/orders/user/${name}`);
      const response = await axios.get(`${BASE_URL}/api/orders/user/${name}`);
      setOrders(response.data);
    } catch (error) {
      console.error("Fetch orders error:", error.message);
      // Magpapakita ng alert kung hindi makakonekta sa IP ng PC mo
      Alert.alert("Connection Error", "Hindi maabot ang server. Check mo ang IP sa config.js mo.");
    } finally {
      // Dito natin sinisigurado na mamamatay ang loading spinner
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 3. Filter orders base sa napiling Tab
  useEffect(() => {
    const filtered = orders.filter(order => order.status === statusTab);
    setFilteredOrders(filtered);
  }, [statusTab, orders]);

  // Initial load
  useEffect(() => {
    getUserData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getUserData();
  }, []);

  const getStatusColor = (st) => {
    switch (st) {
      case 'Accepted': return '#2ecc71';
      case 'Shipped': return '#3498db';
      case 'Delivered': return '#8e44ad';
      case 'Cancelled': return '#e74c3c';
      default: return '#f39c12'; // Pending
    }
  };

  const renderOrderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
            <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          <Chip 
            textStyle={{ color: 'white', fontSize: 10, fontWeight: 'bold' }} 
            style={{ backgroundColor: getStatusColor(item.status), height: 28 }}
          >
            {item.status}
          </Chip>
        </View>

        <View style={styles.itemsList}>
          {item.items.map((pizza, index) => (
            <View key={index} style={styles.pizzaRow}>
              <Text style={styles.pizzaName}>{pizza.quantity}x {pizza.name}</Text>
              <Text style={styles.pizzaPrice}>₱{pizza.price * pizza.quantity}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Payment</Text>
          <Text style={styles.totalValue}>₱{item.totalAmount}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <PaperProvider>
      <View style={styles.container}>
        <View style={styles.tabContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <SegmentedButtons
              value={statusTab}
              onValueChange={setStatusTab}
              buttons={[
                { value: 'Pending', label: 'Pending' },
                { value: 'Accepted', label: 'Accepted' },
                { value: 'Shipped', label: 'Shipped' },
                { value: 'Delivered', label: 'Completed' },
                { value: 'Cancelled', label: 'Cancelled' },
              ]}
              style={styles.segmentedButtons}
            />
          </ScrollView>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator color="#e61e1e" size="large" />
            <Text style={{ textAlign: 'center', marginTop: 10, color: '#888' }}>Checking your pizza orders...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item._id}
            renderItem={renderOrderItem}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#e61e1e']} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No {statusTab} orders yet. 🍕</Text>
              </View>
            }
            contentContainerStyle={{ padding: 10, paddingBottom: 30 }}
          />
        )}
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  tabContainer: { backgroundColor: '#fff', paddingVertical: 10, elevation: 2 },
  segmentedButtons: { paddingHorizontal: 10, minWidth: 550 },
  card: { marginBottom: 12, borderRadius: 8, backgroundColor: '#fff', elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderId: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  dateText: { fontSize: 11, color: '#888' },
  itemsList: { marginBottom: 10 },
  pizzaRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3 },
  pizzaName: { color: '#555', fontSize: 14 },
  pizzaPrice: { fontWeight: '500', color: '#333' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 13, color: '#777' },
  totalValue: { fontWeight: 'bold', color: '#e61e1e', fontSize: 17 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#999', fontSize: 16 }
});

export default MyOrders;