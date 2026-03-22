import React, { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Text, Button, Card, Divider, List } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../../../config'; 
import { clearCartSql } from '../../database/db'; 

const Checkout = (props) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { navigation } = props;

  const cartItems = useSelector(state => state.cartItems.cartItems); 
  const user = useSelector(state => state.cartItems.user); 
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

  const confirmOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert("Empty Cart", "Magdagdag muna ng pizza sa cart!");
      return;
    }

    setLoading(true);
    const orderData = {
      userName: user ? user.name : "Guest", 
      items: cartItems.map(item => ({
        productId: item.productId || item._id, 
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1
      })),
      totalAmount: totalPrice,
      status: 'Pending'
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/orders`, orderData);
      
      if (response.status === 201) {
        // STEP 1: Burahin sa SQLite
        clearCartSql();

        // STEP 2: Burahin sa Redux (Dapat mag-match ito sa Reducer mo!)
        dispatch({ type: 'CLEAR_CART' }); 

        Alert.alert("Success! 🍕", "Order placed successfully!", [
          {
            text: "OK",
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }], 
              });
            }
          }
        ]);
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      Alert.alert("Error", "Check server connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Order Summary 📝</Text>
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.info}>Customer: {user ? user.name : "Guest"}</Text>
          <Divider style={{ marginVertical: 10 }} />
          {cartItems.map((item, index) => (
             <List.Item 
                key={index} 
                title={`${item.name} (x${item.quantity || 1})`} 
                right={() => <Text style={styles.itemPrice}>₱{(item.price * (item.quantity || 1)).toFixed(2)}</Text>} 
             />
          ))}
          <Divider style={{ marginVertical: 10 }} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalPrice}>₱{totalPrice.toFixed(2)}</Text>
          </View>
        </Card.Content>
      </Card>
      
      {loading ? (
        <ActivityIndicator size="large" color="#e61e1e" />
      ) : (
        <Button mode="contained" onPress={confirmOrder} style={styles.confirmBtn}>
          CONFIRM ORDER
        </Button>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f8f8' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  summaryCard: { marginBottom: 30, borderRadius: 10, backgroundColor: '#fff' },
  info: { fontSize: 16 },
  itemPrice: { alignSelf: 'center' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 18 },
  totalPrice: { fontSize: 22, fontWeight: 'bold', color: '#e61e1e' },
  confirmBtn: { backgroundColor: '#e61e1e', borderRadius: 10 }
});

export default Checkout;