import React, { useState } from 'react'; // Inalis ang useEffect at useRef muna
import { View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { IconButton, Menu, Divider } from 'react-native-paper';

// Siguraduhin na ang file extension at paths ay 100% correct
import Login from '../Screens/User/Login';
import Register from '../Screens/User/Register';
import AdminDashboard from "../Screens/Admin/AdminDashboard";
import ManageProducts from "../Screens/Admin/ManageProducts";
import ProductContainer from '../Screens/Product/ProductContainer'; 
import Cart from '../Screens/Cart/Cart';
import Checkout from '../Screens/Checkout/Checkout'; 
import AdminOrders from "../Screens/Admin/AdminOrders";
import MyOrders from '../Screens/User/MyOrders'; 
import UserProfile from '../Screens/User/UserProfile';
import ProductForm from "../Screens/Admin/ProductForm";
import ProductReview from "../Screens/Product/ProductReview";

const Stack = createStackNavigator();

export default function MainNavigator() { 
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{
        headerStyle: { backgroundColor: '#e61e1e' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      {/* Siguraduhin na 'Login' dito ay hindi undefined */}
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={Register} options={{ title: 'Create Account' }} />
      
      <Stack.Screen name="Main" component={ProductContainer} options={({ navigation }) => ({
          title: "Freddy's Pizza 🍕",
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 5 }}>
              <IconButton icon="cart" iconColor="white" size={24} onPress={() => navigation.navigate("Cart")} />
              <Menu 
                visible={visible} 
                onDismiss={closeMenu} 
                anchor={<IconButton icon="account-circle" iconColor="white" size={24} onPress={openMenu} />}
              >
                <Menu.Item onPress={() => { closeMenu(); navigation.navigate("UserProfile"); }} title="My Profile" leadingIcon="account" />
                <Divider />
                <Menu.Item onPress={() => { closeMenu(); navigation.navigate("MyOrders"); }} title="My Orders" leadingIcon="clipboard-list" />
                <Divider />
                <Menu.Item onPress={() => { closeMenu(); navigation.navigate("Login"); }} title="Logout" leadingIcon="logout" />
              </Menu>
            </View>
          ),
        })} 
      /> 
      
      <Stack.Screen name="Cart" component={Cart} options={{ title: 'My Basket 🛒' }} />
      <Stack.Screen name="Checkout" component={Checkout} options={{ title: 'Checkout 🍕' }} />
      <Stack.Screen name="MyOrders" component={MyOrders} options={{ title: 'My Purchase 🍕' }} />
      <Stack.Screen name="UserProfile" component={UserProfile} options={{ title: 'User Profile' }} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: "Admin Panel", headerLeft: null }} />
      <Stack.Screen name="AdminProducts" component={ManageProducts} options={{ title: "Inventory Management" }} />
      <Stack.Screen name="AdminOrders" component={AdminOrders} options={{ title: "Customer Orders 📋" }} /> 
      <Stack.Screen name="ProductForm" component={ProductForm} options={{ title: "Add New Product" }} /> 
      <Stack.Screen name="ProductReview" component={ProductReview} options={{ title: "Write a Review" }} /> 
    </Stack.Navigator>  
  );
}