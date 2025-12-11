import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function ModernDropdown({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Fermer si clic extérieur
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* BOUTON COMPACT */}
      <button
        className="flex items-center justify-between min-w-[115px] px-3 py-1.5
                   rounded-lg bg-white border border-primary/20 shadow-sm
                   text-primary text-sm font-medium cursor-pointer
                   hover:bg-gray-50 transition-all duration-200
                   focus:ring-2 focus:ring-supp"
        onClick={() => setOpen(!open)}
      >
        <span>
          {options.find((o) => o.value === value)?.label || placeholder}
        </span>

        <ChevronDown
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          size={18}
        />
      </button>

      {/* LISTE COMPACTE */}
      {open && (
        <div
          className="absolute left-0 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-100 shadow-lg
               rounded-md py-1 z-20 animate-dropdown text-sm"
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className="px-3 py-1 cursor-pointer text-primary hover:bg-primary/10 transition-all"
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
