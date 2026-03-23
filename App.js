import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNavigationContainerRef } from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import * as Notifications from 'expo-notifications'; 

// Path Imports - Siguraduhing tama ang folders mo
import store from './Redux/store'; 
import MainNavigator from './src/Navigators/MainNavigator';
import { initDatabase } from './src/database/db'; 

// 1. Navigation Reference para sa Deep Linking (Unit 2 Requirement)
export const navigationRef = createNavigationContainerRef();

// Notification Configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const responseListener = useRef();

  useEffect(() => {
    // Initialize Local SQLite Database
    initDatabase();

    // 2. Listener para sa Pag-click ng Notification (Para sa 20pts Status Update)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log("--- Notification Interaction ---");
      console.log("Data Received:", data);

      // Kung may orderId sa notification, i-navigate si user sa MyOrders screen
      if (navigationRef.isReady()) {
        // Ang navigationRef ay ginagamit para makapag-navigate kahit nasa labas ng component
        navigationRef.navigate('MyOrders', { 
          status: data?.status || 'Pending',
          orderId: data?.orderId 
        }); 
      }
    });

    return () => {
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        {/* 3. NavigationContainer with Ref for Global Navigation Control */}
        <NavigationContainer ref={navigationRef}>
          <MainNavigator />
        </NavigationContainer>
      </PaperProvider>
    </ReduxProvider>
  );
}