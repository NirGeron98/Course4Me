// Utility functions for creating SEO-friendly URLs

/**
 * Creates a slug from text (Hebrew and English support)
 */
export const createSlug = (text) => {
    if (!text) return '';
    
    return text
        .toString()
        .toLowerCase()
        .trim()
        // Replace spaces with dashes
        .replace(/\s+/g, '-')
        // Remove special characters but keep Hebrew letters
        .replace(/[^\u0590-\u05FF\w\-]/g, '')
        // Remove multiple consecutive dashes
        .replace(/-+/g, '-')
        // Remove leading/trailing dashes
        .replace(/^-+|-+$/g, '');
};

/**
 * Creates a course slug using course number (preferred) or title + short ID
 */
export const createCourseSlug = (course) => {
    if (!course) return '';
    
    // If course has a number, use it (most SEO friendly)
    if (course.courseNumber) {
        return course.courseNumber.toString();
    }
    
    // Fallback: course title + short ID
    const titleSlug = createSlug(course.title);
    const shortId = course._id ? course._id.slice(-6) : '';
    
    return titleSlug ? `${titleSlug}-${shortId}` : shortId;
};

/**
 * Creates a lecturer slug using name + short ID
 */
export const createLecturerSlug = (lecturer) => {
    if (!lecturer) return '';
    
    const nameSlug = createSlug(lecturer.name);
    const shortId = lecturer._id ? lecturer._id.slice(-6) : '';
    
    return nameSlug ? `${nameSlug}-${shortId}` : shortId;
};

/**
 * Extracts ID from slug (for API calls)
 */
export const extractIdFromSlug = (slug) => {
    if (!slug) return null;
    
    // If it's already a full MongoDB ID, return as is
    if (/^[0-9a-fA-F]{24}$/.test(slug)) {
        return slug;
    }
    
    // If it's just a course number (digits only), return as is for course number lookup
    if (/^\d+$/.test(slug)) {
        return slug;
    }
    
    // Extract the last part after the last dash (short ID)
    const parts = slug.split('-');
    const lastPart = parts[parts.length - 1];
    
    // If the last part looks like a short ID, return it
    if (/^[0-9a-fA-F]{6}$/.test(lastPart)) {
        return lastPart;
    }
    
    // Fallback: return the slug as is
    return slug;
};

/**
 * Resolves course by slug or ID
 */
export const resolveCourseBySlug = async (slug, token) => {
    const extracted = extractIdFromSlug(slug);
    
    try {
        // First try to find by course number (if it's digits only)
        if (/^\d+$/.test(extracted)) {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/courses/by-number/${extracted}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            
            if (response.ok) {
                return await response.json();
            }
        }
        
        // Try to find by full ID
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/courses/${extracted}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        
        if (response.ok) {
            return await response.json();
        }
        
        // If it's a short ID, search all courses for matching suffix
        const allCoursesResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/courses`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        
        if (allCoursesResponse.ok) {
            const courses = await allCoursesResponse.json();
            const matchingCourse = courses.find(course => 
                course._id.endsWith(extracted)
            );
            
            if (matchingCourse) {
                return matchingCourse;
            }
        }
        
        throw new Error('Course not found');
    } catch (error) {
        console.error('Error resolving course:', error);
        throw error;
    }
};

/**
 * Resolves lecturer by slug or ID
 */
export const resolveLecturerBySlug = async (slug, token) => {
    const extracted = extractIdFromSlug(slug);
    
    try {
        // Try to find by full ID
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/lecturers/${extracted}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        
        if (response.ok) {
            return await response.json();
        }
        
        // If it's a short ID, search all lecturers for matching suffix
        const allLecturersResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/lecturers`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        
        if (allLecturersResponse.ok) {
            const lecturers = await allLecturersResponse.json();
            const matchingLecturer = lecturers.find(lecturer => 
                lecturer._id.endsWith(extracted)
            );
            
            if (matchingLecturer) {
                return matchingLecturer;
            }
        }
        
        throw new Error('Lecturer not found');
    } catch (error) {
        console.error('Error resolving lecturer:', error);
        throw error;
    }
};
