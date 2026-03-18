import { configureStore } from '@reduxjs/toolkit';
import orderReducer from './Reducers/orderReducer'; // Siguraduhing tama ang path

const store = configureStore({
  reducer: {
    cartItems: orderReducer, // Ito ang kailangang i-initialize ng store
  },
});

export default store; // Importante: 'export default' para makuha ng App.js