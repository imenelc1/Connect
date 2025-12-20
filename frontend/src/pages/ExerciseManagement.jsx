import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/common/NavBar";
import Button from "../components/common/Button";
import AddModal from "../components/common/AddModel";
import { Search, Pencil, Trash2, Code } from "lucide-react";
import "../styles/index.css";
import { useTranslation } from "react-i18next";
// Navigation entre routes (React Router)
import { useNavigate } from "react-router-dom";

// Thème global (dark/light mode)
import ThemeContext from "../context/ThemeContext";
import UserCircle from "../components/common/UserCircle";
import ContentSearchBar from "../components/common/ContentSearchBar";

export default function ExercisesManagement() {
    // SEARCH contrôlé
    const [search, setSearch] = useState("");
    // Hook pour naviguer vers d'autres pages
    const navigate = useNavigate();
    const { toggleDarkMode } = useContext(ThemeContext);
    const { t, i18n } = useTranslation("ExerciseManagement");
    
    // États pour la responsivité
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // CREATE
    const [createModal, setCreateModal] = useState(false);
    const [newExercise, setNewExercise] = useState({
        title: "",
        category: "",
        difficulty: "Easy",
    });

    // EDIT
    const [editModal, setEditModal] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [editValues, setEditValues] = useState({
        title: "",
        category: "",
        difficulty: "Easy",
    });

    // LISTE
    const [exercises, setExercises] = useState([
        { id: 1, title: "Array Manipulation", category: "Data Structures", difficulty: "easy", submissions: 234 },
        { id: 2, title: "Linked List Implementation", category: "Data Structures", difficulty: "medium", submissions: 187 },
        { id: 3, title: "Binary Search Tree", category: "Algorithm Design", difficulty: "hard", submissions: 98 },
        { id: 4, title: "Pointer Arithmetic", category: "Introduction to C", difficulty: "easy", submissions: 412 },
        { id: 5, title: "Quicksort Algorithm", category: "Algorithm Design", difficulty: "medium", submissions: 156 },
        { id: 6, title: "Memory Allocation", category: "Advanced C Techniques", difficulty: "hard", submissions: 89 },
    ]);

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

    // --- FILTRAGE ---
    const filtered = exercises.filter((e) =>
        (e.title || "").toLowerCase().includes((search || "").toLowerCase())
    );

    // --- CREATE ---
    const submitCreate = (e) => {
        e.preventDefault();
        const newItem = {
            id: Date.now(),
            title: newExercise.title.trim() || "Untitled Exercise",
            category: newExercise.category.trim() || "Uncategorized",
            difficulty: newExercise.difficulty,
            submissions: 0,
        };
        setExercises([...exercises, newItem]);
        setNewExercise({ title: "", category: "", difficulty: "Easy" });
        setCreateModal(false);
    };
    const difficultyBgMap = {
        easy: "bg-grad-2",
        medium: "bg-grad-3",
        hard: "bg-grad-4",
      };

    // --- EDIT ---
    const openEdit = (ex) => {
        setSelectedExercise(ex);
        setEditValues({
            title: ex.title,
            category: ex.category,
            difficulty: ex.difficulty,
        });
        setEditModal(true);
    };

    const submitEdit = (e) => {
        e.preventDefault();
        setExercises(
            exercises.map((ex) => (ex.id === selectedExercise.id ? { ...ex, ...editValues } : ex))
        );
        setEditModal(false);
    };

    // DELETE
    const handleDelete = (id) => {
        setExercises(exercises.filter((ex) => ex.id !== id));
    };

    return (
        <div className="flex flex-row md:flex-row min-h-screen bg-surface gap-16 md:gap-1">
            {/* Sidebar */}
            <div>
                <Navbar />
            </div>

            {/* Main Content */}
            <main className={`
                flex-1 p-6 pt-10 space-y-5 transition-all duration-300
                ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
            `}>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-muted">{t("title")}</h1>
                        <p className="text-gray">{t("description")}</p>
                    </div>
                    
                    <div className="flex gap-4 items-center">
                        <Button
                            text={t("addExerciseButton")}
                            variant="primary"
                            className="!w-auto px-6 py-2 rounded-xl"
                            onClick={() => setCreateModal(true)}
                        />
                       
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {filtered.map((item) => (
    <div
      key={item.id}
      className={`${difficultyBgMap[item.difficulty] || "bg-white"} border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col`}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="w-12 h-12 flex items-center justify-center bg-grad-2 rounded-xl">
          <Code size={24} className="text-muted" />
        </div>
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            item.difficulty === "easy"
              ? "bg-muted/20 text-muted"
              : item.difficulty === "medium"
              ? "bg-pink/20 text-pink"
              : "bg-purple/20 text-purple"
          }`}
        >
          {t(`difficulty.${item.difficulty}`)}
        </span>
      </div>

      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
      <p className="text-gray-500 text-sm mb-4">{item.category}</p>

      <div className="flex justify-between items-center text-sm text-gray-500 mt-auto">
        <span>{t("submissions", { count: item.submissions })}</span>
        <div className="flex gap-3">
          <button 
            className="text-muted hover:opacity-80"
            onClick={() => openEdit(item)}
          >
            <Pencil size={18} />
          </button>
          <button 
            className="text-red hover:opacity-80"
            onClick={() => handleDelete(item.id)}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  ))}
</div>

            </main>

            {/* Modals */}
            <AddModal
                open={createModal}
                onClose={() => setCreateModal(false)}
                title={t("modal.create.title")}
                subtitle={t("modal.create.subtitle")}
                submitLabel={t("modal.create.submit")}
                cancelLabel={t("modal.create.cancel")}
                onSubmit={submitCreate}
                fields={[
                    {
                        label: t("field.title"),
                        placeholder: t("field.titlePlaceholder"),
                        value: newExercise.title,
                        onChange: (e) => setNewExercise({ ...newExercise, title: e.target.value }),
                    },
                    {
                        label: t("field.category"),
                        placeholder: t("field.categoryPlaceholder"),
                        value: newExercise.category,
                        onChange: (e) => setNewExercise({ ...newExercise, category: e.target.value }),
                    },
                    {
                        label: t("field.difficulty"),
                        element: (
                            <select
                                value={newExercise.difficulty}
                                onChange={(e) => setNewExercise({ ...newExercise, difficulty: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="easy">{t("difficulty.easy")}</option>
                                <option value="medium">{t("difficulty.medium")}</option>
                                <option value="hard">{t("difficulty.hard")}</option>
                            </select>
                        ),
                    },
                ]}
            />

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
                        value: editValues.title,
                        onChange: (e) => setEditValues({ ...editValues, title: e.target.value }),
                    },
                    {
                        label: t("field.category"),
                        placeholder: t("field.categoryPlaceholder"),
                        value: editValues.category,
                        onChange: (e) => setEditValues({ ...editValues, category: e.target.value }),
                    },
                    {
                        label: t("field.difficulty"),
                        element: (
                            <select
                                value={editValues.difficulty}
                                onChange={(e) => setEditValues({ ...editValues, difficulty: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="easy">{t("difficulty.easy")}</option>
                                <option value="medium">{t("difficulty.medium")}</option>
                                <option value="hard">{t("difficulty.hard")}</option>
                            </select>
                        ),
                    },
                ]}
            />
        </div>
    );
}