type SearchConfig = {
  exactMatch?: string[];  // fields that need exact match (like id, age)
  partialMatch?: string[]; // fields that need partial match (like name, description)
};

export const createSearchFilter = <T extends Record<string, any>>(
  searchTerm: string,
  config: SearchConfig
) => {
  if (!searchTerm) return () => true;
  
  const searchLower = searchTerm.toLowerCase();
  
  return (item: T) => {
    // Check exact match fields (like numbers, ids)
    const exactMatches = config.exactMatch?.some(field => {
      const value = item[field];
      return value !== undefined && value.toString() === searchTerm;
    }) ?? false;

    // Check partial match fields (like text)
    const partialMatches = config.partialMatch?.some(field => {
      const value = item[field];
      if (value === undefined || value === null) return false;
      
      // Handle numbers and other types by converting to string
      const stringValue = typeof value === 'string' ? value : value.toString();
      return stringValue.toLowerCase().includes(searchLower);
    }) ?? false;

    return exactMatches || partialMatches;
  };
};
