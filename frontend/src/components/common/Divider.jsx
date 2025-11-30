export default function Divider({ text = "Or" }) {
  return (
    <div className="flex items-center my-4">
      <div className="flex-grow h-px bg-gray-300"></div>
      <span className="mx-2 text-gray-400 text-sm">{text}</span>
      <div className="flex-grow h-px bg-gray-300"></div>
    </div>
  );
}
