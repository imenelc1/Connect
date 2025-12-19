import React, { useState } from "react";
import Navbar from "../components/common/NavBar";
import Button from "../components/common/Button";
import AddModal from "../components/common/AddModel";
import { Pencil, Trash2, FileText, Search } from "lucide-react";
import "../styles/index.css";
import { useTranslation } from "react-i18next";

export default function QuizzesManagement() {
    const { t } = useTranslation("QuizManagement");

    const [search, setSearch] = useState("");
    const [createModal, setCreateModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    const [quizzes, setQuizzes] = useState([
        { id: 1, icon: <FileText size={22} />, title: "C Fundamentals Quiz", subtitle: "Introduction to C", questions: 20, attempts: 456, score: 78 },
        { id: 2, icon: <FileText size={22} />, title: "Pointers & Memory", subtitle: "Advanced C Techniques", questions: 15, attempts: 234, score: 65 },
        { id: 3, icon: <FileText size={22} />, title: "Sorting Algorithms", subtitle: "Algorithm Design", questions: 25, attempts: 312, score: 72 },
        { id: 4, icon: <FileText size={22} />, title: "Data Structures Final", subtitle: "Data Structures", questions: 30, attempts: 287, score: 81 },
        { id: 5, icon: <FileText size={22} />, title: "Recursion Practice", subtitle: "Algorithm Design", questions: 18, attempts: 198, score: 68 },
    ]);

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
    const [drawerOpen, setDrawerOpen] = useState(false);


    return (
        <div className="flex w-full bg-bg min-h-screen overflow-x-hidden">
            <Navbar />

            {/* PAGE CONTENT */}
            <div className="flex-1 p-4 md:p-8 ml-0 md:ml-56 transition-all" id="page-content">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-semibold text-textc">{t("title")}</h1>
                        <p className="text-textc mb-6">{t("subtitle")}</p>
                    </div>
                    <Button
                        text={t("createButton")}
                        variant="primary"
                        className="!w-auto px-6 py-2 rounded-xl"
                        onClick={() => setCreateModal(true)}
                    />
                </div>


                {/* SEARCH */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 w-full">
                    <div className="relative flex-1 min-w-[280px] sm:min-w-[350px] lg:min-w-[450px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                        <input
                            type="text"
                            placeholder={t("searchPlaceholder")}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-primary
                                       focus:bg-white focus:text-primary focus:ring-2 focus:ring-primary outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* QUIZZES GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
                    {quizzes
                        .filter((q) => q.title.toLowerCase().includes(search.toLowerCase()))
                        .map((q) => (
                            <div
                                key={q.id}
                                className="bg-white rounded-xl shadow p-5 flex flex-col border hover:shadow-md transition"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 flex items-center justify-center bg-grad-4 text-pink rounded-lg">
                                            {q.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-textc text-base break-words">{q.title}</h3>
                                            <p className="text-textc text-sm break-words">{q.subtitle}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Pencil
                                            size={18}
                                            className="text-primary cursor-pointer hover:scale-110 transition"
                                            onClick={() => handleEdit(q)}
                                        />
                                        <Trash2
                                            size={18}
                                            className="text-red-500 cursor-pointer hover:scale-110 transition"
                                            onClick={() => handleDelete(q.id)}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-3 text-center text-sm text-textc">
                                    <div>
                                        <span className="text-textc/80 text-m">{t("stats.questions")}</span>
                                        <p className="font-semibold text-lg">{q.questions}</p>
                                    </div>
                                    <div>
                                        <span className="text-textc/80 text-m">{t("stats.attempts")}</span>
                                        <p className="font-semibold text-lg">{q.attempts}</p>
                                    </div>
                                    <div>
                                        <span className="text-textc/80 text-m">{t("stats.avgScore")}</span>
                                        <p className="font-semibold text-lg">{q.score}%</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* CREATE MODAL */}
            <AddModal
                open={createModal}
                onClose={() => setCreateModal(false)}
                title={t("modal.createTitle")}
                subtitle={t("modal.createSubtitle")}
                submitLabel={t("modal.submitCreate")}
                cancelLabel={t("modal.cancel")}
                onSubmit={submitCreate}
                className="w-[90vw] md:w-auto max-w-lg"
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
                className="w-[90vw] md:w-auto max-w-lg"
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