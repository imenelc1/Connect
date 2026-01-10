// components/ui/Modal.jsx
import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
}) {
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full ${sizes[size]} mx-4 bg-surface rounded-2xl shadow-strong border border-gray-800/20 animate-modal-in`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/20">
          <h2 className="text-lg font-semibold text-muted">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-primary/10 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-800/20 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
