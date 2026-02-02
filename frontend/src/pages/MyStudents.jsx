import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import ThemeContext from "../context/ThemeContext";
import Navbar from "../components/common/Navbar";
import Button from "../components/common/Button";
import AddModal from "../components/common/AddModel";
import UserCircle from "../components/common/UserCircle";
import { Bell, ChevronRight, X } from "lucide-react";
import NotificationBell from "../components/common/NotificationBell";

import {
  getSpacesStudents,
  createStudent,
  removeStudent,
} from "../services/studentService";
import { getSpaces } from "../services/spacesService";
import { getCurrentProgressStudents } from "../services/progressionService";


export default function MyStudents() {
  const { t } = useTranslation("myStudents");
  const { toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [spacesList, setSpacesList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [modal, setModal] = useState(false);
  const [email, setEmail] = useState("");
  const [space, setSpace] = useState("");

  const [studentsProgress, setStudentsProgress] = useState({});
  const userData = JSON.parse(localStorage.getItem("user"));
  const userRole = userData?.user?.role ?? userData?.role;
  const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""}`.toUpperCase();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
useEffect(() => {
  const handler = (e) => setSidebarCollapsed(e.detail);
  window.addEventListener("sidebarChanged", handler);
  return () => window.removeEventListener("sidebarChanged", handler);
}, []);





  useEffect(() => {
    const fetchStudentsProgress = async () => {
      try {
        const data = await getCurrentProgressStudents();
        // transformer en objet { studentId: progress }
        const progressMap = {};
        data.forEach((item) => {
          progressMap[item.student_id] = item.progress;
        });
        setStudentsProgress(progressMap);
      } catch (err) {
        console.error("Erreur récupération progression étudiants :", err);
      }
    };

    fetchStudentsProgress();
  }, []);


  useEffect(() => {
    const fetchStudentsProgress = async () => {
      try {
        const data = await getCurrentProgressStudents();
        // transformer en objet { studentId: progress }
        const progressMap = {};
        data.forEach((item) => {
          progressMap[item.student_id] = item.progress;
        });
        setStudentsProgress(progressMap);
      } catch (err) {
        console.error(t("Errors.FetchProgress"), err);
      }
    };

    fetchStudentsProgress();
  }, []);

  // -----------------------------
  // Récupérer les étudiants + espaces
  // -----------------------------
  const fetchStudents = () => {
    getSpacesStudents()
      .then((data) => {
        const array = Array.isArray(data) ? data : [];
        const studentsMap = {};

        array.forEach((st) => {
          const id = st.etudiant?.id_utilisateur || st.id;
          const prenom = st.etudiant?.prenom || "";
          const nom = st.etudiant?.nom || "";
          const spaceName = st.space?.nom_space || t("Errors.unknownSpace");
          const spaceId = st.space?.id_space || st.space_id;

          if (!studentsMap[id]) {
            studentsMap[id] = {
              id,
              prenom,
              nom,
              spaces: [spaceName],
              spacesIds: [spaceId],
              progress: st.progress || 0,
            };
          } else {
            if (!studentsMap[id].spaces.includes(spaceName)) {
              studentsMap[id].spaces.push(spaceName);
              studentsMap[id].spacesIds.push(spaceId);
            }
          }
        });

        const formatted = Object.values(studentsMap).map((st) => ({
          ...st,
          spaceName: st.spaces.join(", "),
        }));

        setStudentsList(formatted);
      })
      .catch((err) => console.error("Erreur getStudents:", err));
  };

  const fetchSpaces = () => {
    getSpaces()
      .then((data) => {
        setSpacesList(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Erreur getSpaces:", err));
  };

  useEffect(() => {
    fetchStudents();
    fetchSpaces();
  }, []);

  // -----------------------------
  // Ajout étudiant
  // -----------------------------
  const handleSubmit = async (e) => {

    if (!email || !space) return;

    try {
      await createStudent({ email, space_id: space });
      alert(t("Messages.StudentAdded"));
      setModal(false);
      setEmail("");
      setSpace("");
      fetchStudents();
      fetchSpaces();
    } catch (err) {
      console.error("Erreur createStudent:", err);
      alert(
        err.response?.data?.error ||
        // "Une erreur est survenue lors de l'ajout de l'étudiant"
        t("Errors.addStudent")
      );
    }
  };

  // -----------------------------
  // Supprimer un étudiant
  // -----------------------------
  const handleRemove = async (studentId, spaceId) => {
    if (
      !window.confirm(
        // "Voulez-vous vraiment supprimer cet étudiant de cet espace ?"
        t("Confirmations.RemoveStudent")
      )
    )
      return;

    try {
      await removeStudent(studentId, spaceId);
      alert(t("Messages.StudentRemoved"));
      fetchStudents();
    } catch (err) {
      console.error("Erreur removeStudent:", err);
      alert(
        err.response?.data?.error ||
        // "Une erreur est survenue lors de la suppression"
        t("Messages.DeleteError")
      );
    }
  };

  return (
  <div className="flex flex-row min-h-screen bg-surface gap-16 md:gap-1">
    {/* Sidebar */}
    <div>
      <Navbar />
    </div>

    {/* Main */}
    <main
      className={`
        flex-1 p-4 sm:p-6 pt-10 space-y-5 transition-all duration-300
        min-h-screen w-full overflow-x-hidden
        ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
      `}
    >
      {/* Header */}
      <header className="flex flex-row justify-between items-center gap-3 sm:gap-4 mb-6">
        <h1 className="text-lg sm:text-2xl font-bold text-muted truncate">
          {t("myStudentsTitle")}
        </h1>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <UserCircle
            initials={initials}
            onToggleTheme={toggleDarkMode}
            onChangeLang={(lang) => window.i18n?.changeLanguage(lang)}
          />
        </div>
      </header>

      {/* Action */}
      <div className="flex justify-end mb-6">
        <Button
          variant="primary"
          className="w-full sm:w-auto p-6"
          onClick={() => setModal(true)}
        >
          {t("addStudent")}
        </Button>
      </div>

      {/* Students grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {studentsList.length > 0 ? (
          studentsList.map((st, index) => {
            const gradients = ["bg-grad-2", "bg-grad-3", "bg-grad-4"];
            const randomGrad = gradients[index % gradients.length];

            return (
              <div
                key={st.id}
                className={`p-6 rounded-2xl shadow-lg border border-white/10 ${randomGrad}
                transition-transform duration-300 hover:scale-[1.03]`}
              >
                {/* Header */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <UserCircle
                      initials={(st.prenom[0] || "") + (st.nom[0] || "")}
                       clickable={false}
                      className="w-12 h-12"
                    />
                    <h2 className="font-semibold text-base sm:text-lg text-textc">
                      {st.prenom} {st.nom}
                    </h2>
                  </div>

                  <Button
                    className="!w-9 !h-9 !p-0 !min-w-0"
                    onClick={() => navigate(`/student-exercises/${st.id}`)}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                {/* Spaces */}
                <div className="flex flex-wrap gap-2 my-4">
                  {st.spaces.map((spName, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-xs rounded-full bg-grad-3 text-textc flex items-center gap-2"
                    >
                      {spName}
                      <button
                        onClick={() => handleRemove(st.id, st.spacesIds[i])}
                        className="text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Progress */}
                <div className="w-full h-3 bg-grayc/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-grad-1 rounded-full"
                    style={{ width: `${studentsProgress[st.id] ?? 0}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-grayc">{t("noStudentsMessage")}</p>
        )}
      </div>
    </main>

    {/* Modal */}
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
          label: t("space"),
          element: (
            <select
              value={space}
              onChange={(e) => setSpace(e.target.value)}
              className="w-full  rounded px-3 py-2 bg-surface text-gray"
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