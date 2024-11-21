// /lib/store.ts

import { configureStore } from "@reduxjs/toolkit";
import waterDataReducer from "./features/waterData/waterDataSlice";

export const store = configureStore({
  reducer: {
    waterData: waterDataReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
