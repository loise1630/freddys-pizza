import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import store from './Redux/store'; 
import MainNavigator from './src/Navigators/MainNavigator';
import { initDatabase } from './src/database/db'; 

export default function App() {
  useEffect(() => {
    initDatabase();
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