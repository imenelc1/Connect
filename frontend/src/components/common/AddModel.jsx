// import React from "react";
import Button from "./Button.jsx";
import Input from "../common/Input";

export default function AddModal({
  open,          // bool : contrôle l'affichage du modal
  onClose,       // fonction : fermeture du modal
  title = "",    // titre dynamique
  subtitle,      // sous-titre
  fields = [],   // tableau d'inputs dynamiques
  submitLabel,   // texte du bouton submit
  cancelLabel = "Cancel", // texte du bouton cancel
  onSubmit       // fonction appelée lors du submit
}) {

  // → Si le modal doit être masqué, on ne retourne rien
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-3">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative">

        {/* ✖ Bouton de fermeture (en haut à droite) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>

        {/*  En-tête du modal */}
        <h2 className="text-lg font-semibold mb-1 text-primary">{title}</h2>
        <p className="text-sm text-textc mb-4">{subtitle}</p>

        {/* FORMULAIRE */}
        <form className="space-y-5" onSubmit={onSubmit}>

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
            <div key={index} className="flex flex-col gap-1">

              {/* Label en gras */}
              <label className="font-semibold text-black/50">
                {field.label}
              </label>

              {/* Si field.element existe → on l'affiche 
                  (ex : un <select> personnalisé)
                 Sinon → on affiche un input classique */}
              {field.element ? (
                field.element
              ) : (
                <input
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={field.onChange}
                  className="w-62 bg-gray-100 rounded-md px-3 py-2
                             focus:outline-none focus:ring-2 focus:ring-primary text-black/80"
                />
              )}
            </div>
          ))}

          {/* BOUTONS ACTIONS */}
          <div className="flex justify-end gap-3 mt-6">

            {/* Bouton annuler */}
            <Button variant="outline" onClick={onClose} className="!px-4 !py-2 !w-auto !h-auto !text-sm">
              {cancelLabel}
            </Button>

            {/* Bouton submit */}
            <Button variant="primary" type="submit" className="!px-4 !py-2 !w-auto !h-auto !text-sm">
              {submitLabel}
            </Button>

          </div>

        </form>

      </div>
    </div>
  );
}
