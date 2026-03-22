import { configureStore } from '@reduxjs/toolkit';
import orderReducer from './Reducers/orderReducer'; // Siguraduhing tama ang path na ito

const store = configureStore({
  reducer: {
    // Ang 'cartItems' na key ang kailangan sa useSelector
    // Halimbawa: state.cartItems.cartItems
    cartItems: orderReducer, 
  },
  // Dinagdag ito para maiwasan ang warning sa malalaking data objects
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;