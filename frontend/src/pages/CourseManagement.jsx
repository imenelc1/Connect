import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/common/Navbar";
import Button from "../components/common/Button";
import AddModal from "../components/common/AddModel";
import { SquarePen, Trash2, BookOpen } from "lucide-react";
import "../styles/index.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ContentSearchBar from "../components/common/ContentSearchBar";
import ModernDropdown from "../components/common/ModernDropdown";
import ThemeContext from "../context/ThemeContext";
import NotificationBell from "../components/common/NotificationBell";
import { toast } from 'react-hot-toast';
const levelStyles = {
  Débutant: "bg-blue text-white",
  Intermédiaire: "bg-purple text-white",
  Avancé: "bg-pink text-white",
};

const buttonStyles = {
  Débutant: "bg-blue text-white",
  Intermédiaire: "bg-purple text-white",
  Avancé: "bg-pink text-white",
};

export default function CoursesManagement() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("CoursesManagement");
  const { toggleDarkMode } = useContext(ThemeContext);
  
  const adminData = JSON.parse(localStorage.getItem("admin")) || {};
  const initials = `${adminData.nom?.[0] || ""}${adminData.prenom?.[0] || ""}`.toUpperCase();

  // États pour la responsivité
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    titre_cour: "",
    niveau_cour: "debutant",
    description: "",
    duration: "00:30:00",
    utilisateur: "",
  });

  const [editValues, setEditValues] = useState({
    titre_cour: "",
    niveau_cour: "debutant",
    description: "",
    duration: "00:30:00",
    utilisateur: "",
  });
  const [editModal, setEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [teachers, setTeachers] = useState([]);

  const token = localStorage.getItem("admin_token"); 

  const difficultyOptions = [
    { value: "debutant", label: t("difficulty.Beginner") },
    { value: "intermediaire", label: t("difficulty.Intermediate") },
    { value: "avance", label: t("difficulty.Advanced") },
  ];

  const teacherOptions = teachers.map((t) => ({
    value: t.id_utilisateur,
    label: `${t.nom} ${t.prenom}`,
  }));

  const gradientMap = {
    Débutant: "bg-grad-2",
    Intermédiaire: "bg-grad-3",
    Avancé: "bg-grad-4",
  };


  // Effet pour la responsivité
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Gestion de la sidebar
    const handleSidebarChange = (e) => setSidebarCollapsed(e.detail);

    window.addEventListener("resize", handleResize);
    window.addEventListener("sidebarChanged", handleSidebarChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("sidebarChanged", handleSidebarChange);
    };
  }, []);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("${process.env.REACT_APP_API_URL}/api/courses/admin/courses/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(t("errors.fetchCourses"));
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, [token]);

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch("${process.env.REACT_APP_API_URL}/api/users/enseignants/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(t("errors.fetchTeachers"));
        const data = await res.json();
        setTeachers(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTeachers();
  }, [token]);

  // Filtered courses
  const filtered = courses.filter((c) =>
    (c.titre_cour || "").toLowerCase().includes(search.toLowerCase())
  );



  // EDIT
  const openEdit = (course) => {
    setSelectedCourse(course);
    setEditValues({
      titre_cour: course.titre_cour || "",
      niveau_cour: course.niveau_cour || "debutant",
      description: course.description || "",
      duration: course.duration || "00:30:00",
      utilisateur: course.utilisateur || "",
    });
    setEditModal(true);
  };

  const submitEdit = async () => {
  if (!selectedCourse) return;

  try {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/courses/${selectedCourse.id_cours}/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editValues),
      }
    );

    if (!res.ok) throw new Error();
    toast.success("Cours mis à jour avec succès !");

    const data = await res.json();

    setCourses((prev) =>
      prev.map((c) =>
        c.id_cours === data.id_cours ? data : c
      )
    );

    setEditModal(false);
    setSelectedCourse(null);
  } catch (err) {
    console.error(err);
  }
};


  // DELETE
   const handleDeleteCourse = async (courseId) => {
  if (!window.confirm("Tu es sûr de supprimer ce cours ?")) return;

  try {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/courses/cours/${courseId}/delete/`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) throw new Error("Erreur suppression");

    setCourses((prev) =>
      prev.filter((c) => c.id_cours !== courseId)
    );

    toast.success("Cours supprimé avec succès");
  } catch (err) {
    console.error("Erreur suppression :", err);
    toast.error("Erreur lors de la suppression");
  }
};



  return (
    <div className="flex flex-row md:flex-row min-h-screen bg-surface gap-16 md:gap-1">
      {/* Sidebar */}
      <div>
        <Navbar />
        <div className="fixed top-6 right-6 flex items-center gap-4 z-50">
        <NotificationBell />
       
      </div>
      </div>

      {/* Main Content */}
      <main className={`
        flex-1 p-4 sm:p-6 pt-10 space-y-5 transition-all duration-300 box-border
        ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
      `}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-muted">{t("title")}</h1>
            <p className="text-gray">{t("description")}</p>
          </div>


        </div>

        {/* Search */}
        <div className="relative mb-6 sm:mb-10 w-full max-w-md">
          <ContentSearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full"
          />
        </div>

        {/* Grid */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 box-border">

          {filtered.map((item) => (
            <div
              key={item.id_cours}
              className={`
             w-full sm:w-auto  // prend toute la largeur sur mobile, auto sur sm+
             max-w-[85%] sm:max-w-none  // limite la largeur à 90% sur mobile
             rounded-2xl  p-4 sm:p-6
             shadow-sm hover:shadow-md flex flex-col
             ${gradientMap[item.niveau_cour_label] || "bg-white"}
           `}
            >

              <div className="flex justify-between items-center mb-4">
                <div className="w-12 h-12 flex items-center justify-center bg-grad-2 rounded-xl">
                  <BookOpen size={24} className="text-muted" />
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${item.niveau_cour === "debutant"
                    ? "bg-muted/20 text-muted"
                    : item.niveau_cour === "intermediaire"
                      ? "bg-secondary/20 text-secondary"
                      : "bg-pink/20 text-pink"
                    }`}
                >
                  {item.niveau_cour === "debutant"
                    ? t("difficulty.Beginner")
                    : item.niveau_cour === "intermediaire"
                      ? t("difficulty.Intermediate")
                      : t("difficulty.Advanced")}
                </span>

              </div>

              <h3 className="font-semibold text-lg mb-2 truncate">{item.titre_cour}</h3>
               <p className="text-grayc text-sm mb-2">
                  {item.duration_readable}
                </p>
              {teachers.length > 0 && (
                <p className="text-grayc text-sm mb-2">
                  {t("auteur")}: {teachers.find(t => t.id_utilisateur === item.utilisateur)?.nom}{" "}
                  {teachers.find(t => t.id_utilisateur === item.utilisateur)?.prenom}
                </p>
              )}
              {item.description && (
                <p className="text-grayc  text-sm mb-4 line-clamp-2">{item.description}</p>
              )}

              <div className="flex justify-end mt-auto pt-4">
                <div className="flex gap-2">
                   <Button
                    variant="courseStart"
                    className={`px-2 py-2 whitespace-nowrap ${buttonStyles[item.niveau_cour_label]}`}
                    onClick={() => navigate(`/Cours/${item.id_cours}`)}
                  >
                    {t("voir_cours")}
                  </Button>
                  <button className="text-muted hover:opacity-80" onClick={() => openEdit(item)}>
                    <SquarePen size={20} />
                  </button>
                  <button className="text-red hover:opacity-80" onClick={()=>handleDeleteCourse(item.id_cours)}>
                    <Trash2 size={20}  />
                  </button>
                 
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

     

      {/* EDIT MODAL */}
      <AddModal
        open={editModal}
        onClose={() => setEditModal(false)}
        title={t("modal.edit.title")}
        subtitle={t("modal.edit.subtitle")}
        submitLabel={t("modal.edit.submit")}
        cancelLabel={t("modal.edit.cancel")}
        onSubmit={submitEdit}
        fields={[
          {
            label: t("field.title"),
            placeholder: t("field.titlePlaceholder"),
            value: editValues.titre_cour,
            onChange: (e) => setEditValues({ ...editValues, titre_cour: e.target.value }),
          },
          {
            label: t("field.description"),
            placeholder: t("field.descriptionPlaceholder"),
            value: editValues.description,
            onChange: (e) => setEditValues({ ...editValues, description: e.target.value }),
          },
          {
            label: t("field.duration"),
            placeholder: t("field.durationPlaceholder"),
            value: editValues.duration,
            onChange: (e) => setEditValues({ ...editValues, duration: e.target.value }),
          },
         
          {
            label: t("field.difficulty"),
            element: (
              <ModernDropdown
                value={editValues.niveau_cour}
                onChange={(value) => setEditValues({ ...editValues, niveau_cour: value })}
                options={difficultyOptions}
                placeholder={t("field.difficulty")}
              />
            ),
          },
        ]}
      />
    </div>
  );
}