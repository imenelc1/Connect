
import { useState } from "react";
import AuthTabs from "../components/common/AuthTabs";
import Input from "../components/common/Input";
import Mascotte from "../components/common/Mascotte.jsx";
import LogoComponent from "../components/common/LogoComponent";
import api from "../services/api";
import toast from "react-hot-toast";
import { FaEnvelope, FaLock } from "react-icons/fa";
import {FiGlobe, FiEye, FiEyeOff } from "react-icons/fi";

import LogoIconeComponent from "../components/common/IconeLogoComponent";
import Button from "../components/common/Button.jsx";
import { useTranslation } from "react-i18next";
import { useContext } from "react";
import ThemeContext from "../context/ThemeContext.jsx";
import ThemeButton from "../components/common/ThemeButton";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginInstructor() {
  //  États pour les champs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  //  États pour les erreurs
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");

  //  Toggle visibilité mot de passe
  const [showPassword, setShowPassword] = useState(false);
  const { t, i18n } = useTranslation("login");
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  //  Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset erreurs
    setErrorEmail("");
    setErrorPassword("");

    // --- Validation frontend ---
    if (!email) {
      setErrorEmail(t("errors.emailRequired"));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorEmail(t("errors.emailNotFound"));
      return;
    }

    if (!password) {
      setErrorPassword("errors.passwordRequired");
      return;
    }
    if (password.length < 8) {
      setErrorPassword(t("errors.passwordLength"));
      return;
    }

    // --- Appel API ---
    try {
      const res = await api.post("login/", {
        email,
        password,
        role: "enseignant" // <-- Obligatoire pour que le backend sache que c'est un enseignant
      });
      console.log(t("login.api"), res.data);
      const userWithRole = {
        user_id: res.data.user.user_id,
        nom: res.data.user.nom,
        prenom: res.data.user.prenom,
        email: res.data.user.email,
        role: res.data.user.role,
      };

      localStorage.setItem("user", JSON.stringify(userWithRole));

      loginUser(res.data.token, userWithRole);


      localStorage.setItem("currentUserId", res.data.user.id_utilisateur);
      localStorage.setItem("user", JSON.stringify(res.data.user)); // tu peux le garder si utile

      console.log(t("login.api"), res.data);

      toast.success(t("login.success"));
      navigate("/dashboard-ens");

    } catch (error) {
      const backend = error.response?.data;
      console.log(t("errors.back"), backend);

      if (backend && typeof backend === "object") {
        const newErrors = {};

        //  Mapping backend → frontend
        const mapKey = {
          adresse_email: "email",
          email: "email",
          mot_de_passe: "password",
          password: "password",
          non_field_errors: "password",
          detail: "password",
          error: "password"
        };

        Object.keys(backend).forEach((key) => {
          const value = Array.isArray(backend[key]) ? backend[key][0] : backend[key];
          const target = mapKey[key] || key;
          newErrors[target] = value;
        });

        // Injection erreurs dans UI
        if (newErrors.email) setErrorEmail(newErrors.email);
        if (newErrors.password) setErrorPassword(newErrors.password);
        return;
      }

      setErrorPassword(t("errors.networkError"));
    }
  };


  // Récupération de la fonction permettant de changer le thème
  const { toggleDarkMode } = useContext(ThemeContext);
  return (
    // RESPONSIVE: Padding horizontal sur mobile
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

      {/* RESPONSIVE: AuthTabs avec margin top sur mobile */}
      <AuthTabs
        role="instructor"
        active="signin"
        tab1Label={t("login.signIn")}
        tab2Label={t("login.signUp")}
        className="mt-23 sm:mt-0"
      />

      {/* RESPONSIVE: Conteneur principal - colonne sur mobile, ligne sur desktop */}
      <div className="flex flex-col lg:flex-row w-full max-w-[1000px] min-h-[500px]  bg-card rounded-3xl shadow-lg overflow-hidden relative mt-5 mb-5">

        {/* FORMULAIRE - RESPONSIVE: Largeur 100% sur mobile, 1/2 sur desktop */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-10 0 bg-card">
          <h2 className="text-2xl font-semibold  text-center mb-6">
            <span className="text-textc">{t("login.title")}</span><span>  </span><span className="text-muted">{t("login.connect")}</span>
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label={t("login.email")}
              name="email"
              placeholder={t("login.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errorEmail}
              icon={<FaEnvelope size={16} className="text-grayc" />} />

            <Input
              label={t("login.password")}
              name="password"
              placeholder={t("login.password")}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errorPassword}
              icon={<FaLock size={16} className="text-grayc" />}
              rightIcon={
                showPassword ? (
                  <FiEyeOff
                    size={18}
                    onClick={() => setShowPassword(false)}
                    className="cursor-pointer text-grayc"
                  />
                ) : (
                  <FiEye
                    size={18}
                    onClick={() => setShowPassword(true)}
                    className="cursor-pointer text-grayc"
                  />
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


            <p className="text-sm text-grayc text-center mt-4">
              {t("login.noAccount")}{" "}
              <a href="/signup/instructor" className="text-muted font-medium hover:underline">
                {t("login.signUp")}
              </a>
            </p>

            <Button text={t("login.signIn")} type="submit" />
          </form>
        </div>

        {/* MASCOTTE - RESPONSIVE: Largeur 100% sur mobile, 1/2 sur desktop avec hauteur fixe */}
        <div className="w-full lg:w-1/2 relative flex items-center justify-center bg-card min-h-[400px] lg:min-h-0 hidden lg:block">
          <div className="absolute top-4 right-4 bg-white rounded-xl shadow p-6 sm:p-9 w-max min-h-[80px] z-20">
            <p className="text-gray-700 font-medium text-sm whitespace-pre-line">
              {t("login.welcomeInstructor")}
            </p>

            <div
              className="absolute -top-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center shadow"
              style={{ backgroundColor: "#FFFFFF" }}
            >
              <span
                style={{
                  color: "#4F9DDE",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              >
                &lt;&gt;
              </span>
            </div>
          </div>

          {/* RESPONSIVE: Bulle floue taille adaptative */}
          <div
            className="absolute w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 rounded-full blur-3xl"
            style={{
              background: "rgba(52,144,220,0.6)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)"
            }}
          />

          {/* RESPONSIVE: Mascotte taille adaptative */}
          <Mascotte width="w-48 sm:w-60 lg:w-58" className="hidden lg:block absolute top-20 right-20 h-58 z-10 mt-20 mr-10 " />
        </div>

      </div>
    </div>
  );
}