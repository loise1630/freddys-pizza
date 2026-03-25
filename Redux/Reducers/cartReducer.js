const initialState = {
  cartItems: [],
  user: null,
};

const cartReducer = (state = initialState, action) => {
  switch (action.type) {

    case 'ADD_TO_CART': {
      const exists = state.cartItems.findIndex(i => i.productId === action.payload._id);
      if (exists >= 0) {
        const updated = [...state.cartItems];
        updated[exists] = { ...updated[exists], quantity: (updated[exists].quantity || 1) + 1 };
        return { ...state, cartItems: updated };
      }
      return {
        ...state,
        cartItems: [
          ...state.cartItems,
          { ...action.payload, productId: action.payload._id, quantity: 1 },
        ],
      };
    }

    case 'REMOVE_FROM_CART':
      return { ...state, cartItems: state.cartItems.filter((_, i) => i !== action.payload) };

    case 'INCREASE_QTY': {
      const updated = [...state.cartItems];
      updated[action.payload] = { ...updated[action.payload], quantity: (updated[action.payload].quantity || 1) + 1 };
      return { ...state, cartItems: updated };
    }

    case 'DECREASE_QTY': {
      const updated = [...state.cartItems];
      updated[action.payload] = { ...updated[action.payload], quantity: (updated[action.payload].quantity || 1) - 1 };
      return { ...state, cartItems: updated };
    }

    case 'SET_CART':
      return { ...state, cartItems: action.payload };

    case 'CLEAR_CART':
      return { ...state, cartItems: [] };

    case 'SET_USER':
    case 'LOGIN_USER':
      return { ...state, user: action.payload };

    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };

    case 'LOGOUT_USER':
      return { ...state, user: null };

    default:
      return state;
  }
};

export default cartReducer;