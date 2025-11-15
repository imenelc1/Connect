import { useState } from "react";
import AuthTabs from "../components/common/AuthTabs";
import InputField from "../components/common/InputField";
import Divider from "../components/common/Divider";
import GoogleButton from "../components/common/GoogleButton";
import PrimaryButton from "../components/common/PrimaryButton";
import Mascotte from "../assets/mascotte.svg";
import LogoLight from "../assets/LogoLight.svg";

export default function LoginInstructor() {
  const [activeTab, setActiveTab] = useState("signin");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Logo en haut à gauche */}
<div className="absolute top-4 left-4">
  <img src={LogoLight} alt="Logo" className="w-32" />
</div>

      
      {/* Boutons Sign in / Sign up au-dessus du cadre */}
<AuthTabs role="instructor" active="signin" />


      {/* Cadre principal */}
      <div className="flex w-[1000px] min-h-[550px] bg-white rounded-3xl shadow-lg overflow-hidden relative  pt-12">
        
        {/* Partie gauche : formulaire */}
        <div className="w-1/2 p-10">
          
           <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6 w-full">
            Welcome to <span className="text-blue-500">connect</span>
          </h2>
          <form className="space-y-4">
            <InputField
              label=" email address"
              placeholder=" email address"
              icon="email"
            />
            <InputField
              label="Enter your Password"
              placeholder="Password"
              type="password"
              icon="password"
              showForgot={true}   
            />
            <Divider text="Or" />
            <GoogleButton />
            <p className="text-sm text-gray-500 text-center mt-4">
              Don't have an account?{" "}
              <a href="#" className="text-blue-500 font-medium hover:underline">
                Sign in
              </a>
            </p>
            <PrimaryButton
              text={activeTab === "signin" ? "Sign in" : "Sign up"}
              type="submit"
            />
          </form>
        </div>

        {/* Partie droite : robot */}
<div className="w-1/2 relative flex items-center justify-center bg-white">

  {/* Rectangle "Welcome, dear instructor!" */}
  <div className="absolute top-4 right-4 bg-white rounded-xl shadow p-9 w-max min-h-[80px] z-20">
    <p className="text-gray-700 font-medium text-sm">
      Welcome, dear <br></br>instructor!
    </p>

    {/* Petit cercle en haut à droite */}
     <div
    className="absolute -top-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center shadow"
    style={{ backgroundColor: "#FFFFFF" }}   // cercle blanc
  >
    <span style={{ color: "#4F9DDE", fontSize: "20px", fontWeight: "bold" }}>
      &lt;&gt;
    </span>
  </div>
  </div>
  {/* Fond nuage bleu clair derrière le robot */}
    <div className="absolute w-72 h-72 rounded-full blur-3xl" style={{ background: "rgba(52,144,220,0.6)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />

  {/* Robot */}
  <img src={Mascotte} alt="Robot Mascotte" className="w-72 z-10" />
</div>


      </div>
    </div>
  );
}
