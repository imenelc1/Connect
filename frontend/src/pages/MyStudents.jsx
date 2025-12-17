import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import ThemeContext from "../context/ThemeContext";
import Navbar from "../components/common/NavBar";
import Cards2 from "../components/common/Cards2";
import Button from "../components/common/Button";
import AddModal from "../components/common/AddModel";
import UserCircle from "../components/common/UserCircle";
import NotificationBell from "../components/common/NotificationBell";
import { useNotifications } from "../context/NotificationContext";

import { getSpacesStudents, createStudent } from "../services/studentService";
import { getSpaces } from "../services/spacesService";

export default function MyStudents() {
  const { t } = useTranslation("myStudents");
  const { toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [spacesList, setSpacesList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [modal, setModal] = useState(false);
  const [email, setEmail] = useState("");
  const [studentID, setStudentID] = useState("");
  const [space, setSpace] = useState("");

  // --- Récupération des espaces ---
  useEffect(() => {
    getSpaces()
      .then((data) => {
        const array = Array.isArray(data.results)
          ? data.results
          : Array.isArray(data)
          ? data
          : [];
        setSpacesList(array);
      })
      .catch((err) => console.error("Erreur getSpaces:", err));
  }, []);

  // --- Récupération des étudiants ---
  const fetchStudents = () => {
    getSpacesStudents()
      .then((data) => {
        const array = Array.isArray(data.results)
          ? data.results
          : Array.isArray(data)
          ? data
          : [];

        // mapping avec nested serializer
        const formatted = array.map((st) => ({
          id: st.id,
          prenom: st.etudiant?.prenom || "",
          nom: st.etudiant?.nom || "",
          spaceName: st.space?.nom_space || "Espace inconnu",
          progress: st.progress || 0,
        }));

        setStudentsList(formatted);
      })
      .catch((err) => console.error("Erreur getStudents:", err));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // --- Ajout étudiant ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !studentID || !space) return;

    const data = { email, student_id: studentID, space_id: space };

    createStudent(data)
      .then(() => {
        setModal(false);
        setEmail("");
        setStudentID("");
        setSpace("");
        fetchStudents(); // rafraîchir la liste
      })
      .catch((err) => console.error("Erreur createStudent:", err));
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      {/* Header */}
      <div className="flex justify-between items-center w-full mb-6 pl-4 lg:pl-60">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-muted">
          {t("myStudentsTitle")}
        </h1>
        <div className="flex items-center gap-4">
          <div className="fixed top-6 right-6 flex items-center gap-4 z-50">
        <NotificationBell />
        <UserCircle
          initials={initials}
          onToggleTheme={toggleDarkMode}
          onChangeLang={(lang) => {
            const i18n = window.i18n;
            if (i18n?.changeLanguage) i18n.changeLanguage(lang);
          }}
        />
      </div>
        </div>
      </div>

      <div className="flex w-full">
        <Navbar />

        <div className="flex-1 p-4 sm:p-6 ml-0 lg:ml-60 transition-all duration-300">
          {/* Boutons */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <Button
              variant="primary"
              className="!px-4 !py-2 !text-white !w-auto ml-auto whitespace-nowrap"
              onClick={() => navigate("/Spaces")}
            >
              {t("createSpace")}
            </Button>

            <Button
              variant="primary"
              className="!px-4 !py-2 !w-auto"
              onClick={() => setModal(true)}
            >
              {t("addStudent")}
            </Button>
          </div>

          {/* Liste des étudiants */}
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {studentsList.length > 0 ? (
              studentsList.map((st, i) => (
                <Cards2
                  key={i}
                  icon={<UserCircle initials={(st.prenom[0] || "") + (st.nom[0] || "")} />}
                  title={`${st.prenom} ${st.nom}`}
                  description={st.spaceName}
                  progress={st.progress}
                  status="Actif"
                  className="bg-grad-2 rounded-xl shadow-md border p-6"
                />
              ))
            ) : (
              <p className="text-gray-500">{t("noStudentsMessage")}</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal d’ajout */}
      <AddModal
        open={modal}
        onClose={() => setModal(false)}
        title={t("addStudentTitle")}
        subtitle={t("addStudentSubtitle")}
        submitLabel={t("addStudentSubmit")}
        cancelLabel={t("addStudentCancel")}
        onSubmit={handleSubmit}
        fields={[
          {
            label: t("email"),
            placeholder: t("emailPlaceholder"),
            value: email,
            onChange: (e) => setEmail(e.target.value),
          },
          {
            label: t("studentID"),
            placeholder: t("studentIDPlaceholder"),
            value: studentID,
            onChange: (e) => setStudentID(e.target.value),
          },
          {
            label: t("space"),
            element: (
              <select
                value={space}
                onChange={(e) => setSpace(e.target.value)}
                className="w-full border rounded px-3 py-2 text-black/80"
              >
                <option value="">{t("selectSpace")}</option>
                {spacesList.map((s) => (
                  <option key={s.id_space} value={s.id_space}>
                    {s.nom_space}
                  </option>
                ))}
              </select>
            ),
          },
        ]}
      />
    </div>
  );
}
