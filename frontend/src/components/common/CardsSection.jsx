// 
import Cards from "./Cards";
import "../../styles/index.css";
import {
  FaBookOpen,
  FaChartLine,
  FaBrain,
  FaGamepad,
  FaUsers,
  FaComments
} from "react-icons/fa";

export default function CardsSection() {
  const features = [
    {
      icon: <FaBookOpen />,
      title: "STRUCTURED COURSES",
      text: "Progressive and well-organized lessons to master fundamental concepts.",
    },
    {
      icon: <FaChartLine />,
      title: "PERSONALIZED TRACKING",
      text: "Track your progress and identify your strengths and areas for improvement.",
      gradient: true,
    },
    {
      icon: <FaUsers />,
      title: "ACCESSIBLE TO EVERYONE",
      text: "A platform designed for all levels — from beginners to experts.",
    },
    {
      icon: <FaBrain />,
      title: "INTEGRATED AI",
      text: "AI-powered guidance that adapts to your level, helping you learn faster and understand complex concepts with clarity.",
    },
    {
      icon: <FaGamepad />,
      title: "GAMIFICATION",
      text: "Boost your learning with interactive challenges, achievements, and rewards that turn your progress into a game.",
      gradient: true,
    },
    {
      icon: <FaComments />,
      title: "FORUMS FOR COLLABORATION",
      text: "Collaborate, exchange ideas, and get help through dedicated forums connecting students and teachers.",
    },
  ];

  return (
    <section className="py-20">
      <h2 className="text-center text-3xl font-bold text-black">
        Why Choose CONNECT?
      </h2>

      <p className="text-center text-[var(--color-text-main)] mt-2 mb-12">
        We provide the tools and resources you need to master C programming and algorithms effectively
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-4 place-items-center">
        {features.map((f, i) => (
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
