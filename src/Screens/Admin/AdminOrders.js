import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { DataTable, Text, PaperProvider, IconButton, Chip, Menu, Divider } from 'react-native-paper';
import axios from 'axios';
import { BASE_URL } from '../../../config';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [menuVisible, setMenuVisible] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/orders`);
      setOrders(response.data);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Fetch Error:", error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderRequest = async (id, newStatus) => {
    setMenuVisible(null);
    try {
      await axios.put(`${BASE_URL}/api/orders/${id}/status`, { status: newStatus });
      fetchOrders(); 
    } catch (error) {
      Alert.alert("Error", "Failed to update status");
    }
  };

  // BAGONG LOGIC: Sa halip na axios.delete, gagamit tayo ng update status para sa "Cancelled"
  const handleCancelOrder = (id) => {
    setMenuVisible(null);
    Alert.alert("Cancel Order", "Sigurado ka bang i-ca-cancel ang order na ito?", [
      { text: "No" },
      { text: "Yes, Cancel it", onPress: () => updateOrderRequest(id, "Cancelled") }
    ]);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Accepted': 
        return { bg: '#e8f5e9', text: '#2e7d32' }; 
      case 'Shipped': 
        return { bg: '#e3f2fd', text: '#1565c0' }; 
      case 'Delivered': 
        return { bg: '#f3e5f5', text: '#7b1fa2' }; 
      case 'Cancelled': 
        return { bg: '#ffebee', text: '#c62828' }; // Reddish for Cancelled
      default: // Pending
        return { bg: '#fff3cd', text: '#856404' }; 
    }
  };

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color="#e61e1e" /></View>;

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text style={styles.title}>Manage Orders 📋</Text>
        
        <ScrollView 
          horizontal 
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchOrders();}} />}
        >
          <View>
            <DataTable style={styles.table}>
              <DataTable.Header style={styles.tableHeader}>
                <DataTable.Title style={{ width: 80 }}>Order ID</DataTable.Title>
                <DataTable.Title style={{ width: 100 }}>Customer</DataTable.Title>
                <DataTable.Title numeric style={{ width: 80 }}>Total</DataTable.Title>
                <DataTable.Title style={{ width: 120 }}>Status</DataTable.Title>
                <DataTable.Title style={{ width: 80 }}>Action</DataTable.Title>
              </DataTable.Header>

              <ScrollView style={{ height: '100%' }}>
                {orders.map((item) => (
                  <DataTable.Row key={item._id} style={styles.row}>
                    <DataTable.Cell style={{ width: 80 }}>
                       <Text style={styles.idText}>#{item._id.slice(-4).toUpperCase()}</Text>
                    </DataTable.Cell>
                    
                    <DataTable.Cell style={{ width: 100 }}>{item.userName}</DataTable.Cell>
                    <DataTable.Cell numeric style={{ width: 80 }}>₱{item.totalAmount.toFixed(0)}</DataTable.Cell>
                    
                    <DataTable.Cell style={{ width: 120 }}>
                      <Chip 
                        style={{ backgroundColor: getStatusStyle(item.status).bg, height: 30 }}
                        textStyle={{ color: getStatusStyle(item.status).text, fontSize: 11, fontWeight: 'bold' }}
                      >
                        {item.status}
                      </Chip>
                    </DataTable.Cell>

                    <DataTable.Cell style={{ width: 80 }}>
                        <Menu
                          visible={menuVisible === item._id}
                          onDismiss={() => setMenuVisible(null)}
                          anchor={
                            <IconButton 
                              icon="chevron-down-circle-outline" 
                              size={22} 
                              iconColor="#666"
                              onPress={() => setMenuVisible(item._id)} 
                            />
                          }
                        >
                          <Menu.Item onPress={() => updateOrderRequest(item._id, "Pending")} title="Pending" />
                          <Menu.Item onPress={() => updateOrderRequest(item._id, "Accepted")} title="Accepted" />
                          <Menu.Item onPress={() => updateOrderRequest(item._id, "Shipped")} title="Shipped" />
                          <Menu.Item onPress={() => updateOrderRequest(item._id, "Delivered")} title="Delivered" />
                          <Divider />
                          {/* PINALITAN: Mula Delete, naging Cancel Order */}
                          <Menu.Item 
                            onPress={() => handleCancelOrder(item._id)} 
                            title="Cancel Order" 
                            titleStyle={{ color: '#c62828' }} 
                            leadingIcon="close-circle-outline"
                          />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 10 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  table: { minWidth: 500 }, 
  tableHeader: { backgroundColor: '#f8f9fa' },
  row: { borderBottomWidth: 0.5, borderBottomColor: '#eee', height: 60 },
  idText: { fontSize: 10, color: '#888', fontWeight: 'bold' }
});

export default AdminOrders;