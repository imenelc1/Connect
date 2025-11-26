import React from "react";
import ContentProgress from "./ContentProgress";
import Button from "./Button";
import { FiEdit, FiTrash2 } from "react-icons/fi";

export default function ContentCard({ item, role, showProgress, className = "" }) {
  return (
    <div className={`shadow-md p-6 rounded-2xl flex flex-col justify-between h-full ${className}`}>
      
      {/* Contenu principal */}
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-start">
          <h2 className="font-semibold text-lg">{item.title}</h2>
          {item.level && (
            <span className="px-3 py-1 text-xs rounded-full bg-primary/20 text-primary">
              {item.level}
            </span>
          )}
        </div>

        <p className="text-grayc my-3 line-clamp-3">{item.description}</p>

        <div className="flex items-center justify-between mt-2">
          {item.author && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                {item.initials}
              </div>
              <span className="text-sm">{item.author}</span>
            </div>
          )}
          {item.duration && <span className="text-xs text-gray-400">{item.duration}</span>}
        </div>

        {showProgress && <ContentProgress value={item.progress ?? 0} className="mt-3" />}
      </div>

      <div className="mt-4 flex items-center justify-between">
        {(role === "student" || role === "instructor") && (
          item.progress > 0 ? (
            <div className="flex gap-2">
              <Button variant="heroPrimary" className="!w-auto px-4 py-2">Continue</Button>
              <Button variant="heroOutline" className="!w-auto px-4 py-2">Restart</Button>
            </div>
          ) : (
            <Button variant="courseStart" className="!w-auto px-4 py-2">Start</Button>
          )
        )}

        {role === "instructor" && item.isMine && (
          <div className="flex gap-2 ml-4">
            <FiEdit size={18} className="cursor-pointer text-grayc hover:text-primary" />
            <FiTrash2 size={18} className="cursor-pointer text-grayc hover:text-red-500" />
          </div>
        )}
      </div>

    </div>
  );
}
