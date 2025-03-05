import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  brand: string;
  category: string;
  stock: number;
  sku: string;
  weight: string;
  availabilityStatus: string;
  discountPercentage: number;
  rating: number;
}

interface FetchProductsParams {
  limit: number;
  skip: number;
  filterKey?: string;   // e.g. 'brand', 'category', 'title'
  filterValue?: string; // value for that filter
  searchTerm?: string;  // search term for backend search
  currentTab: string;   // "ALL" or "Laptops"
}

interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

interface ProductsState {
  data: Product[];
  loading: boolean;
  error: string | null;
  limit: number;
  skip: number;
  total: number;
  filterKey: string;
  filterValue: string;
  searchTerm: string;  // optional client-side search if needed
  currentTab: string;  // "ALL" or "Laptops"
}

const initialState: ProductsState = {
  data: [],
  loading: false,
  error: null,
  limit: 5,
  skip: 0,
  total: 0,
  filterKey: "",
  filterValue: "",
  searchTerm: "",
  currentTab: "ALL",
};

export const fetchProducts = createAsyncThunk<ProductsResponse, FetchProductsParams>(
  "products/fetchProducts",
  async ({ limit, skip, filterKey, filterValue, searchTerm, currentTab }) => {
    // Base URL
    let url = `https://dummyjson.com/products?limit=${limit}&skip=${skip}`;

    // If there's a search term, use the search endpoint
    if (searchTerm) {
      url = `https://dummyjson.com/products/search?q=${searchTerm}&limit=${limit}&skip=${skip}`;
    }
    // If category filter is applied
    else if (filterKey === 'category' && filterValue) {
      url = `https://dummyjson.com/products/category/${filterValue}?limit=${limit}&skip=${skip}`;
    }
    // If there's no search but there's a non-category filter
    else if (filterKey && filterValue) {
      url = `https://dummyjson.com/products/search?q=${filterValue}&limit=${limit}&skip=${skip}`;
    }
    // If no search or filter but tab is "Laptops", fetch laptops only
    else if (currentTab === "Laptops") {
      url = `https://dummyjson.com/products/category/laptops?limit=${limit}&skip=${skip}`;
    }

    const response = await axios.get<ProductsResponse>(url);
    return response.data;
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setLimit: (state, action) => {
      state.limit = action.payload;
    },
    setSkip: (state, action) => {
      state.skip = action.payload;
    },
    setFilterKey: (state, action) => {
      state.filterKey = action.payload;
    },
    setFilterValue: (state, action) => {
      state.filterValue = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setCurrentTab: (state, action) => {
      state.currentTab = action.payload;
    },
    resetFilters: (state) => {
      state.filterKey = "";
      state.filterValue = "";
      state.searchTerm = "";
      state.skip = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.products;
        state.total = action.payload.total;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export const {
  setLimit,
  setSkip,
  setFilterKey,
  setFilterValue,
  setSearchTerm,
  setCurrentTab,
  resetFilters,
} = productsSlice.actions;

export default productsSlice.reducer;
