import React from "react";

const AuthTabs = ({ active = "signup", onTabChange }) => {
  return (
    <div className="flex justify-center bg-white p-1 rounded-full w-80 mx-auto shadow-sm">
      <button
        onClick={() => onTabChange("signin")}
        className={`flex-1 py-2 rounded-l-full font-medium transition-colors duration-300 ${
          active === "signin"
            ? "bg-blue-500 text-white"
            : "bg-white text-gray-600 hover:bg-gray-100"
        }`}
      >
        Sign in
      </button>
      <button
        onClick={() => onTabChange("signup")}
        className={`flex-1 py-2 rounded-full font-medium transition-colors duration-300 ${
          active === "signup"
            ? "bg-blue-500 text-white"
            : "bg-white text-gray-600 hover:bg-gray-100"
        }`}
      >
        Sign up
      </button>
    </div>
  );
};

export default AuthTabs;
