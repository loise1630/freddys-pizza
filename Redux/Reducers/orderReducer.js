const initialState = {
  cartItems: [], 
  user: null,    
};

const orderReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      return { ...state, cartItems: [...state.cartItems, action.payload] };

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cartItems: state.cartItems.filter((_, index) => index !== action.payload),
      };

    case 'SET_CART':
      return { ...state, cartItems: action.payload };

    case 'CLEAR_CART':
      return { ...state, cartItems: [] };

    case 'SET_USER':
    case 'LOGIN_USER': 
      console.log("REDUX: User session active! 👤");
      return { ...state, user: action.payload };

    case 'LOGOUT_USER':
      return { ...state, user: null };

    default:
      return state;
  }
};

export default orderReducer;