import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import ThemeContext from "../context/ThemeContext";
import Navbar from "../components/common/NavBar";
import Button from "../components/common/Button";
import AddModal from "../components/common/AddModel";
import UserCircle from "../components/common/UserCircle";
import { Bell, ChevronRight,X } from "lucide-react";

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
          const spaceName = st.space?.nom_space || "Espace inconnu";
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
    e.preventDefault();
    if (!email || !space) return;

    try {
      await createStudent({ email, space_id: space });
      alert("Étudiant ajouté avec succès !");
      setModal(false);
      setEmail("");
      setSpace("");
      fetchStudents();
      fetchSpaces();
    } catch (err) {
      console.error("Erreur createStudent:", err);
      alert(
        err.response?.data?.error ||
          "Une erreur est survenue lors de l'ajout de l'étudiant"
      );
    }
  };

  // -----------------------------
  // Supprimer un étudiant
  // -----------------------------
  const handleRemove = async (studentId, spaceId) => {
    if (
      !window.confirm(
        "Voulez-vous vraiment supprimer cet étudiant de cet espace ?"
      )
    )
      return;

    try {
      await removeStudent(studentId, spaceId);
      alert("Étudiant supprimé avec succès !");
      fetchStudents();
    } catch (err) {
      console.error("Erreur removeStudent:", err);
      alert(
        err.response?.data?.error ||
          "Une erreur est survenue lors de la suppression"
      );
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      {/* Header */}
      <div className="flex justify-between items-center w-full m-5 pl-4 lg:pl-60">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-muted">
          {t("myStudentsTitle")}
        </h1>
        <div className="flex items-center gap-4 mr-8">
          <Bell
            className="w-5 h-5 text-gray-600 cursor-pointer"
            fill="currentColor"
          />
          <UserCircle initials="MH" onToggleTheme={toggleDarkMode} />
        </div>
      </div>

      <div className="flex w-full">
        <Navbar />

        <div className="flex-1 p-4 sm:p-6 ml-0 mt-5 lg:ml-60 transition-all duration-300">
          {/* Boutons */}
          <div className="flex flex-col sm:flex-row justify-end sm:items-center gap-4 mb-6">
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
              studentsList.map((st, index) => {
                const gradients = ["bg-grad-2", "bg-grad-3", "bg-grad-4"];
                const randomGrad = gradients[index % gradients.length];

                return (
                  <div
                    key={st.id}
                    className={`p-6 rounded-2xl shadow-lg border border-white/10 ${randomGrad}
                      transition-transform duration-300 hover:scale-[1.03] hover:shadow-2xl`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex gap-[180px]">
                        <div className="flex gap-5">
                          <UserCircle
                            initials={(st.prenom[0] || "") + (st.nom[0] || "")}
                            className="w-14 h-14"
                          />
                          <h2 className="font-semibold text-lg text-textc whitespace-nowrap">
                            {st.prenom} {st.nom}
                          </h2>
                        </div>

                        {/* RIGHT ARROW */}
                        <Button className="!w-9 !h-9 !p-0 !min-w-0 flex mt-10">
                          <ChevronRight size={16} className="w-6 h-6" />
                        </Button>
                      </div>
                    </div>

                    {/* Badges espaces */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {st.spaces.map((spName, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 text-xs rounded-full bg-grad-6 text-textc flex items-center gap-2"
                        >
                          {spName}
                          <button
                            onClick={() => handleRemove(st.id, st.spacesIds[i])}
                            className="text-red-500 font-bold"
                          >
                          <X size={12}/>
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-3 bg-grayc/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-grad-1 rounded-full"
                        style={{
                          width: `${
                            studentsProgress[st.id]
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-grayc">{t("noStudentsMessage")}</p>
            )}
          </div>
        </div>
      </div>

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
