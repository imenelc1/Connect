
import Cards from "./Cards";
import "../../styles/index.css";
import {
  FaBookOpen,
  FaChartLine,
  FaBrain,
  FaGamepad,
  FaUsers,
  FaComments,
} from "react-icons/fa";

import { useTranslation } from "react-i18next";

export default function CardsSection() {
  // Hook i18next → permet de traduire le texte dynamiquement
  const { t } = useTranslation("acceuil");

  // Liste des cartes à afficher
  // Chaque objet contient une icône, un titre, un texte, et parfois gradient
  const features = [
    {
      icon: <FaBookOpen />,
      title: "acceuil.structuredCourses",
      text: "acceuil.structuredCoursesText",
    },
    {
      icon: <FaChartLine />,
      title: "acceuil.personalizedTracking",
      text: "acceuil.personalizedTrackingText",
      gradient: true, // active un style différent dans Card
    },
    {
      icon: <FaUsers />,
      title: "acceuil.accessibleEveryone",
      text: "acceuil.accessibleEveryoneText",
    },
    {
      icon: <FaBrain />,
      title: "acceuil.integratedAI",
      text: "acceuil.integratedAIText",
    },
    {
      icon: <FaGamepad />,
      title: "acceuil.gamification",
      text: "acceuil.gamificationText",
      gradient: true,
    },
    {
      icon: <FaComments />,
      title: "acceuil.forumsCollaboration",
      text: "acceuil.forumsCollaborationText",
    },
  ];

  return (
    <section className="py-20">
      {/* Titre principal */}
      <h2 className="text-center text-3xl font-bold text-textc">
        {t("acceuil.whyChoose")}
      </h2>

      {/* Sous-titre */}
      <p className="text-center text-textc mt-2 mb-12">
        {t("acceuil.whyChooseText")}
      </p>

      {/* Grille contenant les cartes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-4 place-items-center">
        {features.map((f, i) => (
          // Chaque carte est rendue à partir du composant Cards
          <Cards
            key={i}
            icon={f.icon}
            title={f.title}
            text={f.text}
            gradient={f.gradient}
          />
        ))}
      </div>
    </section>
  );
}
