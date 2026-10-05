"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const greetings = [
  { text: "Hello", language: "English" },
  { text: "こんにちは", language: "Japanese" },
  { text: "Bonjour", language: "French" },
  { text: "Hola", language: "Spanish" },
  { text: "안녕하세요", language: "Korean" },
  { text: "Ciao", language: "Italian" },
  { text: "Hallo", language: "German" },
  { text: "Namaste", language: "Hindi" },
];

export default function DynamicText() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % greetings.length);
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  const textVariants = {
    hidden: {
      y: 14,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
    },
    exit: {
      y: -14,
      opacity: 0,
    },
  };

  return (
    <div
      className="hero-greeting"
      aria-label="Greetings in different languages"
    >
      <span className="hero-greeting-line" />

      <div className="hero-greeting-window">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={currentIndex}
            initial={textVariants.hidden}
            animate={textVariants.visible}
            exit={textVariants.exit}
            transition={{
              duration: 0.10,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="hero-greeting-text"
          >
            <span className="hero-greeting-dot" />
            <span>{greetings[currentIndex].text}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      <span className="hero-greeting-line" />
    </div>
  );
}