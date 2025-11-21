
export default function Cards({ icon, title, text, gradient }) {
  return (
    <div
      className={`
        w-78  rounded-3xl shadow-md p-6
        flex flex-col items-start gap-4
        transition
        ${gradient
          ? "bg-gradient-to-br from-[#4F9DDE] to-[#2F4F70] text-white"
          : "bg-[var(--color-bg)] text-[var(--color-text-main)]"
        }
      `}
    >
      <div
        className={`
          w-16 h-16 rounded-full flex items-center justify-center shadow-md text-3xl
          ${gradient
            ? "bg-white text-[var(--color-primary)]"
            : "bg-[var(--color-primary)] text-white"
          }
        `}
      >
        {icon}
      </div>

      <h3 className="text-base font-bold uppercase whitespace-nowrap">
        {title}
      </h3>

      <p className="text-left text-base opacity-90">
        {text}
      </p>
    </div>
  );
}
