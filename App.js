import React, { useEffect, useRef } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import * as Notifications from 'expo-notifications'; 
import store from './Redux/store'; 
import MainNavigator from './src/Navigators/MainNavigator';
import { initDatabase } from './src/database/db'; 

// 1. Navigation Reference para sa Deep Linking
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
    initDatabase();

    // 2. Listener para sa Pag-click ng Notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log("Notification Clicked! Data:", data);

      // Kung may orderId sa notification, i-navigate si user sa MyOrders screen
      if (navigationRef.isReady()) {
        // Ipapasa natin ang status para kusa siyang pumunta sa tamang tab (Optional but pro move)
        navigationRef.navigate('MyOrders', { status: data?.status || 'Pending' }); 
      }
    });

    return () => {
      if (responseListener.current) {
        responseListener.current.remove(); 
      }
    };
  }, []);

  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        {/* 3. I-attach ang navigationRef dito */}
        <NavigationContainer ref={navigationRef}>
          <MainNavigator />
        </NavigationContainer>
      </PaperProvider>
    </ReduxProvider>
  );
}