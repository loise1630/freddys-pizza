import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux'; // Idagdag ito
import store from './Redux/store'; // Siguraduhin na tama ang path papunta sa store.js mo
import MainNavigator from './src/Navigators/MainNavigator';

export default function App() {
  return (
    // Kailangan nating i-wrap ang buong app sa Provider
    <Provider store={store}>
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </Provider>
  );
}