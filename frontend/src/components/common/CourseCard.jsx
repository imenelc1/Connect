import React from "react";
import CourseProgress from "./CourseProgress";
import Button from "./Button";
import { FiEdit, FiTrash2 } from "react-icons/fi";

export default function CourseCard({ course, role, showProgress, className = "" }) {
  return (
    <div className={`shadow-md p-6 rounded-2xl flex flex-col justify-between h-full ${className}`}>
      
      {/* Contenu principal */}
      <div className="flex flex-col flex-1">
        {/* Header: titre + niveau */}
        <div className="flex justify-between items-start">
          <h2 className="font-semibold text-lg">{course.title}</h2>
          <span className="px-3 py-1 text-xs rounded-full bg-primary/20 text-muted">
            {course.level}
          </span>
        </div>

        {/* Description: limité à 3 lignes pour alignement */}
        <p className="text-grayc my-3 line-clamp-3">
          {course.description}
        </p>

        {/* Prof + durée */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
              {course.initials}
            </div>
            <span className="text-sm">{course.author}</span>
          </div>
          <span className="text-xs text-gray-400">{course.duration}</span>
        </div>

        {/* Progression */}
        {showProgress && <CourseProgress value={course.progress ?? 0} className="mt-3" />}
      </div>

      {/* Footer: boutons + actions enseignants */}
      <div className="mt-4 flex items-center justify-between">
        {/* Boutons pour étudiant ou enseignant */}
        {(role === "etudiant" || role === "enseignant") && (
          course.progress > 0 ? (
            <div className="flex gap-2">
              <Button variant="heroPrimary" className="!w-auto px-4 py-2">Continue</Button>
              <Button variant="heroOutline" className="!w-auto px-4 py-2">Restart</Button>
            </div>
          ) : (
            <Button variant="courseStart" className="!w-auto px-4 py-2">Start the course</Button>
          )
        )}

        {/* Actions enseignant */}
        {role === "enseignant" && course.isMine && (
          <div className="flex gap-2 ml-4">
            <FiEdit size={18} className="cursor-pointer text-grayc hover:text-primary" />
            <FiTrash2 size={18} className="cursor-pointer text-grayc hover:text-red-500" />
          </div>
        )}
      </div>

    </div>
  );
}
