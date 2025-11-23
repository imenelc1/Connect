import React from "react";
import "../../styles/index.css";

export default function CodeBlock() {
  return (
    // Conteneur principal du bloc de code (carte stylisée)
    <div className="relative p-4 sm:p-6 rounded-2xl shadow-lg w-full w-[420px] h-[260px] md:max-w-[450px] bg-surface">

      {/* Nom du fichier affiché en haut */}
      <div className="text-textc mb-3 font-bold">
        &gt; -algorithme.c
      </div>

      {/* Bloc contenant le code source */}
      <pre className="p-5 rounded-xl font-mono text-[15px] leading-6 shadow-inner overflow-x-auto">
        <code>
          {/* Code C stylisé syntaxiquement */}
          <span className="text-yellowc font-bold">#INCLUDE</span>{" "}
          <span className="text-primary font-bold">&lt;STDIO.H&gt;</span>
          {"\n"}

          <span className="text-secondary font-bold">INT</span>{" "}
          <span className="text-textc font-bold">MAIN</span>(){"\n"}
          {"{"}{"\n"}
          {"  "}
          <span className="text-secondary font-bold">INT</span>{" "}
          <span className="text-yellowc font-bold">N=0;</span>
          {"\n"}
          {"  "}
          <span className="text-primary font-bold">PRINTF</span>
          <span className="text-bg font-bold">("HELLO CONNECT");</span>
          {"\n  "}
          <span className="text-yellowc font-bold">return 0;</span>
          {"\n"}
          {"}"}
        </code>
      </pre>

      {/* Décorations circulaires (flèches) pour le design */}
      <div className="absolute top-[-18px] right-[-18px] w-14 h-14 bg-surface rounded-full flex items-center justify-center shadow-lg text-xl font-black text-primary">
        {"< >"}
      </div>

      {/* Cercle décoratif bas-gauche */}
      <div className="absolute bottom-[-18px] left-[-18px] w-14 h-14 bg-surface rounded-full flex items-center justify-center shadow-lg text-2xl font-black text-primary">
        {"{ }"}
      </div>

    </div>
  );
}
