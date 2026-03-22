const initialState = {
  cartItems: [], // Lalagyan ng items galing SQLite o manual adds
  user: null,    // Lalagyan ng logged-in user info
};

const orderReducer = (state = initialState, action) => {
  switch (action.type) {
    // 1. ADD: Kapag nag-add ng pizza mula sa menu
    case 'ADD_TO_CART':
      console.log("REDUX: Item added to state! 🍕");
      return {
        ...state,
        cartItems: [...state.cartItems, action.payload],
      };

    // 2. REMOVE: Kapag nag-delete ng specific item sa cart screen
    case 'REMOVE_FROM_CART':
      console.log("REDUX: Item removed from state! ❌");
      return {
        ...state,
        cartItems: state.cartItems.filter((_, index) => index !== action.payload),
      };

    // 3. SET: IMPORTANTE para sa SQLite Persistence (Tuwing bubuksan ang app)
    case 'SET_CART':
      console.log("REDUX: Cart restored from SQLite! 📥", action.payload.length, "items");
      return {
        ...state,
        cartItems: action.payload,
      };

    // 4. CLEAR: IMPORTANTE para mabura ang cart pagkatapos ng Checkout
    case 'CLEAR_CART':
      console.log("REDUX: Cart cleared after checkout! 🧹");
      return {
        ...state,
        cartItems: [],
      };

    // 5. USER: Para sa Login at User Context
    case 'SET_USER':
    case 'LOGIN_USER': 
      console.log("REDUX: User context updated! 👤");
      return {
        ...state,
        user: action.payload,
      };

    default:
      return state;
  }
};

export default orderReducer;