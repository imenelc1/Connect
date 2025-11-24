import React, { useState, useContext } from "react";
import {
  FaUser, FaEnvelope, FaLock, FaPaperPlane,
  FaEye, FaEyeSlash, FaCalendarAlt, FaIdBadge,
  FaLayerGroup, FaCalendarCheck
} from "react-icons/fa";
import { FiGlobe } from "react-icons/fi";

import Input from "../components/common/Input";
import Button from "../components/common/Button";
import AuthTabs from "../components/common/AuthTabs";
import LogoComponent from "../components/common/LogoComponent";
import robot from "../assets/mascotte.svg";
import api from "../services/api";
import { useTranslation } from "react-i18next";
import ThemeContext from "../context/ThemeContext";
import ThemeButton from "../components/common/ThemeButton";
import toast from "react-hot-toast";

const Select = ({ label, icon, name, value, onChange, options, error }) => (
  <div className="flex flex-col mb-4">
    <label className="mb-1 font-semibold text-gray-700">{label}</label>

    <div
      className={`flex items-center rounded-md px-3 py-2 bg-white 
      ${error ? "border-red-500" : "border-gray-300"} border`}
    >
      {icon && <span className="mr-2 text-gray-300">{icon}</span>}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="flex-1 outline-none bg-transparent cursor-pointer font-inherit appearance-none"
      >
        <option value="">{label}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>

    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default function StudentSignUp() {

  const { t, i18n } = useTranslation("signup");
  const { toggleDarkMode } = useContext(ThemeContext);

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

  const handleChange = e => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));

    if (name === "password" && value.length < 8)
      setErrors(prev => ({ ...prev, password: "Minimum 8 caractères" }));

    if (name === "confirm" && value !== formData.password)
      setErrors(prev => ({ ...prev, confirm: "Les mots de passe ne correspondent pas" }));
  };

  // VALIDATION
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nickname) newErrors.nickname = "Champ obligatoire";
    if (!formData.fullname) newErrors.fullname = "Champ obligatoire";

    if (!formData.email)
      newErrors.email = "Email obligatoire";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Format d'email invalide";

    if (!formData.password) newErrors.password = "Mot de passe obligatoire";
    if (formData.password.length < 8) newErrors.password = "Minimum 8 caractères";

    if (formData.confirm !== formData.password)
      newErrors.confirm = "Mot de passe non identique";

    if (!formData.dob) newErrors.dob = "Champ obligatoire";
    if (!formData.regnumber) newErrors.regnumber = "Champ obligatoire";
    if (!formData.field) newErrors.field = "Champ obligatoire";
    if (!formData.year) newErrors.year = "Champ obligatoire";

    if (formData.regnumber && !/^\d{12}$/.test(formData.regnumber))
      newErrors.regnumber = "Matricule invalide (12 chiffres)";

    const birthDate = new Date(formData.dob);
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 16);
    if (birthDate > minDate)
      newErrors.dob = "Vous devez avoir au moins 16 ans.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SUBMIT
  const handleSubmit = async e => {
    e.preventDefault();

    console.log("FORM SUBMITTED"); // Debug

    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs.");
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
      const res = await api.post("register/", payload);

      localStorage.setItem("user", JSON.stringify(res.data));
      toast.success("Inscription réussie !");
      setTimeout(() => (window.location.href = "/all-courses"), 1500);

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

        toast.error("Erreur : " + Object.values(newErrors)[0]);
        return;
      }

      toast.error("Erreur réseau");
    }
  };

  const toggleLanguage = () =>
    i18n.changeLanguage(i18n.language === "fr" ? "en" : "fr");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface p-4">

      <div className="flex items-center justify-start w-full mb-4">
        <LogoComponent />
        <ThemeButton onClick={toggleDarkMode} />
        <FiGlobe size={20} className="ml-4 cursor-pointer" onClick={toggleLanguage} />
      </div>

      <AuthTabs role="student" active="signup" />

      <div className="flex flex-col lg:flex-row w-full max-w-[1000px] min-h-[650px] bg-card rounded-3xl shadow-lg overflow-hidden relative mt-2">

        {/* FORM */}
        <div className="w-full md:w-1/2 p-10">
          <h2 className="text-2xl font-semibold text-muted text-center mb-6">
            {t("welcomeStudent")}
          </h2>

          <form className="space-y-4 pt-20" onSubmit={handleSubmit}>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label={t("nickname")} name="nickname" value={formData.nickname} onChange={handleChange} icon={<FaUser />} error={errors.nickname} />

              <Input label={t("fullname")} name="fullname" value={formData.fullname} onChange={handleChange} icon={<FaUser />} error={errors.fullname} />
            </div>

            <Input label={t("email")} name="email" type="email" value={formData.email} onChange={handleChange} icon={<FaEnvelope />} error={errors.email} />

            <Input
              label={t("password")}
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              icon={<FaLock />}
              rightIcon={showPassword ? <FaEyeSlash onClick={() => setShowPassword(!showPassword)} /> : <FaEye onClick={() => setShowPassword(!showPassword)} />}
              error={errors.password}
            />

            <Input
              label={t("confirmPassword")}
              name="confirm"
              type={showConfirm ? "text" : "password"}
              value={formData.confirm}
              onChange={handleChange}
              icon={<FaLock />}
              rightIcon={showConfirm ? <FaEyeSlash onClick={() => setShowConfirm(!showConfirm)} /> : <FaEye onClick={() => setShowConfirm(!showConfirm)} />}
              error={errors.confirm}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label={t("dob")} name="dob" type="date" value={formData.dob} onChange={handleChange} icon={<FaCalendarAlt />} error={errors.dob} />

              <Input label={t("regnumber")} name="regnumber" value={formData.regnumber} onChange={handleChange} icon={<FaIdBadge />} error={errors.regnumber} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label={t("field")} name="field" value={formData.field} onChange={handleChange} icon={<FaLayerGroup />} error={errors.field} />

              <Select label={t("year")} name="year" value={formData.year} onChange={handleChange} options={["L1","L2","L3","Ing1","Ing2","Ing3","M1","M2"]} icon={<FaCalendarCheck />} error={errors.year} />
            </div>

            <Button type="submit" variant="primary">
              <FaPaperPlane /> {t("signUp")}
            </Button>

          </form>
        </div>

        

        {/* Mascotte */}
        <div className="w-full md:w-1/2 relative flex items-center justify-center mt-8 md:mt-0 bg-card">
          <div className="absolute top-12 md:top-16 right-4 md:right-12 bg-white rounded-xl shadow p-6 md:p-9 w-max min-h-[80px] z-20">
            <p className="text-gray-700 font-medium text-sm">
              {t("welcomeStudent")}
            </p>
            <div className="absolute -top-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center shadow">
              <span style={{ color: "#4F9DDE", fontSize: "20px", fontWeight: "bold" }}>&lt;&gt;</span>
            </div>
          </div>

          <div className="absolute w-56 md:w-72 h-56 md:h-72 rounded-full blur-3xl" style={{ background: "rgba(52,144,220,0.6)", top: "45%", left: "50%", transform: "translate(-50%, -50%)" }} />
          <img src={robot} alt="Robot Mascotte" className="w-56 md:w-72 z-10 -mt-10 md:-mt-10" />
        </div>
      </div>
    </div>
  );
}

