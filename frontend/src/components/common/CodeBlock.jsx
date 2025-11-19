// CodeBlock.jsx
import React from "react";
import "../../styles/index.css";

export default function CodeBlock() {
  return (
    <div className="relative  p-4 sm:p-6 rounded-2xl shadow-lg w-full w-[420px] h-[260px] md:max-w-[450px] h-[260px]">

      {/* Nom du fichier */}
      <div className="text-textc mb-3 font-bold">
        &gt; -algorithme.c
      </div>

      {/* Bloc de code */}
      <pre className=" p-5 rounded-xl font-mono text-[15px] leading-6 shadow-inner overflow-x-auto">
        <code>
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

      {/* Cercle flèche */}
      <div className="absolute top-[-18px] right-[-18px] w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg text-xl font-black text-primary">
        {"< >"}
      </div>

      {/* Cercle accolades */}
      <div className="absolute bottom-[-18px] left-[-18px] w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg text-2xl font-black text-primary">
        {"{ }"}
      </div>

    </div>
  );
}