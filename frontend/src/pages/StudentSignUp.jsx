import React, { useState } from "react";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import AuthTabs from "../components/common/AuthTabs";
import logo from "../assets/LogoLight.svg";
import robot from "../assets/mascotte.svg";
import googleIcon from "../assets/google-icon.svg";
import api from "../services/api";
import {
  FaUser, FaEnvelope, FaLock, FaCalendarAlt, FaIdBadge,
  FaGraduationCap, FaPaperPlane, FaEye, FaEyeSlash, FaStar
} from "react-icons/fa";
import toast from "react-hot-toast";

const Select = ({ label, icon, name, value, onChange, options }) => (
  <div className="flex flex-col mb-4">
    <label className="mb-1 font-semibold text-gray-700">{label}</label>
    <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-white">
      {icon && <span className="mr-2 text-gray-400">{icon}</span>}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="flex-1 outline-none bg-transparent cursor-pointer font-inherit appearance-none"
      >
        <option value="">Select an option</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  </div>
);

const StudentSignup = () => {
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

  // --- CHANGE HANDLER ---
  const handleChange = e => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

    setErrors(prev => ({ ...prev, [name]: "" }));

    if (name === "password" && value.length < 8)
      setErrors(prev => ({ ...prev, password: "Minimum 8 caractères" }));

    if (name === "confirm" && value !== formData.password)
      setErrors(prev => ({ ...prev, confirm: "Les mots de passe ne correspondent pas" }));
  };
  
  
