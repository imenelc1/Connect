import React from "react";
import "../../styles/index.css";
import { FiArrowRight } from "react-icons/fi";

export default function ButtonCA() {
  return (
    <button className="flex items-center space-x-2 bg-gradient-to-r from-[#4F9DDE] to-[#A3AAED] text-white px-4 py-2 rounded-full shadow-md hover:opacity-90 transition">
      <span>Create Account</span>
      <FiArrowRight size={18} />
    </button>
  );
}