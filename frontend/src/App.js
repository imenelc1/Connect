// src/App.js
import React from "react";

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <h1 className="text-5xl font-bold mb-4">🚀 Tailwind CSS fonctionne !</h1>
      <p className="text-lg">Si tu vois un joli dégradé violet-bleu, c’est gagné 💪</p>
      <button className="mt-6 px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition">
        Tester le bouton
      </button>
    </div>
  );
}

export default App;
