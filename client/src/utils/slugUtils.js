export const generateSlug = (text) => {
    return text
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\u0590-\u05FF\w-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
};

export const getLecturerSlug = (lecturer) => {
    if (!lecturer) return '';
    const name = typeof lecturer === 'object' ? lecturer.name : lecturer;
    return generateSlug(name);
};