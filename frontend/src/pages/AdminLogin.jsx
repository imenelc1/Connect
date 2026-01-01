import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";

import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input";
import Mascotte from "../components/common/Mascotte.jsx";
import LogoComponent from "../components/common/LogoComponent";
import LogoIconeComponent from "../components/common/IconeLogoComponent";
import AuthContext from "../context/AuthContext.jsx";

import api from "../services/api";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { t } = useTranslation("login");
  const { loginUser } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

 const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorEmail("");
    setErrorPassword("");

    // Validation frontend
    if (!email) return setErrorEmail(t("errors.emailRequired"));
    if (!password) return setErrorPassword(t("errors.passwordRequired"));

    try {
      // Appel API backend
      const res = await api.post("admin/login/", {
        email_admin: email,
        mdp_admin: password,
      });

      // ✅ Stockage du token JWT
      const token = res.data.token;
      localStorage.setItem("admin_token", token);

      // Stockage info utilisateur
      const user = {
        id_admin: res.data.id_admin,
        email_admin: res.data.email_admin,
        role: "admin",
      };
      localStorage.setItem("user", JSON.stringify(user));

      // Met à jour le context Auth (si utilisé)
      loginUser(token, user);

      toast.success("Connexion administrateur réussie");
      navigate("/Dashboard-admin"); // Redirection vers dashboard admin
    } catch (error) {
      const backend = error.response?.data;
      const msg = backend?.detail || backend?.error || "Accès refusé";
      setErrorPassword(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface px-4 sm:px-0 pb-12">

      {/* Header */}
      <div className="flex w-full mb-4 items-center justify-between px-4 pt-12">
        <div className="hidden md:block"><LogoComponent /></div>
        <div className="block md:hidden"><LogoIconeComponent className="w-8 h-8" /></div>
      </div>

      <div className="flex flex-col lg:flex-row w-full max-w-[900px] min-h-[480px] bg-card rounded-3xl shadow-lg overflow-hidden mt-5">

        {/* FORM */}
        <div className="w-full lg:w-1/2 p-8 bg-card">
          <h2 className="text-2xl font-semibold text-center mb-6">
            <span className="text-textc">Admin</span>{" "}
            <span className="text-muted">Login</span>
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
                showPassword ? 
                  <FiEyeOff size={18} onClick={() => setShowPassword(false)} className="cursor-pointer" /> : 
                  <FiEye size={18} onClick={() => setShowPassword(true)} className="cursor-pointer" 
                />
              }
              className={errorPassword ? "border-blue-500" : ""}
            />
            <Button text="Se connecter" type="submit" />
          </form>
        </div>

        {/* MASCOTTE */}
        <div className="w-full lg:w-1/2 relative hidden lg:flex items-center justify-center bg-card">
          <Mascotte width="w-48 sm:w-60 lg:w-58" className="absolute top-20 right-20 h-58 z-10" />
          <div className="absolute w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 rounded-full blur-3xl" 
               style={{ background: "rgba(52,144,220,0.6)", top: "50%", left: "70%", transform: "translate(-50%, -50%)" }} />
        </div>

      </div>
    </div>
  );
}