// --- VALIDATION GLOBALE ---
const validateForm = () => {
  const newErrors = {};

  // Champs obligatoires
  if (!formData.nickname) newErrors.nickname = "Champ obligatoire";
  if (!formData.fullname) newErrors.fullname = "Champ obligatoire";
  if (!formData.email) {
  newErrors.email = "Email obligatoire";
} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
  newErrors.email = "Format d'email invalide";
}
  if (!formData.password) newErrors.password = "Mot de passe obligatoire";
  if (formData.password.length < 8) newErrors.password = "Minimum 8 caractères";

  if (formData.confirm !== formData.password)
    newErrors.confirm = "Mot de passe non identique";

  if (!formData.dob) newErrors.dob = "Champ obligatoire";
  if (!formData.regnumber) newErrors.regnumber = "Champ obligatoire";
  if (!formData.field) newErrors.field = "Champ obligatoire";
  if (!formData.year) newErrors.year = "Champ obligatoire";

  // Matricule : 12 chiffres
  if (formData.regnumber && !/^\d{12}$/.test(formData.regnumber)) {
    newErrors.regnumber =
      "Matricule invalide (format: année BAC + numéro du diplôme du bac)";
  }

  // Âge minimum 16 ans
  if (formData.dob) {
    const birthDate = new Date(formData.dob);
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 16);

    if (birthDate > minDate) {
      newErrors.dob = "Vous devez avoir au moins 16 ans.";
    }
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


  // --- SUBMIT ---
  const handleSubmit = async e => {
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
      specialite: formData.field,
      annee_etude: formData.year,
      role: "etudiant",
    };

    try {
      await api.post("register/", payload);

      toast.success("Inscription réussie !");
      setTimeout(() => (window.location.href = "/dashboard-etudiant"), 1500);

    } catch (err) {
      const backend = err.response?.data;
      console.log("Erreur backend:", backend);

      const newErrors = {};

      // Email déjà utilisé
      if (backend?.adresse_email) {
        newErrors.email = backend.adresse_email[0];
      }

      // Matricule déjà utilisé
      if (backend?.matricule) {
        newErrors.regnumber = backend.matricule[0];
      }

      // Autres erreurs
      if (backend) {
        const msg = Object.values(backend).flat().join("\n");
        toast.error(msg);
      }

      setErrors(prev => ({ ...prev, ...newErrors }));
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-0"
      style={{ backgroundColor: "#f5f9fd" }}
    >
      <div className="w-full flex items-center justify-between px-8 py-5 relative">
        <div className="flex-shrink-0">
          <img src={logo} alt="Connect Logo" className="w-28 md:w-36 h-auto" />
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2">
           <AuthTabs role="student" active="signup" />
        </div>

        <div className="w-32"></div>
      </div>

      <div
        className="max-w-6xl w-full bg-white rounded-2xl shadow-2xl flex overflow-hidden"
        style={{ boxShadow: "0 6px 48px 0 rgba(52,144,220,.12)" }}
      >
        <div className="flex-1 p-10 bg-white">
          <h2 className="text-2xl font-semibold text-slate-700 mb-6">
            Welcome to <span className="text-sky-500">connect</span>
          </h2>
 
         <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Enter your nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                placeholder="Nickname"
                icon={<FaUser />}
                error={errors.nickname}
              />

              <Input
                label="Enter your name"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                placeholder="Full name"
                icon={<FaUser />}
                error={errors.fullname}
              />
            </div>

            <Input
              label="Enter your Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              icon={<FaEnvelope />}
              error={errors.email}
            />

            <Input
              label="Enter your Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              icon={<FaLock />}
             
              rightIcon={
                showPassword
                  ? <FaEyeSlash onClick={() => setShowPassword(!showPassword)} className="cursor-pointer" />
                  : <FaEye onClick={() => setShowPassword(!showPassword)} className="cursor-pointer" />
              }
              error={errors.password}
            />

            <Input
              label="Confirm your password"
              name="confirm"
              type={showConfirm ? "text" : "password"}
              value={formData.confirm}
              onChange={handleChange}
              placeholder="Confirm password"
              icon={<FaLock />}
              
              rightIcon={
                showConfirm
                  ? <FaEyeSlash onClick={() => setShowConfirm(!showConfirm)} className="cursor-pointer" />
                  : <FaEye onClick={() => setShowConfirm(!showConfirm)} className="cursor-pointer" />
              }
              error={errors.confirm}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Enter your date of birth"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                placeholder="Date of birth"
                icon={<FaCalendarAlt />}
                
                error={errors.dob}
              />

              <Input
                label="Enter your registration number"
                name="regnumber"
                value={formData.regnumber}
                onChange={handleChange}
                placeholder="Registration number"
                icon={<FaIdBadge />}
                
                 error={errors.regnumber}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
<div className="w-full">
  <label className="block mb-1 text-sm font-medium text-gray-700">
    Enter your field of study
  </label>

  <div className="relative">
    <select
      name="field"
      value={formData.field}
      onChange={handleChange}
      className={`w-full p-3 pl-10 rounded-lg border ${
        errors.field ? "border-red-500" : "border-gray-300"
      }`}
    >
      <option value="">-- Select your field --</option>
      <option value="informatique">Informatique</option>
      <option value="mathematiques">Mathématiques</option>
      <option value="genie_civil">Génie Civil</option>
      <option value="genie_electrique">Génie Électrique</option>
      <option value="genie_mecanique">Génie Mécanique</option>
      <option value="biologie">Biologie</option>
    </select>

    {/* Icône à gauche comme dans ton Input */}
    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500">
      <FaStar />
    </span>
  </div>

  {errors.field && (
    <p className="text-red-500 text-sm mt-1">{errors.field}</p>
  )}
</div>

              <Select
                label="Enter your academic year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                icon={<FaGraduationCap/>}
                options={["L1", "L2", "L3", "Ing1", "Ing2", "Ing3", "M1", "M2"]}
                 error={errors.year}
              />
            </div>

            <div className="text-center text-gray-400">Or</div>

            <Button text="Continue with Google" variant="google" />
           

            <Button type="submit" variant="primary">
              <FaPaperPlane className="inline mr-2" /> Sign up
            </Button>

            <p className="text-sm text-gray-500 text-center">
              Already have an account?{" "}
              <a href="/LoginStudent" className="text-sky-500">Sign in</a>
            </p>
          </form>
        </div>

       {/* --- RIGHT SIDE --- */}
               <div className="flex-1 flex items-center justify-center relative bg-white overflow-hidden">
       
                 <div
                   className="absolute w-72 h-72 rounded-full blur-3xl"
                   style={{
                     background: "rgba(52,144,220,0.6)",
                     top: "50%",
                     left: "50%",
                     transform: "translate(-50%, -50%)"
                   }}
                 />
       
                 <div
                   className="absolute w-12 h-12 rounded-full flex items-center justify-center z-20"
                   style={{
                     backgroundColor: "#FFFFFF",
                     border: "2px solid rgba(0,0,0,0.13)",
                     top: "50px",
                     right: "40px"
                   }}
                 >
                   <span
                     style={{
                       color: "#3490DC",
                       fontSize: "22px",
                       fontWeight: "bold"
                     }}
                   >
                     &lt;&gt;
                   </span>
                 </div>
       
                 <div className="absolute z-10" style={{ top: "70px", right: "40px" }}>
                   <svg
                     xmlns="http://www.w3.org/2000/svg"
                     width="300"
                     height="175"
                     viewBox="0 0 331 193"
                     fill="none"
                   >
                     <g filter="url(#filter0_dd)">
                       <path
                         d="M11 22C11 13.7157 17.7157 7 26 7H304.372C312.656 7 319.372 13.7157 319.372 22V162.204C319.372 170.488 312.656 177.204 304.372 177.204H26C17.7157 177.204 11 170.488 11 162.204V22Z"
                         fill="white"
                         fillOpacity="0.97"
                       />
                       <path
                         d="M26 7.5H304.372C312.38 7.50008 318.872 13.9919 318.872 22V162.204C318.872 170.212 312.38 176.704 304.372 176.704H26C17.9919 176.704 11.5 170.212 11.5 162.204V22C11.5 13.9919 17.9919 7.5 26 7.5Z"
                         stroke="black"
                         strokeOpacity="0.13"
                       />
                     </g>
                     <text
                       x="50%"
                       y="50%"
                       textAnchor="middle"
                       dominantBaseline="middle"
                       fontSize="20"
                       fontWeight="500"
                       fill="#000"
                     >
                       Join CONNECT, dear Student!
                     </text>
                   </svg>
                 </div>
       
                 <img
                   src={robot}
                   alt="robot"
                   className="max-w-xs md:max-w-md drop-shadow-lg relative z-10"
                 />
               </div>
             </div>
           </div>
         );
       };

export default StudentSignup;
