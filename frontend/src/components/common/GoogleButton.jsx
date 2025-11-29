import { FcGoogle } from "react-icons/fc";

export default function GoogleButton({ text = "Continue with Google" }) {
  return (
    <button className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-full border border-gray-300">
      <FcGoogle size={20} />
      {text}
    </button>
  );
}
