import React, { useState,useEffect } from "react";
// Styles globaux
import "../styles/index.css";// Import des styles globaux
import NavSetting from "../components/common/navsetting";
import Button from "../components/common/Button";
import { Trash, Home, LayoutDashboard, BookOpen, FileCheck2, Users, Sun, Globe, Shield, User, UserRound, Mail, Pen, Hash, Award } from "lucide-react";
import { useTranslation } from "react-i18next";
// Thème global (dark/light mode)
import ThemeContext from "../context/ThemeContext";
import { useContext } from "react";
import Navbar from "../components/common/NavBar";
import "../components/common/NavBar";
import LogoComponent from "../components/common/LogoComponent";
import axios from "../services/api";
import api from "../services/api";



export default function Setting() {
    // Hook de traduction
    const { t, i18n } = useTranslation("setting");
    // un gestionnaire pour changer la langue
    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        i18n.changeLanguage(lang);
    };
    // Récupérer darkMode depuis ThemeContext
    const { darkMode, toggleDarkMode } = useContext(ThemeContext);


const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState("profile");
    // Permet de changer la langue (FR ↔ EN)²
    // const toggleLanguage = () => {
    //     const newLang = i18n.language === "fr" ? "en" : "fr";
    //     i18n.changeLanguage(newLang);
    // };


 useEffect(() => {
  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, cannot fetch profile");
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("profile/");
      setUser(response.data);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, []);

if (loading) {
    return <div className="p-10 text-center text-textc">Loading...</div>;
}
if (!user) {
    return <div className="p-10 text-center text-red-500">Cannot load user profile</div>;
}

    return (
        // -------- GLOBAL LAYOUT --------
        <div className="  flex w-full md:flex-row min-h-screen">
           


            {/* Sidebar : cachée sur mobile, visible sur large écrans */}
            <div className="hidden lg:block w-64 ">
                
                
                <Navbar />
            </div>


            {/* -------- RIGHT CONTENT -------- */}
            <div className="flex-1 p-4 p-4 sm:p-6 md:p-8 lg:p-10">

                {/* Top nav tabs */}
                <NavSetting active={activeTab} onChange={setActiveTab} />

                {/* -------- PROFILE TAB -------- */}
                {activeTab === "profile" && (

                    <div className="mt-10 bg-grad-3 backdrop-blur-md rounded-3xl shadow-md p-6 sm:p-6 md:p-8  border border-white/40">



                        {/* PROFILE HEADER */}
                        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">

                            {/* Avatar + infos sur une seule ligne */}
                            <div className="flex items-center gap-4 sm:whitespace-nowrap">

                                {/* Avatar */}
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-grad-7 text-white flex items-center justify-center text-2xl sm:text-3xl font-bold">
                                    M.H
                                </div>

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
                                    className="bg-grad-7 hover:bg-sky-600 text-white font-xl px-4 sm:px-5 py-2 rounded-lg transition text-sm sm:text-base"
                                >  <Pen />{t("Profile.Editprofile")}
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
                                        defaultValue={`${user?.nom}`}
                                        className="w-full pl-10 bg-white rounded-xl p-3 shadow-sm text-black/80"
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
                                        defaultValue={`${user?.prenom}`}
                                        className="w-full pl-10 bg-white rounded-xl p-3 shadow-sm text-black/80"
                                    />
                                </div>
                            </div>

                            {/* Date */}
                            <div className="flex flex-col">
                                <label className="text-textc mb-2">{t("Profile.Datebirth")}</label>
                                <input
                                    type="date"
                                    defaultValue={user?.dateNaissance}
                                    className="w-full pl-10 bg-white rounded-xl p-3 shadow-sm text-black/50"
                                />
                            </div>

                            {/* Email */}
                            <div className="flex flex-col">
                                <label className="text-textc mb-2">{t("Profile.EmailAddress")}</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        defaultValue={user?.email}
                                        className="w-full pl-10 bg-white rounded-xl p-3 shadow-sm text-black/80"
                                    />

                                </div>
                            </div>

                            {/* Registration */}
                            <div className="flex flex-col">
                                <label className="text-textc mb-2">{t("Profile.RegistratioNumber")}</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                            type="text"
                                            defaultValue={user?.matricule}
                                            className="w-full pl-10 bg-white rounded-xl p-3 shadow-sm text-black/80"
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
                defaultValue={user.specialite}
                className="w-full bg-white rounded-xl p-3 shadow-sm text-black/80"
            />
        </div>

        {/* Année d'étude */}
        <div className="flex flex-col">
            <label className="text-textc mb-2">{t("Profile.StudyYear")}</label>
            <input
                type="text"
                defaultValue={user.annee_etude}
                className="w-full bg-white rounded-xl p-3 shadow-sm text-black/80"
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
                    defaultValue={user.grade}
                    className="w-full pl-10 bg-white rounded-xl p-3 shadow-sm text-black/80"
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
                    <div className="mt-10 p-6  bg-grad-3 sm:p-8 md:p-10 rounded-3xl shadow-md">

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
                    <div className="mt-4 p-6 sm:p-8 md:p-10 rounded-3xl shadow-md bg-grad-3">

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
                                    placeholder="Enter current password"
                                    className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm"
                                />
                            </div>

                            {/* New Password */}
                            <div className="flex flex-col mb-4">
                                <label className="text-textc mb-2">  {t("Account.NewPassword")}</label>
                                <input
                                    type="password"
                                    placeholder="Enter new password"
                                    className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm"
                                />
                            </div>

                            {/* Confirm New Password */}
                            <div className="flex flex-col mb-6">
                                <label className="text-textc mb-2">  {t("Account.ConfirmNewPassword")}</label>
                                <input
                                    type="password"
                                    placeholder="Confirm new password"
                                    className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm"
                                />
                            </div>

                            {/* UPDATE BUTTON */}
                            <div className="flex justify-end mt-4">

                                <Button
                                    variant="Setting"
                                    onClick={() => navigate("/")}
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

