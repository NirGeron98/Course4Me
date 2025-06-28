import React, { useState, useEffect } from 'react';
import { Building, X } from 'lucide-react';

const MultiSelectDepartments = ({ 
  departments = [], 
  selectedDepartments = [], 
  onChange, 
  placeholder = "בחר מחלקות..." 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.departments-dropdown')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleDepartmentToggle = (departmentName) => {
    const newSelected = selectedDepartments.includes(departmentName)
      ? selectedDepartments.filter(dept => dept !== departmentName)
      : [...selectedDepartments, departmentName];
    
    onChange(newSelected);
  };

  const handleRemoveDepartment = (departmentName) => {
    const newSelected = selectedDepartments.filter(dept => dept !== departmentName);
    onChange(newSelected);
  };

  // Process departments - handle both string array and object array
  const processedDepartments = departments
    .map(dept => {
      // If dept is an object with name property, extract the name
      if (typeof dept === 'object' && dept.name) {
        return dept.name;
      }
      // If dept is already a string, use it as is
      return dept;
    })
    .filter(dept => dept && dept.trim());

  return (
    <div className="relative departments-dropdown">
      {/* Main Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 text-right bg-white flex justify-between items-center hover:bg-gray-50 transition-all"
      >
        <div className="flex items-center gap-2 flex-1">
          <Building className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">
            {selectedDepartments.length === 0
              ? placeholder
              : `נבחרו ${selectedDepartments.length} מחלקות`
            }
          </span>
        </div>
        <svg
          className={`w-5 h-5 transition-transform text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown with checkboxes */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
          {processedDepartments.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              אין מחלקות זמינות
            </div>
          ) : (
            <div className="p-2">
              {processedDepartments.map((deptName, index) => (
                <label
                  key={`${deptName}-${index}`}
                  className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedDepartments.includes(deptName)}
                    onChange={() => handleDepartmentToggle(deptName)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ml-3"
                  />
                  <div className="flex-1 text-right">
                    <div className="font-medium text-sm">{deptName}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected departments display */}
      {selectedDepartments.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedDepartments.map((dept, index) => (
            <span
              key={`selected-${dept}-${index}`}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              {dept}
              <button
                type="button"
                onClick={() => handleRemoveDepartment(dept)}
                className="mr-2 hover:text-blue-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDepartments;