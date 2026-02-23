import React, { useState, useContext } from "react";
import {
  FaUser, FaEnvelope, FaLock, FaPaperPlane,
  FaEye, FaEyeSlash, FaCalendarAlt, FaIdBadge,
  FaLayerGroup, FaCalendarCheck
} from "react-icons/fa";

import Input from "../components/common/Input";
import Button from "../components/common/Button.jsx";
import AuthTabs from "../components/common/AuthTabs";
import LogoComponent from "../components/common/LogoComponent";
import Mascotte from "../components/common/Mascotte";
import LogoIconeComponent from "../components/common/IconeLogoComponent";
import ModernDropdown from "../components/common/ModernDropdown.jsx";

import api from "../services/api";
import { useTranslation } from "react-i18next";
import ThemeContext from "../context/ThemeContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext.jsx";

export default function StudentSignUp() {
  const { t, i18n } = useTranslation("signup");
  const { toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { loginUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    nickname: "",
    fullname: "",
    email: "",
    password: "",
    confirm: "",
    dob: "",
    regnumber: "",
    field: "",
    year: ""
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Gestion des changements dans le formulaire
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));

    if (name === "nickname" && /\d/.test(value))
      setErrors(prev => ({ ...prev, nickname: t("nicknameNumbers") }));

    if (name === "fullname" && /\d/.test(value))
      setErrors(prev => ({ ...prev, fullname: t("fullnameNumbers") }));

    if (name === "password" && value.length < 8)
      setErrors(prev => ({ ...prev, password: t("passwordMin") }));

    if (name === "confirm" && value !== formData.password)
      setErrors(prev => ({ ...prev, confirm: t("passwordMismatch") }));
  };

  // Validation complète du formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nickname) newErrors.nickname = t("requiredField");
    if (!formData.fullname) newErrors.fullname = t("requiredField");
    if (/\d/.test(formData.nickname)) newErrors.nickname = t("nicknameNumbers");
    if (/\d/.test(formData.fullname)) newErrors.fullname = t("fullnameNumbers");

    if (!formData.email) newErrors.email = t("emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = t("invalidEmail");

    if (!formData.password) newErrors.password = t("pwdRequired");
    if (formData.password.length < 8) newErrors.password = t("passwordMin");
    if (formData.confirm !== formData.password) newErrors.confirm = t("passwordMismatch");

    if (!formData.dob) newErrors.dob = t("requiredField");
    if (!formData.regnumber) newErrors.regnumber = t("requiredField");
    if (!formData.field) newErrors.field = t("requiredField");
    if (!formData.year) newErrors.year = t("requiredField");
    if (formData.regnumber && !/^\d{12}$/.test(formData.regnumber))
      newErrors.regnumber = t("studentRegnumberInvalid");

    const birthDate = new Date(formData.dob);
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 16);
    if (birthDate > minDate) newErrors.dob = t("dobMinAge");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t("fixErrors"));
      return;
    }

    const payload = {
      nom: formData.nickname,
      prenom: formData.fullname,
      adresse_email: formData.email,
      mot_de_passe: formData.password,
      date_naissance: formData.dob,
      matricule: formData.regnumber,
      specialite: formData.field,
      annee_etude: formData.year,
      role: "etudiant",
    };

    try {
      const res = await api.post("users/register/", payload);

      // Créer userData à partir de la réponse backend
      const userData = {
        ...res.data.user,
        role: res.data.role || res.data.user.role
      };

      // 🔹 Mettre à jour le contexte Auth
      loginUser(res.data.token, userData);

      toast.success(t("successSignUp"));

      // 🔹 Rediriger vers dashboard étudiant
      navigate("/dashboard-etu");

    } catch (err) {
      const backend = err.response?.data;

      if (backend && typeof backend === "object") {
        const newErrors = {};
        Object.keys(backend).forEach(key => {
          const firstError = Array.isArray(backend[key]) ? backend[key][0] : backend[key];
          const mapKey = {
            adresse_email: "email",
            mot_de_passe: "password",
            date_naissance: "dob",
            matricule: "regnumber",
            specialite: "field",
            annee_etude: "year",
            nom: "nickname",
            prenom: "fullname",
          };
          const targetField = mapKey[key] || key;
          newErrors[targetField] = firstError;
        });
        setErrors(newErrors);
        toast.error(t("error") + ": " + Object.values(newErrors)[0]);
        return;
      }

      toast.error(t("networkError"));
    }
  };

  // Options dropdown
  const fieldOptions = [
    { value: "math", label: t("fieldMath") },
    { value: "cs", label: t("fieldCS") },
    { value: "ST", label: t("fieldST") },
  ];

  const yearOptions = [
    { value: "L1", label: "L1" }, { value: "L2", label: "L2" }, { value: "L3", label: "L3" },
    { value: "Ing1", label: "Ing1" }, { value: "Ing2", label: "Ing2" }, { value: "Ing3", label: "Ing3" },
    { value: "Ing4", label: "Ing4" }, { value: "M1", label: "M1" }, { value: "M2", label: "M2" }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface p-4 pt-12">
      {/* Header */}
      <div className="flex w-full mb-4 items-center justify-between px-4 md:-mt-10">
        <div className="hidden md:block">
          <LogoComponent className="-mt-10 ml-20" />
        </div>
        <div className="block md:hidden">
          <LogoIconeComponent className="w-8 h-8 -ml-1" />
        </div>
      </div>

      <AuthTabs
        role="student"
        active="signup"
        tab1Label={t("login.signIn")}
        tab2Label={t("login.signUp")}
        className="mt-20 sm:mt-0"
      />

      <div className="flex flex-col lg:flex-row w-full max-w-[1000px] min-h-[650px] bg-card rounded-3xl shadow-lg overflow-hidden relative mt-2">
        {/* Formulaire */}
        <div className="w-full md:w-1/2 p-10">
          <h2 className="text-2xl font-semibold text-center mb-6">
            <span className="text-textc">{t("title")}</span>
            <span>  </span>
            <span className="text-muted">{t("connect")}</span>
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label={t("nickname")} name="nickname" value={formData.nickname} onChange={handleChange} placeholder={t("nickname")} icon={<FaUser />} error={errors.nickname} />
              <Input label={t("fullname")} name="fullname" value={formData.fullname} onChange={handleChange} placeholder={t("fullname")} icon={<FaUser />} error={errors.fullname} />
            </div>

            <Input label={t("email")} name="email" type="email" value={formData.email} onChange={handleChange} placeholder={t("email")} icon={<FaEnvelope />} error={errors.email} />

            <Input
              label={t("password")}
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder={t("password")}
              icon={<FaLock />}
              rightIcon={showPassword
                ? <FaEyeSlash onClick={() => setShowPassword(!showPassword)} className="cursor-pointer" />
                : <FaEye onClick={() => setShowPassword(!showPassword)} className="cursor-pointer" />}
              error={errors.password}
            />

            <Input
              label={t("confirmPassword")}
              name="confirm"
              type={showConfirm ? "text" : "password"}
              value={formData.confirm}
              onChange={handleChange}
              placeholder={t("confirmPassword")}
              icon={<FaLock />}
              rightIcon={showConfirm
                ? <FaEyeSlash onClick={() => setShowConfirm(!showConfirm)} className="cursor-pointer" />
                : <FaEye onClick={() => setShowConfirm(!showConfirm)} className="cursor-pointer" />}
              error={errors.confirm}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label={t("dob")} name="dob" type="date" value={formData.dob} onChange={handleChange} placeholder={t("dob")} icon={<FaCalendarAlt />} error={errors.dob} />
              <Input label={t("regnumber")} name="regnumber" value={formData.regnumber} onChange={handleChange} placeholder={t("regnumber")} icon={<FaIdBadge />} error={errors.regnumber} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModernDropdown
                value={formData.field}
                onChange={value => { setFormData(prev => ({ ...prev, field: value })); setErrors(prev => ({ ...prev, field: "" })); }}
                options={fieldOptions}
                placeholder={t("selectField")}
                icon={<FaLayerGroup />}
                error={errors.field}
              />

              <ModernDropdown
                value={formData.year}
                onChange={value => { setFormData(prev => ({ ...prev, year: value })); setErrors(prev => ({ ...prev, year: "" })); }}
                options={yearOptions}
                placeholder={t("selectYear")}
                icon={<FaCalendarCheck />}
                error={errors.year}
              />
            </div>

            <Button type="submit" variant="primary"><FaPaperPlane className="inline mr-2" /> {t("signUp")}</Button>

            <p className="text-sm text-grayc text-center mt-4">
              {t("alreadyHaveAccount")}{" "}
              <a href="/login/student" className="text-muted font-medium hover:underline">{t("signIn")}</a>
            </p>
          </form>
        </div>

        {/* Mascotte */}
        <div className="w-full md:w-1/2 relative flex items-center justify-center mt-8 md:mt-0 bg-card hidden lg:block">
          <div className="absolute top-12 md:top-16 right-4 md:right-12 bg-white rounded-xl shadow p-6 md:p-9 w-max min-h-[80px] z-20 mt-12">
            <p className="text-gray-700 font-medium text-sm">{t("welcomeStudent")}</p>
            <div className="absolute -top-4 -right-2 w-9 h-9 rounded-full flex items-center justify-center shadow bg-white">
              <span style={{ color: "#4F9DDE", fontSize: "20px", fontWeight: "bold" }}>&lt;&gt;</span>
            </div>
          </div>
          <div className="absolute w-56 md:w-72 h-56 md:h-72 rounded-full blur-3xl"
               style={{ background: "rgba(52,144,220,0.6)", top: "45%", left: "50%", transform: "translate(-50%, -50%)" }} />
          <Mascotte width="w-48 sm:w-60 lg:w-58" className="hidden lg:block absolute top-20 right-20 h-58 z-10 mt-40 mr-10 " />
        </div>
      </div>
    </div>
  );
}
