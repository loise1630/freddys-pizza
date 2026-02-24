import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, List, Button, IconButton, Divider } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../../../config';

const Cart = (props) => {
  const dispatch = useDispatch();
  
  // Kunin ang cartItems at user details mula sa Redux state
  const cartItems = useSelector(state => state.cartItems.cartItems); 
  const user = useSelector(state => state.cartItems.user); 

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price, 0);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      return Alert.alert("Ops!", "Walang laman ang basket mo. 🍕");
    }

    // Siguraduhin na ang fields dito ay tugma sa hinahanap ng MyOrders.js
    const orderData = {
      userName: user ? user.name : "Guest", 
      items: cartItems.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: 1
      })),
      totalAmount: totalPrice,
      status: 'Pending', // NAPAKAHALAGA: Para lumitaw sa Pending tab
      createdAt: new Date()
    };

    try {
      console.log("Sending order to:", `${BASE_URL}/api/orders`);
      const res = await axios.post(`${BASE_URL}/api/orders`, orderData);
      
      Alert.alert("Success! 🍕", `Order placed for ${orderData.userName}!`);
      
      // 1. Linisin ang cart sa Redux
      dispatch({ type: 'CLEAR_CART' }); 

      // 2. Imbes na sa "Main", dalhin natin sa "MyOrders" para makita ang progress
      props.navigation.navigate("MyOrders"); 
      
    } catch (error) {
      console.error("Checkout Error:", error.response ? error.response.data : error.message);
      Alert.alert("Error", "Hindi naisave ang order. Siguraduhin na naka-ON ang backend server.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Basket 🛒</Text>
      <Text style={{marginBottom: 10, color: '#666'}}>
        Customer: <Text style={{fontWeight: 'bold'}}>{user ? user.name : "Guest"}</Text>
      </Text>
      
      <ScrollView style={styles.itemList}>
        {cartItems.length > 0 ? (
          cartItems.map((item, index) => (
            <View key={index}>
              <List.Item
                title={item.name}
                description={`₱${item.price.toFixed(2)}`}
                left={props => <List.Icon {...props} icon="pizza" color="#e61e1e" />}
                right={props => (
                  <IconButton 
                    icon="close-circle-outline" 
                    iconColor="red" 
                    onPress={() => dispatch({ type: 'REMOVE_FROM_CART', payload: index })} 
                  />
                )}
              />
              <Divider />
            </View>
          ))
        ) : (
          <View style={{alignItems: 'center', marginTop: 50}}>
             <Text style={styles.emptyText}>Empty basket. Order na!</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalPrice}>₱{totalPrice.toFixed(2)}</Text>
        </View>
        <Button 
          mode="contained" 
          onPress={handleCheckout} 
          disabled={cartItems.length === 0}
          style={[styles.checkoutBtn, { opacity: cartItems.length === 0 ? 0.5 : 1 }]}
          labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
        >
          PLACE ORDER
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  itemList: { flex: 1 },
  emptyText: { textAlign: 'center', color: '#888', fontSize: 16 },
  footer: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 20, marginBottom: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  totalLabel: { fontSize: 18, color: '#666' },
  totalPrice: { fontSize: 22, fontWeight: 'bold', color: '#e61e1e' },
  checkoutBtn: { backgroundColor: '#e61e1e', paddingVertical: 8, borderRadius: 10 }
});

export default Cart;