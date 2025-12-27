import React, { useState, useEffect, useContext } from "react";
import Button from "../components/common/Button";
import ProgressBar from "../components/ui/ProgressBar";
import Navbar from "../components/common/NavBar";
import { Trash2, SquarePen, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import ContentSearchBar from "../components/common/ContentSearchBar";
import ThemeContext from "../context/ThemeContext";

// Modal étudiant
function StudentDetailModal({ student, onClose }) {
  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4">{student.nom} {student.prenom}</h2>
        <p className="text-sm text-gray-500 mb-2">{student.email}</p>
        <p className="text-sm text-gray-500 mb-4">
          {`Cours suivis: ${student.courses_count || 0}`}
        </p>

        {student.courses_count > 0 ? (
          <div>
            {student.courses.map((course, idx) => (
              <div key={idx} className="mb-3 border-b pb-2">
                <p className="font-semibold">{course.title}</p>
                <p className="text-sm text-gray-500">Progression: {course.progress}%</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Aucun cours suivi</p>
        )}
      </div>
    </div>
  );
}

export default function StudentsManagement() {
  const { t } = useTranslation("StudentsManagement");
  const { toggleDarkMode } = useContext(ThemeContext);

  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch étudiants
  useEffect(() => {
    const fetchStudents = async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        setError("Token JWT manquant.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          "http://localhost:8000/api/users/students-with-progress/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error(`Impossible de récupérer les étudiants (${res.status})`);
        const data = await res.json();

        // Transform courses en tableau vide si non présent
        const formatted = data.map(s => ({
          ...s,
          courses: s.courses || [],
          courses_count: s.courses_count || s.courses?.length || 0
        }));

        setStudents(formatted);

      } catch (err) {
        console.error(err);
        setError("Impossible de charger les étudiants.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getGridCols = () => {
    if (windowWidth < 640) return 1;
    if (windowWidth < 1024) return 2;
    return 3;
  };

  const filteredStudents = students.filter(s =>
    `${s.nom} ${s.prenom}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-row min-h-screen bg-surface gap-16 md:gap-1">
      <Navbar />

      <main className={`flex-1 p-6 pt-10 space-y-5 transition-all duration-300 ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-muted">
              {t("StudentsManagement.StudentsManagement")}
            </h1>
            <p className="text-gray">{t("StudentsManagement.view")}</p>
          </div>

          <Button
            text={<span className="flex items-center gap-2"><UserPlus size={18} />{t("StudentsManagement.buttonAdd")}</span>}
            variant="primary"
            className="!w-auto px-6 py-2 rounded-xl"
          />
        </div>

        {/* Search */}
        <ContentSearchBar
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full max-w-md mb-6 sm:mb-10"
        />

        {/* Grid */}
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: `repeat(${getGridCols()}, minmax(0, 1fr))` }}
        >
          {filteredStudents.map((s, index) => (
            <div
              key={index}
              className="bg-grad-2 rounded-2xl p-6 shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-lg transition"
              onClick={() => setSelectedStudent(s)}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-grad-1 text-white flex items-center justify-center text-lg font-semibold">
                    {s.initials}
                  </div>
                  <div className="truncate">
                    <h2 className="font-semibold text-lg truncate">{s.nom} {s.prenom}</h2>
                    <p className="text-sm text-grayc truncate">{s.email}</p>
                  </div>
                </div>

                <div className="flex gap-4 text-gray-500">
                  <button className="text-muted hover:opacity-80">
                    <SquarePen size={20} />
                  </button>
                  <button className="text-red hover:opacity-80">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* Courses count */}
              <div className="mb-2">
                <p className="text-sm text-grayc mb-1">
                  {t("StudentsManagement.Encolled")}: {s.courses_count || 0}
                </p>
              </div>

              {/* Progress */}
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>{t("StudentsManagement.Overal")}</span>
                  <span>{s.progress}%</span>
                </div>
                <ProgressBar value={s.progress} />
              </div>

              {/* Joined */}
              <div className="flex justify-between text-sm text-grayc mt-4">
                <span>{t("StudentsManagement.joined")}</span>
                <span className="font-medium">{s.joined}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedStudent && (
          <StudentDetailModal
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
          />
        )}
      </main>
    </div>
  );
}
