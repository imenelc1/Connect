import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/common/Navbar";
import Button from "../components/common/Button";
import AddModal from "../components/common/AddModel";
import { Plus, Trash, SquarePen } from "lucide-react";
import { useTranslation } from "react-i18next";
import ThemeContext from "../context/ThemeContext";
import ContentSearchBar from "../components/common/ContentSearchBar";
import api from "../services/apiGenerale";
import { toast } from "react-hot-toast";
import Input from "../components/common/Input";

// Import des icônes React
import {
  FaMedal,
  FaChartLine,
  FaTrophy,
  FaRocket,
  FaLightbulb,
  FaStar,
  FaFire,
  FaLock,
} from "react-icons/fa";
import { MdAutoAwesome } from "react-icons/md";

// Couleurs selon la catégorie
const categoryColors = {
  progress: {
    icon: "bg-blue",
    card: "bg-grad-2",
    xp: "text-blue border-blue bg-blue/10",
  },
  success: {
    icon: "bg-purple",
    card: "bg-grad-3",
    xp: "text-purple border-purple bg-purple/10",
  },
  special: {
    icon: "bg-pink",
    card: "bg-grad-4",
    xp: "text-pink border-pink bg-pink/10",
  },
  default: {
    icon: "bg-blue",
    card: "bg-grad-2",
    xp: "text-blue border-blue bg-blue/10",
  },
};
const buttonStyles = {
  progress: {
    icon: "bg-blue",
    card: "bg-grad-2",
    xp: "text-blue border-blue bg-blue/10",
  },
  success: {
    icon: "bg-purple",
    card: "bg-grad-3",
    xp: "text-purple border-purple bg-purple/10",
  },
  special: {
    icon: "bg-pink",
    card: "bg-grad-4",
    xp: "text-pink border-pink bg-pink/10",
  },
  default: {
    icon: "bg-blue",
    card: "bg-grad-2",
    xp: "text-blue border-blue bg-blue/10",
  },
};

// Fonction pour récupérer l'icône selon le titre
const getBadgeIcon = (title) => {
  switch (title) {
    case "Course Explorer":
      return <FaMedal className="text-white text-xl" />;
    case "Halfway There":
      return <FaChartLine className="text-white text-xl" />;
    case "Dedicated Learner":
      return <FaTrophy className="text-white text-xl" />;
    case "Marathon Coder":
      return <FaRocket className="text-white text-xl" />;
    case "First Steps":
      return <FaLightbulb className="text-white text-xl" />;
    case "Problem Solver":
      return <FaStar className="text-white text-xl" />;
    case "Perfectionist":
      return <FaStar className="text-white text-xl" />;
    case "Speed Demon":
      return <FaRocket className="text-white text-xl" />;
    case "7 Day Streak":
      return <FaFire className="text-white text-xl" />;
    case "Quiz Novice":
      return <FaLightbulb className="text-white text-xl" />;
    case "Quiz Whiz":
      return <FaStar className="text-white text-xl" />;
    case "Quiz Master":
      return <FaTrophy className="text-white text-xl" />;
    case "Curious Mind":
      return <FaLightbulb className="text-white text-xl" />;
    case "AI Learner":
      return <MdAutoAwesome className="text-white text-xl" />;
    case "All-Rounder":
      return <FaMedal className="text-white text-xl" />;
    case "Legendary Coder":
      return <FaTrophy className="text-white text-xl" />;
    case "Active Learner":
      return <FaFire className="text-white text-xl" />;
    case "Night Owl":
      return <FaStar className="text-white text-xl" />;
    case "Top Commentator":
      return <FaLightbulb className="text-white text-xl" />;
    default:
      return <FaRocket className="text-white text-xl" />;
  }
};

// Icône avec couleur selon catégorie
const getColoredBadgeIcon = (title, category) => {
  const colorClass =
    categoryColors[category]?.icon || categoryColors.default.icon;
  const icon = getBadgeIcon(title);
  return React.cloneElement(icon, { className: `${colorClass} text-xl` });
};

