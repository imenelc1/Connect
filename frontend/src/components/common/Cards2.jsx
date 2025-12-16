import React from "react";
import Button from "./Button";
import { ChevronRight } from "lucide-react";
import "../../styles/index.css";
import ContentProgress from "./ContentProgress";


/**
 * COMPONENT: InfoCard
 * Reusable card for student, course, project, user, etc.
 *
 * PROPS:
 * - icon            → string | element ("JW", <UserIcon/>...)
 * - roundedIcon     → true = cercle / false = carré
 * - title           → text principal
 * - description     → petit texte dessous
 * - progress        → number (0–100) si tu veux une progress bar
 * - status          → string (ex: "Active 3h ago", "Created 12 Feb", etc.)
 * - showArrow       → bool (flèche droite)
 * - className       → styles externes (fond gradient etc.)
 */

export default function Cards2({
  icon,
  roundedIcon = true,
  title,
  description,
  progress = null,
  status = "",
  showArrow = true,
  className = "",
  onArrowClick = null,
  extraActions = null, // ← AJOUTÉ
}) {
  return (
    <div className={`flex justify-between w-full p-4 ${className} min-w-0`}>
      {/* LEFT AREA */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 w-full">
        {/* ICON */}
        <div className="flex items-center justify-center">
          {typeof icon === "string" ? (
            <div className="w-10 h-10 flex items-center justify-center text-white font-semibold bg-grad-1 rounded-md">
              {icon}
            </div>
          ) : (
            icon
          )}
        </div>

        {/* TEXT PART */}
        <div className="flex flex-col w-full min-w-0">
          <div className="mb-2">
            <h3 className="font-semibold text-textc text-lg">{title}</h3>
            <p className="text-sm text-textc">{description}</p>
          </div>

          {progress !== null ? (
            <ContentProgress value={progress} status={status} className="[&>div>div]:bg-blue" />
          ) : (
            <p className="mt-1 text-xs text-textc">{status}</p>
          )}
        </div>
      </div>

      {/* RIGHT AREA: Arrow + Extra Actions */}
      <div className="flex items-center gap-2">
        
        {showArrow && (
          <Button
            className="!w-9 !h-9 !p-0 !min-w-8 flex items-center justify-center"
            onClick={onArrowClick}
          >
            <ChevronRight size={16} className="w-6 h-6" />
          </Button>

          
        )}

        {extraActions && <div>{extraActions}</div>}
      </div>
    </div>
  );
}