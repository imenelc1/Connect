import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/common/NavBar";
import Button from "../components/common/Button";
import AddModal from "../components/common/AddModel";
import {  Trash2, FileText,SquarePen } from "lucide-react";
import "../styles/index.css";
import { useTranslation } from "react-i18next";
// Navigation entre routes (React Router)
import { useNavigate } from "react-router-dom";

// Thème global (dark/light mode)
import ThemeContext from "../context/ThemeContext";
import UserCircle from "../components/common/UserCircle";
import ContentSearchBar from "../components/common/ContentSearchBar";
import api from "../services/api";

export default function QuizzesManagement() {
    const { t, i18n } = useTranslation("QuizManagement");
    const navigate = useNavigate();
    const { toggleDarkMode } = useContext(ThemeContext);

    // États pour la responsivité
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const [search, setSearch] = useState("");
    const [createModal, setCreateModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const difficultyBgMap = {
        debutant: "bg-grad-2",
        intermediaire: "bg-grad-3",
        avance: "bg-grad-4",
    };


    const [quizzes, setQuizzes] = useState([]);
    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const token = localStorage.getItem("admin_token");

                const res = await fetch("http://127.0.0.1:8000/api/quiz/api/quiz/", {

                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }

                const data = await res.json();
                console.log("Quiz backend:", data);

                setQuizzes(
                    data.map((q) => ({
                        id: q.id,
                        title: q.exercice?.titre_exo || "Sans titre",
                        subtitle: q.exercice?.enonce || "",
                        questions: q.questions?.length || 0,
                        attempts: q.nbMax_tentative || 0,
                        score: q.scoreMinimum || 0,
                        niveau_exo: q.exercice?.niveau_exo || "debutant",
                        icon: <FileText size={22} />,
                    }))
                );

            } catch (err) {
                console.error("Erreur chargement quiz:", err);
            }
        };

        fetchQuizzes();
    }, []);


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

    // CREATE QUIZ
    const [newQuiz, setNewQuiz] = useState({ title: "", description: "" });
    const submitCreate = (e) => {
        e.preventDefault();
        const id = Date.now();
        const item = {
            id,
            icon: <FileText size={22} />,
            title: newQuiz.title,
            subtitle: newQuiz.description,
            questions: 0,
            attempts: 0,
            score: 0,
        };
        setQuizzes([...quizzes, item]);
        setNewQuiz({ title: "", description: "" });
        setCreateModal(false);
    };

    // EDIT QUIZ
    const [editValues, setEditValues] = useState({ title: "", description: "" });
    const handleEdit = (quiz) => {
        setSelectedQuiz(quiz);
        setEditValues({ title: quiz.title, description: quiz.subtitle });
        setEditModal(true);
    };
    const submitEdit = (e) => {
        e.preventDefault();
        setQuizzes(
            quizzes.map((q) =>
                q.id === selectedQuiz.id
                    ? { ...q, title: editValues.title, subtitle: editValues.description }
                    : q
            )
        );
        setEditModal(false);
    };

    // DELETE QUIZ
    const handleDelete = (id) => {
        setQuizzes(quizzes.filter((q) => q.id !== id));
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
                        <p className="text-gray">{t("subtitle")}</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <Button
                            text={t("createButton")}
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

                {/* Quizzes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                    {quizzes
                        .filter((q) => q.title.toLowerCase().includes(search.toLowerCase()))
                        .map((q) => (
                            <div
                                key={q.id}
                                className={`${difficultyBgMap[q.niveau_exo] || "bg-white"} rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col`}
                            >

                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-12 h-12 flex items-center justify-center bg-pink/20 text-pink rounded-xl">
                                            {q.icon}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-lg truncate">{q.title}</h3>
                                            <p className="text-grayc text-sm truncate">{q.subtitle}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button className="text-muted hover:opacity-80">
                                            <SquarePen size={20} />
                                        </button>
                                        <button className="text-red hover:opacity-80">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 grid grid-cols-3 text-center">
                                    <div>
                                        <span className="text-gray-500 text-sm">{t("stats.questions")}</span>
                                        <p className="font-semibold text-lg">{q.questions}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-sm">{t("stats.attempts")}</span>
                                        <p className="font-semibold text-lg">{q.attempts}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-sm">{t("stats.avgScore")}</span>
                                        <p className="font-semibold text-lg">{q.score}%</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </main>

            {/* CREATE MODAL */}
            <AddModal
                open={createModal}
                onClose={() => setCreateModal(false)}
                title={t("modal.createTitle")}
                subtitle={t("modal.createSubtitle")}
                submitLabel={t("modal.submitCreate")}
                cancelLabel={t("modal.cancel")}
                onSubmit={submitCreate}
                fields={[
                    {
                        label: t("modal.fields.title.label"),
                        placeholder: t("modal.fields.title.placeholder"),
                        value: newQuiz.title,
                        onChange: (e) => setNewQuiz({ ...newQuiz, title: e.target.value }),
                    },
                    {
                        label: t("modal.fields.description.label"),
                        placeholder: t("modal.fields.description.placeholder"),
                        value: newQuiz.description,
                        onChange: (e) => setNewQuiz({ ...newQuiz, description: e.target.value }),
                    },
                ]}
            />

            {/* EDIT MODAL */}
            <AddModal
                open={editModal}
                onClose={() => setEditModal(false)}
                title={t("modal.editTitle")}
                subtitle={t("modal.editSubtitle")}
                submitLabel={t("modal.submitEdit")}
                cancelLabel={t("modal.cancel")}
                onSubmit={submitEdit}
                fields={selectedQuiz
                    ? [
                        {
                            label: t("modal.fields.title.label"),
                            placeholder: t("modal.fields.title.placeholder"),
                            value: editValues.title,
                            onChange: (e) => setEditValues({ ...editValues, title: e.target.value }),
                        },
                        {
                            label: t("modal.fields.description.label"),
                            placeholder: t("modal.fields.description.placeholder"),
                            value: editValues.description,
                            onChange: (e) =>
                                setEditValues({ ...editValues, description: e.target.value }),
                        },
                    ]
                    : []
                }
            />
        </div>
    );
}