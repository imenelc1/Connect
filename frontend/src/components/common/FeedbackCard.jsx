import React from "react";

export default function FeedbackCard({ feedback }) {
  return (
    <div className="relative bg-grad-1 rounded-3xl p-4 sm:p-6 text-white shadow-lg h-full">
      {/* Initiales */}
      <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/20 rounded-full flex items-center justify-center text-sm sm:text-lg font-semibold mb-3">
        {feedback.initials}
      </div>

      {/* Nom */}
      <p className="text-sm sm:text-base font-medium opacity-90 mb-2">
        {feedback.nomComplet}
      </p>

      {/* Commentaire */}
      <p className="text-xs sm:text-sm leading-relaxed opacity-90 break-words whitespace-pre-wrap">
        {feedback.comment}
      </p>

      {/* Étoiles */}
      <div className="flex gap-1 text-yellow-300 text-base sm:text-xl mt-4">
        {[...Array(5)].map((_, i) => (
          <span key={i}>{i < feedback.stars ? "★" : "☆"}</span>
        ))}
      </div>
    </div>
  );
}
