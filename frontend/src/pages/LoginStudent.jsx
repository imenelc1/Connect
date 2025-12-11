import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";

import AuthTabs from "../components/common/AuthTabs";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input";
import Mascotte from "../components/common/Mascotte.jsx";
import LogoComponent from "../components/common/LogoComponent";
import LogoIconeComponent from "../components/common/IconeLogoComponent";
import ThemeButton from "../components/common/ThemeButton";

import api from "../services/api";
import toast from "react-hot-toast";
import ThemeContext from "../context/ThemeContext";
import AuthContext from "../context/AuthContext.jsx";

export default function LoginStudent() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("login");
  const { loginUser } = useContext(AuthContext);
  const { toggleDarkMode } = useContext(ThemeContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "fr" ? "en" : "fr");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorEmail("");
    setErrorPassword("");

    // --- Validation frontend ---
    if (!email) return setErrorEmail(t("errors.emailRequired"));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErrorEmail(t("errors.invalidEmail"));
    if (!password) return setErrorPassword(t("errors.passwordRequired"));
    if (password.length < 8) return setErrorPassword(t("errors.passwordLength"));

    try {
      const res = await api.post("login/", { email, password, role: "etudiant" });
      console.log("LOGIN SUCCESS:", res.data);

      const userWithRole = {
        ...res.data.user,
        role: res.data.role || res.data.user.role
      };

      // Stockage local
      localStorage.setItem("user", JSON.stringify(userWithRole));
      localStorage.setItem("token", res.data.token);

      loginUser(res.data.token, userWithRole); // ⚡ AuthContext

      toast.success(t("login.success"));
      navigate("/dashboard-etu");

    } catch (error) {
      const backend = error.response?.data;

      // Gestion des erreurs générales
      if (backend?.detail || backend?.error) {
        const msg = backend.detail || backend.error;
        setErrorPassword(msg);
        toast.error(msg);
        return;
      }

      // Mapping backend → frontend
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

      // Erreur réseau
      setErrorPassword("Erreur réseau");
      toast.error("Erreur réseau");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface px-4 sm:px-0 pb-12">

      {/* Header */}
      <div className="flex w-full mb-4 items-center justify-between px-4 pt-12">
        <div className="hidden md:block"><LogoComponent /></div>
        <div className="block md:hidden"><LogoIconeComponent className="w-8 h-8" /></div>
      </div>

      {/* AuthTabs */}
      <AuthTabs role="student" active="signin" tab1Label={t("login.signIn")} tab2Label={t("login.signUp")} className="mt-6 sm:mt-0" />

      <div className="flex flex-col lg:flex-row w-full max-w-[1000px] min-h-[500px] bg-card rounded-3xl shadow-lg overflow-hidden mt-5 mb-5">

        {/* FORM */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-10 bg-card">
          <h2 className="text-2xl font-semibold text-center mb-6">
            <span className="text-textc">{t("login.title")}</span>{" "}
            <span className="text-muted">{t("login.connect")}</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input label={t("login.email")} value={email} placeholder={t("login.email")} onChange={(e) => setEmail(e.target.value)} icon={<FaEnvelope />} error={errorEmail} />
            <Input label={t("login.password")} type={showPassword ? "text" : "password"} value={password} placeholder={t("login.password")} onChange={(e) => setPassword(e.target.value)} icon={<FaLock />} error={errorPassword} rightIcon={showPassword ? <FiEyeOff size={18} onClick={() => setShowPassword(false)} className="cursor-pointer" /> : <FiEye size={18} onClick={() => setShowPassword(true)} className="cursor-pointer" />} />
            <div className="flex justify-end -mt-4">
              <a href="/forgot-password" className="text-sm text-muted hover:underline">{t("login.forgotPassword")}</a>
            </div>
            <Button text={t("login.signIn")} type="submit" />
            <p className="text-sm text-center mt-4">
              {t("login.noAccount")}{" "}
              <a href="/signup/student" className="text-muted hover:underline">{t("login.signUp")}</a>
            </p>
          </form>
        </div>

        {/* MASCOTTE */}
        <div className="w-full lg:w-1/2 relative hidden lg:flex items-center justify-center bg-card">
          <div className="absolute w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 rounded-full blur-3xl" style={{ background: "rgba(52,144,220,0.6)", top: "50%", left: "70%", transform: "translate(-50%, -50%)" }} />
          <div className="absolute top-8 right-10 rounded-xl shadow p-6 sm:p-9 w-max min-h-[80px] bg-white z-20">
            <p className="text-black font-medium text-sm whitespace-pre-line">{t("login.welcome")}</p>
            <div className="absolute -top-5 -right-2 w-9 h-9 rounded-full flex items-center justify-center shadow bg-white">
              <span className="text-[#4F9DDE] text-[20px] font-bold">&lt;&gt;</span>
            </div>
          </div>
          <Mascotte width="w-48 sm:w-60 lg:w-58" className="absolute top-20 right-20 h-58 z-10" />
        </div>

      </div>
    </div>
  );
}