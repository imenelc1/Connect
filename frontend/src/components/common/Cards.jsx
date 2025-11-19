
export default function Cards({ icon, title, text, gradient }) {
  return (
    <div
      className={`
        w-78  rounded-3xl shadow-md p-4 p-6
        flex flex-col items-start gap-4
        transition
        ${gradient
          ? "bg-grad-1 text-white"
          : "bg-surface text-title-card"
        }
      `}
    >
      <div
        className={`
          w-16 h-16 rounded-full flex items-center justify-center shadow-md text-3xl
          ${gradient
            ? "bg-white text-primary"
            : "bg-primary text-white"
          }
        `}
      >
        {icon}
      </div>

      <h3 className="text-base font-bold uppercase whitespace-nowrap text-text">
        {title}
      </h3>

      <p className="text-left text-base opacity-90 text-text">
        {text}
      </p>
    </div>
  );
}
