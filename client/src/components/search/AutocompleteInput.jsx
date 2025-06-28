import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

const AutocompleteInput = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "חפש...", 
  displayKey = "name", 
  valueKey = "id",
  maxResults = 8 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Find selected option when value changes
  useEffect(() => {
    if (value) {
      const option = options.find(opt => opt[valueKey] === value);
      setSelectedOption(option);
      setSearchTerm(option ? option[displayKey] : '');
    } else {
      setSelectedOption(null);
      setSearchTerm('');
    }
  }, [value, options, valueKey, displayKey]);

  // Filter options based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOptions(options.slice(0, maxResults));
    } else {
      const filtered = options
        .filter(option => 
          option[displayKey].toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, maxResults);
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options, displayKey, maxResults]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    
    // If user clears the input, clear the selection
    if (!newValue.trim()) {
      onChange('');
      setSelectedOption(null);
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setSearchTerm(option[displayKey]);
    onChange(option[valueKey]);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedOption(null);
    onChange('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative">
      {/* Input Field */}
      <div className="relative">
        <div className="absolute right-3 top-3.5 text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pr-10 pl-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute left-3 top-3.5 flex items-center gap-1">
          {selectedOption ? (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-red-500 transition-colors"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {filteredOptions.length > 0 ? (
            <div className="py-2">
              {filteredOptions.map((option, index) => (
                <button
                  key={option[valueKey]}
                  onClick={() => handleOptionSelect(option)}
                  className="w-full px-4 py-3 text-right hover:bg-blue-50 transition-colors flex items-center justify-between group"
                >
                  <span className="text-gray-700 group-hover:text-blue-700">
                    {option[displayKey]}
                  </span>
                  {/* Optional: Show additional info */}
                  {option.department && (
                    <span className="text-xs text-gray-500 group-hover:text-blue-500">
                      {option.department}
                    </span>
                  )}
                </button>
              ))}
              
              {/* Show "more results" indicator if there are more options */}
              {options.length > maxResults && searchTerm && (
                <div className="px-4 py-2 text-xs text-gray-500 text-center border-t border-gray-100">
                  {options.filter(option => 
                    option[displayKey].toLowerCase().includes(searchTerm.toLowerCase())
                  ).length - maxResults} תוצאות נוספות...
                </div>
              )}
            </div>
          ) : searchTerm ? (
            <div className="py-4 px-4 text-center text-gray-500 text-sm">
              לא נמצאו תוצאות עבור "{searchTerm}"
            </div>
          ) : (
            <div className="py-4 px-4 text-center text-gray-500 text-sm">
              התחל להקליד לחיפוש...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;