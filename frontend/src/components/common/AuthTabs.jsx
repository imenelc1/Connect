import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AuthTabs = ({ role = "student", active = "signin" }) => {
  const navigate = useNavigate();
  const { t } = useTranslation("login");

  const goTo = (type) => {
    navigate(`/${type === "signin" ? "login" : "signup"}/${role}`);
  };

  return (
    <div className="flex justify-center bg-white p-1 rounded-full w-80 mx-auto shadow-sm mt-5 md:-mt-20">
      <button
        onClick={() => goTo("signin")}
        className={`flex-1 py-2 rounded-full font-medium transition-colors duration-300 ${
          active === "signin"
            ? "bg-grad-1 text-white"
            : "bg-white text-gray-600 hover:bg-white"
        }`}
      >
        {t("login.signIn")}
      </button>

      <button
        onClick={() => goTo("signup")}
        className={`flex-1 py-2 rounded-full font-medium transition-colors duration-300 ${
          active === "signup"
            ? "bg-grad-1 text-white"
            : "bg-white text-gray-600 hover:bg-white"
        }`}
      >
        {t("login.signUp")}
      </button>
    </div>
  );
};

export default AuthTabs;