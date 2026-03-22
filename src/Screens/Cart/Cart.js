import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List, Button, IconButton, Divider } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { getCartItemsSql } from '../../database/db';

const Cart = (props) => {
  const dispatch = useDispatch();
  
  const cartItems = useSelector(state => state.cartItems.cartItems); 
  const user = useSelector(state => state.cartItems.user); 
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

  useEffect(() => {
    const loadFromSql = () => {
      try {
        const items = getCartItemsSql();
        if (items && items.length > 0) {
          // Ginawa nating consistent ang type name
          dispatch({ type: 'SET_CART', payload: items });
        }
      } catch (error) {
        console.log("SQLITE LOAD ERROR:", error);
      }
    };
    loadFromSql();
  }, []); 

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Basket 🛒</Text>
      <Text style={{marginBottom: 10, color: '#666'}}>
        Customer: <Text style={{fontWeight: 'bold'}}>{user ? user.name : "Guest"}</Text>
      </Text>
      
      <ScrollView style={styles.itemList}>
        {cartItems && cartItems.length > 0 ? (
          cartItems.map((item, index) => (
            <View key={index}>
              <List.Item
                title={item.name}
                description={`₱${item.price.toFixed(2)}`}
                left={p => <List.Icon {...p} icon="pizza" color="#e61e1e" />}
                right={p => (
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
          onPress={() => props.navigation.navigate("Checkout")} 
          disabled={cartItems.length === 0}
          style={[styles.checkoutBtn, { opacity: cartItems.length === 0 ? 0.5 : 1 }]}
        >
          GO TO CHECKOUT
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