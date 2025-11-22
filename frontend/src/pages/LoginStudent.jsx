import { useState } from "react";
import AuthTabs from "../components/common/AuthTabs";
import Input from "../components/common/Input"; // Composant Input réutilisable (scalabilité)
import Mascotte from "../assets/mascotte.svg";
import LogoLight from "../assets/LogoLight.svg";
import api from "../services/api"; // Instance Axios centralisée
import toast from "react-hot-toast"; // Notifications globales
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Button from "../components/common/Button"; // Bouton réutilisable

export default function LoginStudent() {

  // État des champs
  const [activeTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // États d'erreur (affichage sous Input)
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");

  // Gestion visibilité du mot de passe
  const [showPassword, setShowPassword] = useState(false);

  /**
   * ==============================
   *   SOUMISSION DU FORMULAIRE
   * ==============================
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le refresh de la page

    // Réinitialisation des erreurs
    setErrorEmail("");
    setErrorPassword("");

    /**
     * ======================
     *   VALIDATION FRONTEND
     * ======================
     */

    // Vérification email vide
    if (!email) {
      setErrorEmail("Email obligatoire");
      return;
    }

    // Vérification format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorEmail("Format email invalide");
      return;
    }

    // Vérification mot de passe vide
    if (!password) {
      setErrorPassword("Mot de passe obligatoire");
      return;
    }

    // Vérification longueur minimum
    if (password.length < 8) {
      setErrorPassword("Minimum 8 caractères");
      return;
    }

    /**
     * ======================
     *   REQUÊTE BACKEND
     * ======================
     */
    try {
      // Envoi des identifiants
      const res = await api.post("login/", { email, password });

      // Notification succès
      toast.success("Connexion réussie !");

      // Redirection vers tableau de bord étudiant
      window.location.href = "/dashboard-etudiant";

    } catch (error) {

      const backend = error.response?.data;
      console.log("Erreur backend login étudiant:", backend);

      /**
       * =========================================
       *   TRAITEMENT DES ERREURS DU BACKEND
       * =========================================
       */
      if (backend && typeof backend === "object") {
        const newErrors = {};

        const mapKey = {
          adresse_email: "email",
          email: "email",
          mot_de_passe: "password",
          password: "password",
          non_field_errors: "password",
          detail: "password",
          error: "password" // Souvent "Mot de passe incorrect"
        };

        // Transformation des erreurs backend → erreurs UI
        Object.keys(backend).forEach((key) => {
          const value = Array.isArray(backend[key]) ? backend[key][0] : backend[key];
          const target = mapKey[key] || key;
          newErrors[target] = value;
        });

        // Injection des erreurs dans les setters React
        if (newErrors.email) setErrorEmail(newErrors.email);
        if (newErrors.password) setErrorPassword(newErrors.password);

        return;
      }

      // Cas exceptionnel : aucun message backend
      setErrorPassword("Erreur réseau");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">

      {/* Logo en haut à gauche */}
      <div className="absolute top-4 left-4">
        <img src={LogoLight} alt="Logo" className="w-32" />
      </div>

      {/* Composant d’onglets réutilisable : Student / Teacher */}
      <AuthTabs role="student" active="signin" />

      <div className="flex w-[1000px] min-h-[550px] bg-white rounded-3xl shadow-lg overflow-hidden relative pt-12">

        {/* ============================== */}
        {/*         COLONNE FORMULAIRE      */}
        {/* ============================== */}
        <div className="w-1/2 p-10">

          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
            Welcome to <span className="text-[#4F9DDE]">connect</span>
          </h2>

          {/* FORMULAIRE */}
          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* Champ Email */}
            <Input
              label="Email address"
              name="email"
              placeholder="Email address"
              icon={<FaEnvelope />}
              onChange={(e) => setEmail(e.target.value)}
              error={errorEmail}
            />

            {/* Champ Mot de passe + icône affichage */}
            <Input
              label="Enter your Password"
              name="password"
              icon={<FaLock />}
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errorPassword}
              rightIcon={
                showPassword ? (
                  <FaEyeSlash size={18} onClick={() => setShowPassword(false)} />
                ) : (
                  <FaEye size={18} onClick={() => setShowPassword(true)} />
                )
              }
            />

            {/* Lien vers inscription */}
            <p className="text-sm text-gray-500 text-center mt-4">
              Don't have an account?{" "}
              <a href="StudentSignUp" className="text-[#4F9DDE] font-medium hover:underline">
                Sign up
              </a>
            </p>

            {/* Bouton d’envoi */}
            <Button text="Sign in" variant="primary" type="submit" />
          </form>
        </div>

        {/* ============================== */}
        {/*            COLONNE VISUEL       */}
        {/* ============================== */}
        <div className="w-1/2 relative flex items-center justify-center bg-white">

          {/* message */}
          <div className="absolute top-4 right-4 bg-white rounded-xl shadow p-9 w-max min-h-[80px] z-20">
            <p className="text-gray-700 font-medium text-sm">
              Welcome, dear <br /> student!
            </p>

            {/* Icône "<>" décorative */}
            <div
              className="absolute -top-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center shadow"
            >
              <span className="text-[#4F9DDE] text-[20px] font-bold">
                &lt;&gt;
              </span>
            </div>
          </div>

          {/* Effet lumineux bleu */}
          <div
            className="absolute w-72 h-72 rounded-full blur-3xl"
            style={{
              background: "rgba(52,144,220,0.6)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)"
            }}
          />

          {/* Mascotte */}
          <img src={Mascotte} alt="Robot Mascotte" className="w-72 z-10" />
        </div>
      </div>
    </div>
  );
}
