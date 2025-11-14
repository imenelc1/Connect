




 import CodeBlock from "../common/CodeBlock";
import mascotte from "../../assets/mascotte.svg";
import CardsSection from "../common/CardsSection";
import AboutSection from "../ui/AboutSection";
import "../../styles/index.css";



export default function Body() {
  return (
    <section className="py-20 bg-[var(--color-surface)] flex flex-col items-center gap-16   w-full max-w-[1400px] mx-auto px-6">

      {/* PARTIE 1 : Code + Mascotte */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        <div className="md:-translate-y-10">
    <CodeBlock />
  </div>
       

        <img
          src={mascotte}
          alt="Robot"
          className="w-44 md:w-56 md:translate-y-12"
        />
      </div>

 {/* PARTIE 2 : ABOUT */}
<AboutSection/>
      


      {/* PARTIE 3 : Cards juste en dessous */}
      <div className="w-full">
        <CardsSection />
      </div>

    </section>
  );
}
