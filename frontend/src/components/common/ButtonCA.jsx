import React from "react";
import "../../styles/index.css";
import { FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function ButtonCA() {
  const navigate = useNavigate();
  return (
    <button  onClick={() => navigate("/choice")} className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-full shadow-md hover:opacity-90 transition">
      <span>Create Account</span>
      <FiArrowRight size={18} />
    </button>
  );
}
