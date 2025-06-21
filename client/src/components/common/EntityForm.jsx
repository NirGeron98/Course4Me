import React from "react";
import { Save } from "lucide-react";

const EntityForm = ({
  title,
  fields,
  formState,
  setFormState,
  onSubmit,
  isLoading,
  isEditing,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">{title}</h2>

      <form
        onSubmit={onSubmit}
        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 shadow-lg border border-gray-200"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => (
            <div
              key={field.name}
              className={field.fullWidth ? "md:col-span-2" : ""}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
              </label>
              <div className="relative">
                {field.icon && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-500 w-5 h-5">
                    {field.icon}
                  </div>
                )}
                <input
                  type={field.type || "text"}
                  value={formState[field.name]}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      [field.name]: e.target.value,
                    })
                  }
                  required={field.required}
                  placeholder={field.placeholder}
                  className="w-full pr-12 pl-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                />
              </div>
            </div>
          ))}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-4"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                  {isEditing ? "מעדכן..." : "מוסיף..."}
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Save className="w-5 h-5 ml-2" />
                  {isEditing ? "עדכן" : "הוסף"}
                </div>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EntityForm;
