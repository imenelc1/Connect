// src/components/common/AuthTabs.jsx
import React from "react";

const AuthTabs = ({ active="signup" }) => {
  return (
    <div className="flex justify-center gap-2 mb-6">
      <button className={`px-6 py-2 rounded-l-full ${active==="signin" ? "bg-white text-sky-600" : "bg-white text-gray-500"}`}>Sign in</button>
      <button className={`px-6 py-2 rounded-r-full ${active==="signup" ? "bg-sky-500 text-white" : "bg-white text-gray-500"}`}>Sign up</button>
    </div>
  );
};

export default AuthTabs;
