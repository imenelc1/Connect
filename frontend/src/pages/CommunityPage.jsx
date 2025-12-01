import { FiSend } from "react-icons/fi";
import Input from "../components/common/Input";
import Navbar from "../components/common/Navbar";
import UserCircle from "../components/common/UserCircle";
import { useContext, useState } from "react";
import ThemeContext from "../context/ThemeContext";
import Tabs from "../components/common/Tabs";
import Post from "../components/common/Post";
import Button from "../components/common/Button";
import ModernDropdown from "../components/common/ModernDropdown";
import { Bell } from "lucide-react";
export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("recent");
  const userData = JSON.parse(localStorage.getItem("user"));
  const role = userData?.role;

  const forumOptions =
    role === "enseignant"
      ? [
          { value: "all", label: "All forums" },
          { value: "teacher-teacher", label: "Teacher ↔ Teacher" },
          { value: "teacher-student", label: "Teacher ↔ Student" }
        ]
      : [
          { value: "all", label: "All forums" },
          { value: "student-student", label: "Student ↔ Student" },
          { value: "teacher-student", label: "Student ↔ Teacher" }
        ];

  const [forumType, setForumType] = useState("all");

  const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""}`.toUpperCase();
  const { toggleDarkMode } = useContext(ThemeContext);

  const [posts, setPosts] = useState([
    {
      id: 1,
      authorInitials: "SM",
      authorName: "Sophie Martin",
      time: "3 hours ago",
      title: "🎉 Excellente nouvelle ! Mes élèves ont tous réussi le test de géométrie ...",
      likes: 42,
      type: "teacher-teacher",
      comments: [
        {
          userInitials: "JD",
          userName: "Julie Dupont",
          time: "1h ago",
          text: "Bravo ! Quelle méthode visuelle as-tu utilisée ?",
          replies: [
            { userInitials: "SM", userName: "Sophie Martin", time: "1h ago", text: "J'ai utilisé des diagrammes et animations sur GeoGebra !" }
          ]
        }
      ]
    },
    {
      id: 2,
      authorInitials: "MD",
      authorName: "Marc Dubois",
      time: "5h ago",
      title: "Qui a des ressources sur l’enseignement de la physique quantique...?",
      likes: 14,
      type: "teacher-student",
      comments: []
    }
  ]);

  const [newPost, setNewPost] = useState("");

  // -------------------------------
  // ✔ FILTRE PAR ONGLET (Recent / Popular / My Forums)
  // -------------------------------
  const filteredPosts = activeTab === "popular"
    ? [...posts].sort((a, b) => b.likes - a.likes)
    : activeTab === "myforums"
    ? posts.filter((p) => p.authorInitials === initials)
    : posts;

  // -------------------------------
  // ✔ FILTRE SELON LE RÔLE (enseignant / étudiant)
  // -------------------------------
  let roleFiltered;

  if (role === "enseignant") {
    roleFiltered = filteredPosts.filter(
      (p) => p.type === "teacher-teacher" || p.type === "teacher-student"
    );
  } else {
    roleFiltered = filteredPosts.filter(
      (p) => p.type === "student-student" || p.type === "teacher-student"
    );
  }

  // -------------------------------
  // ✔ FILTRE SELON LE DROPDOWN
  // -------------------------------
  const finalPosts =
    forumType === "all"
      ? roleFiltered
      : roleFiltered.filter((p) => p.type === forumType);

  // -------------------------------
  // 🚀 HANDLE SEND POST (corrigé)
  // -------------------------------
  const handleSendPost = () => {
    if (!newPost.trim()) return;

    const newForumPost = {
      id: crypto.randomUUID(),
      authorInitials: initials,
      authorName: `${userData?.nom} ${userData?.prenom}`,
      time: "just now",
      title: newPost,
      likes: 0,
      comments: [],
      type:
        role === "enseignant"
          ? "teacher-teacher"
          : "student-student"
    };

    setPosts((prev) => [newForumPost, ...prev]);
    setNewPost("");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navbar />
      <div className="fixed top-6 right-6 flex items-center gap-4 z-50">

  {/* Notification Icon */}
  <div className="bg-bg w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shadow-sm">
    <Bell size={18} />
  </div>

  {/* User Circle */}
  <div className="flex items-center">
    <UserCircle
      initials={initials}
      onToggleTheme={toggleDarkMode}
      onChangeLang={(lang) => i18n.changeLanguage(lang)}
    />
  </div>

</div>
      
      <div className="flex-1 ml-56 p-8 transition-all relative">

        <h1 className="text-3xl font-bold mb-2 text-blue">Community</h1>
        <p className="mb-6 text-grayc">
          Exchange with other instructors and share your experience
        </p>

        {/* WRITE POST */}
        <div className="bg-card shadow-lg rounded-3xl p-5 mb-6 border border-blue/20">
          <Input
            placeholder="Share with the community..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="bg-surface text-textc border border-blue/20 rounded-full px-5 py-3"
          />

          <div className="flex justify-end mt-3">
            <Button
              variant="send"
              text="Send"
              className="!w-auto px-6 py-2"
              onClick={handleSendPost}
            />
          </div>
        </div>

        {/* TABS */}
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex justify-end mt-4">
          <ModernDropdown
            value={forumType}
            onChange={setForumType}
            options={forumOptions}
            placeholder="Select forum type"
          />
        </div>

        {/* POSTS */}
        <div className="space-y-6">
          {finalPosts.map((post) => (
            <Post key={post.id} {...post} />
          ))}
        </div>
      </div>
    </div>
  );
}
