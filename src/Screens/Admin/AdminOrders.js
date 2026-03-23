import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Alert, StatusBar, Platform } from 'react-native';
import { DataTable, Text, PaperProvider, IconButton, Chip, Menu, Divider } from 'react-native-paper';
import axios from 'axios';
import { BASE_URL } from '../../../config';

const STATUS_COLORS = {
  Accepted: { bg: '#e8f5e9', text: '#2e7d32' },
  Shipped:  { bg: '#e3f2fd', text: '#1565c0' },
  Delivered:{ bg: '#f3e5f5', text: '#7b1fa2' },
  Cancelled:{ bg: '#ffebee', text: '#c62828' },
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/orders`);
      setOrders(data);
    } catch (e) { console.error('Fetch Error:', e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateOrderRequest = async (id, newStatus) => {
    setMenuVisible(null);
    try {
      await axios.put(`${BASE_URL}/api/orders/${id}/status`, { status: newStatus });
      Alert.alert('Success', `Order status updated to ${newStatus}`);
      fetchOrders();
    } catch { Alert.alert('Error', 'Failed to update status'); }
  };

  const handleCancelOrder = (id) => {
    setMenuVisible(null);
    Alert.alert('Cancel Order', 'Sigurado ka bang i-ca-cancel ang order na ito?', [
      { text: 'No' },
      { text: 'Yes, Cancel it', onPress: () => updateOrderRequest(id, 'Cancelled') },
    ]);
  };

  const getStatusStyle = (st) => STATUS_COLORS[st] || { bg: '#fff3cd', text: '#856404' };

  if (loading) return <View style={s.loader}><ActivityIndicator size="large" color="#FF6B35" /></View>;

  return (
    <PaperProvider>
      <View style={s.container}>
        <StatusBar backgroundColor="#FF6B35" barStyle="light-content" />

        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Manage Orders 📋</Text>
          <Text style={s.headerSub}>{orders.length} total orders</Text>
        </View>

        <ScrollView horizontal refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} />}>
          <View>
            <DataTable style={s.table}>
              <DataTable.Header style={s.tableHeader}>
                <DataTable.Title style={{ width: 80 }}>Order ID</DataTable.Title>
                <DataTable.Title style={{ width: 100 }}>Customer</DataTable.Title>
                <DataTable.Title numeric style={{ width: 80 }}>Total</DataTable.Title>
                <DataTable.Title style={{ width: 120 }}>Status</DataTable.Title>
                <DataTable.Title style={{ width: 80 }}>Action</DataTable.Title>
              </DataTable.Header>
              <ScrollView style={{ height: '100%' }}>
                {orders.map((item) => (
                  <DataTable.Row key={item._id} style={s.row}>
                    <DataTable.Cell style={{ width: 80 }}>
                      <Text style={s.idText}>#{item._id.slice(-4).toUpperCase()}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={{ width: 100 }}><Text>{item.userName}</Text></DataTable.Cell>
                    <DataTable.Cell numeric style={{ width: 80 }}>
                      <Text>₱{item.totalAmount?.toFixed(0) || 0}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={{ width: 120 }}>
                      <Chip style={{ backgroundColor: getStatusStyle(item.status).bg, height: 30 }}
                        textStyle={{ color: getStatusStyle(item.status).text, fontSize: 11, fontWeight: 'bold' }}>
                        {item.status}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell style={{ width: 80 }}>
                      <Menu visible={menuVisible === item._id} onDismiss={() => setMenuVisible(null)}
                        anchor={<IconButton icon="chevron-down-circle-outline" size={22} iconColor="#666" onPress={() => setMenuVisible(item._id)} />}>
                        {['Pending', 'Accepted', 'Shipped', 'Delivered'].map(st => (
                          <Menu.Item key={st} onPress={() => updateOrderRequest(item._id, st)} title={st} />
                        ))}
                        <Divider />
                        <Menu.Item onPress={() => handleCancelOrder(item._id)} title="Cancel Order" titleStyle={{ color: '#c62828' }} />
                      </Menu>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </ScrollView>
            </DataTable>
          </View>
        </ScrollView>
      </View>
    </PaperProvider>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#FF6B35',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 54,
    paddingBottom: 18, paddingHorizontal: 20,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 10,
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500', marginTop: 1 },
  table: { minWidth: 500 },
  tableHeader: { backgroundColor: '#f8f9fa' },
  row: { borderBottomWidth: 0.5, borderBottomColor: '#eee', height: 60 },
  idText: { fontSize: 10, color: '#888', fontWeight: 'bold' },
});

export default AdminOrders;