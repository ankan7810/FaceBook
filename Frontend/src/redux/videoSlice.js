import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "@/Utils/Constant.js";

// const BASE_URL = "http://localhost:3000/api/v1";

const videoSlice = createSlice({
  name: "video",
  initialState: {
    videos: [],
  },
  reducers: {
    setVideos: (state, action) => {
      state.videos = action.payload;
    },
  },
});

export const { setVideos } = videoSlice.actions;
export default videoSlice.reducer;

export const fetchVideos = () => async (dispatch) => {
  const res = await axios.get(
    `${BASE_URL}/video/allvideos`,
    { withCredentials: true }
  );

  dispatch(setVideos(res.data.videos));
};