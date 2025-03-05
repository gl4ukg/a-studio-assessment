import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./DatePicker.css"; // Custom DatePicker styles

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

type DateRange = [Date | null, Date | null];

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
  const [dateRange, setDateRange] = useState<DateRange>([null, null]);

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



  const handleDateRangeChange = (update: DateRange) => {
    setDateRange(update);
    const [start, end] = update;
    
    if (start && end) {
      // Reset search term and other filters before setting date range
      setLocalSearchTerm('');
      setSearchTerm('');
      setShowSearch(false);
      // Format dates as ISO strings and set as filter value
      setLocalFilterKey('birthDate');
      setLocalFilterValue(`${start.toISOString()},${end.toISOString()}`);
      setFilterKey('birthDate');
      setFilterValue(`${start.toISOString()},${end.toISOString()}`);
    } else {
      // Clear filter if either date is null
      setLocalFilterKey('');
      setLocalFilterValue('');
      setFilterKey('');
      setFilterValue('');
    }
  };

  const handleFilterSelect = (key: string, value: string) => {
    // If value is empty, reset all filters
    if (!value) {
      setLocalFilterKey('');
      setLocalFilterValue('');
      setFilterKey('');
      setFilterValue('');
      setDateRange([null, null]);
      return;
    }

    // If selecting a non-date filter, reset date range
    if (key !== 'birthDate') {
      setDateRange([null, null]);
    }
    // If selecting a new filter when date range is active, reset it
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
            <DatePicker
              selectsRange={true}
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              onChange={handleDateRangeChange}
              className="px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[220px] cursor-pointer"
              placeholderText="Birth date"
              dateFormat="MM/dd/yyyy"
              isClearable={true}
              monthsShown={2}
              showPopperArrow={false}
              popperClassName="date-picker-popper"
              popperPlacement="bottom-start"
              calendarClassName="shadow-lg border-0"
              renderCustomHeader={({ 
                date,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled
              }) => (
                <div className="flex items-center justify-between px-2 py-2">
                  <button
                    onClick={decreaseMonth}
                    disabled={prevMonthButtonDisabled}
                    type="button"
                    className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="text-gray-700 font-medium">
                    {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </div>
                  <button
                    onClick={increaseMonth}
                    disabled={nextMonthButtonDisabled}
                    type="button"
                    className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            />
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
      {/* Entries Dropdown */}
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

      {/* Search with Icon */}
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

      {/* Filter Fields */}
      <div className="flex items-center gap-3">
        {filterKeyOptions.map((opt) => (
          <div key={opt.value} className="flex items-center gap-2">
            {renderFilterInput(opt)}
          </div>
        ))}
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          setLocalFilterKey('');
          setLocalFilterValue('');
            setLocalSearchTerm('');
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
