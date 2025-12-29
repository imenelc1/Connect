import { createContext } from "react";

const ExerciseContext = createContext({
  id: null,
  titre: "",
  enonce: "",
  code: "",
  output: "",
  level: "débutant",
  setLevel: () => {},
  generateExercise: () => {},
  onHintRequest: () => {},
});

export default ExerciseContext;
