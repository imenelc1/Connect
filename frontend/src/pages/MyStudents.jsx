
import React, { useState } from "react";
import { Search, Bell } from "lucide-react";
import Navbar from "../components/common/Navbar";
import Button from "../components/common/Button";
import Cards2 from "../components/common/Cards2";
import AddModal from "../components/common/AddModel";
import UserCircle from "../components/common/UserCircle";
import "../styles/index.css";
import { useTranslation } from "react-i18next";
import LogoComponent from "../components/common/LogoComponent"; // <-- ton chemin peut varier

export default function MyStudents() {

  const { t } = useTranslation("myStudents");

  const [modal, setModal] = useState(false);
  const [email, setEmail] = useState("");
  const [studentID, setStudentID] = useState("");
  const [space, setSpace] = useState("");

  const students = [
    { name: "Hamouche Meriem", course: "Mobile Design Patterns", progress: 100, lastActive: "3h ago", bg: "bg-grad-2" },
    { name: "Imene Lakhdar Chaouch", course: "Mobile Design Patterns", progress: 30, lastActive: "3h ago", bg: "bg-grad-3" },
    { name: "Albane Amina", course: "Mobile Design Patterns", progress: 100, lastActive: "2h ago", bg: "bg-grad-4" },
    { name: "Azidane Chahla", course: "Mobile Design Patterns", progress: 100, lastActive: "1h ago", bg: "bg-grad-2" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setModal(false);
  };

  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex">

      <Navbar />

      <main className="ml-60  w-full min-h-screen px-6 py-6 bg-bg">

        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-5xl font-semibold text-primary text-3d">{t("myStudentsTitle")}</h1>

          <div className="flex items-center gap-4">
            <Bell className="w-5 h-5 text-gray-600 cursor-pointer fill-current" />

            <UserCircle initials="MH" onToggleTheme={() => console.log("theme toggle")} />


          </div>
        </div>

        {/* ===== SEARCH + ACTIONS ===== */}
        <div className="mt-5 w-full max-w-full flex items-center gap-10">
          <div className="relative flex-1 min-w-0 mt-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5" />
            <input
              type="text"
              placeholder={t("searchStudentPlaceholder")}
              className="w-full pl-10 pr-4 py-3 rounded-xl border 
              focus:outline-none focus:ring-2 focus:ring-primary
              text-gray-700 placeholder:text-gray-400 min-w-0"
            />
          </div>

          <div className="flex-1"></div>

          <div className="flex gap-3">
            <Button variant="primary" className="!px-4 !py-2 !text-white !w-auto !h-auto">{t("createSpace")}</Button>
            <Button variant="primary" className="!px-4 !py-2 !text-white !w-auto !h-auto" onClick={() => setModal(true)}>
              {t("addStudent")}
            </Button>
          </div>
        </div>

        {/* ===== STUDENT CARDS ===== */}
        <div className="mt-8 space-y-10">
          {students.map((st, i) => (
            <Cards2
              key={i}
              icon={<UserCircle initials={st.name.split(" ").map(n => n[0]).join("").slice(0, 2)} />}  // Prend les 2 initiales du nom automatiquement en utilisant le tableau students 
              roundedIcon={true}
              title={st.name}
              description={st.course}
              progress={st.progress}
              status={`${t("active")} ${st.lastActive}`}
              className={`${st.bg} rounded-xl shadow-md border p-6`}
            />
          ))}
        </div>

        {/* ===== PAGINATION ===== */}
        <div className="flex justify-center gap-4 mt-8">
          <span className="w-5 h-5 flex justify-center items-center cursor-pointer">&lt;</span>
          <span className="w-5 h-5 flex justify-center items-center hover:bg-secondary/80 hover:text-surface cursor-pointer">1</span>
          <span className="w-5 h-5 flex justify-center items-center hover:bg-secondary/80 hover:text-surface cursor-pointer">2</span>
          <span className="w-5 h-5 flex justify-center items-center hover:bg-secondary/80 hover:text-surface cursor-pointer">3</span>
          <span className="w-5 h-5 flex justify-center items-center cursor-pointer">&gt;</span>
        </div>

        {/* ===== MODAL ===== */}
        <AddModal
          open={modal}
          onClose={() => setModal(false)}
          title={t("addStudentTitle")}
          subtitle={t("addStudentSubtitle")}
          submitLabel={t("addStudentSubmit")}
          cancelLabel={t("addStudentCancel")}
          onSubmit={handleSubmit}
          fields={[
            { label: t("email"), placeholder: t("emailPlaceholder"), value: email, onChange: e => setEmail(e.target.value) },
            { label: t("studentID"), placeholder: t("studentIDPlaceholder"), value: studentID, onChange: e => setStudentID(e.target.value) },
            {
              label: t("space"),
              element: (
                <select value={space} onChange={e => setSpace(e.target.value)} className="w-full border rounded px-3 py-2">
                  <option value="UI/UX Class">{t("UIUXClass")}</option>
                  <option value="Mobile Design">{t("mobileDesign")}</option>
                  <option value="Web Development">{t("webDevelopment")}</option>
                  <option value="Data Science">{t("dataScience")}</option>
                </select>
              )
            }
          ]}
        />

      </main>
    </div>
  );
}
