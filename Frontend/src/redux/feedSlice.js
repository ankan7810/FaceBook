import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "@/Utils/Constant.js";

// const BASE_URL = "http://localhost:3000/api/v1";

const feedSlice = createSlice({
  name: "feed",
  initialState: {
    feed: [],
    loading: false,
    error: null,
  },

  reducers: {
    // ✅ SET FULL FEED
    setFeed: (state, action) => {
      state.feed = action.payload;
    },

    // ✅ MAIN UPDATE REDUCER (robust)
    updatePostInFeed: (state, action) => {
      const updatedPost = action.payload;

      state.feed = state.feed.map((item) => {
        // CASE 1: wrapped object { type, data }
        if (item?.data?._id === updatedPost._id) {
          return {
            ...item,
            data: updatedPost,
          };
        }

        // CASE 2: direct post object
        if (item?._id === updatedPost._id) {
          return updatedPost;
        }

        return item;
      });
    },

    // ✅ ALIAS (so you can use either name)
    updatePostInState: (state, action) => {
      const updatedPost = action.payload;

      state.feed = state.feed.map((item) => {
        if (item?.data?._id === updatedPost._id) {
          return {
            ...item,
            data: updatedPost,
          };
        }

        if (item?._id === updatedPost._id) {
          return updatedPost;
        }

        return item;
      });
    },

    // ✅ DELETE POST
    deletePostFromFeed: (state, action) => {
      const postId = action.payload;

      state.feed = state.feed.filter((item) => {
        if (item?.data) {
          return item.data._id !== postId;
        }
        return item._id !== postId;
      });
    },
  },
});

export const {
  setFeed,
  updatePostInFeed,
  updatePostInState, // 🔥 NEW
  deletePostFromFeed,
} = feedSlice.actions;

export default feedSlice.reducer;


// ✅ FETCH FEED
export const fetchFeed = () => async (dispatch) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/feed`,
      { withCredentials: true }
    );

    dispatch(setFeed(res.data.feed));
  } catch (err) {
    console.error("Fetch feed error:", err);
  }
};
