import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./features/users/usersSlice";
import productsReducer from "./features/products/productsSlice";
import categoriesReducer from "./features/products/categoriesSlice";

export const store = configureStore({
  reducer: {
    users: usersReducer,
    products: productsReducer,
    categories: categoriesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
