import { createSlice } from "@reduxjs/toolkit";


const initialState: any = {
  user: {} as any
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUser: (state, action) => {
      console.log(action.payload, 'payload---');
      state.user = action.payload;
    },
  },
});

const { actions, reducer } = userSlice;
export const { updateUser } = actions; // name export
export default reducer; // default export
