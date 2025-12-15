import React, { useState } from "react";
import Navbar from "../components/common/NavBar";
import Button from "../components/common/Button";
import AddModal from "../components/common/AddModel";
import { Search, Pencil, Trash2, BookOpen } from "lucide-react";
import "../styles/index.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";


export default function CoursesManagement() {
const navigate = useNavigate();
  // SEARCH contrôlé
  const [search, setSearch] = useState("");

  // CREATE
  const [createModal, setCreateModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    category: "",
    level: "Beginner",
  });

  // EDIT
  const [editModal, setEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editValues, setEditValues] = useState({
    title: "",
    category: "",
    level: "Beginner",
  });

  // LIST
  const [courses, setCourses] = useState([
    { id: 1, title: "React Basics", category: "Frontend", level: "Beginner", students: 120 },
    { id: 2, title: "Advanced Node.js", category: "Backend", level: "Advanced", students: 85 },
    { id: 3, title: "Data Structures", category: "Computer Science", level: "Intermediate", students: 95 },
    { id: 4, title: "Python for AI", category: "AI", level: "Beginner", students: 150 },
  ]);

  // --- FILTRAGE ---
  const filtered = courses.filter((c) =>
    (c.title || "").toLowerCase().includes((search || "").toLowerCase())
  );

  // --- CREATE ---
  const submitCreate = (e) => {
    e.preventDefault();
    const newItem = {
      id: Date.now(),
      title: newCourse.title.trim() || "Untitled Course",
      category: newCourse.category.trim() || "Uncategorized",
      level: newCourse.level,
      students: 0,
    };
    setCourses([...courses, newItem]);
    setNewCourse({ title: "", category: "", level: "Beginner" });
    setCreateModal(false);
  };

  // --- EDIT ---
  const openEdit = (course) => {
    setSelectedCourse(course);
    setEditValues({
      title: course.title,
      category: course.category,
      level: course.level,
    });
    setEditModal(true);
  };

  const submitEdit = (e) => {
    e.preventDefault();
    setCourses(
      courses.map((c) => (c.id === selectedCourse.id ? { ...c, ...editValues } : c))
    );
    setEditModal(false);
  };

  // DELETE
  const handleDelete = (id) => {
    setCourses(courses.filter((c) => c.id !== id));
  };
  const { t } = useTranslation("CoursesManagement");


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
          <div className="flex gap-4">
            <Button
              text={t("addCourseButton")}
              variant="primary"
              className="px-6 py-3 whitespace-nowrap"
              onClick={() => setCreateModal(true)}
            />

            <Button
              text={t("validationButton")}
              variant="primary"
              className="px-6 py-3 whitespace-nowrap"
              onClick={() => navigate("/validation-courses")}
            />
          </div>



        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-6 w-full">
          <div className="relative flex-1 min-w-[280px] lg:min-w-[450px]">
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

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow p-5 flex flex-col border hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="w-12 h-12 flex items-center justify-center bg-grad-2 rounded-lg">
                  <BookOpen size={24} className="text-primary" />
                </div>
                <span
                  className={`px-3 py-1 text-xs rounded-lg font-medium ${item.level === "Beginner"
                    ? "bg-primary/30 text-primary"
                    : item.level === "Intermediate"
                      ? "bg-secondary/30 text-secondary"
                      : "bg-pink/30 text-pink"
                    }`}
                >
                  {t(`difficulty.${item.level}`)}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-textc">{item.title}</h3>
              <p className="text-gray-500 text-sm mb-4">{item.category}</p>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{t("submissions", { count: item.students })}</span>
                <div className="flex gap-3 text-gray-400">
                  <Pencil
                    size={18}
                    className="text-primary cursor-pointer hover:scale-110 transition"
                    onClick={() => openEdit(item)}
                  />
                  <Trash2
                    size={18}
                    className="text-red-500 cursor-pointer hover:scale-110 transition"
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
            value: newCourse.title,
            onChange: (e) => setNewCourse({ ...newCourse, title: e.target.value }),
          },
          {
            label: t("field.category"),
            placeholder: t("field.categoryPlaceholder"),
            value: newCourse.category,
            onChange: (e) => setNewCourse({ ...newCourse, category: e.target.value }),
          },
          {
            label: t("field.difficulty"),
            element: (
              <select
                value={newCourse.level}
                onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                className="bg-grisclair rounded-md px-3 py-2 border-primary"
              >
                <option value="Beginner">{t("difficulty.Beginner")}</option>
                <option value="Intermediate">{t("difficulty.Intermediate")}</option>
                <option value="Advanced">{t("difficulty.Advanced")}</option>
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
                value={editValues.level}
                onChange={(e) => setEditValues({ ...editValues, level: e.target.value })}
                className="bg-grisclair rounded-md px-3 py-2"
              >
                <option value="Beginner">{t("difficulty.Beginner")}</option>
                <option value="Intermediate">{t("difficulty.Intermediate")}</option>
                <option value="Advanced">{t("difficulty.Advanced")}</option>
              </select>
            ),
          },
        ]}
      />
    </div>
  );
}
