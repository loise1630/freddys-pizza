import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ScrollView, RefreshControl, Alert, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native'; 
import { Card, Chip, Button, ActivityIndicator, PaperProvider, SegmentedButtons } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; 
import { BASE_URL } from '../../../config';

const MyOrders = () => {
  const navigation = useNavigation();
  const route = useRoute(); // Para makuha ang data mula sa notification click
  const [orders, setOrders] = useState([]);
  const [userReviews, setUserReviews] = useState([]); 
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusTab, setStatusTab] = useState('Pending'); 
  const [userData, setUserData] = useState(null);

  // Deep Link Logic: I-set ang tab base sa pinadalang status ng notification
  useEffect(() => {
    if (route.params?.status) {
      setStatusTab(route.params.status);
    }
  }, [route.params?.status]);

  const getUserData = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const parsedUser = JSON.parse(user);
        setUserData(parsedUser);
        await Promise.all([
          fetchUserOrders(parsedUser.name),
          fetchUserReviews(parsedUser._id)
        ]);
      }
    } catch (error) {
      console.log("Context Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUserOrders = async (name) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/orders/user/${name}`);
      setOrders(response.data);
    } catch (error) {
      console.error("Fetch Orders Error:", error);
    }
  };

  const fetchUserReviews = async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/reviews/user/${userId}`);
      setUserReviews(response.data);
    } catch (error) {
      console.log("Fetch User Reviews Error:", error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getUserData();
    }, [])
  );

  useEffect(() => {
    const filtered = orders.filter(order => order.status === statusTab);
    setFilteredOrders(filtered);
  }, [statusTab, orders]);

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
      default: return '#f39c12';
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
            {item.status === 'Delivered' ? 'Completed' : item.status}
          </Chip>
        </View>

        <View style={styles.itemsList}>
          {item.items.map((pizza, index) => {
            const idToReview = pizza.productId || pizza._id;
            const existingReview = userReviews.find(rev => rev.productId === idToReview);

            return (
              <View key={index} style={styles.pizzaRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pizzaName}>{pizza.quantity}x {pizza.name}</Text>
                  <Text style={styles.pizzaPrice}>₱{(pizza.price * pizza.quantity).toFixed(2)}</Text>
                </View>
                
                {item.status === 'Delivered' && (
                  <Button 
                    mode={existingReview ? "outlined" : "contained"} 
                    compact 
                    onPress={() => {
                      if (!userData?._id) {
                          Alert.alert("Notice", "Please login again.");
                          return;
                      }
                      navigation.navigate("ProductReview", { 
                        productId: idToReview, 
                        userId: userData?._id, 
                        userName: userData?.name,
                        productName: pizza.name,
                        existingReview: existingReview 
                      });
                    }}
                    style={[styles.reviewBtn, existingReview && styles.editBtnOutline]}
                    labelStyle={{ fontSize: 10, fontWeight: 'bold', color: existingReview ? '#e61e1e' : '#fff' }}
                  >
                    {existingReview ? 'Edit' : 'Rate'}
                  </Button>
                )}
              </View>
            );
          })}
        </View>
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Payment</Text>
          <Text style={styles.totalValue}>₱{item.totalAmount.toFixed(2)}</Text>
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
          <View style={styles.center}><ActivityIndicator color="#e61e1e" size="large" /></View>
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item._id}
            renderItem={renderOrderItem}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#e61e1e']} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No {statusTab.toLowerCase()} orders found. 🍕</Text>
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
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabContainer: { paddingVertical: 10, backgroundColor: '#fff' },
  segmentedButtons: { paddingHorizontal: 10 },
  card: { marginVertical: 8, borderRadius: 12, elevation: 3, backgroundColor: '#fff', borderLeftWidth: 4, borderLeftColor: '#e61e1e' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  orderId: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  dateText: { fontSize: 12, color: '#888' },
  itemsList: { marginBottom: 10 },
  pizzaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingVertical: 5 },
  pizzaName: { fontSize: 14, fontWeight: '600' },
  pizzaPrice: { fontSize: 12, color: '#666' },
  reviewBtn: { backgroundColor: '#e61e1e', borderRadius: 20, minWidth: 80, height: 35, justifyContent: 'center' },
  editBtnOutline: { backgroundColor: 'transparent', borderColor: '#e61e1e', borderWidth: 1 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, color: '#555' },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: '#e61e1e' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16, color: '#999' }
});

export default MyOrders;