import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../Screens/User/Login';
import Register from '../Screens/User/Register';
import AdminDashboard from "../Screens/Admin/AdminDashboard";
import ManageProducts from "../Screens/Admin/ManageProducts";
import ProductContainer from '../Screens/Product/ProductContainer'; 

const Stack = createStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{
        headerStyle: { backgroundColor: '#e61e1e' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      {/* AUTH SCREENS */}
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={Register} />

      {/* USER SCREEN (Pizza Inventory for Customers) */}
      <Stack.Screen name="Main" component={ProductContainer} options={{ title: 'Pizza Shop' }} /> 

      {/* ADMIN SCREENS */}
      <Stack.Screen 
        name="AdminDashboard" 
        component={AdminDashboard} 
        options={{ title: "Admin Panel", headerLeft: null }} // headerLeft: null para hindi maka-back sa login
      />

      <Stack.Screen 
        name="AdminProducts" 
        component={ManageProducts} 
        options={{ title: "Manage Products" }} 
      />

    </Stack.Navigator>  
  );
}