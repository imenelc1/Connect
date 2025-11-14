// 



import "../../styles/index.css";

export default function Cards({ icon, title, text, gradient = false }) {
  return (
    <div
      
  className={`
    w-72 h-64
    scale-100 sm:scale-95 md:scale-90 lg:scale-100   
    origin-top                                      
    rounded-3xl shadow-md p-6
    flex flex-col items-start justify-start gap-4
    ${gradient
      ? "bg-gradient-to-br from-[#4F9DDE] to-[#2F4F70] text-white"
      : "bg-[var(--color-bg)] text-[var(--color-text-main)]"
    }
  `}
>

    
      {/* ICON CIRCLE */}
      <div
        className={`
          w-16 h-16 rounded-full flex items-center justify-center shadow-md text-3xl
          ${gradient ? "bg-white text-[var(--color-primary)]" : "bg-[var(--color-primary)] text-white"}
        `}
      >
        {icon}
      </div>

      {/* TITLE */}
      <h3 className={`text-center text-base font-bold uppercase whitespace-nowrap
      ${gradient ? "text-white" : "text-[#2F4F70]"}
      
      `}
      
      >
        {title}
      </h3>

      {/* TEXT */}
     <p
  className={`text-left text-base 
    ${gradient ? "text-white/90" : "text-[#2F4F70]"}
  `}
>
  {text}
</p>
    </div>
  );
}
