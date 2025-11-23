import { useState } from "react";
import AuthTabs from "../components/common/AuthTabs";
import Input from "../components/common/Input";
import Divider from "../components/common/Divider";
import GoogleButton from "../components/common/GoogleButton";
import Mascotte from "../assets/mascotte.svg";
import LogoComponent from "../components/common/LogoComponent";
import api from "../services/api";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff,FiGlobe } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import Button from "../components/common/Button";
import { useContext } from "react";
// Thème global (dark/light mode)
import ThemeContext from "../context/ThemeContext";
import ThemeButton from "../components/common/ThemeButton";

export default function LoginInstructor() {
  const [activeTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

   // Traduction (espace de noms : "login")
    const { t, i18n } = useTranslation("login");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorEmail("");
    setErrorPassword("");

    if (!email) {
      setErrorEmail(t("errors.emailRequired"));
      return;
    }
    if (!password) {
      setErrorPassword(t("errors.passwordRequired"));
      return;
    }
    if (password.length < 8) {
      setErrorPassword(t("errors.passwordLength"));
      return;
    }

    try {
      const res = await api.post("login/", { email, password });
      toast.success(t("success.login"));
      window.location.href = "/dashboard-enseignant";
    } catch (error) {
      const backendError = error.response?.data?.error;
      if (backendError) {
        const msg = backendError.toLowerCase();
        if (msg.includes("utilisateur") || msg.includes("email")) {
          setErrorEmail(t("errors.emailNotFound"));
          return;
        }
        if (msg.includes("mot de passe")) {
          setErrorPassword(t("errors.wrongPassword"));
          return;
        }
        setErrorPassword(backendError);
        return;
      }
      setErrorPassword(t("errors.networkError"));
    }
  };

   //Permet de changer la langue (FR ↔ EN)
  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
  };
  
  // Récupération de la fonction permettant de changer le thème
  const { toggleDarkMode } = useContext(ThemeContext);

  return (
    // RESPONSIVE: Padding horizontal sur mobile
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface px-4 sm:px-0 pb-50">
      
      <div className="flex items-center justify-star w-full ml-20">
          
           <LogoComponent />
           {/* Bouton pour activer/désactiver le dark mode */}
           <ThemeButton onClick={toggleDarkMode} />

            {/* Bouton pour changer la langue */}
           <FiGlobe size={20} title="Changer la langue" onClick={toggleLanguage} />
        </div>
        
      {/* RESPONSIVE: AuthTabs avec margin top sur mobile */}
      <AuthTabs role="instructor" active="signin" className="mt-8 sm:mt-0" />
       
      {/* RESPONSIVE: Conteneur principal - colonne sur mobile, ligne sur desktop */}
     <div className="flex flex-col lg:flex-row w-full max-w-[1000px] min-h-[650px] bg-card/75 rounded-3xl shadow-lg overflow-hidden relative mt-5">

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
            />

            <Input 
              label={t("login.password")}
              name="password"
              placeholder={t("login.password")}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errorPassword}
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

            <Divider text={t("login.or")} />
            <GoogleButton />

            <p className="text-sm text-grayc text-center mt-4">
              {t("login.noAccount")}{" "}
              <a href="InstructorSignUp" className="text-muted font-medium hover:underline">
                {t("login.signUp")}
              </a>
            </p>

            <Button text={t("login.signIn")} type="submit" />
          </form>
        </div>

        {/* MASCOTTE - RESPONSIVE: Largeur 100% sur mobile, 1/2 sur desktop avec hauteur fixe */}
        <div className="w-full lg:w-1/2 relative flex items-center justify-center bg-card min-h-[400px] lg:min-h-0">
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
          <img src={Mascotte} alt="Robot Mascotte" className="w-48 sm:w-60 lg:w-73 z-10" />
        </div>

      </div>
    </div>
  );
}