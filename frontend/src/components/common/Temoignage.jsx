import React from "react";

export default function Temoignage({ name, text, onPrev, onNext }) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-md w-full max-w-md mx-auto">
      
      {/* Avatar cercle */}
      <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-bold text-gray-700 mb-4">
        {name[0]}
      </div>

      {/* Nom */}
      <h3 className="font-semibold text-lg mb-2">{name}</h3>

      {/* Texte */}
      <p className="text-gray-600 mb-4">{text}</p>

      {/* Étoiles */}
      <div className="flex text-yellow-400 text-xl mb-4">
        {"★★★★★"}
      </div>

      {/* Boutons navigation */}
      <div className="flex gap-4">
        <button
          onClick={onPrev}
          className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
        >
          ←
        </button>

        <button
          onClick={onNext}
          className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
        >
          →
        </button>
      </div>
    </div>
  );
}
