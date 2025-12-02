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
  progress = null, // si null → pas de barre
  status = "",
  showArrow = true,
  className = "",
}) {
  return (
    <div className={`flex justify-between w-full p-4 ${className} min-w-0`}>

      {/* LEFT AREA */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 w-full">
        {/* ICON */}
        <div className="flex items-center justify-center">
          {typeof icon === "string" ? (
            //  Si c'est du texte → RECTANGLE (pas cercle)
            <div
              className="
            w-10 h-10 flex items-center justify-center text-white font-semibold
            bg-grad-1 rounded-md
          "
            >
              {icon}
            </div>
          ) : (
            // Si c'est UserCircle → on laisse tel quel (forme native)
            icon
          )}
        </div>


        {/* TEXT PART */}
        <div className="flex flex-col w-full min-w-0">

          {/* Title & Description */}
          <div className="mb-2">
            <h3 className="font-semibold text-textc text-lg">{title}</h3>
            <p className="text-sm text-textc">{description}</p>
          </div>

          {/* OPTIONAL PROGRESS BAR */}

          {progress !== null && <ContentProgress value={progress} status={status} />}



          {/* If NO progress bar → show status alone */}
          {progress === null && (
            <p className="mt-1 text-xs text-textc">{status}</p>
          )}
        </div>
      </div>

      {/* RIGHT ARROW */}
      {showArrow && (
        <Button className=" !w-9 !h-9 !p-0 !min-w-0 flex items-center justify-center">
          <ChevronRight size={16} className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}
