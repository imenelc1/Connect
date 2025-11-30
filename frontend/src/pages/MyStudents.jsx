import React, { useState,useContext } from "react";
import { Search, Bell } from "lucide-react";
import Navbar from "../components/common/Navbar";
import Button from "../components/common/Button";
import Cards2 from "../components/common/Cards2";
import AddModal from "../components/common/AddModel";
import UserCircle from "../components/common/UserCircle";
import "../styles/index.css";
import { useTranslation } from "react-i18next"; // Pour support multilingue

import ThemeContext from "../context/ThemeContext";


export default function MyStudents() {

  const { t } = useTranslation("myStudents"); // Aller chercher les textes depuis le fichier de traduction
  const [modal, setModal] = useState(false); // Gère l’ouverture/fermeture du modal
  const [email, setEmail] = useState(""); // Champ email du futur étudiant à ajouter
  const [studentID, setStudentID] = useState(""); // Champ identifiant de l’étudiant
  const [space, setSpace] = useState(""); // Classe/Espace auquel l'étudiant sera affecté

  // Liste temporaire (mock data) — normalement viendra de la DB / API
  const students = [
    { name: "Hamouche Meriem", course: "Mobile Design Patterns", progress: 100, lastActive: "3h ago", bg: "bg-grad-2" },
    { name: "Imene Lakhdar Chaouch", course: "Mobile Design Patterns", progress: 30, lastActive: "3h ago", bg: "bg-grad-3" },
    { name: "Albane Amina", course: "Mobile Design Patterns", progress: 100, lastActive: "2h ago", bg: "bg-grad-4" },
    { name: "Azidane Chahla", course: "Mobile Design Patterns", progress: 100, lastActive: "1h ago", bg: "bg-grad-2" },
  ];

  // Action quand on valide le modal
  const handleSubmit = (e) => {
    e.preventDefault();  // Empêche le refresh de la page
    setModal(false);     // Ferme le modal après l’envoi
  };


  const { toggleDarkMode } = useContext(ThemeContext);

  return (
    <div className="flex w-full">

      {/* ========== NAVBAR ========== */}
      {/* Affichée uniquement sur Desktop → cachée sur mobiles/tablettes */}
      <Navbar className="hidden lg:block" />

      {/* Zone principale de la page */}
      <main className="lg:ml-60 w-full min-h-screen px-4 sm:px-6 py-6 bg-bg">

        {/* ========== HEADER ========== */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl md:text-5xl font-semibold text-muted text-3d">
            {t("myStudentsTitle")} {/* titre venant du fichier de traduction */}
          </h1>

          {/* Icônes à droite du header */}
          <div className="flex items-center gap-4">
            <Bell className="w-5 h-5 text-gray-600 cursor-pointer" fill="currentColor" />
            <UserCircle initials="MH" onToggleTheme={toggleDarkMode} /> {/* Avatar simple avec initiales */}
          </div>
        </div>

        {/* ========== BARRE DE RECHERCHE & ACTIONS ========== */}
        <div className="mt-5 w-full flex flex-wrap items-center gap-4 lg:flex-nowrap">

          {/* Champ de recherche étudiant */}
          <div className="relative flex-1 min-w-[280px] lg:min-w-[450px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 
              text-blue-500 w-5 h-5" />
            <input
              type="text"
              placeholder={t("searchStudentPlaceholder")}
              className="w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Boutons à droite = ajout espace / ajout étudiant */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto lg:ml-auto">

            {/* Bouton créer un espace */}
            <Button className="!px-6 !py-2 w-full sm:w-auto">
              {t("createSpace")}
            </Button>

            {/* Bouton ouvrir modal d'ajout étudiant */}
            <Button onClick={() => setModal(true)}
              className="!px-6 !py-2 w-full sm:w-auto">
              {t("addStudent")}
            </Button>
          </div>
        </div>

        {/* ========== LISTE D'ÉTUDIANTS ========== */}
        <div className="mt-10 grid gap-6 
          md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

          {/* On boucle sur la liste students */}
          {students.map((st, i) => (
            <Cards2
              key={i}
              icon={<UserCircle initials={st.name.split(" ").map(n => n[0]).join("").slice(0, 2)} />}
              roundedIcon={true}
              title={st.name}
              description={st.course}
              progress={st.progress} // barre de progression d'avancement
              status={`${t("active")} ${st.lastActive}`} // ex : "Active 3h ago"
              className={`${st.bg} rounded-xl shadow-md border p-6`}
            />
          ))}
        </div>

        {/* ========== PAGINATION ========== */}
        <div className="flex justify-center gap-4 mt-10 text-sm">
          <span className="cursor-pointer">&lt;</span>
          <span className="cursor-pointer hover:bg-secondary/80 px-2 rounded">1</span>
          <span className="cursor-pointer hover:bg-secondary/80 px-2 rounded">2</span>
          <span className="cursor-pointer hover:bg-secondary/80 px-2 rounded">3</span>
          <span className="cursor-pointer">&gt;</span>
        </div>

        {/* ========== MODAL D’AJOUT ÉTUDIANT ========== */}
        <AddModal
          open={modal}
          onClose={() => setModal(false)}
          title={t("addStudentTitle")}
          subtitle={t("addStudentSubtitle")}
          submitLabel={t("addStudentSubmit")}
          cancelLabel={t("addStudentCancel")}
          onSubmit={handleSubmit}
          fields={[
            // Champs remplis dans le modal
            { label: t("email"), placeholder: t("emailPlaceholder"), value: email, onChange: e => setEmail(e.target.value) },
            { label: t("studentID"), placeholder: t("studentIDPlaceholder"), value: studentID, onChange: e => setStudentID(e.target.value) },
            {
              label: t("space"),
              // Menu déroulant pour choisir un espace
              element: (
                <select value={space} onChange={e => setSpace(e.target.value)} className="w-full border rounded px-3 py-2 text-black/80">
                  <option value="UI/UX Class">{t("UIUXClass")}</option>
                  <option value="Mobile Design">{t("mobileDesign")}</option>
                  <option value="Web Development">{t("webDevelopment")}</option>
                  <option value="Data Science">{t("dataScience")}</option>
                </select>
              )
            }
          ]}
        />

      </main>
    </div>
  );
}
