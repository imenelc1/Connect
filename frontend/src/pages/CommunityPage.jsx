import { FiSend } from "react-icons/fi";
import Input from "../components/common/Input";
import Navbar from "../components/common/Navbar";
import UserCircle from "../components/common/UserCircle";
import { useContext, useState } from "react";
import ThemeContext from "../context/ThemeContext";
import Tabs from "../components/common/Tabs";
import Post from "../components/common/Post";
import Button from "../components/common/Button";
export default function CommunityPage() {
  // ... ton code existant
  const [activeTab, setActiveTab] = useState("recent");
  const userData = JSON.parse(localStorage.getItem("user"));
  const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""}`.toUpperCase();
  const { toggleDarkMode } = useContext(ThemeContext);
// Exemple de posts statiques (simule la BDD)
const posts = [
  {
    authorInitials: "SM",
    authorName: "Sophie Martin",
    time: "3 hours ago",
    title: "🎉 Excellente nouvelle ! Mes élèves ont tous réussi le test de géométrie ...",
    likes: 42,
    comments: [
      {
        userInitials: "JD",
        userName: "Julie Dupont",
        time: "1h ago",
        text: "Bravo ! Quelle méthode visuelle as-tu utilisée ?",
        replies: [
          { userInitials: "SM", userName: "Sophie Martin", time: "1h ago", text: "J'ai utilisé des diagrammes et animations sur GeoGebra !" }
        ]
      },
      {
        userInitials: "MD",
        userName: "Marc Dubois",
        time: "1h ago",
        text: "Super résultat ! Félicitations 🎉",
        replies: [
          { userInitials: "SM", userName: "Sophie Martin", time: "45 min ago", text: "Merci beaucoup !" }
        ]
      }
    ]
  },
  {
    authorInitials: "MD",
    authorName: "Marc Dubois",
    time: "5h ago",
    title: "Qui a des ressources intéressantes sur l'enseignement de la physique quantique ...",
    likes: 14,
    comments: []
  }
];
const [showComments, setShowComments] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Navbar />
      <div className="flex-1 ml-56 p-8 transition-all">
        <UserCircle initials={initials} onToggleTheme={toggleDarkMode} />

        <h1 className="text-3xl font-bold mb-2 text-blue">Community</h1>
        <p className="mb-6 text-grayc">
          Exchange with other instructors and share your experience
        </p>

        {/* WRITE POST */}
       {/* WRITE POST */}
<div className="bg-card shadow-lg rounded-3xl p-5 mb-6 border border-blue/20">
  <Input
    placeholder="Share with the community..."
    className="bg-surface text-textc border border-blue/20 rounded-full px-5 py-3"
  />

  <div className="flex justify-end mt-3">
   <Button
  variant="send"
  text="Send"
  className="!w-auto px-6 py-2"  // le ! force l'override
  onClick={() => console.log("Send post clicked!")}
/>
  </div>
</div>

        {/* TABS */}
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* POSTS */}
        <div className="space-y-6">
          {posts.map((post, idx) => <Post key={idx} {...post} />)}
        </div>
      </div>
    </div>
  );
}
