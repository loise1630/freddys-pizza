import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Screen Imports
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
  return (
    <Stack.Navigator 
      initialRouteName="Login"
      // GLOBAL SETTING: Tinanggal lahat ng headers sa buong app
      screenOptions={{
        headerShown: false,
        animationEnabled: true, // Optional: para smooth pa rin ang lipat ng screens
      }}
    >
      {/* 1. Auth Screens */}
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      
      {/* 2. Main Shop Screen */}
      <Stack.Screen name="Main" component={ProductContainer} /> 
      
      {/* 3. User & Transaction Screens */}
      <Stack.Screen name="Cart" component={Cart} />
      <Stack.Screen name="Checkout" component={Checkout} />
      <Stack.Screen name="MyOrders" component={MyOrders} />
      <Stack.Screen name="UserProfile" component={UserProfile} />
      <Stack.Screen name="ProductReview" component={ProductReview} /> 

      {/* 4. Admin Management Screens */}
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="AdminProducts" component={ManageProducts} />
      <Stack.Screen name="AdminOrders" component={AdminOrders} /> 
      <Stack.Screen name="ProductForm" component={ProductForm} /> 
    </Stack.Navigator>  
  );
}