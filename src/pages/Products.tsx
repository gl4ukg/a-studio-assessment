import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import {
  fetchProducts,
  setLimit,
  setSkip,
  setFilterKey,
  setFilterValue,
  setSearchTerm,
  setCurrentTab,
  resetFilters,
} from "../features/products/productsSlice";
import { fetchCategories } from "../features/products/categoriesSlice";

import Pagination from "../components/Pagination";
import Filters from "../components/Filters";
import Table from "../components/Table";
import { createSearchFilter } from "../utils/searchUtils";

const productColumns = [
  { key: "id", header: "ID" },
  { key: "title", header: "Title" },
  { key: "description", header: "Description" },
  { key: "brand", header: "Brand" },
  { key: "category", header: "Category" },
  { key: "price", header: "Price" },
  { key: "discountPercentage", header: "Discount Percentage" },
  { key: "rating", header: "Rating" },
  { key: "sku", header: "SKU" },
  { key: "weight", header: "Weight" },
  { key: "stock", header: "Stock" },
  { key: "availabilityStatus", header: "Availabiliy Status" },
];

const Products: React.FC = () => {
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
    currentTab,
  } = useSelector((state: RootState) => state.products);

  const { categories } = useSelector((state: RootState) => state.categories);

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Fetch data when filters change
  useEffect(() => {
    dispatch(
      fetchProducts({
        limit,
        skip,
        filterKey: filterKey || undefined,
        filterValue: filterValue || undefined,
        currentTab,
      })
    );
  }, [limit, skip, filterKey, filterValue, currentTab, dispatch]);

  // Client-side search filter
  const allFilteredData = useMemo(() => {
    const searchFilter = createSearchFilter(searchTerm, {
      exactMatch: ['id', 'price', 'discountPercentage', 'rating', 'stock'],
      partialMatch: ['title', 'description', 'brand', 'category', 'sku', 'weight', 'availabilityStatus']
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

  const totalPages = searchTerm ? totalFilteredPages : Math.ceil(total / limit);

  const handlePageChange = (page: number) => {
    dispatch(setSkip((page - 1) * limit));
  };

  const handleLimitChange = (newLimit: number) => {
    dispatch(setLimit(newLimit));
    dispatch(setSkip(0));
  };

  // Tab switching
  const handleTabChange = (tab: string) => {
    dispatch(setCurrentTab(tab));
    // reset skip if you want
    dispatch(setSkip(0));
  };

  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 text-black font-neutra">
      <h1 className="text-2xl font-bold mb-4">Products</h1>

      {/* Tabs: ALL, Laptops */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => handleTabChange("ALL")}
          className={`p-2 border rounded cursor-pointer ${
            currentTab === "ALL" ? "bg-yellow" : "bg-white"
          }`}
        >
          ALL
        </button>
        <button
          onClick={() => handleTabChange("Laptops")}
          className={`p-2 border rounded cursor-pointer ${
            currentTab === "Laptops" ? "bg-yellow" : "bg-white"
          }`}
        >
          Laptops
        </button>
      </div>

      {/* Filters */}
      <Filters
        limit={limit}
        onLimitChange={handleLimitChange}
        filterKey={filterKey}
        filterValue={filterValue}
        setFilterKey={(key) => dispatch(setFilterKey(key))}
        setFilterValue={(val) => dispatch(setFilterValue(val))}
        searchTerm={searchTerm}
        setSearchTerm={(term) => dispatch(setSearchTerm(term))}
        onReset={() => {
          dispatch(resetFilters());
          dispatch(setCurrentTab('ALL'));
        }}
        filterKeyOptions={[
          { value: "title", label: "Title" },
          { value: "brand", label: "Brand" },
          { 
            value: "category", 
            label: "Category",
            options: categories?.map(cat => ({ value: cat.slug, label: cat.name }))
          },
        ]}
      />

      {/* Products Table */}
      {loading ? (
        <div className="p-4">Loading...</div>
      ) : (
        <Table data={filteredData} columns={productColumns} />
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={searchTerm ? totalFilteredPages : totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Products;
