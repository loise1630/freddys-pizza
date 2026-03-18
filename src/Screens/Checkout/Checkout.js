import React, { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Text, Button, Card, Divider, List } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../../../config'; 

// IMPORT SQLITE CLEAR FUNCTION
import { clearCartSql } from '../../database/db'; 

const Checkout = (props) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  
  const cartItems = useSelector(state => state.cartItems.cartItems); 
  const user = useSelector(state => state.cartItems.user); 
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price, 0);

  const confirmOrder = async () => {
    if (cartItems.length === 0) return;

    setLoading(true);
    const orderData = {
      userName: user ? user.name : "Guest", 
      items: cartItems.map(item => ({
        productId: item._id || item.productId, // Compatibility check
        name: item.name,
        price: item.price,
        quantity: 1
      })),
      totalAmount: totalPrice,
      status: 'Pending',
      createdAt: new Date()
    };

    try {
      // 1. I-save ang order sa Server
      await axios.post(`${BASE_URL}/api/orders`, orderData);
      
      // 2. BURAHIN SA SQLITE (Ito ang requirement!)
      clearCartSql();

      // 3. BURAHIN SA REDUX (UI)
      dispatch({ type: 'CLEAR_CART' }); 

      Alert.alert("Success! 🍕", "Order placed successfully!");
      
      // I-reset ang navigation
      props.navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
      
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Hindi naisave ang order. Pakicheck ang server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Order Summary 📝</Text>
      
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.info}>Customer: <Text style={{fontWeight: 'bold'}}>{user ? user.name : "Guest"}</Text></Text>
          <Divider style={{ marginVertical: 10 }} />
          
          {cartItems.map((item, index) => (
             <List.Item
                key={index}
                title={item.name}
                right={() => <Text>₱{item.price.toFixed(2)}</Text>}
             />
          ))}

          <Divider style={{ marginVertical: 10 }} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalPrice}>₱{totalPrice.toFixed(2)}</Text>
          </View>
        </Card.Content>
      </Card>

      {loading ? (
        <ActivityIndicator size="large" color="#e61e1e" />
      ) : (
        <Button 
          mode="contained" 
          onPress={confirmOrder}
          style={styles.confirmBtn}
          labelStyle={{fontWeight: 'bold'}}
        >
          CONFIRM ORDER
        </Button>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f8f8' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  summaryCard: { marginBottom: 30, elevation: 4, borderRadius: 10 },
  info: { fontSize: 16 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  totalLabel: { fontSize: 18, fontWeight: '600' },
  totalPrice: { fontSize: 20, fontWeight: 'bold', color: '#e61e1e' },
  confirmBtn: { backgroundColor: '#e61e1e', paddingVertical: 8, borderRadius: 10 }
});

export default Checkout;