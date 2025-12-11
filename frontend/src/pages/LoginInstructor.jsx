import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

import AuthTabs from "../components/common/AuthTabs";
import Input from "../components/common/Input";
import Mascotte from "../components/common/Mascotte.jsx";
import LogoComponent from "../components/common/LogoComponent";
import LogoIconeComponent from "../components/common/IconeLogoComponent";
import Button from "../components/common/Button.jsx";

import AuthContext from "../context/AuthContext";
import ThemeContext from "../context/ThemeContext";
import api from "../services/api";

export default function LoginInstructor() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const { t } = useTranslation("login");
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toggleDarkMode } = useContext(ThemeContext);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: "", password: "" };

    if (!form.email) {
      newErrors.email = "Email obligatoire";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Format email invalide";
      valid = false;
    }

    if (!form.password) {
      newErrors.password = "Mot de passe obligatoire";
      valid = false;
    } else if (form.password.length < 8) {
      newErrors.password = "Minimum 8 caractères";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await api.post("login/", {
        email: form.email,
        password: form.password,
        role: "enseignant",
      });

      const currentUser = { ...res.data.user, role: res.data.user.role };
      localStorage.setItem("user", JSON.stringify(currentUser));
      localStorage.setItem("currentUserId", res.data.user.id_utilisateur);

      loginUser(res.data.token, currentUser);

      toast.success("Connexion réussie !");
      navigate("/dashboard-ens");
    } catch (err) {
      const backend = err.response?.data;
      console.log("Erreur backend login enseignant:", backend);

      if (backend && typeof backend === "object") {
        const mapKey = {
          adresse_email: "email",
          email: "email",
          mot_de_passe: "password",
          password: "password",
          non_field_errors: "password",
          detail: "password",
          error: "password",
        };
        const newErrors = { email: "", password: "" };

        Object.keys(backend).forEach((key) => {
          const value = Array.isArray(backend[key]) ? backend[key][0] : backend[key];
          const target = mapKey[key] || key;
          newErrors[target] = value;
        });

        setErrors(newErrors);
      } else {
        setErrors({ ...errors, password: "Erreur réseau" });
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface px-4 sm:px-0 pb-50">
      {/* Header */}
      <div className="flex w-full mb-4 items-center justify-between px-4 pt-12">
        <div className="hidden md:block">
          <LogoComponent className="-mt-10 ml-20" />
        </div>
        <div className="block md:hidden">
          <LogoIconeComponent className="w-8 h-8 -ml-1" />
        </div>
      </div>

      {/* Tabs */}
      <AuthTabs
        role="instructor"
        active="signin"
        tab1Label={t("login.signIn")}
        tab2Label={t("login.signUp")}
        className="mt-23 sm:mt-0"
      />

      <div className="flex flex-col lg:flex-row w-full max-w-[1000px] min-h-[500px] bg-card rounded-3xl shadow-lg overflow-hidden relative mt-5 mb-5">
        {/* Form */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-10 bg-card">
          <h2 className="text-2xl font-semibold text-center mb-6">
            <span className="text-textc">{t("login.title")}</span>{" "}
            <span className="text-muted">{t("login.connect")}</span>
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label={t("login.email")}
              name="email"
              placeholder={t("login.email")}
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              icon={<FaEnvelope size={16} className="text-grayc" />}
            />

            <Input
              label={t("login.password")}
              name="password"
              placeholder={t("login.password")}
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              icon={<FaLock size={16} className="text-grayc" />}
              rightIcon={
                showPassword ? (
                  <FaEyeSlash
                    size={18}
                    onClick={() => setShowPassword(false)}
                    className="cursor-pointer text-grayc"
                  />
                ) : (
                  <FaEye
                    size={18}
                    onClick={() => setShowPassword(true)}
                    className="cursor-pointer text-grayc"
                  />
                )
              }
            />

            <div className="flex justify-end -mt-4">
              <a href="/forgot-password" className="text-sm text-muted hover:underline">
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

        {/* Mascotte */}
        <div className="w-full lg:w-1/2 relative flex items-center justify-center bg-card min-h-[400px] lg:min-h-0 hidden lg:block">
          <div className="absolute top-4 right-4 bg-white rounded-xl shadow p-6 sm:p-9 w-max min-h-[80px] z-20">
            <p className="text-gray-700 font-medium text-sm whitespace-pre-line">
              {t("login.welcomeInstructor")}
            </p>
            <div
              className="absolute -top-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center shadow"
              style={{ backgroundColor: "#FFFFFF" }}
            >
              <span style={{ color: "#4F9DDE", fontSize: "20px", fontWeight: "bold" }}>
                &lt;&gt;
              </span>
            </div>
          </div>

          <div
            className="absolute w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 rounded-full blur-3xl"
            style={{
              background: "rgba(52,144,220,0.6)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />

          <Mascotte width="w-48 sm:w-60 lg:w-58" className="hidden lg:block absolute top-20 right-20 h-58 z-10 mt-20 mr-10 " />
        </div>
      </div>
    </div>
  );
}
