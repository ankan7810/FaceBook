import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1/post";

/* =========================================================
   🔥 FETCH FEED POSTS
========================================================= */
export const fetchPosts = createAsyncThunk(
  "post/fetchPosts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/feed`, {
        withCredentials: true,
      });
      return res.data.posts;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Fetch failed" }
      );
    }
  }
);

/* =========================================================
   🔥 LIKE / UNLIKE POST
========================================================= */
export const likePost = createAsyncThunk(
  "post/likePost",
  async (postId, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/like/${postId}`,
        {},
        { withCredentials: true }
      );

      return {
        postId,
        likesCount: res.data.likesCount,
        isLiked: res.data.isLiked, // 🔥 make sure backend sends this
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Like failed" }
      );
    }
  }
);

/* =========================================================
   🔥 INITIAL STATE
========================================================= */
const initialState = {
  posts: [],
  loading: false,

  // granular loading (better UX)
  likeLoading: false,

  error: null,
};

/* =========================================================
   🔥 SLICE
========================================================= */
const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      /* ================= FETCH POSTS ================= */
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;

        // 🔥 Add isLiked field for UI (important)
        state.posts = action.payload.map((post) => ({
          ...post,
          isLiked: post.likes?.includes(post.currentUserId) || false,
        }));
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      /* ================= LIKE POST ================= */
      .addCase(likePost.pending, (state) => {
        state.likeLoading = true;
      })
      .addCase(likePost.fulfilled, (state, action) => {
        state.likeLoading = false;

        const { postId, likesCount, isLiked } = action.payload;

        // 🔥 CRITICAL: return new array (immutability fix)
        state.posts = state.posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likesCount,
                isLiked,
              }
            : post
        );
      })
      .addCase(likePost.rejected, (state, action) => {
        state.likeLoading = false;
        state.error = action.payload?.message;
      });
  },
});

export default postSlice.reducer;