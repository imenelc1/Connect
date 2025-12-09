import { useState } from "react";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import api from "../services/api";
import toast from "react-hot-toast";
import { FaEnvelope } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function ForgotPassword() {
  const { t } = useTranslation("login");
  const [email, setEmail] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorEmail("");

    if (!email) {
      setErrorEmail(t("errors.emailRequired"));
      return;
    }

    try {
      setLoading(true);
      await api.post("password/forgot/", { email });
      setSubmitted(true); // Affiche message “Check your email”
    } catch (error) {
      const backend = error.response?.data;
      if (typeof backend?.error === "string") {
        setErrorEmail(backend.error);
        toast.error(backend.error);
        return;
      }
      toast.error(t("login.error"));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-card p-6 rounded-2xl shadow-lg w-full max-w-md text-center">
          <h2 className="text-xl font-semibold mb-4">{t("login.checkEmail")}</h2>
          <p>{t("login.emailSentTo")}: {email}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-card p-6 rounded-2xl shadow-lg w-full max-w-md space-y-5"
      >
        <h2 className="text-xl font-semibold text-center">
          {t("login.forgotPassword")}
        </h2>

        <Input
          label={t("login.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("login.email")}
          icon={<FaEnvelope />}
          error={errorEmail}
        />

        <Button
          text={loading ? t("login.sending") + "..." : t("login.sendLink")}
          type="submit"
        />
      </form>
    </div>
  );
}
