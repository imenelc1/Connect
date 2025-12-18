import React, { useState, useEffect } from "react";
import Button from "../components/common/Button";
import ProgressBar from "../components/ui/ProgressBar";
import Navbar from "../components/common/NavBar";
import { Trash, SquarePen, Search, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function StudentsManagement() {
<<<<<<< HEAD
    const { t } = useTranslation("StudentsManagement");
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const students = [
        { initials: "AM", name: "Alice Martin", email: "alice.m@email.com", courses: 5, progress: 85, joined: "Jan 2024" },
        { initials: "BJ", name: "Bob Johnson", email: "bob.j@email.com", courses: 3, progress: 62, joined: "Feb 2024" },
        { initials: "CS", name: "Carol Smith", email: "carol.s@email.com", courses: 7, progress: 91, joined: "Dec 2023" },
        { initials: "DL", name: "David Lee", email: "david.l@email.com", courses: 4, progress: 73, joined: "Mar 2024" },
        { initials: "EW", name: "Emma Wilson", email: "emma.w@email.com", courses: 6, progress: 88, joined: "Jan 2024" },
        { initials: "FB", name: "Frank Brown", email: "frank.b@email.com", courses: 2, progress: 45, joined: "Apr 2024" },
    ];

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // largeur dynamique navbar
    const sidebarWidth = windowWidth < 640 ? 64 : 240; // 16rem sur mobile, 240px sur desktop

    const getGridCols = () => {
        if (windowWidth < 640) return 1;
        if (windowWidth < 1024) return 2;
        return 3;
    };

    return (
        <div className="flex bg-surface min-h-screen">
            {/* Navbar collapsée sur mobile */}
            <div
                className={`flex-shrink-0 transition-all duration-300`}
                style={{ width: sidebarWidth }}
            >
                <Navbar collapsed={windowWidth < 640} /> {/* si ton composant Navbar accepte un prop collapsed */}
            </div>

            {/* Main content */}
            <main
                className="flex-1 p-4 sm:p-6 md:p-10 transition-all duration-300"
                style={{ marginLeft: 0 }} // margin-left inutile car flex prend tout l'espace
            >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold">
                            {t("StudentsManagement.StudentsManagement")}
                        </h1>
                        <p className="text-grayc text-sm sm:text-base">
                            {t("StudentsManagement.view")}
                        </p>
                    </div>

                  
                    <Button
                        variant="heroPrimary"
                        className="!w-auto bg-primary rounded-full px-6 py-3 flex items-center gap-2"
                    >
                         <UserPlus size={18} />
                          {t("StudentsManagement.buttonAdd")}
                    </Button>
                </div>

                {/* Search bar */}
                <div className="relative mb-6 sm:mb-10 w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-grayc w-5 h-5" />
                    <input
                        className="w-full pl-12 pr-4 py-2 rounded-full border border-grayc/30 shadow-sm focus:outline-none"
                        placeholder={t("StudentsManagement.Search")}
                    />
                </div>

                {/* Students Grid */}
                <div
                    className="grid gap-6"
                    style={{ gridTemplateColumns: `repeat(${getGridCols()}, minmax(0, 1fr))` }}
                >
                    {students.map((s, index) => (
                        <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
                        >
                            {/* Card header */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-12 h-12 rounded-full bg-primary text-card flex items-center justify-center text-lg font-semibold">
                                        {s.initials}
                                    </div>
                                    <div className="truncate">
                                        <h2 className="font-semibold text-lg truncate">{s.name}</h2>
                                        <p className="text-sm text-grayc truncate">{s.email}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4 text-grayc">
                                    <button className="text-primary hover:opacity-80">
                                        <SquarePen size={20} />
                                    </button>
                                    <button className="text-red hover:opacity-80">
                                        <Trash size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Courses */}
                            <p className="text-sm text-grayc mb-2">
                                {t("StudentsManagement.Encolled")} {s.courses}
                            </p>

                            {/* Progress */}
                            <div className="mb-2">
                                <div className="flex justify-between text-sm text-grayc mb-1">
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
            </main>
        </div>
    );
=======
  const { t } = useTranslation("StudentsManagement");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
useEffect(() => {
  const fetchStudents = async () => {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      setError("Token JWT manquant, vous devez vous reconnecter.");
      setStudents([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/users/etudiants/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const text = await res.text();

      if (!res.ok) {
        console.error(`Erreur HTTP ${res.status}:`, text);
        throw new Error(`Impossible de récupérer les étudiants (${res.status})`);
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Réponse non JSON :", text);
        throw new Error("Réponse serveur invalide");
      }

      if (!Array.isArray(data)) {
        throw new Error("Format inattendu");
      }

      setStudents(data);

    } catch (err) {
      console.error("Erreur chargement étudiants :", err);
      setError("Impossible de charger les étudiants.");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  fetchStudents();
}, []);



  const sidebarWidth = windowWidth < 640 ? 64 : 240;

  const getGridCols = () => {
    if (windowWidth < 640) return 1;
    if (windowWidth < 1024) return 2;
    return 3;
  };

  const filteredStudents = students.filter((s) =>
    `${s.nom} ${s.prenom}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex bg-surface min-h-screen">
      {/* Navbar */}
      <div className={`flex-shrink-0 transition-all duration-300`} style={{ width: sidebarWidth }}>
        <Navbar collapsed={windowWidth < 640} />
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 transition-all duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              {t("StudentsManagement.StudentsManagement")}
            </h1>
            <p className="text-grayc text-sm sm:text-base">
              {t("StudentsManagement.view")}
            </p>
          </div>

          <Button
            variant="heroPrimary"
            className="!w-auto bg-primary rounded-full px-6 py-3 flex items-center gap-2"
          >
            <UserPlus size={18} />
            {t("StudentsManagement.buttonAdd")}
          </Button>
        </div>

        {/* Search bar */}
        <div className="relative mb-6 sm:mb-10 w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-grayc w-5 h-5" />
          <input
            className="w-full pl-12 pr-4 py-2 rounded-full border border-grayc/30 shadow-sm focus:outline-none"
            placeholder={t("StudentsManagement.Search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Loading / Error */}
        {loading && <p>Chargement des étudiants…</p>}
        {error && <p className="text-red mt-2">{error}</p>}

        {/* Students Grid */}
        {!loading && !error && (
          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: `repeat(${getGridCols()}, minmax(0, 1fr))` }}
          >
            {filteredStudents.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary text-card flex items-center justify-center text-lg font-semibold">
                      {s.initials}
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg">{s.nom} {s.prenom}</h2>
                      <p className="text-sm text-grayc">{s.email}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 text-grayc">
                    <button className="text-primary hover:opacity-80">
                      <SquarePen size={20} />
                    </button>
                    <button className="text-red hover:opacity-80">
                      <Trash size={20} />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-grayc mb-2">
                  {t("StudentsManagement.Encolled")} {s.courses}
                </p>

                <div className="mb-2">
                  <div className="flex justify-between text-sm text-grayc mb-1">
                    <span>{t("StudentsManagement.Overal")}</span>
                    <span>{s.progress}%</span>
                  </div>
                  <ProgressBar value={s.progress} />
                </div>

                <div className="flex justify-between text-sm text-grayc mt-4">
                  <span>{t("StudentsManagement.joined")}</span>
                  <span className="font-medium">{s.joined}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
>>>>>>> main
}
