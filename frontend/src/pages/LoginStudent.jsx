import { useState, useContext, useEffect } from "react";
import AuthTabs from "../components/common/AuthTabs";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input";
import Mascotte from "../components/common/Mascotte.jsx";
import api from "../services/api";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff, FiGlobe } from "react-icons/fi";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import LogoComponent from "../components/common/LogoComponent";
import ThemeButton from "../components/common/ThemeButton";
import ThemeContext from "../context/ThemeContext";
import LogoIconeComponent from "../components/common/IconeLogoComponent";
import AuthContext from "../context/AuthContext.jsx";
export default function LoginStudent() {
  const [activeTab] = useState("signin");
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userRole, setUserRole] = useState("");

const { loginUser } = useContext(AuthContext);

  const { t, i18n } = useTranslation("login");

  const { toggleDarkMode } = useContext(ThemeContext);

  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
  };

  // ==============================
  //      HANDLE SUBMIT
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorEmail("");
    setErrorPassword("");

    if (!email) {
      setErrorEmail(t("errors.emailRequired"));
      return;
    }

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      setErrorEmail(t("errors.invalidEmail"));
      return;
    }

    if (!password) {
      setErrorPassword(t("errors.passwordRequired"));
      return;
    }

    if (password.length < 8) {
      setErrorPassword(t("errors.passwordLength"));
      return;
    }

    try {
      const res = await api.post("login/", {
        email,
        password,
        role: "etudiant" // <-- Obligatoire pour que le backend sache que c'est un étudiant
      });
      console.log(res.data)
      console.log(" LOGIN SUCCESS:", res.data); // <---- IMPORTANT

      // Combine user + role pour être sûr que role est présent
      const userWithRole = {
        ...res.data.user,
        role: res.data.role || res.data.user.role
      };

      localStorage.setItem("user", JSON.stringify(userWithRole));
      loginUser(res.data.token);


      toast.success(t("login.success"));
      navigate("/dashboard-etu");

    } catch (error) {
      const backend = error.response?.data;

      // 🔥 SI BACKEND RENVOIE UN MESSAGE GÉNÉRAL (CAS 403, 401, etc.)
      if (typeof backend?.detail === "string") {
        setErrorPassword(backend.detail);
        toast.error(backend.detail);
        return;
      }

      if (typeof backend?.error === "string") {
        setErrorPassword(backend.error);
        toast.error(backend.error);
        return;
      }

      //  ANALYSE NORMALISÉE
      if (backend && typeof backend === "object") {
        const mapKey = {
          email: "email",
          adresse_email: "email",
          mot_de_passe: "password",
          password: "password",
          non_field_errors: "password",
          detail: "password",
        };

        Object.keys(backend).forEach((key) => {
          const val = Array.isArray(backend[key]) ? backend[key][0] : backend[key];
          const target = mapKey[key] || key;

          if (target === "email") setErrorEmail(val);
          if (target === "password") setErrorPassword(val);
        });

        return;
      }

      //  Erreur réseau
      setErrorPassword("Erreur réseau");
      toast.error("Erreur réseau");
    }

  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface px-4 sm:px-0 pb-50">

      {/* Header */}
      <div className="flex w-full mb-4 items-center justify-between px-4 pt-12">

        {/* Logo normal (grand) — visible seulement md+ */}
        <div className="hidden md:block">
          <LogoComponent className="-mt-10 ml-20" />
        </div>

        {/* Petit logo — visible seulement sur mobile */}
        <div className="block md:hidden">
          <LogoIconeComponent className="w-8 h-8 -ml-1" />
        </div>


      </div>


      <AuthTabs
        role={userRole || "student"}
        active="signin"
        tab1Label={t("login.signIn")}
        tab2Label={t("login.signUp")}
        className="mt-20 sm:mt-0"
      />


      <div className="flex flex-col lg:flex-row w-full max-w-[1000px] min-h-[500px]  bg-card rounded-3xl shadow-lg overflow-hidden relative mt-5 mb-5">

        {/* FORM */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:m-10 bg-card">
          <h2 className="text-2xl font-semibold text-center mb-6">
            <span className="text-textc">{t("login.title")}</span>{" "}
            <span className="text-muted">{t("login.connect")}</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">

            <Input
              label={t("login.email")}
              value={email}
              placeholder={t("login.email")}
              onChange={(e) => setEmail(e.target.value)}
              icon={<FaEnvelope />}
              error={errorEmail}
            />

            <Input
              label={t("login.password")}
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder={t("login.password")}
              onChange={(e) => setPassword(e.target.value)}
              icon={<FaLock />}
              error={errorPassword}
              rightIcon={
                showPassword ? (
                  <FiEyeOff size={18} onClick={() => setShowPassword(false)} className="cursor-pointer" />
                ) : (
                  <FiEye size={18} onClick={() => setShowPassword(true)} className="cursor-pointer" />
                )
              }
            />
            <div className="flex justify-end -mt-4">
              <a
                href="/forgot-password"
                className="text-sm text-muted hover:underline"
              >
                {t("login.forgotPassword")}
              </a>
            </div>


            <Button text={t("login.signIn")} type="submit" />

            <p className="text-sm text-center mt-4">
              {t("login.noAccount")}{" "}
              <a href="/signup/student" className="text-muted hover:underline">
                {t("login.signUp")}
              </a>
            </p>
          </form>
        </div>

        {/* MASCOTTE - RESPONSIVE */}
        <div className="w-full lg:w-1/2 -relative flex items-center justify-center bg-card h-80 lg:h-auto mt-6 lg:mt-0 H-auto hidden lg:block">

          {/* RESPONSIVE: Bulle floue taille adaptative */}
          <div
            className="absolute w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 rounded-full blur-3xl"
            style={{
              background: "rgba(52,144,220,0.6)",
              top: "50%",
              left: "70%",
              transform: "translate(-50%, -50%)"
            }}
          />

          {/* Carte info au-dessus */}
          <div className="absolute top-8 right-10 rounded-xl shadow p-6 sm:p-9 w-max min-h-[80px] bg-white z-20">
            <p className="text-black font-medium text-sm whitespace-pre-line">
              {t("login.welcome")}
            </p>
            <div className="absolute -top-5 -right-2 w-9 h-9 rounded-full flex items-center justify-center shadow bg-white">
              <span className="text-[#4F9DDE] text-[20px] font-bold">&lt;&gt;</span>
            </div>
          </div>

        </div>

        <Mascotte width="w-48 sm:w-60 lg:w-58" className="hidden lg:block absolute top-20 right-20 h-58 z-10 mt-20 mr-10 " />
      </div>
    </div>
  );
}