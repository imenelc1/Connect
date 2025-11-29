import React, { useState, useContext } from "react";
import Input from "../components/common/Input.jsx";
import Button from "../components/common/Button.jsx";
import AuthTabs from "../components/common/AuthTabs.jsx";
import LogoIconeComponent from "../components/common/IconeLogoComponent.jsx";
import Mascotte from "../components/common/Mascotte.jsx";
import Select from "../components/common/Select.jsx";
import api from "../services/api";

import LogoComponent from "../components/common/LogoComponent.jsx";

import { 
  FaEye, FaEyeSlash, FaPaperPlane, FaStar, FaIdBadge,
  FaCalendarAlt, FaLock, FaEnvelope, FaUser, FaGraduationCap
} from "react-icons/fa";

import { FiGlobe } from "react-icons/fi";

import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ThemeContext from "../context/ThemeContext.jsx";
import ThemeButton from "../components/common/ThemeButton.jsx";

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

  // mapping backend -> frontend
  const fieldMap = {
    nom: "nickname",
    prenom: "fullname",
    adresse_email: "email",
    mot_de_passe: "password",
    date_naissance: "dob",
    matricule: "regnumber",
    grade: "rank",
  };

  // regex utiles
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const matriculeRegex = /^\d{12}$/;
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/; // lettres + accents + espaces + ' -

  // VALIDATION EN TEMPS RÉEL pendant la saisie
  const handleChange = (e) => {
    const { name, value } = e.target;

    // met à jour la valeur
    setFormData(prev => ({ ...prev, [name]: value }));

    // reset de l'erreur pour ce champ
    setErrors(prev => ({ ...prev, [name]: "" }));

    // validations en direct par champ (pour UX immédiate)
    if (name === "password") {
      if (value.length < 8) {
        setErrors(prev => ({ ...prev, password: "Minimum 8 caractères" }));
      } else {
        setErrors(prev => ({ ...prev, password: "" }));
      }

      // si confirm existant, vérifie cohérence
      if (formData.confirm && formData.confirm !== value) {
        setErrors(prev => ({ ...prev, confirm: "Les mots de passe ne correspondent pas" }));
      } else if (formData.confirm && formData.confirm === value) {
        setErrors(prev => ({ ...prev, confirm: "" }));
      }
    }

    if (name === "confirm") {
      if (value !== formData.password) {
        setErrors(prev => ({ ...prev, confirm: "Les mots de passe ne correspondent pas" }));
      } else {
        setErrors(prev => ({ ...prev, confirm: "" }));
      }
    }

    if ((name === "nickname" || name === "fullname") && /\d/.test(value)) {
      setErrors(prev => ({ ...prev, [name]: "Ne doit pas contenir de chiffres" }));
    } else if (name === "nickname" || name === "fullname") {
      // clear only if it matches name rules
      if (value.trim() === "") {
        setErrors(prev => ({ ...prev, [name]: "" })); // keep required handled in final validate
      } else if (!nameRegex.test(value)) {
        setErrors(prev => ({ ...prev, [name]: "Caractères invalides (lettres seulement)" }));
      } else {
        setErrors(prev => ({ ...prev, [name]: "" }));
      }
    }

    if (name === "email") {
      if (value && !emailRegex.test(value)) {
        setErrors(prev => ({ ...prev, email: "Format d'email invalide" }));
      } else {
        setErrors(prev => ({ ...prev, email: "" }));
      }
    }

    if (name === "regnumber") {
      if (value && !/^\d*$/.test(value)) {
        setErrors(prev => ({ ...prev, regnumber: "Le matricule doit contenir uniquement des chiffres" }));
      } else if (value && !matriculeRegex.test(value)) {
        // si longueur différente de 12, message moins brutal
        setErrors(prev => ({ ...prev, regnumber: "Matricule : 12 chiffres attendus" }));
      } else {
        setErrors(prev => ({ ...prev, regnumber: "" }));
      }
    }

    if (name === "dob") {
      if (value) {
        const birthDate = new Date(value);
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 25); // 25 ans minimum
        if (birthDate > minDate) {
          setErrors(prev => ({ ...prev, dob: "Vous devez avoir au moins 25 ans." }));
        } else {
          setErrors(prev => ({ ...prev, dob: "" }));
        }
      } else {
        setErrors(prev => ({ ...prev, dob: "" }));
      }
    }
  };

  // VALIDATION FINALE (utilisée au submit)
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nickname.trim()) newErrors.nickname = "Pseudo obligatoire.";
    else if (!nameRegex.test(formData.nickname)) newErrors.nickname = "Le pseudo ne doit contenir que des lettres.";

    if (!formData.fullname.trim()) newErrors.fullname = "Nom complet obligatoire.";
    else if (!nameRegex.test(formData.fullname)) newErrors.fullname = "Le nom complet ne doit contenir que des lettres.";

    if (!formData.email.trim()) newErrors.email = "Email obligatoire.";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Format email invalide.";

    if (!formData.password.trim()) newErrors.password = "Mot de passe obligatoire.";
    else if (formData.password.length < 8) newErrors.password = "Minimum 8 caractères.";

    if (formData.confirm !== formData.password) newErrors.confirm = "Mot de passe non identique";

    if (!formData.dob) newErrors.dob = "Champ obligatoire";
    else {
      const birthDate = new Date(formData.dob);
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 25);
      if (birthDate > minDate) newErrors.dob = "Vous devez avoir au moins 25 ans.";
    }

    if (!formData.regnumber) newErrors.regnumber = "Champ obligatoire";
    else if (!matriculeRegex.test(formData.regnumber)) newErrors.regnumber = "Matricule invalide (12 chiffres)";

    if (!formData.rank) newErrors.rank = "Grade obligatoire";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

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
      grade: formData.rank,
      role: "enseignant"
    };

    try {
      const res = await api.post("register/", payload);
      localStorage.setItem("user", JSON.stringify(res.data));
      toast.success("Inscription réussie !");
      // redirection
      setTimeout(() => {
        window.location.href = "/all-courses";
      }, 1200);
    } catch (err) {
      const apiErrors = err.response?.data;

      if (apiErrors) {
        if (apiErrors.error) {
          toast.error(apiErrors.error);
          return;
        }

        const backendMappedErrors = {};
        Object.keys(apiErrors).forEach((key) => {
          const frontendKey = fieldMap[key] || key;
          // backend peut retourner array
          const firstErr = Array.isArray(apiErrors[key]) ? apiErrors[key][0] : apiErrors[key];
          backendMappedErrors[frontendKey] = firstErr;
        });

        setErrors((prev) => ({ ...prev, ...backendMappedErrors }));

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