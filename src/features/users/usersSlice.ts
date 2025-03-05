import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  maidenName: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  username: string;
  birthDate: string;
  bloodGroup: string;
  eyeColor: string;
}

interface FetchUsersParams {
  limit: number;
  skip: number;
  filterKey?: string;
  filterValue?: string;
  searchTerm?: string;
}

interface UsersResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}

interface UsersState {
  data: User[];
  loading: boolean;
  error: string | null;
  limit: number;
  skip: number;
  total: number;
  filterKey: string;   // e.g. 'age', 'firstName', etc.
  filterValue: string; // value for the filter
  searchTerm: string;  // client-side search
}

const initialState: UsersState = {
  data: [],
  loading: false,
  error: null,
  limit: 5,
  skip: 0,
  total: 0,
  filterKey: "",
  filterValue: "",
  searchTerm: "",
};

export const fetchUsers = createAsyncThunk<UsersResponse, FetchUsersParams>(
  "users/fetchUsers",
  async ({ limit, skip, filterKey, filterValue, searchTerm }) => {
    // Base URL for normal pagination
    let url = `https://dummyjson.com/users?limit=${limit}&skip=${skip}`;

    // If there's a search term, use the search endpoint
    if (searchTerm) {
      url = `https://dummyjson.com/users/search?q=${searchTerm}&limit=${limit}&skip=${skip}`;
    }
    // Handle date range filtering for birthDate
    else if (filterKey === 'birthDate' && filterValue) {
      const [startDate, endDate] = filterValue.split(',').map(date => new Date(date));
      // First get all users since DummyJSON doesn't support date range filtering
      const allUsersResponse = await axios.get<UsersResponse>(`https://dummyjson.com/users?limit=100`);
      // Filter users whose birthDate falls within the range
      const filteredUsers = allUsersResponse.data.users.filter(user => {
        const birthDate = new Date(user.birthDate);
        return birthDate >= startDate && birthDate <= endDate;
      });
      // Return paginated results
      return {
        users: filteredUsers.slice(skip, skip + limit),
        total: filteredUsers.length,
        skip,
        limit
      };
    }
    // Use search endpoint for email filtering to support partial matches
    else if (filterKey === 'email' && filterValue) {
      url = `https://dummyjson.com/users/search?q=${filterValue}&limit=${limit}&skip=${skip}`;
    }
    // For other filters, use the normal filter endpoint
    else if (filterKey && filterValue) {
      url = `https://dummyjson.com/users/filter?key=${filterKey}&value=${filterValue}&limit=${limit}&skip=${skip}`;
    }

    const response = await axios.get<UsersResponse>(url);
    return response.data;
  }
);

const usersSlice = createSlice({
  name: "users",
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
    resetFilters: (state) => {
      // reset all filters
      state.filterKey = "";
      state.filterValue = "";
      state.searchTerm = "";
      state.skip = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.users;
        state.total = action.payload.total;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
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
  resetFilters,
} = usersSlice.actions;

export default usersSlice.reducer;
