const initialState = {
  cartItems: [],
  user: null, // Dito itatago ang details ng nag-login
};

const orderReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'LOGIN_USER':
      return {
        ...state,
        user: action.payload,
      };

    case 'ADD_TO_CART':
      return {
        ...state,
        cartItems: [...state.cartItems, action.payload],
      };
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cartItems: state.cartItems.filter((item, index) => index !== action.payload),
      };

    case 'CLEAR_CART':
      return {
        ...state,
        cartItems: [],
      };

    default:
      return state;
  }
};

export default orderReducer;