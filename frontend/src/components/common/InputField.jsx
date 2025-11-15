import { FaEnvelope, FaLock } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useState } from "react";

export default function InputField({ label, placeholder, type = "text", icon, showForgot = false }) {
  const [showPassword, setShowPassword] = useState(false);
  const Icon = icon === "email" ? FaEnvelope : icon === "password" ? FaLock : null;

  const isPassword = type === "password";

  return (
    <div className="mb-4">
      <label className="block text-gray-600 mb-1 text-sm">{label}</label>
      <div className="relative">
        {/* Icône gauche */}
        {Icon && (
          <div className="absolute left-3 top-3">
            <Icon className="text-gray-300" />
          </div>
        )}

        {/* Input */}
        <input
          type={isPassword && showPassword ? "text" : type}
          placeholder={placeholder}
          autoComplete={isPassword ? "new-password" : "off"}
          className="w-full pl-10 pr-10 py-2 border border-blue-400 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4F9DDE]"
          style={{
            WebkitTextSecurity: isPassword && !showPassword ? "disc" : "none", // barre par défaut
          }}
        />

        {/* Icône œil à droite */}
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-3 text-gray-400 bg-transparent focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
          </button>
        )}
      </div>

      {/* Forgot password */}
      {showForgot && isPassword && (
        <div className="text-right mt-1">
          <button className="text-sm text-gray-500 hover:underline bg-transparent focus:outline-none">
            Forgot password?
          </button>
        </div>
      )}
    </div>
  );
}
