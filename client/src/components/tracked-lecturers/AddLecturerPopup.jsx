import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, X, Loader2, Users } from "lucide-react";
import LecturerItem from "./LecturerItem";
import LecturerDetailsModal from "./LecturerDetailsModal";

const AddLecturerPopup = ({ onClose, onLecturerAdded }) => {
  const [allLecturers, setAllLecturers] = useState([]);
  const [, setTrackedLecturerIds] = useState([]);
  const [filteredLecturers, setFilteredLecturers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [isAdding, setIsAdding] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch all lecturers and tracked lecturers in parallel
        const [lecturersRes, trackedRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/lecturers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/tracked-lecturers`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        const allLecturersData = lecturersRes.data;
        const trackedData = trackedRes.data;

        // Extract IDs of already tracked lecturers
        const trackedIds = trackedData
          .filter(({ lecturer }) => lecturer) // Filter out null/undefined
          .map(({ lecturer }) => lecturer._id);

        // Filter out lecturers that are already being tracked and ensure valid lecturer objects
        const availableLecturers = allLecturersData.filter(
          lecturer => lecturer && lecturer._id && lecturer.name && !trackedIds.includes(lecturer._id)
        );

        setAllLecturers(availableLecturers);
        setTrackedLecturerIds(trackedIds);
        setFilteredLecturers(availableLecturers);
      } catch (err) {
        setError("שגיאה בטעינת המרצים");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = allLecturers.filter((lecturer) => {
      // Safe string check function
      const safeIncludes = (value) => {
        return value && typeof value === 'string' ? value.toLowerCase().includes(term) : false;
      };

      return (
        safeIncludes(lecturer.name) ||
        safeIncludes(lecturer.department) ||
        safeIncludes(lecturer.email) ||
        safeIncludes(lecturer.academicInstitution)
      );
    });
    setFilteredLecturers(filtered);
  }, [searchTerm, allLecturers]);

  const handleAddLecturer = async (lecturerId) => {
    try {
      setIsAdding(lecturerId);
      const token = localStorage.getItem("token");
      
      // Add lecturer to tracked list
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/tracked-lecturers`,
        { lecturerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remove the added lecturer from the available list
      setAllLecturers(prev => prev.filter(lecturer => lecturer._id !== lecturerId));
      setFilteredLecturers(prev => prev.filter(lecturer => lecturer._id !== lecturerId));

      // Get the full tracked lecturer data returned from the API
      const newTrackedLecturer = response.data;
      
      // Get latest lecturer data to ensure we have the most up-to-date information
      // This is important for showing correct review stats
      try {
        const lecturerResponse = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/lecturers/${lecturerId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (lecturerResponse.status === 200) {
          // Update lecturer data in our tracked lecturer object
          newTrackedLecturer.lecturer = lecturerResponse.data;
        }
      } catch (error) {
        console.error("Error fetching updated lecturer data:", error);
      }
      
      // Update tracked lecturers cache
      const updateTrackedLecturersCache = () => {
        try {
          // Get current cache
          const cacheKey = 'tracked_lecturers_data';
          const cachedData = localStorage.getItem(cacheKey);
          
          if (cachedData) {
            // Parse and update cache
            const { trackedLecturers } = JSON.parse(cachedData);
            
            if (Array.isArray(trackedLecturers)) {
              // Add new lecturer to cached array
              const updatedLecturers = [...trackedLecturers, newTrackedLecturer];
              
              // Save updated cache
              localStorage.setItem(cacheKey, JSON.stringify({
                trackedLecturers: updatedLecturers,
                timestamp: Date.now()
              }));
            }
          }
        } catch (error) {
          console.error("Error updating lecturer cache:", error);
          // On error, clear the cache to force refresh
          localStorage.removeItem('tracked_lecturers_data');
        }
      };
      
      // Update dashboard cache if exists
      const updateDashboardCache = () => {
        try {
          const cacheKey = 'dashboard_lecturers';
          const cachedData = localStorage.getItem(cacheKey);
          
          if (cachedData) {
            // Parse dashboard cache
            const lecturers = JSON.parse(cachedData);
            
            if (Array.isArray(lecturers)) {
              // Find if lecturer already exists
              const lecturerIndex = lecturers.findIndex(l => l._id === lecturerId);
              
              if (lecturerIndex === -1) {
                // Find the lecturer in our available list
                const lecturer = allLecturers.find(l => l._id === lecturerId);
                if (lecturer) {
                  // Add lecturer to dashboard cache
                  const updatedLecturers = [...lecturers, lecturer];
                  localStorage.setItem(cacheKey, JSON.stringify(updatedLecturers));
                  localStorage.setItem('dashboard_lecturers_timestamp', Date.now().toString());
                }
              }
            }
          }
        } catch (error) {
          console.error("Error updating dashboard cache:", error);
        }
      };
      
      // Update all relevant caches
      updateTrackedLecturersCache();
      updateDashboardCache();

      // Notify other tabs/components about tracked lecturer addition
      const trackingEvent = new CustomEvent('trackedLecturerAdded', {
        detail: { lecturerId, timestamp: Date.now(), data: newTrackedLecturer }
      });
      window.dispatchEvent(trackingEvent);

      // Update localStorage for cross-tab synchronization
      localStorage.setItem('trackedLecturerChanged', JSON.stringify({
        lecturerId,
        action: 'added',
        timestamp: Date.now(),
        data: newTrackedLecturer
      }));
      
      onLecturerAdded();
    } catch (err) {
      setError("מרצה זה כבר במעקב או שיש שגיאה");
      console.error("Error adding lecturer:", err);
    } finally {
      setIsAdding(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-2xl w-full rounded-xl shadow-lg p-6 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-800">הוספת מרצה למעקב</h2>
        </div>

        <div className="relative mb-6">
          <Search className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="חפש לפי שם, מחלקה, מוסד או אימייל..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            dir="rtl"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            <span className="mr-2 text-gray-600">טוען מרצים...</span>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              נסה שוב
            </button>
          </div>
        ) : filteredLecturers.length === 0 ? (
          <div className="text-center py-10">
            {searchTerm ? (
              <div>
                <p className="text-gray-600 text-sm mb-2">לא נמצאו מרצים התואמים לחיפוש.</p>
                <p className="text-gray-500 text-xs">נסה לחפש במילים אחרות</p>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                </div>
                <p className="text-gray-600 text-sm mb-2">כל המרצים כבר במעקב!</p>
                <p className="text-gray-500 text-xs">נראה שאתה עוקב אחר כל המרצים הזמינים במערכת</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
            {filteredLecturers.map((lecturer) => (
              <LecturerItem
                key={lecturer._id}
                lecturer={lecturer}
                onAdd={handleAddLecturer}
                isAdding={isAdding === lecturer._id}
              />
            ))}
          </div>
        )}

        {/* Counter showing available lecturers */}
        {!isLoading && !error && (
          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              {filteredLecturers.length} מרצים זמינים להוספה
              {searchTerm && ` (מתוך ${allLecturers.length} סה"כ)`}
            </p>
          </div>
        )}

        {selectedLecturer && (
          <LecturerDetailsModal
            lecturer={selectedLecturer}
            onClose={() => setSelectedLecturer(null)}
          />
        )}
      </div>
    </div>
  );
};

export default AddLecturerPopup;