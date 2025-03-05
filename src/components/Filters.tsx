import React, { useState, useEffect } from "react";
import { FaSearch, FaCalendarAlt } from "react-icons/fa";
import { DateRange, Range, RangeKeyDict } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "./DatePicker.css";

interface FilterKeyOption {
  value: string;
  label: string;
  options?: { value: string; label: string }[];
}

interface FiltersProps {
  limit: number;
  onLimitChange: (newLimit: number) => void;
  filterKey: string;
  filterValue: string;
  setFilterKey: (key: string) => void;
  setFilterValue: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onReset: () => void;
  filterKeyOptions: FilterKeyOption[];
}

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  type: 'dropdown' | 'text' | 'dateRange';
  options?: FilterOption[] | string[];
}

const filterConfigs: Record<string, FilterConfig> = {
  // User filters
  firstName: {
    type: 'dropdown',
    options: ['John', 'Jane', 'Michael', 'Sarah', 'David']
  },
  email: {
    type: 'dropdown',
    options: ['@x.dummyjson.com', '@gmail.com', '@hotmail.com']
  },
  birthDate: {
    type: 'dateRange'
  },
  gender: {
    type: 'dropdown',
    options: ['male', 'female']
  },
  // Product filters
  title: {
    type: 'text'
  },
  brand: {
    type: 'dropdown',
    options: ['Apple', 'Samsung', 'OPPO', 'Huawei', 'Microsoft Surface', 'HP Pavilion']
  },
  category: {
    type: 'dropdown',
    options: ['smartphones', 'laptops', 'fragrances', 'skincare', 'groceries', 'home-decoration']
  }
};

type DateRangeTuple = [Date | null, Date | null];

