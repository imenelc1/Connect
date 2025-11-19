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
  FaGraduationCap, FaPaperPlane, FaEye, FaEyeSlash
} from "react-icons/fa";

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = e =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();

    if (formData.password !== formData.confirm) {
      setMessage("Les mots de passe ne correspondent pas !");
      return;
    }

    // Mapping pour Django
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
      const res = await api.post("register/", payload); // 🔥 API Axios

      setMessage("Inscription réussie ! ");

      setTimeout(() => {
        window.location.href = "/login-etudiant";
      }, 1500);

    } catch (err) {
      console.log("Erreur API:", err);

      // 🔥 Protection contre erreur réseau
      setMessage(
        err.response?.data?.error ||
        "Erreur réseau, vérifie que Django tourne bien"
      );
    }
  };


  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-0"
      style={{ backgroundColor: "#f5f9fd" }}
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between px-8 py-5 relative">
        <div className="flex-shrink-0">
          <img src={logo} alt="Connect Logo" className="w-28 md:w-36 h-auto" />
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2">
           <AuthTabs role="student" active="signup" />
        </div>

        <div className="w-32"></div>
      </div>

      {/* Formulaire + mascotte */}
      <div
        className="max-w-6xl w-full bg-white rounded-2xl shadow-2xl flex overflow-hidden"
        style={{ boxShadow: "0 6px 48px 0 rgba(52,144,220,.12)" }}
      >

        {/* Formulaire */}
        <div className="flex-1 p-10 bg-white">
          <h2 className="text-2xl font-semibold text-slate-700 mb-6">
            Welcome to <span className="text-sky-500">connect</span>
          </h2>

          {message && (
            <p className="text-center text-red-500 mb-4 font-semibold">
              {message}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Enter your nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                placeholder="Nickname"
                icon={<FaUser />}
              />
              <Input
                label="Enter your name"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                placeholder="Full name"
                icon={<FaUser />}
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
              />
              <Input
                label="Enter your registration number"
                name="regnumber"
                value={formData.regnumber}
                onChange={handleChange}
                placeholder="Registration number"
                icon={<FaIdBadge />}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Enter your field of study"
                name="field"
                value={formData.field}
                onChange={handleChange}
                placeholder="Field of study"
                icon={<FaGraduationCap />}
              />
              <Select
                label="Enter your academic year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                icon={<FaGraduationCap />}
                options={["L1", "L2", "L3", "Ingenieur"]}
              />
            </div>

            <div className="text-center text-gray-400">Or</div>

            <Button variant="outline">
              <img src={googleIcon} alt="google" className="inline-block w-5 h-5 mr-2" />
              Continue with Google
            </Button>

            <Button type="submit" variant="primary">
              <FaPaperPlane className="inline mr-2" /> Sign up
            </Button>

            <p className="text-sm text-gray-500 text-center">
              Already have an account?{" "}
              <a href="/login-etudiant" className="text-sky-500">Sign in</a>
            </p>
          </form>
        </div>

        {/* Mascotte */}
        <div className="flex-1 flex items-center justify-center relative bg-white overflow-hidden">
          <img src={robot} alt="robot" className="max-w-xs md:max-w-md drop-shadow-lg relative z-10" />
        </div>
      </div>
    </div>
  );
};

export default StudentSignup;
