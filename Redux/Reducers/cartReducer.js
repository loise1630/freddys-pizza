import { createStore, combineReducers } from 'redux';

const initialState = {
    cartItems: [], // Dito papasok yung data galing SQLite
    user: null,
};

const cartReducer = (state = initialState, action) => {
    switch (action.type) {
        // 1. ADD: Kapag nag-add ng pizza sa screen
        case 'ADD_TO_CART':
            return {
                ...state,
                cartItems: [...state.cartItems, action.payload]
            };

        // 2. REMOVE: Kapag nag-delete ng isang item sa cart screen
        case 'REMOVE_FROM_CART':
            return {
                ...state,
                cartItems: state.cartItems.filter((_, index) => index !== action.payload)
            };

        // 3. SET: Ito ang kailangan para sa SQLite (Requirement: Get items when app opens)
        case 'SET_CART':
            return {
                ...state,
                cartItems: action.payload
            };

        // 4. CLEAR: Gagamitin pagkatapos ng Checkout (Requirement: Delete contents after checkout)
        case 'CLEAR_CART':
            return {
                ...state,
                cartItems: []
            };

        case 'SET_USER':
            return {
                ...state,
                user: action.payload
            };

        default:
            return state;
    }
};

const rootReducer = combineReducers({
    cartItems: cartReducer // Ito yung tinatawag mo sa useSelector
});

const store = createStore(rootReducer);

export default store;