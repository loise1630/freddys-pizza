import React, { useState, useEffect, useRef } from 'react'; // Dagdag: useEffect, useRef
import { View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { IconButton, Menu, Divider } from 'react-native-paper';
import * as Notifications from 'expo-notifications'; // Dagdag ito

// --- SCREENS IMPORT ---
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

const Stack = createStackNavigator();

// Configure kung paano lalabas ang notif (Dapat nasa labas ng component)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function MainNavigator({ navigation }) { // Dagdag: navigation prop
  const [visible, setVisible] = useState(false);
  const responseListener = useRef();

  useEffect(() => {
    // 10pts: CLICK NOTIFICATION TO VIEW DETAILS
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // Dito natin kukunin ang orderId na isesend ng backend
      const { orderId } = response.notification.request.content.data;
      
      if (orderId) {
        // I-navigate ang user sa MyOrders (o specific Order Details screen)
        navigation.navigate("MyOrders", { orderId: orderId });
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

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
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={Register} options={{ title: 'Create Account' }} />

      <Stack.Screen 
        name="Main" 
        component={ProductContainer} 
        options={({ navigation }) => ({
          title: "Freddy's Pizza 🍕",
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 5 }}>
              <IconButton 
                icon="cart" 
                iconColor="white" 
                size={24} 
                onPress={() => navigation.navigate("Cart")} 
              />
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
      
    </Stack.Navigator>  
  );
}