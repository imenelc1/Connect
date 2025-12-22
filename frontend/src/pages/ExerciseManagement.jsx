
import React, { useState } from "react";
import Navbar from "../components/common/NavBar";
import Button from "../components/common/Button";
import AddModal from "../components/common/AddModel";
import { Search, Pencil, Trash2, Code } from "lucide-react";
import "../styles/index.css";
import { useTranslation } from "react-i18next";

export default function ExercisesManagement() {
    // SEARCH contrôlé
    const [search, setSearch] = useState("");

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

    const { t } = useTranslation("ExerciseManagement");

    return (
        <div className="flex w-full bg-bg min-h-screen overflow-x-hidden">
            <Navbar />

            {/* Main Content */}
            <div className="flex-1 p-4 md:p-8 md:ml-56">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-semibold text-textc">{t("title")}</h1>
                        <p className="text-textc mb-6">{t("description")}</p>
                    </div>
                    <Button
                        text={t("addExerciseButton")}
                        variant="primary"
                        className="!w-auto px-6 py-2 rounded-xl"
                        onClick={() => setCreateModal(true)}
                    />
                </div>

                {/* Search Bar */}

                <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-6 w-full">

                    {/* Champ de recherche étudiant */}
                    <div className="relative flex-1 min-w-[280px] lg:min-w-[450px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 
                                  text-primary w-5 h-5" />
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

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-xl shadow p-5 flex flex-col border hover:shadow-md transition"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <div className="w-12 h-12 flex items-center justify-center bg-grad-2 rounded-lg">
                                    <Code size={24} className="text-primary" />
                                </div>
                                <span
                                    className={`px-3 py-1 text-xs rounded-lg font-medium ${item.difficulty === "easy"
                                        ? "bg-primary/30 text-primary"
                                        : item.difficulty === "medium"
                                            ? "bg-secondary/30 text-secondary"
                                            : "bg-pink/30 text-pink"
                                        }`}
                                >
                                    {t(`difficulty.${item.difficulty}`)}

                                </span>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                            <p className="text-gray-500 text-sm mb-4">{item.category}</p>

                            <div className="flex justify-between items-center text-sm text-gray-500">
                                <span>{t("submissions", { count: item.submissions })}</span>
                                <div className="flex gap-3 text-gray-400">
                                    <Pencil
                                        size={18}
                                        className="text-primary cursor-pointer hover:scale-110 transition"
                                        onClick={() => openEdit(item)}
                                    />
                                    <Trash2
                                        size={18}
                                        className="text-red cursor-pointer hover:scale-110 transition"
                                        onClick={() => handleDelete(item.id)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

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
                                className="bg-grisclair rounded-md px-3 py-2 border-primary"
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
                                className="bg-grisclair rounded-md px-3 py-2"
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

