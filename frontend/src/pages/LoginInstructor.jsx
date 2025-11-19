import { useState } from "react";
import AuthTabs from "../components/common/AuthTabs";
import Input from "../components/common/Input"; 
import Divider from "../components/common/Divider";
import Mascotte from "../assets/mascotte.svg";
import LogoLight from "../assets/LogoLight.svg";
import api from "../services/api";
import toast from "react-hot-toast";
import {FaEnvelope, FaLock, FaEye, FaEyeSlash} from "react-icons/fa";
import Button from "../components/common/Button";

export default function LoginInstructor() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset erreurs
    setErrorEmail("");
    setErrorPassword("");

    // --- Validation ---
    if (!email) {
      setErrorEmail("Email obligatoire");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
  setErrorEmail("Format email invalide");
  return;
}

    if (!password) {
      setErrorPassword("Mot de passe obligatoire");
      return;
    }
    if (password.length < 8) {
      setErrorPassword("Minimum 8 caractères");
      return;
    }

    try {
      const res = await api.post("login/", {
        email,
        password,
      });

      toast.success("Connexion réussie !");
      window.location.href = "/dashboard-enseignant";

    } catch (error) {
      const backendError = error.response?.data?.error;

      if (backendError) {
        const msg = backendError.toLowerCase();

        if (msg.includes("utilisateur") || msg.includes("email")) {
          setErrorEmail("Adresse email inconnue");
          return;
        }

        if (msg.includes("mot de passe")) {
          setErrorPassword("Mot de passe incorrect");
          return;
        }

        setErrorPassword(backendError);
        return;
      }

      setErrorPassword("Erreur réseau");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      
      {/* Logo */}
      <div className="absolute top-4 left-4">
        <img src={LogoLight} alt="Logo" className="w-32" />
      </div>

      {/* Tabs */}
      <AuthTabs role="instructor" active="signin" />

      {/* Cadre */}
      <div className="flex w-[1000px] min-h-[550px] bg-white rounded-3xl shadow-lg overflow-hidden relative pt-12">

        {/* Formulaire */}
        <div className="w-1/2 p-10">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
            Welcome to <span className="text-[#4F9DDE]">connect</span>
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* EMAIL */}
            <Input
              label="Email address"
              name="email"
              placeholder="Email address"
              icon={<FaEnvelope />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errorEmail}
            />

            {/* PASSWORD */}
            <Input
              label="Enter your Password"
              name="password"
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              icon={<FaLock />}
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

            <Divider text="Or" />

            <Button text="Continue with Google" variant="google" />

            <p className="text-sm text-gray-500 text-center mt-4">
              Don't have an account?{" "}
              <a href="/InstructorSignUp" className="text-[#4F9DDE] font-medium hover:underline">
                Sign up
              </a>
            </p>

           <Button text="Login" variant="primary" type="submit" />


          </form>
        </div>

        {/* MASCOTTE */}
        <div className="w-1/2 relative flex items-center justify-center bg-white">
          
          <div className="absolute top-4 right-4 bg-white rounded-xl shadow p-9 w-max min-h-[80px] z-20">
            <p className="text-gray-700 font-medium text-sm">
              Welcome, dear <br /> instructor!
            </p>

            <div
              className="absolute -top-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center shadow"
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

          <div
            className="absolute w-72 h-72 rounded-full blur-3xl"
            style={{
              background: "rgba(52,144,220,0.6)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />

          <img src={Mascotte} alt="Robot Mascotte" className="w-72 z-10" />
        </div>

      </div>
    </div>
  );
}
