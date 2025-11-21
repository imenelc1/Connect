import { useState } from "react";
import AuthTabs from "../components/common/AuthTabs";
import Input from "../components/common/Input";
import Divider from "../components/common/Divider";
import GoogleButton from "../components/common/GoogleButton";
import PrimaryButton from "../components/common/PrimaryButton";
import Mascotte from "../assets/mascotte.svg";
import LogoLight from "../assets/LogoLight.svg";
import api from "../services/api";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";
import useI18n from "../i18n";

export default function LoginInstructor() {
  const [activeTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { language, toggleLanguage, t } = useI18n();

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

  return (
    // RESPONSIVE: Padding horizontal sur mobile
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 sm:px-0">
      
      {/* BOUTON DE LANGUE - RESPONSIVE: Position relative sur mobile, absolute sur desktop */}
      <div className="relative sm:absolute top-4 right-4 mb-4 sm:mb-0">
        <button
          onClick={toggleLanguage}
          className="px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-sm font-medium text-gray-700 border border-gray-200 flex items-center gap-2"
        >
          {language === 'fr' ? (
            <>
              <span>Français</span>
              <span>FR</span>
            </>
          ) : (
            <>
              <span>English</span>
              <span>EN</span>
            </>
          )}
        </button>
      </div>

      {/* RESPONSIVE: Logo position relative sur mobile, absolute sur desktop */}
      <div className="relative sm:absolute top-4 left-4 mb-4 sm:mb-0">
        <img src={LogoLight} alt="Logo" className="w-32" />
      </div>
        
      {/* RESPONSIVE: AuthTabs avec margin top sur mobile */}
      <AuthTabs role="instructor" active="signin" className="mt-8 sm:mt-0" />
       
      {/* RESPONSIVE: Conteneur principal - colonne sur mobile, ligne sur desktop */}
      <div className="flex flex-col lg:flex-row w-full max-w-[1000px] min-h-[650px] bg-white rounded-3xl shadow-lg overflow-hidden relative pt-12 mt-5">

        {/* FORMULAIRE - RESPONSIVE: Largeur 100% sur mobile, 1/2 sur desktop */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-10">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
            {t("login.title")} <span className="text-[#4F9DDE]">{t("login.connect")}</span>
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
                    className="cursor-pointer text-gray-500 hover:text-gray-700"
                  />
                ) : (
                  <FiEye
                    size={18}
                    onClick={() => setShowPassword(true)}
                    className="cursor-pointer text-gray-500 hover:text-gray-700"
                  />
                )
              }
            />

            <Divider text={t("login.or")} />
            <GoogleButton />

            <p className="text-sm text-gray-500 text-center mt-4">
              {t("login.noAccount")}{" "}
              <a href="InstructorSignUp" className="text-[#4F9DDE] font-medium hover:underline">
                {t("login.signUp")}
              </a>
            </p>

            <PrimaryButton text={t("login.signIn")} type="submit" />
          </form>
        </div>

        {/* MASCOTTE - RESPONSIVE: Largeur 100% sur mobile, 1/2 sur desktop avec hauteur fixe */}
        <div className="w-full lg:w-1/2 relative flex items-center justify-center bg-white min-h-[400px] lg:min-h-0">
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