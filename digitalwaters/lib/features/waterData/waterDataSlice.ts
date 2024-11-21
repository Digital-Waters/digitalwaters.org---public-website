// /lib/features/waterData/waterDataSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WaterDataState {
  organizedData: Record<string, any[]>;
  currentData: Record<string, any>;
  waterBodyCoordinates: any[];
  dateLimit: Date[];
}

// Define the initial state
const initialState: WaterDataState = {
  organizedData: {},
  currentData: {},
  waterBodyCoordinates: [],
  dateLimit: []
};

const waterDataSlice = createSlice({
  name: "waterData",
  initialState,
  reducers: {
    setOrganizedData: (state, action: PayloadAction<Record<string, any[]>>) => {
      state.organizedData = action.payload;
    },
    setCurrentData: (state, action: PayloadAction<Record<string, any>>) => {
      state.currentData = action.payload;
    },
    setWaterBodyCoordinates: (state, action: PayloadAction<any[]>) => {
      state.waterBodyCoordinates = action.payload;
    },
    setDateLimit: (state, action: PayloadAction<Date[]>)=>{
        state.dateLimit = action.payload;
    }
  },
});

export const { setOrganizedData, setCurrentData, setWaterBodyCoordinates, setDateLimit } =
  waterDataSlice.actions;
export default waterDataSlice.reducer;
