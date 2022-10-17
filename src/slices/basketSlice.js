import { createSlice } from "@reduxjs/toolkit";

// initial state of the slice
const initialState = {
  items: [],
};

// create the slice
export const basketSlice = createSlice({
  name: "basket",
  initialState,
  // an action can be something like add to basket
  // dispatching an action will update the state
  // actions:
  reducers: {
    // comes with 2 things: state and action
    // action has payload inside of it, it will be in action.payload
    addToBasket: (state, action) => {
      // add item to basket. we keep whatever was already inside and add the payload
      state.items = [...state.items, action.payload];
    },
    removeFromBasket: (state, action) => {
      // find the index of the item we want to remove
      const index = state.items.findIndex(
        (basketItem) => basketItem.id === action.payload.id
      );
      // create a new basket and remove the item
      let newBasket = [...state.items];
      if (index >= 0) {
        // item exists in basket, remove it
        newBasket.splice(index, 1);
      } else {
        console.warn(
          `Can't remove product (id: ${action.payload.id}) as it's not in basket!`
        );
      }
      state.items = newBasket;
    },
  },
});

export const { addToBasket, removeFromBasket } = basketSlice.actions;

// Selectors - This is how we pull information from the Global store slice
export const selectItems = (state) => state.basket.items;
export const selectTotal = (state) =>
  state.basket.items.reduce((total, item) => total + item.price, 0);

export default basketSlice.reducer;
