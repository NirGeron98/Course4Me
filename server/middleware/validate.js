const mongoose = require("mongoose");

// Lightweight body validator. Rejects malformed payloads with 400 before
// any DB work runs. Schema shape:
//   { field: { type, required, enum, min, max, minLength, maxLength } }
// type ∈ 'string' | 'number' | 'boolean' | 'array' | 'objectId'
const validate = (schema) => (req, res, next) => {
  const body = req.body || {};
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = body[field];
    const present = value !== undefined && value !== null && value !== "";

    if (rules.required && !present) {
      errors.push(`שדה חובה חסר: ${field}`);
      continue;
    }
    if (!present) continue;

    switch (rules.type) {
      case "string":
        if (typeof value !== "string") errors.push(`${field} חייב להיות טקסט`);
        break;
      case "number": {
        const num = typeof value === "number" ? value : Number(value);
        if (Number.isNaN(num)) errors.push(`${field} חייב להיות מספר`);
        else {
          if (rules.min != null && num < rules.min) errors.push(`${field} חייב להיות לפחות ${rules.min}`);
          if (rules.max != null && num > rules.max) errors.push(`${field} חייב להיות לכל היותר ${rules.max}`);
        }
        break;
      }
      case "boolean":
        if (typeof value !== "boolean") errors.push(`${field} חייב להיות ערך בוליאני`);
        break;
      case "array":
        if (!Array.isArray(value)) errors.push(`${field} חייב להיות מערך`);
        else if (rules.minLength != null && value.length < rules.minLength) errors.push(`${field} חייב להכיל לפחות ${rules.minLength} פריטים`);
        break;
      case "objectId":
        if (!mongoose.Types.ObjectId.isValid(value)) errors.push(`${field} אינו מזהה תקין`);
        break;
      default:
        break;
    }

    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`ערך לא חוקי עבור ${field}`);
    }
    if (typeof value === "string") {
      if (rules.minLength != null && value.length < rules.minLength) errors.push(`${field} חייב להכיל לפחות ${rules.minLength} תווים`);
      if (rules.maxLength != null && value.length > rules.maxLength) errors.push(`${field} חייב להכיל עד ${rules.maxLength} תווים`);
    }
  }

  if (errors.length) {
    return res.status(400).json({ message: errors[0], errors });
  }
  next();
};

module.exports = { validate };
