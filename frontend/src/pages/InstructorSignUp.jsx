import React, { useState } from "react";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import AuthTabs from "../components/common/AuthTabs";
import logo from "../assets/LogoLight.svg";
import robot from "../assets/mascotte.svg";
import googleIcon from "../assets/google-icon.svg";
import api from "../services/api";

import { FaEye, FaEyeSlash, FaPaperPlane } from "react-icons/fa";
import toast from "react-hot-toast";

const InstructorSignup = () => {
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

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const newErrors = {};

    // 🔍 Validation
    if (!formData.nickname.trim())
      newErrors.nickname = "Pseudo obligatoire.";

    if (!formData.fullname.trim())
      newErrors.fullname = "Nom complet obligatoire.";

    if (!formData.email.trim())
      newErrors.email = "Email obligatoire.";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Email invalide.";

    if (!formData.password.trim())
      newErrors.password = "Mot de passe obligatoire.";
    else if (formData.password.length < 8)
      newErrors.password = "Minimum 8 caractères.";

    if (!formData.confirm.trim())
      newErrors.confirm = "Confirmez votre mot de passe.";
    else if (formData.confirm !== formData.password)
      newErrors.confirm = "Les mots de passe ne correspondent pas.";

    if (!formData.dob.trim())
      newErrors.dob = "Date de naissance obligatoire.";

    if (!formData.regnumber.trim())
      newErrors.regnumber = "Matricule obligatoire.";

    if (!formData.rank.trim())
      newErrors.rank = "Grade obligatoire.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    // 🔥 Payload Django
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
      toast.success("Inscription réussie !");

      setTimeout(() => {
        window.location.href = "/dashboard-instructor";
      }, 1500);

    } catch (err) {
      const errorsApi = err.response?.data;

      if (errorsApi) {
        if (errorsApi.error) {
          toast.error(errorsApi.error);
          return;
        }

        const msg = Object.values(errorsApi).flat().join("\n");
        toast.error(msg);
        return;
      }

      toast.error("Erreur réseau. Vérifiez Django.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-8 bg-[#f5f9fd]">
      <header className="w-full relative flex items-center justify-center py-4 mb-8">
        <img src={logo} alt="Connect Logo" className="absolute left-6 w-28 md:w-36" />

        <AuthTabs role="instructor" active="signup" />
      </header>

      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-2xl flex overflow-hidden">

        {/* LEFT FORM */}
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
                icon="user"
                error={errors.nickname}
              />

              <Input
                label="Enter your full name"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                placeholder="Full name"
                icon="user"
                error={errors.fullname}
              />
            </div>

            <Input
              label="Enter your email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              type="email"
              icon="email"
              error={errors.email}
            />

            <Input
              label="Enter your password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              icon="lock"
              error={errors.password}
              rightIcon={
                showPassword ? (
                  <FaEyeSlash onClick={() => setShowPassword(!showPassword)} />
                ) : (
                  <FaEye onClick={() => setShowPassword(!showPassword)} />
                )
              }
            />

            <Input
              label="Confirm password"
              name="confirm"
              type={showConfirm ? "text" : "password"}
              value={formData.confirm}
              onChange={handleChange}
              placeholder="Confirm password"
              icon="lock"
              error={errors.confirm}
              rightIcon={
                showConfirm ? (
                  <FaEyeSlash onClick={() => setShowConfirm(!showConfirm)} />
                ) : (
                  <FaEye onClick={() => setShowConfirm(!showConfirm)} />
                )
              }
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Enter your date of birth"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                icon="calendar"
                error={errors.dob}
              />

              <Input
                label="Enter your registration number"
                name="regnumber"
                value={formData.regnumber}
                onChange={handleChange}
                placeholder="Registration number"
                icon="badge"
                error={errors.regnumber}
              />
            </div>

            <Input
              label="Enter your rank"
              name="rank"
              value={formData.rank}
              onChange={handleChange}
              placeholder="Rank"
              icon="star"
              error={errors.rank}
            />

            <div className="text-center text-gray-400">Or</div>

            <Button text="Continue with Google" variant="google" />

            <Button type="submit" variant="primary">
              <FaPaperPlane className="inline mr-2" /> Sign up
            </Button>

            <p className="text-sm text-gray-500 text-center">
              Already have an account?
              <a href="/LoginInstructor" className="text-sky-500"> Sign in</a>
            </p>
          </form>
        </div>

        {/* RIGHT SIDE IMAGE */}
        <div className="flex-1 flex items-center justify-center bg-white relative">
          <img src={robot} alt="robot" className="max-w-xs md:max-w-md z-10" />
        </div>
      </div>
    </div>
  );
};

export default InstructorSignup;