const Filters: React.FC<FiltersProps> = ({
  limit,
  onLimitChange,
  filterKey,
  filterValue,
  setFilterKey,
  setFilterValue,
  searchTerm,
  setSearchTerm,
  onReset,
  filterKeyOptions,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [localFilterKey, setLocalFilterKey] = useState(filterKey);
  const [localFilterValue, setLocalFilterValue] = useState(filterValue);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [dateRange, setDateRange] = useState<DateRangeTuple>([null, null]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const pageSizeOptions = [5, 10, 20, 50];

  // Update search term immediately (client-side filtering)
  useEffect(() => {
    setSearchTerm(localSearchTerm);
  }, [localSearchTerm, setSearchTerm]);

  // Update filters and reset other filters
  useEffect(() => {
    if (localFilterKey && localFilterValue) {
      // Reset search when using filters
      setLocalSearchTerm('');
      setSearchTerm('');
      setShowSearch(false);
      
      // Reset date range if switching to a different filter
      if (localFilterKey !== 'birthDate') {
        setDateRange([null, null]);
      }
      
      // Update filters
      setFilterKey(localFilterKey);
      setFilterValue(localFilterValue);
    }
  }, [localFilterKey, localFilterValue, setFilterKey, setFilterValue, setSearchTerm]);

  // Reset local state when external state changes
  useEffect(() => {
    setLocalFilterKey(filterKey);
    setLocalFilterValue(filterValue);
    setLocalSearchTerm(searchTerm);
  }, [filterKey, filterValue, searchTerm]);

  const handleSearchIconClick = () => {
    const newShowSearch = !showSearch;
    setShowSearch(newShowSearch);
    
    if (newShowSearch) {
      // Reset filters when showing search
      setLocalFilterKey("");
      setLocalFilterValue("");
      setFilterKey("");
      setFilterValue("");
      setDateRange([null, null]);
    } else {
      // Clear search when hiding
      setLocalSearchTerm("");
      setSearchTerm("");
    }
  };

  // Updated handler using RangeKeyDict and handling undefined dates
  const handleDateRangeChange = (rangesByKey: RangeKeyDict) => {
    const selection = rangesByKey.selection as Range;
    const startDate = selection.startDate ?? null;
    const endDate = selection.endDate ?? null;
    setDateRange([startDate, endDate]);

    if (startDate && endDate) {
      // Reset search term and other filters before setting date range
      setLocalSearchTerm('');
      setSearchTerm('');
      setShowSearch(false);
      const formattedDates = `${startDate.toISOString()},${endDate.toISOString()}`;
      setLocalFilterKey('birthDate');
      setLocalFilterValue(formattedDates);
      setFilterKey('birthDate');
      setFilterValue(formattedDates);
      setShowDatePicker(false);
    } else {
      setLocalFilterKey('');
      setLocalFilterValue('');
      setFilterKey('');
      setFilterValue('');
    }
  };

  const handleFilterSelect = (key: string, value: string) => {
    if (!value) {
      setLocalFilterKey('');
      setLocalFilterValue('');
      setFilterKey('');
      setFilterValue('');
      setDateRange([null, null]);
      return;
    }

    if (key !== 'birthDate') {
      setDateRange([null, null]);
    }
    if (filterKey === 'birthDate' && key !== 'birthDate') {
      setDateRange([null, null]);
    }
    setLocalFilterKey(key);
    setLocalFilterValue(value);
  };

  const renderFilterInput = (opt: FilterKeyOption) => {
    const config = filterConfigs[opt.value];
    const isActive = localFilterKey === opt.value;

    switch (config?.type) {
      case 'dateRange':
        return (
          <div className="relative inline-block">
            <input
              type="text"
              readOnly
              value={
                dateRange[0] && dateRange[1]
                  ? `${dateRange[0].toLocaleDateString()} - ${dateRange[1].toLocaleDateString()}`
                  : ""
              }
              placeholder="Birth date"
              onClick={() => setShowDatePicker(true)}
              className="px-3 py-1.5 pr-10 text-gray-700 cursor-pointer min-w-[220px]"
            />
            <div
              onClick={() => setShowDatePicker(true)}
              className="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer"
            >
              <FaCalendarAlt className="text-gray-400" />
            </div>
            {showDatePicker && (
              <div className="absolute z-10 mt-2 bg-white shadow-lg border rounded">
                <DateRange
                  editableDateInputs={true}
                  onChange={handleDateRangeChange}
                  moveRangeOnFirstSelection={false}
                  ranges={[
                    {
                      startDate: dateRange[0] || new Date(),
                      endDate: dateRange[1] || new Date(),
                      key: 'selection',
                    },
                  ]}
                />
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="w-full text-center py-1 bg-gray-200 hover:bg-gray-300 rounded-b"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        );
      case 'dropdown':
        return (
          <select
            value={isActive ? localFilterValue : ""}
            onChange={(e) => handleFilterSelect(opt.value, e.target.value)}
            className="px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[150px] cursor-pointer"
          >
            <option value="">{opt.label}</option>
            {(opt.options || config.options)?.map((option) => {
              const { value, label } = typeof option === 'string'
                ? { value: option, label: option }
                : option;
              return (
                <option key={value} value={value}>
                  {label}
                </option>
              );
            })}
          </select>
        );
      default:
        return (
          <input
            type="text"
            value={isActive ? localFilterValue : ""}
            onChange={(e) => {
              setLocalFilterKey(opt.value);
              setLocalFilterValue(e.target.value);
            }}
            className="px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder={`Enter ${opt.label.toLowerCase()}...`}
          />
        );
    }
  };

  return (
    <div className="flex items-center gap-3 mb-4 bg-white p-4 rounded shadow-sm">
      <div className="flex items-center gap-2">
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span className="text-gray-600">Entries</span>
      </div>

      <div className="h-6 w-px bg-gray-300 mx-2"></div>

      <div className="flex items-center">
        <button
          onClick={handleSearchIconClick}
          className="text-gray-600 hover:text-gray-800 focus:outline-none cursor-pointer"
        >
          <FaSearch className="w-4 h-4" />
        </button>
        {showSearch && (
          <input
            type="text"
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="border border-gray-300 rounded ms-6 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Search..."
            autoFocus
          />
        )}
      </div>

      <div className="h-6 w-px bg-gray-300 mx-2"></div>

      <div className="flex items-center gap-3">
        {filterKeyOptions.map((opt) => (
          <div key={opt.value} className="flex items-center gap-2">
            {renderFilterInput(opt)}
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          setLocalFilterKey('');
          setLocalFilterValue('');
          setLocalSearchTerm('');
          setDateRange([null, null]);
          onReset();
        }}
        className="px-4 py-1.5 bg-yellow text-black rounded hover:bg-yellow-600 transition-colors ms-4 cursor-pointer"
      >
        Reset
      </button>
    </div>
  );
};

export default Filters;
