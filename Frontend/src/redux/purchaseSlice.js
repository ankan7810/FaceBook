import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    purchasedProducts: [],
};

const purchaseSlice = createSlice({
    name: "purchase",
    initialState,
    reducers: {
        addPurchasedProduct: (state, action) => {
            if (!state.purchasedProducts.includes(action.payload)) {
                state.purchasedProducts.push(action.payload);
            }
        },

        clearPurchasedProducts: (state) => {
            state.purchasedProducts = [];
        },
    },
});

export const {
    addPurchasedProduct,
    clearPurchasedProducts,
} = purchaseSlice.actions;

export default purchaseSlice.reducer;