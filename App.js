import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNavigationContainerRef } from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import * as Notifications from 'expo-notifications'; 

import store from './Redux/store'; 
import MainNavigator from './src/Navigators/MainNavigator';
import { initDatabase } from './src/database/db'; 

export const navigationRef = createNavigationContainerRef();

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

    // Listener para sa pag-click ng notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (navigationRef.isReady()) {
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
        <NavigationContainer ref={navigationRef}>
          <MainNavigator />
        </NavigationContainer>
      </PaperProvider>
    </ReduxProvider>
  );
}