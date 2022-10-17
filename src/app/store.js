import { configureStore } from "@reduxjs/toolkit";
import basketReducer from "../slices/basketSlice";

// Redux store
export const store = configureStore({
  reducer: {
    // a single slice
    basket: basketReducer,
  },
});
