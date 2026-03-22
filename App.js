import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import * as Notifications from 'expo-notifications'; 
import store from './Redux/store'; 
import MainNavigator from './src/Navigators/MainNavigator';
import { initDatabase } from './src/database/db'; 

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
    initDatabase();

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const orderId = response.notification.request.content.data?.orderId;
      console.log("Notification Clicked! Order ID:", orderId);
    });

    return () => {
      // FIX: Tamang pag-remove ng subscription
      if (responseListener.current) {
        responseListener.current.remove(); 
      }
    };
  }, []);

  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      </PaperProvider>
    </ReduxProvider>
  );
}