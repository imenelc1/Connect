import Button from "./Button.jsx";
import ThemeContext from "../../context/ThemeContext";
import React, {  useContext } from "react";
import { useNavigate } from "react-router-dom";

export default function AddModal({
  open,
  onClose,
  title = "",
  subtitle,
  fields = [],
  submitLabel,
  cancelLabel = "Cancel",
  onSubmit,
}) {
  if (!open) return null;
  const { toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-start z-50 px-4 py-6 overflow-auto">
      <div className="bg-card rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative transform transition-all duration-300 mt-6 sm:mt-12">

        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 text-gray-400 hover:text-gray-600 transition-colors duration-200 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md"
        >
          <span className="text-xl">&times;</span>
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold mb-2 text-muted">{title}</h2>
        {subtitle && <p className="text-gray-500 mb-6">{subtitle}</p>}

        {/* FORMULAIRE */}
        <form className="space-y-5" onSubmit={(e) => {
    e.preventDefault(); // empêche le refresh/navigue
    onSubmit(); // appelle ton handleAddItem
  }}>

          {/*
             Génération dynamique des champs
            Chaque élément du tableau "fields" contient :
            - label
            - placeholder
            - value
            - onChange
            - element → si fourni, remplace l’input (ex: <select>)
          */}
          {fields.map((field, index) => (
            <div key={index} className="flex flex-col gap-2">
              <label className="font-medium text-grad-2">{field.label}</label>
              {field.element ? (
                <div className="w-full">{field.element}</div>
              ) : (
                <input
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={field.onChange}
                  className="w-full bg-gray-50 rounded-lg px-4 py-2 text-gray-800
                             border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary
                             focus:border-primary transition duration-200 placeholder-gray-400"
                />
              )}
            </div>
          ))}

          {/* Boutons */}
          <div className="flex justify-end gap-3 mt-6 flex-wrap">
            <Button
              variant="outline"
              onClick={onClose}
              className="!px-5 !py-2 !w-auto !text-sm hover:bg-gray-100 transition"
            >
              {cancelLabel}
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="!px-6 !py-2 !w-40 !text-sm hover:scale-105 transition"
            >
              {submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}