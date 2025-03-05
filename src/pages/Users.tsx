import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import {
  fetchUsers,
  setLimit,
  setSkip,
  setFilterKey,
  setFilterValue,
  setSearchTerm,
  resetFilters,
} from "../features/users/usersSlice";

import Table from "../components/Table";
import Pagination from "../components/Pagination";
import Filters from "../components/Filters";
import { createSearchFilter } from "../utils/searchUtils";

const userColumns = [
  { key: "id", header: "ID" },
  { key: "firstName", header: "First Name" },
  { key: "lastName", header: "Last Name" },
  { key: "maidenName", header: "Maiden Name" },
  { key: "age", header: "Age" },
  { key: "gender", header: "Gender" },
  { key: "email", header: "Email" },
  { key: "phone", header: "Phone" },
  { key: "username", header: "Username" },
  { key: "birthDate", header: "Birth Date" },
  { key: "bloodGroup", header: "Blood Group" },
  { key: "eyeColor", header: "Eye Color" },
];

const Users: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    data,
    loading,
    error,
    limit,
    skip,
    total,
    filterKey,
    filterValue,
    searchTerm,
  } = useSelector((state: RootState) => state.users);

  // Fetch data when filters change
  useEffect(() => {
    dispatch(
      fetchUsers({
        limit,
        skip,
        filterKey: filterKey || undefined,
        filterValue: filterValue || undefined
      })
    );
  }, [limit, skip, filterKey, filterValue, dispatch]);

  // Client-side search filter
  const allFilteredData = useMemo(() => {
    const searchFilter = createSearchFilter(searchTerm, {
      exactMatch: ['age'],
      partialMatch: [
        'firstName',
        'lastName',
        'maidenName',
        'gender',
        'email',
        'phone',
        'username',
        'birthDate',
        'bloodGroup',
        'eyeColor'
      ]
    });
    
    return data.filter(searchFilter);
  }, [data, searchTerm]);

  // Handle pagination for filtered data
  const totalFilteredItems = allFilteredData.length;
  const totalFilteredPages = Math.ceil(totalFilteredItems / limit);
  const currentPage = searchTerm ? Math.min(skip / limit + 1, totalFilteredPages) : skip / limit + 1;
  
  // Get current page data
  const filteredData = useMemo(() => {
    if (!searchTerm) return data; // Use API pagination for unfiltered data
    
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    return allFilteredData.slice(startIndex, endIndex);
  }, [allFilteredData, currentPage, limit, searchTerm, data]);
  const totalPages = Math.ceil(total / limit);

  const handlePageChange = (page: number) => {
    dispatch(setSkip((page - 1) * limit));
  };

  const handleLimitChange = (newLimit: number) => {
    dispatch(setLimit(newLimit));
    dispatch(setSkip(0)); // reset to first page
  };

  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 text-black font-neutra">
      <h1 className="text-2xl font-bold mb-4">Users</h1>

     
      <Filters
        limit={limit}
        onLimitChange={handleLimitChange}
        filterKey={filterKey}
        filterValue={filterValue}
        setFilterKey={(key) => dispatch(setFilterKey(key))}
        setFilterValue={(val) => dispatch(setFilterValue(val))}
        searchTerm={searchTerm}
        setSearchTerm={(term) => dispatch(setSearchTerm(term))}
        onReset={() => dispatch(resetFilters())}
        filterKeyOptions={[
          { value: "firstName", label: "Name" },
          { value: "email", label: "Email" },
          { value: "birthDate", label: "Birth Date" },
          { value: "gender", label: "Gender" },
        ]}
      />

      {loading ? (
        <div className="p-4">Loading...</div>
      ) : (
        <Table data={filteredData} columns={userColumns} />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={searchTerm ? totalFilteredPages : totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Users;