export default function BadgesManagement() {
  const { t } = useTranslation("BadgesManagement");
  const { toggleDarkMode } = useContext(ThemeContext);

  const [badges, setBadges] = useState([]);
  const [search, setSearch] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [previewIcon, setPreviewIcon] = useState("");

  const [formValues, setFormValues] = useState({
    title: "",
    desc: "",
    category: "success",
    condition: "",
    xpPoint: 0,
    icon: "",
  });

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [studentsModalOpen, setStudentsModalOpen] = useState(false);
  const [students, setStudents] = useState([]);

  // Récupération des badges
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await api.get("badges/badge/");
        const mappedBadges = res.data.map((b) => ({
          id: b.id,
          title: b.nom,
          desc: b.description,
          category: b.categorie.toLowerCase(),
          condition: b.condition,
          xpPoint: b.numpoints,
          locked: false,
        }));
        setBadges(mappedBadges);
      } catch (err) {
        console.error(t("messages.fetchBadgesError"), err);

      }
    };
    fetchBadges();
  }, []);

  // Resize & sidebar
  useEffect(() => {
    const resizeHandler = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
    };
    const sidebarHandler = (e) => setSidebarCollapsed(e.detail);

    window.addEventListener("resize", resizeHandler);
    window.addEventListener("sidebarChanged", sidebarHandler);
    return () => {
      window.removeEventListener("resize", resizeHandler);
      window.removeEventListener("sidebarChanged", sidebarHandler);
    };
  }, []);

  // Voir les étudiants
  const handleViewStudents = async (badge) => {
    try {
      const res = await api.get(`badges/badge/${badge.id}/utilisateurs/`);
      setStudents(res.data);
      setSelectedBadge(badge);
      setStudentsModalOpen(true);
    } catch (err) {
      console.error(t("messages.fetchStudentsError"), err);
      toast.error(t("messages.fetchStudentsToast"));

    }
  };

  const getGridCols = () => {
    if (windowWidth < 640) return 1;
    if (windowWidth < 1024) return 2;
    return 3;
  };

  const filteredBadges = badges.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.desc.toLowerCase().includes(search.toLowerCase())
  );

  // Création / édition
  const handleCreate = () => {
    setSelectedBadge(null);
    setFormValues({
      title: "",
      desc: "",
      category: "success",
      condition: "",
      xpPoint: 0,
      icon: "",
    });
    setPreviewIcon("");
    setCreateModal(true);
  };

  const handleEdit = (badge) => {
    setSelectedBadge(badge);
    setFormValues({
      title: badge.title,
      desc: badge.desc,
      category: badge.category,
      condition: badge.condition,
      xpPoint: badge.xpPoint,
      icon: "",
    });
    setPreviewIcon(""); // pas de fichier uploadé, icône React sera affichée
    setEditModal(true);
  };

  const submitBadge = async () => {
    try {
      const formData = new FormData();
      formData.append("nom", formValues.title);
      formData.append("description", formValues.desc);
      formData.append("categorie", formValues.category);
      formData.append("condition", formValues.condition);
      formData.append("numpoints", formValues.xpPoint);
      if (formValues.icon instanceof File)
        formData.append("icone", formValues.icon);

      if (selectedBadge) {
        // Edit
        const res = await api.put(
          `badges/badge/${selectedBadge.id}/`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setBadges((prev) =>
          prev.map((b) =>
            b.id === selectedBadge.id
              ? {
                ...b,
                title: res.data.nom,
                desc: res.data.description,
                category: res.data.categorie.toLowerCase(),
                condition: res.data.condition,
                xpPoint: res.data.numpoints,
              }
              : b
          )
        );
        setEditModal(false);
        toast.success(t("messages.updated"));

      } else {
        // Create
        const res = await api.post("badges/create_badge/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setBadges((prev) => [
          ...prev,
          {
            id: res.data.id,
            title: res.data.nom,
            desc: res.data.description,
            category: res.data.categorie.toLowerCase(),
            condition: res.data.condition,
            xpPoint: res.data.numpoints,
            locked: false,
          },
        ]);
        setCreateModal(false);
        toast.success(t("messages.created"));
      }
    } catch (err) {
      console.error(t("messages.errorBadge"), err);
      toast.error(t("messages.operationError"));
    }
  };

  const handleDelete = async (badgeId) => {
    if (!window.confirm(t("messages.confirmDelete"))) return;
    try {
      await api.delete(`badges/badge/${badgeId}/delete/`);
      setBadges((prev) => prev.filter((b) => b.id !== badgeId));
      toast.error(t("messages.deleted"));
    } catch (err) {
      console.error(err);
      toast.error(t("messages.deleteError"));
    }
  };

  return (
    <div className="flex flex-row min-h-screen bg-surface gap-16 md:gap-1">
      {/* Sidebar */}
      <div>
        <Navbar />
      </div>
      <main className={`flex-1 p-6 pt-10 space-y-5 transition-all duration-300 ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}`}>



        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-muted">
              {t("BadgesManagement.title")}
            </h1>
            <p className="text-gray">{t("BadgesManagement.badgesp")}</p>
          </div>
          <Button
            text={
              <span className="flex items-center gap-2">
                <Plus size={18} /> {t("BadgesManagement.buttonCreate")}
              </span>
            }
            variant="primary"
            className="!w-auto px-6 py-2 rounded-xl"
            onClick={handleCreate}
          />
        </div>

        <ContentSearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("BadgesManagement.search")}
          className="w-full max-w-md mb-6 sm:mb-10"
        />

        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: `repeat(${getGridCols()}, minmax(0,1fr))`,
          }}
        >
          {filteredBadges.map((badge) => (
            <div
              className={`rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between ${categoryColors[badge.category]?.card || categoryColors.default.card
                }`}
            >

              <div className="flex justify-between mb-4">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${categoryColors[badge.category]?.icon ||
                    categoryColors.default.icon
                    }`}
                >
                  {getBadgeIcon(badge.title)}
                </div>

                <span
                  className={`h-6 px-3 py-1 text-xs font-medium rounded-full ${buttonStyles[badge.category]?.xp || buttonStyles.default.xp
                    }`}
                >
                  {badge.category}
                </span>
              </div>
              <h2 className="font-semibold text-lg">{badge.title}</h2>
              <p className="text-sm text-grayc/85">{badge.desc}</p>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-2">
                <p className="text-sm text-gray">{badge.xpPoint}</p>
                <div className="flex gap-3 text-gray">
                  <Button
                    variant="courseStart"
                    className={`px-4 py-2 whitespace-nowrap border rounded ${buttonStyles[badge.category]?.xp ||
                      buttonStyles.default.xp
                      }`}
                    onClick={() => handleViewStudents(badge)}
                  >
                    {t("BadgesManagement.viewStudents")}
                  </Button>
                  <button
                    className="text-muted hover:opacity-80"
                    onClick={() => handleEdit(badge)}
                  >
                    <SquarePen size={20} />
                  </button>
                  <button
                    className="text-red hover:opacity-80"
                    onClick={() => handleDelete(badge.id)}
                  >
                    <Trash size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal création / édition */}
      <AddModal
        open={createModal || editModal}
        onClose={() => {
          setCreateModal(false);
          setEditModal(false);
        }}
        title={selectedBadge ? t("editTitle") : t("createBadge")}
        submitLabel={selectedBadge ? t("common.save") : t("common.create")}
        cancelLabel={t("common.cancel")}
        onSubmit={submitBadge}
        fields={[
          {
            label: t("fields.title"),
            element: (
              <Input
                type="text"
                className="border p-2 rounded w-full "
                value={formValues.title}
                onChange={(e) =>
                  setFormValues({ ...formValues, title: e.target.value })
                }
              />
            ),
          },
          {
            label: "Description",
            element: (
              <textarea
                className="border p-2 rounded w-full  bg-surface"
                value={formValues.desc}
                onChange={(e) =>
                  setFormValues({ ...formValues, desc: e.target.value })
                }
              />
            ),
          },
          {
            label: t("fields.category"),
            element: (
              <select
                value={formValues.category}
                onChange={(e) =>
                  setFormValues({ ...formValues, category: e.target.value })
                }
                className="border p-2 rounded w-full bg-surface"
              >
                <option value="success">{t("fields.categories.success")}</option>
                <option value="special">{t("fields.categories.special")}</option>
                <option value="progress">{t("fields.categories.progress")}</option>
              </select>
            ),
          },
          {
            label: "Condition",
            element: (
              <Input
                type="text"
                className="border p-2 rounded w-full "
                value={formValues.condition}
                onChange={(e) =>
                  setFormValues({ ...formValues, condition: e.target.value })
                }
              />
            ),
          },
          {
            label: t("fields.xpPoints"),
            element: (
              <Input
                type="number"
                className="border p-2 rounded w-full "
                value={formValues.xpPoint}
                onChange={(e) =>
                  setFormValues({
                    ...formValues,
                    xpPoint: Number(e.target.value),
                  })
                }
              />
            ),
          },
          {
            label: t("fields.icon"),

            element: (
              <div className="flex flex-col gap-2 items-center">
                {previewIcon ? (
                  <img
                    src={previewIcon}
                    alt={t("fields.iconPreview")}
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center rounded-lg border bg-gray-100">
                    {getColoredBadgeIcon(
                      formValues.title || "default",
                      formValues.category
                    )}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setFormValues({ ...formValues, icon: file });
                    if (file) setPreviewIcon(URL.createObjectURL(file));
                  }}
                />
              </div>
            ),
          },
        ]}
      />

      {/* Modal étudiants */}
      <AddModal
        open={studentsModalOpen}
        onClose={() => setStudentsModalOpen(false)}
        title={t("modalTitle", { title: selectedBadge?.title })}

        submitLabel={t("BadgesManagement.close")}
        cancelLabel=""
        onSubmit={() => setStudentsModalOpen(false)}
        fields={[
          {
            label: "",
            element: (
              <div className="flex flex-col gap-2 max-h-96 overflow-auto">
                {students.length === 0 ? (
                  <p>{t("BadgesManagement.noStudent")}</p>
                ) : (
                  students.map((s, index) => (
                    <div
                      key={index}
                      className="border-b py-2 flex justify-between"
                    >
                      <span>
                        {s.nom} {s.prenom}
                      </span>
                      <span>
                        {t("BadgesManagement.studentInfo", {
                          specialite: s.specialite,
                          annee: s.annee_etude,
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}