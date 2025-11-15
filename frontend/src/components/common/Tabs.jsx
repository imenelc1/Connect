export default function Tabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex justify-center bg-white mb-6  p-1 rounded-full w-80 mx-auto">
      <button
        className={`flex-1 py-2 rounded-full font-medium  ${
          activeTab === "signin"
            ? "bg-blue-500 text-white"
            : "bg-white text-gray-600"
        }`}
         style={activeTab === "signin" ? { backgroundColor: "#4F9DDE" } : {}}
        onClick={() => setActiveTab("signin")}
      >
        Sign in
      </button>

      <button
        className={`flex-1 py-2 rounded-full font-medium  ${
          activeTab === "signup"
            ? "bg-blue-500 text-white"
            : "bg-white text-gray-600"
        }`}
         style={activeTab === "signup" ? { backgroundColor: "#4F9DDE" } : {}}
        onClick={() => setActiveTab("signup")}
      >
        Sign up
      </button>
    </div>
  );
}
