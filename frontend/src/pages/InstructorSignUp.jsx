import React, { useState, useContext } from "react";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import AuthTabs from "../components/common/AuthTabs";
import LogoIconeComponent from "../components/common/IconeLogoComponent";
import Mascotte from "../components/common/Mascotte.jsx";
import Select from "../components/common/Select";
import api from "../services/api";

import LogoComponent from "../components/common/LogoComponent";

import { 
  FaEye, FaEyeSlash, FaPaperPlane, FaStar, FaIdBadge,
  FaCalendarAlt, FaLock, FaEnvelope, FaUser, FaGraduationCap
} from "react-icons/fa";

import { FiGlobe } from "react-icons/fi";

import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ThemeContext from "../context/ThemeContext";
import ThemeButton from "../components/common/ThemeButton";

const InstructorSignUp = () => {
  const [formData, setFormData] = useState({
    nickname: "",
    fullname: "",
    email: "",
    password: "",
    confirm: "",
    dob: "",
    regnumber: "",
    rank: ""
  });
 const { t, i18n } = useTranslation("signup");
  const { toggleDarkMode } = useContext(ThemeContext);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
// --- MAPPING BACKEND → FRONTEND ---
  const fieldMap = {
    nom: "nickname",
    prenom: "fullname",
    adresse_email: "email",
    mot_de_passe: "password",
    date_naissance: "dob",
    matricule: "regnumber",
    grade: "rank",
  };
  const handleSubmit = async (e) => {
  e.preventDefault();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const matriculeRegex = /^\d{12}$/;

  const newErrors = {};

  // --- PSEUDO ---
  if (!formData.nickname.trim())
    newErrors.nickname = "Pseudo obligatoire.";

  // --- NOM COMPLET ---
  if (!formData.fullname.trim())
    newErrors.fullname = "Nom complet obligatoire.";

  // --- EMAIL ---
  if (!formData.email.trim())
    newErrors.email = "Email obligatoire.";
  else if (!emailRegex.test(formData.email))
    newErrors.email = "Format email invalide.";

  // --- MOT DE PASSE ---
  if (!formData.password.trim())
    newErrors.password = "Mot de passe obligatoire.";
  else if (formData.password.length < 8)
    newErrors.password = "Minimum 8 caractères.";

  // --- CONFIRMATION ---
  if (!formData.confirm.trim())
    newErrors.confirm = "Confirmez votre mot de passe.";
  else if (formData.confirm !== formData.password)
    newErrors.confirm = "Les mots de passe ne correspondent pas.";

  // --- DATE DE NAISSANCE ---
  if (!formData.dob.trim()) {
    newErrors.dob = "Date de naissance obligatoire.";
  } else {
    const birthDate = new Date(formData.dob);
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 25);

    if (birthDate > minDate)
      newErrors.dob = "Vous devez avoir au moins 25 ans.";
  }

  // --- MATRICULE ---
  if (!formData.regnumber.trim())
    newErrors.regnumber = "Matricule obligatoire.";
  else if (!matriculeRegex.test(formData.regnumber))
    newErrors.regnumber = "Matricule invalide (12 chiffres attendus).";

  // --- GRADE ---
  if (!formData.rank.trim())
    newErrors.rank = "Grade obligatoire.";

  // STOP si erreurs
  setErrors(newErrors);
  if (Object.keys(newErrors).length > 0) return;

  // --- PAYLOAD ---
  const payload = {
    nom: formData.nickname,
    prenom: formData.fullname,
    adresse_email: formData.email,
    mot_de_passe: formData.password,
    date_naissance: formData.dob,
    matricule: formData.regnumber,
    grade: formData.rank,
    role: "enseignant"
  };

  try {
    const res = await api.post("register/", payload);
    localStorage.setItem("user", JSON.stringify(res.data));
    toast.success("Inscription réussie !");

    setTimeout(() => {
      window.location.href = "/all-courses";
    }, 1500);

 } catch (err) {
      const apiErrors = err.response?.data;

      if (apiErrors) {
        // Error globale : { "error": "..." }
        if (apiErrors.error) {
          toast.error(apiErrors.error);
          return;
        }

        // Backend → Front errors
        const backendMappedErrors = {};

        Object.keys(apiErrors).forEach((key) => {
          const frontendKey = fieldMap[key] || key;
          backendMappedErrors[frontendKey] = apiErrors[key][0];
        });

        setErrors((prev) => ({ ...prev, ...backendMappedErrors }));

        // Toast avec toutes les erreurs
        toast.error(Object.values(backendMappedErrors).join("\n"));
        return;
      }

      toast.error("Erreur réseau. Vérifiez Django.");
    }
};
 const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
  };

    return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface p-4 pt-12">
  {/* Header */}
  <div className="flex w-full mb-4 items-center justify-between px-4">

    {/* Logo normal (grand) — visible seulement md+ */}
    <div className="hidden md:block">
      <LogoComponent className="-mt-10 ml-20" />
    </div>

    {/* Petit logo — visible seulement sur mobile */}
    <div className="block md:hidden">
      <LogoIconeComponent className="w-8 h-8 -ml-1" />
    </div>

    {/* Actions */}
    <div className="flex items-center gap-4">
      <ThemeButton onClick={toggleDarkMode} />
      <FiGlobe
        size={20}
        title="Changer la langue"
        onClick={toggleLanguage}
        className="cursor-pointer"
      />
    </div>
  </div>




      <AuthTabs
          role="instructor"
          active="signup"
          tab1Label={t("login.signIn")}
          tab2Label={t("login.signUp")}
          className="mt-20 sm:mt-0"
      />

      <div className="flex flex-col lg:flex-row w-full max-w-[1000px] min-h-[650px] bg-card rounded-3xl shadow-lg overflow-hidden relative mt-2">
        {/* Formulaire */}
        <div className="w-full md:w-1/2 p-10">
         <h2 className="text-2xl font-semibold text-center mb-6"><span className="text-textc">{t("title")}</span><span>  </span><span className="text-muted">{t("connect")}</span></h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label={t("nickname")} name="nickname" value={formData.nickname} onChange={handleChange} placeholder={t("nickname")} icon={<FaUser />} error={errors.nickname} />
              <Input label={t("fullname")} name="fullname" value={formData.fullname} onChange={handleChange} placeholder={t("fullname")} icon={<FaUser />} error={errors.fullname} />
            </div>

            <Input label={t("email")} name="email" type="email" value={formData.email} onChange={handleChange} placeholder={t("email")} icon={<FaEnvelope />} error={errors.email} />

            <Input label={t("password")} name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} placeholder={t("password")} icon={<FaLock />} rightIcon={showPassword ? <FaEyeSlash onClick={() => setShowPassword(!showPassword)} className="cursor-pointer" /> : <FaEye onClick={() => setShowPassword(!showPassword)} className="cursor-pointer" />} error={errors.password} />

            <Input label={t("confirmPassword")} name="confirm" type={showConfirm ? "text" : "password"} value={formData.confirm} onChange={handleChange} placeholder={t("confirmPassword")} icon={<FaLock />} rightIcon={showConfirm ? <FaEyeSlash onClick={() => setShowConfirm(!showConfirm)} className="cursor-pointer" /> : <FaEye onClick={() => setShowConfirm(!showConfirm)} className="cursor-pointer" />} error={errors.confirm} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label={t("dob")} name="dob" type="date" value={formData.dob} onChange={handleChange} placeholder={t("dob")} icon={<FaCalendarAlt />} error={errors.dob} />
              <Input label={t("regnumber")} name="regnumber" value={formData.regnumber} onChange={handleChange} placeholder={t("regnumber")} icon={<FaIdBadge />} error={errors.regnumber} />
            </div>

            <Select label={t("rank")} name="rank" value={formData.rank} onChange={handleChange} placeholder={t("rank")} options={[
                    { value: "Prof", label: "Professor" },
                    { value: "maitre conf", label: "Maitre de conférences" },
                    { value: "maitre ass", label: "maitre assistant" },
                  ]} />
            <Button type="submit" variant="primary"><FaPaperPlane className="inline mr-2" /> {t("signUp")}</Button>
              <p className="text-sm text-grayc text-center mt-4">
                          {t("alreadyHaveAccount")}{" "}
                          <a href="/login/student" className="text-muted font-medium hover:underline">
                            {t("signIn")}
                          </a>
                        </p>
            
                       
          </form>
        </div>

        {/* Mascotte */}
        <div className="w-full md:w-1/2 relative flex items-center justify-center mt-8 md:mt-0 bg-card hidden lg:block">
          <div className="absolute top-12 md:top-16 right-4 md:right-12 bg-white rounded-xl shadow p-6 md:p-9 w-max min-h-[80px] z-20">
            <p className="text-gray-700 font-medium text-sm">
              {t("welcomeInstructor")}
            </p>
            <div className="absolute -top-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center shadow">
              <span style={{ color: "#4F9DDE", fontSize: "20px", fontWeight: "bold" }}>&lt;&gt;</span>
            </div>
          </div>

          <div className="absolute w-56 md:w-72 h-56 md:h-72 rounded-full blur-3xl" style={{ background: "rgba(52,144,220,0.6)", top: "45%", left: "50%", transform: "translate(-50%, -50%)" }} />
           <Mascotte width="w-48 sm:w-60 lg:w-58" className="hidden lg:block absolute top-10 right-20 h-58 z-10 mt-40 mr-10 " />
        </div>

      </div>
    </div>
  );
}



export default InstructorSignUp;