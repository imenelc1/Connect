import { FaRocket } from "react-icons/fa";
import { FiSend } from "react-icons/fi";

export default function PrimaryButton({ text, onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 text-white font-medium py-2 rounded-full transition-all duration-200 bg-primary"

    >
      <FiSend  size={18} /> {/* Icône missile à gauche */}
      {text}
    </button>
  );
}
