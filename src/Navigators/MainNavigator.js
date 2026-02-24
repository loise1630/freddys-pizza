import React, { useState } from 'react';
import { View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { IconButton, Menu, Divider, Provider as PaperProvider } from 'react-native-paper';

// --- SCREENS IMPORT ---
import Login from '../Screens/User/Login';
import Register from '../Screens/User/Register';
import AdminDashboard from "../Screens/Admin/AdminDashboard";
import ManageProducts from "../Screens/Admin/ManageProducts";
import ProductContainer from '../Screens/Product/ProductContainer'; 
import Cart from '../Screens/Cart/Cart';
import AdminOrders from "../Screens/Admin/AdminOrders";
import MyOrders from '../Screens/User/MyOrders'; // Import ang bago nating MyOrders

const Stack = createStackNavigator();

export default function MainNavigator() {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <PaperProvider>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: '#e61e1e' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {/* --- AUTH SCREENS --- */}
        <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Register" 
          component={Register} 
          options={{ title: 'Create Account' }}
        />

        {/* --- USER MAIN SCREEN (With Dropdown & Cart) --- */}
        <Stack.Screen 
          name="Main" 
          component={ProductContainer} 
          options={({ navigation }) => ({
            title: "Freddy's Pizza 🍕",
            headerRight: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 5 }}>
                {/* CART ICON */}
                <IconButton 
                  icon="cart" 
                  iconColor="white" 
                  size={24} 
                  onPress={() => navigation.navigate("Cart")} 
                />

                {/* PROFILE DROPDOWN */}
                <Menu
                  visible={visible}
                  onDismiss={closeMenu}
                  anchor={
                    <IconButton 
                      icon="account-circle" 
                      iconColor="white" 
                      size={24} 
                      onPress={openMenu} 
                    />
                  }
                >
                  <Menu.Item 
                    onPress={() => { closeMenu(); navigation.navigate("MyOrders"); }} 
                    title="My Orders" 
                    leadingIcon="clipboard-list"
                  />
                  <Divider />
                  <Menu.Item 
                    onPress={() => { closeMenu(); navigation.navigate("Login"); }} 
                    title="Logout" 
                    leadingIcon="logout"
                  />
                </Menu>
              </View>
            ),
          })} 
        /> 
        
        {/* OTHER USER SCREENS */}
        <Stack.Screen 
          name="Cart" 
          component={Cart} 
          options={{ title: 'My Basket 🛒' }} 
        />
        
        <Stack.Screen 
          name="MyOrders" 
          component={MyOrders} 
          options={{ title: 'My Purchase 🍕' }} 
        />

        {/* --- ADMIN SCREENS --- */}
        <Stack.Screen 
          name="AdminDashboard" 
          component={AdminDashboard} 
          options={{ 
            title: "Admin Panel", 
            headerLeft: null 
          }} 
        />

        <Stack.Screen 
          name="AdminProducts" 
          component={ManageProducts} 
          options={{ title: "Inventory Management" }} 
        />

        <Stack.Screen 
          name="AdminOrders" 
          component={AdminOrders} 
          options={{ title: "Customer Orders 📋" }} 
        /> 
        
      </Stack.Navigator>  
    </PaperProvider>
  );
}