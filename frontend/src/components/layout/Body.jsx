import React from "react";
import { motion } from "framer-motion";
import CodeBlock from "../common/CodeBlock";
import mascotte from "../../assets/mascotte.svg";
import CardsSection from "../common/CardsSection";
import AboutSection from "../ui/AboutSection";
import "../../styles/index.css";

export default function Body() {
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  return (
    <section className="py-20 bg-background flex flex-col items-center gap-16 w-full max-w-[1400px] mx-auto px-6">
      
      <motion.div
        className="flex flex-row items-center justify-center gap-0"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
      >
        <div className="md:-translate-y-10">
          <CodeBlock />
        </div>
        <motion.img
          src={mascotte}
          alt="Robot"
          className="w-44 md:w-56 md:translate-y-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2 } }}
          viewport={{ once: true, amount: 0.3 }}
        />
      </motion.div>

      <motion.div
        className="w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
      >
        <AboutSection />
      </motion.div>

      <motion.div
        className="w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
      >
        <CardsSection />
      </motion.div>

    </section>
  );
}
