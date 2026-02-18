import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../Screens/User/Login';
import Register from '../Screens/User/Register';
// Siguraduhing tama ang path na ito
import ProductContainer from '../Screens/Product/ProductContainer'; 

const Stack = createStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      {/* Siguraduhing walang quotes ang ProductContainer */}
      <Stack.Screen name="Main" component={ProductContainer} /> 
    </Stack.Navigator>
  );
}