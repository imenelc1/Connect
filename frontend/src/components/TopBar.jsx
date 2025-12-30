import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function Topbar({ steps = [], activeStep, setActiveStep, onStepChange, className = "" }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className={`w-full bg-card rounded-2xl shadow-md p-4 flex items-center justify-center ${className}`}>
      {steps.map((step, index) => {
        const isActive = activeStep === index + 1;
        const Icon = step.icon || (() => <div />);

        return (
          <div
            key={index}
            onClick={() => {
              // Utilise onStepChange si fourni (pour SpaceDetails)
              if (onStepChange) onStepChange(index + 1);
              // Sinon, fallback sur setActiveStep (autres pages)
              else if (setActiveStep) setActiveStep(index + 1);

              // Navigation si route définie
              step.route && navigate(step.route);
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer ${activeStep < index + 1 ? "opacity-60" : ""}`}
          >
            <div className="flex items-center gap-2">
              <Icon size={18} className={isActive ? "text-muted" : "text-grayc"} />
              <span className={`font-semibold text-sm md:text-base ${isActive ? "text-muted" : "text-grayc"}`}>
                {t(step.label)}
              </span>
            </div>

            <div className={`w-20 h-[3px] rounded-full ${isActive ? "bg-muted" : "bg-transparent"}`}></div>
          </div>
        );
      })}
    </div>
  );
}
