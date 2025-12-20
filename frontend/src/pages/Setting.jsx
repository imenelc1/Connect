import React, { useState, useEffect } from "react";
// Styles globaux
import "../styles/index.css";// Import des styles globaux
import NavSetting from "../components/common/navsetting";
import Button from "../components/common/Button";
import { Trash, Sun, Globe, Shield, User, UserRound, Mail, Pen, Hash, Award } from "lucide-react";
import { useTranslation } from "react-i18next";
// Thème global (dark/light mode)
import ThemeContext from "../context/ThemeContext";
import { useContext } from "react";
import Navbar from "../components/common/NavBar";
import "../components/common/NavBar";
import api from "../services/api";
import UserCircle from "../components/common/UserCircle";
import toast, { Toaster } from "react-hot-toast";

import { FaEye, FaEyeSlash } from "react-icons/fa";
export default function Setting() {
    // Hook de traduction
    const { t, i18n } = useTranslation("setting");
    // un gestionnaire pour changer la langue
    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        i18n.changeLanguage(lang);
        
    };
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
        useEffect(() => {
           const handler = (e) => setSidebarCollapsed(e.detail);
           window.addEventListener("sidebarChanged", handler);
           return () => window.removeEventListener("sidebarChanged", handler);
         }, []);
    // Récupérer darkMode depuis ThemeContext
    const { darkMode, toggleDarkMode } = useContext(ThemeContext);


    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState("profile");
    const [isEditing, setIsEditing] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);       // Pour le nouveau mot de passe
    const [showConfirm, setShowConfirm] = useState(false);         // Pour confirmer le mot de passe
    const [passwordSuccess, setPasswordSuccess] = useState("");

    // STATE pour le formulaire
    // 1️⃣ Initialisation avec des champs vides
    const [formData, setFormData] = useState({
        nom: "",
        prenom: "",
        date_naissance: "",
        adresse_email: "",
        matricule: "",
        specialite: "",
        annee_etude: "",
        grade: "",
    });

    // 2️⃣ Remplir formData une fois user chargé
    useEffect(() => {
        if (user) {
            setFormData({
                nom: user.nom || "",
                prenom: user.prenom || "",
                date_naissance: user.date_naissance || "",
                adresse_email: user.adresse_email || "",
                matricule: user.matricule || "",
                specialite: user.specialite || "",
                annee_etude: user.annee_etude || "",
                grade: user.grade || "",
            });
        }
    }, [user]);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordError, setPasswordError] = useState("");

    const handleSave = async () => {
        if (!validateProfile()) {
            console.error("Erreurs dans le formulaire:", formErrors);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await api.put("profile/", formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(formData);
            setIsEditing(false);
        } catch (error) {
            console.error(t("Errors.ProfileUpdateFailed"), error);
            toast.error(t("Errors.ProfileUpdateFailed"));
        }
    };

    const validatePassword = () => {
        const { newPassword, confirmPassword } = passwordData;
        const passwordRegex = /^.{8,}$/; // minimum 8 caractères

        if (!newPassword) {
            setPasswordError(t("Errors.PasswordRequired"));
            return false;
        }

        if (!passwordRegex.test(newPassword)) {
            setPasswordError(t("Errors.PasswordMin8"));
            return false;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError(t("Errors.PasswordsMismatch"));
            return false;
        }

        setPasswordError("");
        return true;
    };


    const handlePasswordUpdate = async () => {
        if (!validatePassword()) return;

        try {
            const token = localStorage.getItem("token");
            await api.put("profile/password/", passwordData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setPasswordSuccess(t("Messages.PasswordUpdateSuccess"));
            setPasswordError("");
            toast.success(t("Messages.PasswordUpdateSuccess"));
            setTimeout(() => setPasswordSuccess(""), 3000);
        } catch (error) {
            console.error(t("Messages.PasswordUpdateFailed"), error);
            setPasswordError(t("Messages.PasswordUpdateFailed"));
            toast.error(t("Messages.PasswordUpdateFailed"));
        }
    };
    const validateProfile = () => {
        const errors = {};

        // Email obligatoire + format correct
        if (!formData.adresse_email) {
            errors.adresse_email = t("Errors.EmailRequired");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adresse_email)) {
            errors.adresse_email = t("Errors.EmailInvalid");
        }

        // Mot de passe obligatoire + min 8 caractères
        if (formData.mot_de_passe && formData.mot_de_passe.length < 8) {
            errors.mot_de_passe = t("Errors.PasswordMin8");
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };


    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error(t("Errors.NoToken"));
                setLoading(false);
                return;
            }

            try {
                const response = await api.get("profile/", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setUser(response.data);
            } catch (error) {
                console.error(t("Errors.ProfileLoadFailed"), error);
                toast.error(t("Errors.ProfileLoadFailed"));
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return <div className="p-10 text-center text-textc">{t("Global.Loading")}</div>;
    }
    if (!user) {
        return <div className="p-10 text-center text-red">{t("Errors.ProfileLoadFailed")}</div>;
    }

    const initials = `${user.nom?.[0] || ""}${user.prenom?.[0] || ""}`.toUpperCase();

    return (
        // -------- GLOBAL LAYOUT --------
        <div className="  w-full md:flex-row min-h-screen">


            {/* Sidebar : cachée sur mobile, visible sur large écrans */}
           <div className="flex-shrink-0 w-14 sm:w-16 md:w-48">


                <Navbar />
            </div>


            {/* -------- RIGHT CONTENT -------- */}
           <div className={`
        p-6 pt-10 min-h-screen text-textc transition-all duration-300 space-y-5
        ${sidebarCollapsed ? "ml-20" : "ml-64"}
      `}>

                {/* Top nav tabs */}
                <NavSetting active={activeTab} onChange={setActiveTab} />

                {/* -------- PROFILE TAB -------- */}
                {activeTab === "profile" && (

                    <div className="mt-10 bg-grad-2 backdrop-blur-md rounded-3xl shadow-md p-6 sm:p-6 md:p-8  border border-white/40">

                        {/* PROFILE HEADER */}
                        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">

                            {/* Avatar + Name */}
                            <div className="flex items-center gap-4">

                                <UserCircle
                                    initials={initials}
                                    onToggleTheme={toggleDarkMode}
                                    onChangeLang={(lang) => i18n.changeLanguage(lang)}
                                />

                                {/* Name + email + tag */}
                                <div>
                                    <h2 className="text-lg sm:text-xl font-semibold text-textc whitespace-nowrap">
                                        {user?.nom} {user?.prenom}
                                    </h2>

                                    <p className="text-textc text-sm sm:text-base whitespace-nowrap">
                                        {user?.email}
                                    </p>

                                    <span className="inline-block mt-1 bg-secondary text-white text-xs px-3 py-1 rounded-full">
                                        {user?.role === "enseignant" ? "Professor" : "Student"}
                                    </span>
                                </div>
                            </div>

                            {/* Edit button */}
                            <div className="md:ml-auto">
                                <Button
                                    variant="Setting"
                                    onClick={() => {
                                        if (isEditing) {
                                            handleSave();  // Sauvegarde les changements dans la BDD
                                        } else {
                                            setIsEditing(true);  // Passe en mode édition
                                        }
                                    }}
                                    className="bg-grad-7 hover:bg-sky-600 text-white font-xl px-4"
                                >
                                    <Pen />
                                    {isEditing ? t("Profile.SaveChanges") : t("Profile.Editprofile")}
                                </Button>

                            </div>
                        </div>


                        {/* -------- FORM -------- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">

                            {/* Full name */}
                            <div className="flex flex-col">
                                <label className="text-textc mb-2">{t("Profile.FullName")}</label>
                                <div className="relative">
                                    <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={formData.nom}
                                        onChange={(e) => {
                                            // Ne garder que les lettres et les espaces
                                            const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                                            setFormData({ ...formData, nom: value });
                                        }}
                                        disabled={!isEditing}
                                        className={`w-full pl-10 bg-white rounded-xl p-3 shadow-sm text-black/80 
     ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                                    />


                                </div>
                            </div>

                            {/* Nickname */}
                            <div className="flex flex-col">
                                <label className="text-textc smb-2"> {t("Profile.NickName")}</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={formData.prenom}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                                            setFormData({ ...formData, prenom: value });
                                        }}
                                        disabled={!isEditing}
                                        className={`w-full pl-10 bg-white rounded-xl p-3 shadow-sm text-black/80 
                                           ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                                    />
                                </div>
                            </div>

                            {/* Date */}
                            <div className="flex flex-col">
                                <label className="text-textc mb-2">{t("Profile.Datebirth")}</label>
                                <input
                                    type="date"
                                    value={formData.date_naissance}
                                    onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                                    disabled={!isEditing}
                                    className={`w-full pl-10 bg-white rounded-xl p-3 shadow-sm text-black/50 
                                           ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                                />
                            </div>

                            {/* Email */}
                            <div className="flex flex-col">
                                <label className="text-textc mb-2">{t("Profile.EmailAddress")}</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={formData.adresse_email}
                                        onChange={(e) => setFormData({ ...formData, adresse_email: e.target.value })}
                                        disabled={!isEditing}
                                        className={`w-full pl-10 bg-white rounded-xl p-3 shadow-sm text-black/80 
                                           ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                                    />
                                    {formErrors.adresse_email && <p className="text-red text-sm mt-1">{formErrors.adresse_email}</p>}


                                </div>
                            </div>

                            {/* Registration */}
                            <div className="flex flex-col">
                                <label className="text-textc mb-2">{t("Profile.RegistratioNumber")}</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={formData.matricule}
                                        onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                                        disabled={!isEditing}
                                        className={`w-full pl-10 bg-white rounded-xl p-3 shadow-sm text-black/80 
                                           ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                                    />

                                </div>
                            </div>

                            {/* ---- EXTRA FIELDS BASED ON ROLE ----*/}
                            {user.role === "etudiant" && (
                                <>
                                    {/* Specialité */}
                                    <div className="flex flex-col">
                                        <label className="text-textc mb-2">{t("Profile.Speciality")}</label>
                                        <input
                                            type="text"
                                            value={formData.specialite}
                                            onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                                            disabled={!isEditing}
                                            className={`w-full bg-white rounded-xl p-3 shadow-sm text-black/80 
                                           ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                                        />
                                    </div>

                                    {/* Année d'étude */}
                                    <div className="flex flex-col">
                                        <label className="text-textc mb-2">{t("Profile.StudyYear")}</label>
                                        <input
                                            type="text"
                                            value={formData.annee_etude}
                                            onChange={(e) => setFormData({ ...formData, annee_etude: e.target.value })}
                                            disabled={!isEditing}
                                            className={`w-full bg-white rounded-xl p-3 shadow-sm text-black/80 
                                           ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                                        />
                                    </div>
                                </>
                            )}

                            {user.role === "enseignant" && (
                                <>
                                    {/* Grade */}
                                    <div className="flex flex-col">
                                        <label className="text-textc mb-2">{t("Profile.Grade")}</label>
                                        <div className="relative">
                                            <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                value={formData.grade}
                                                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                                disabled={!isEditing}
                                                className={`w-full pl-10 bg-white rounded-xl p-3 shadow-sm text-black/80 
                                           ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                        </div>
                    </div>
                )}

                {/* -------- PREFERENCES -------- */}
                {activeTab === "preferences" && (
                    <div className="mt-10 p-6  bg-grad-2 sm:p-8 md:p-10 rounded-3xl shadow-md">

                        {/* THEME */}
                        <div className="mb-10">
                            <h3 className="text-textc font-semibold mb-4 flex items-center gap-2">
                                <span className="text-sky-500 text-lg"><Sun /></span>
                                {t("Preferences.Theme")}
                            </h3>

                            {/* LIGHT MODE */}
                            <label className="flex items-center justify-between bg-white rounded-xl p-4 mb-3 shadow-sm cursor-pointer  text-black/80">
                                <div>
                                    <p className="font-medium text-black/80">{t("Preferences.LightMode")}</p>
                                    <p className="text-sm text-black/80">{t("Preferences.Brightp")}</p>
                                </div>

                                <input
                                    type="radio"
                                    name="theme"
                                    className="w-4 h-4 text-sky-500"
                                    checked={!darkMode}
                                    onChange={() => toggleDarkMode("light")}
                                />
                            </label>



                            {/* DARK MODE */}
                            <label className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm cursor-pointer text-black/80">
                                <div>
                                    <p className="font-medium text-black/80">{t("Preferences.DarkMode")}</p>
                                    <p className="text-sm text-black/80">{t("Preferences.Easyp")}</p>
                                </div>

                                <input
                                    type="radio"
                                    name="theme"
                                    className="w-4 h-4 text-sky-500"
                                    checked={darkMode}
                                    onChange={() => toggleDarkMode("dark")}
                                />

                            </label>
                        </div>

                        {/* LANGUAGE */}
                        <div>
                            <h3 className="text-textc font-semibold mb-4 flex items-center gap-2">
                                <span className="text-sky-500 text-lg"><Globe /></span>
                                {t("Preferences.Language")}
                            </h3>

                            <p className="text-sm text-textc mb-2">
                                {t("Preferences.Selectp")}
                            </p>

                            <select
                                className="w-full bg-white rounded-xl p-3 shadow-sm border border-gray-200 text-black/80"
                                value={i18n.language}
                                onChange={handleLanguageChange}
                            >
                                <option value="fr">{t("Preferences.French")}</option>
                                <option value="en">{t("Preferences.English")}</option>


                            </select>
                        </div>

                    </div>
                )}


                {/* -------- ACCOUNT -------- */}
                {activeTab === "account" && (
                    <div className="mt-4 p-6 sm:p-8 md:p-10 rounded-3xl shadow-md bg-grad-2">

                        {/* SECURITY */}
                        <div className="bg-primary/10 rounded-2xl p-6 shadow-sm border border-white/40 mb-10">

                            <h3 className="text-textc font-bold mb-6 flex items-center gap-2">
                                <span className="text-sky-500 text-xl"><Shield /></span>
                                {t("Account.Security")}
                            </h3>

                            {/* Current Password */}
                            <div className="flex flex-col mb-4">
                                <label className="text-textc mb-2">  {t("Account.CurrentPassword")}</label>
                                <input
                                    type="password"
                                    placeholder={t("Placeholders.CurrentPassword")}
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm"
                                />
                            </div>

                            {/* NEW PASSWORD */}
                            <div className="flex flex-col mb-4">
                                <label className="text-textc mb-2">{t("Account.NewPassword")}</label>
                                <div className="relative flex items-center">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder={t("Placeholders.NewPassword")}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full bg-white border border-gray-200 rounded-xl p-3 pr-10 shadow-sm"
                                    />
                                    <span
                                        className="absolute right-3 cursor-pointer text-gray-400"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                                {passwordError && <p className="text-red text-sm mt-1">{passwordError}</p>}
                            </div>

                            {/* CONFIRM PASSWORD */}
                            <div className="flex flex-col mb-6">
                                <label className="text-textc mb-2">{t("Account.ConfirmNewPassword")}</label>
                                <div className="relative flex items-center">
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        placeholder={t("Placeholders.ConfirmPassword")}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full bg-white border border-gray-200 rounded-xl p-3 pr-10 shadow-sm"
                                    />
                                    <span
                                        className="absolute right-3 cursor-pointer text-gray-400"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                    >
                                        {showConfirm ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                            </div>

                            {/* UPDATE BUTTON */}
                            <div className="flex justify-end mt-4">

                                <Button
                                    variant="Setting"
                                    onClick={handlePasswordUpdate}
                                    className="bg-sky-500 hover:bg-sky-600 text-white font-medium px-6 py-2 rounded-lg shadow h-15 w-[180px] "
                                >  {t("Account.UpdatePass")}</Button>
                            </div>
                        </div>

                        {/* DANGER ZONE */}
                        <div className="bg-red/10 border border-red rounded-2xl p-6 shadow-sm">
                            <div className="bg-white border  rounded-2xl p-6 shadow-sm">

                                <h3 className="text-red font-bold mb-3 flex items-center gap-2">
                                    <span className="text-red text-xl"><Trash /></span>
                                    {t("Account.DangerZone")}
                                </h3>

                                <p className="text-gray-700 font-medium">  {t("Account.HDelete")}</p>
                                <p className="text-sm text-gray-500 mb-5">
                                    {t("Account.deleteP")}
                                </p>
                                <Button
                                    variant="Setting"
                                    onClick={() => navigate("/")}
                                    className="bg-red  hover:bg-red/80 text-white font-xl px-4 sm:px-5 py-2 rounded-lg transition text-sm sm:text-base w-[205px]"
                                >  {t("Account.DeleteAccount")}
                                </Button>




                            </div>
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}

