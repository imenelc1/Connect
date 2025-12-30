import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export default function WelcomeResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams(); // récupère le token depuis l'URL
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) return setError("Mot de passe trop court");
    if (password !== confirm) return setError("Les mots de passe ne correspondent pas");
    if (!token) return setError("Token manquant");

    try {
      await api.post("users/reset-password/", { token, new_password: password });
      toast.success("Mot de passe mis à jour");
      navigate("/dashboard-etu");
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <form onSubmit={handleSubmit} className="bg-card p-8 rounded-xl shadow w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Bienvenue 👋</h2>
        <p className="text-sm text-muted mb-6 text-center">
          Veuillez définir votre nouveau mot de passe
        </p>
        <input type="password" placeholder="Nouveau mot de passe" className="input mb-4" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="password" placeholder="Confirmer le mot de passe" className="input mb-4" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button className="btn-primary w-full">Confirmer</button>
      </form>
    </div>
  );
}
