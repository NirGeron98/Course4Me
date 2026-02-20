export const generateSlug = (text) => {
    if (typeof text !== 'string') return '';
    return text
        .replace(/\u00a0/g, ' ')
        .replace(/\s+/g, ' ')
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