import { useState, useCallback, useEffect } from "react";
import { Loader } from "lucide-react";
import ForumItem from "./ForumItem";
import { useTranslation } from "react-i18next";
export default function ForumList({
  isLoading,
  finalPosts,
  forumType,
  forumOptions,
  posts,
  setPosts,
  token,
  API_URL,
  role,
  userId,
  setError,
  triggerNotificationEvent,
  getForumTypeLabel,
  getForumTypeClasses,
  formatTimeAgo
}) {
  const { t } = useTranslation("community"); // 
  const [messages, setMessages] = useState({});
  const [expandedForums, setExpandedForums] = useState({});
  const [loadingMessages, setLoadingMessages] = useState({});
  const [newMessages, setNewMessages] = useState({});
  const [postingMessage, setPostingMessage] = useState({});

  const loadForumMessages = useCallback(async (forumId) => {
    if (!token || !forumId) return;

    setLoadingMessages(prev => ({ ...prev, [forumId]: true }));

    try {
      const response = await fetch(`${API_URL}/forums/${forumId}/messages/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`${t("errors.loadMessages")} ${response.status}`);
      }

      const forumData = await response.json();
      const messagesArray = Array.isArray(forumData.messages)
        ? forumData.messages
        : [];

      const messagesWithComments = messagesArray.map(msg => ({
        ...msg,
        commentaires: msg.commentaires || [],
        nombre_commentaires: msg.nombre_commentaires ?? (msg.commentaires?.length || 0)
      }));

      setMessages(prev => ({
        ...prev,
        [forumId]: messagesWithComments
      }));

      setPosts(prev =>
        prev.map(post =>
          post.id === forumId
            ? { ...post, commentsCount: messagesArray.length }
            : post
        )
      );

    } catch (error) {
      console.error(`Erreur chargement messages forum ${forumId}:`, error);
      setMessages(prev => ({
        ...prev,
        [forumId]: []
      }));
      setError(`${t("errors.loadMessages")}:  ${error.message}`);
    } finally {
      setLoadingMessages(prev => ({ ...prev, [forumId]: false }));
    }
  }, [token, API_URL, setPosts, setError]);

  const toggleForumMessages = useCallback(async (forumId) => {
    const isExpanded = expandedForums[forumId];

    if (!isExpanded && !messages[forumId]) {
      await loadForumMessages(forumId);
    }

    setExpandedForums(prev => ({
      ...prev,
      [forumId]: !isExpanded
    }));
  }, [expandedForums, messages, loadForumMessages]);

  const handlePostMessage = useCallback(async (forumId) => {
    const messageContent = newMessages[forumId]?.trim();
    const post = posts.find(p => p.id === forumId);

    if (!post) {
      setError(t("messages.forumNotFound"));
      return;
    }

    // Vérification des permissions de réponse
    const canReply =
      // 1. L'utilisateur peut répondre à son propre forum
      post.isMine ||
      // 2. Admin peut répondre à tout
      role === "admin" ||
      // 3. Étudiant peut répondre aux forums pour étudiants
      (role === "etudiant" && (post.type === "teacher-student" || post.type === "student-student")) ||
      // 4. Enseignant peut répondre aux forums pour enseignants
      (role === "enseignant" && (post.type === "teacher-teacher" || post.type === "student-teacher"));

    if (!canReply) {
      const forumTypeLabels = {
        "teacher-teacher": t("forums.instructorReserved"),
        "teacher-student":t("forums.studentReserved"),
        "student-student":t("forums.studentReserved"),
        "student-teacher":t("forums.instructorReserved")
      };
      // setError(`Ce forum est ${forumTypeLabels[post.type]}. Vous n'avez pas la permission d'y répondre.`);
      setError(
        t("errors.noPermission", { type: forumTypeLabels[post.type] })
      );
      return;
    }

    if (!messageContent) {
      setError(t("errors.emptyMessage"));
      return;
    }

    if (!token) {
      setError(t("errors.loginRequired"));
      return;
    }

    if (messageContent.length > 2000) {
      // setError("Le message ne doit pas dépasser 2000 caractères");
      setError(t("errors.maxCharacters"));
      return;
    }

    setPostingMessage(prev => ({ ...prev, [forumId]: true }));
    setError("");

    try {
      const response = await fetch(`${API_URL}/forums/${forumId}/messages/create/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contenu_message: messageContent
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }

      const newMessage = await response.json();
      const messageWithLikeAndComments = {
        ...newMessage,
        user_has_liked: false,
        nombre_likes: 0,
        commentaires: [],
        nombre_commentaires: 0
      };

      setMessages(prev => ({
        ...prev,
        [forumId]: [...(prev[forumId] || []), messageWithLikeAndComments]
      }));

      setPosts(prev => prev.map(p =>
        p.id === forumId
          ? { ...p, commentsCount: (p.commentsCount || 0) + 1 }
          : p
      ));

      setNewMessages(prev => ({ ...prev, [forumId]: "" }));

      if (!expandedForums[forumId]) {
        setExpandedForums(prev => ({
          ...prev,
          [forumId]: true
        }));
      }

      triggerNotificationEvent();

    } catch (error) {
      console.error(t("errors.sendMessage"), error);
      setError(`${t("errors.sendMessage")}: ${error.message}`);

    } finally {
      setPostingMessage(prev => ({ ...prev, [forumId]: false }));
    }
  }, [token, API_URL, newMessages, posts, role, expandedForums, triggerNotificationEvent, setError, setPosts]);

  const handleLike = useCallback(async (forumId) => {
    if (!token) {
    setError(t("messages.loginLike"));

      return;
    }

    const post = posts.find(p => p.id === forumId);
    if (!post) {
      setError(t("errors.forumNOTfound"));
      return;
    }

    const newLikedState = !post.userHasLiked;
    const newLikesCount = newLikedState ? (post.likes || 0) + 1 : Math.max(0, (post.likes || 0) - 1);

    setPosts(prev => prev.map(p =>
      p.id === forumId
        ? { ...p, likes: newLikesCount, userHasLiked: newLikedState }
        : p
    ));

    try {
      const response = await fetch(`${API_URL}/forums/${forumId}/like/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        setPosts(prev => prev.map(p =>
          p.id === forumId
            ? { ...p, likes: post.likes || 0, userHasLiked: post.userHasLiked || false }
            : p
        ));

        const errorData = await response.json().catch(() => ({}));
        console.error(t("errors.likeError"), errorData.error || t("errors.unknownError"));
        setError(
          `${t("errors.likeError")}: ${errorData.error || t("errors.unknownError")}`
        );

      } else {
        const data = await response.json();
        setPosts(prev => prev.map(p =>
          p.id === forumId
            ? {
              ...p,
              likes: data.likes_count || newLikesCount,
              userHasLiked: data.user_has_liked || newLikedState
            }
            : p
        ));

        triggerNotificationEvent();
      }
    } catch (error) {
      setPosts(prev => prev.map(p =>
        p.id === forumId
          ? { ...p, likes: post.likes || 0, userHasLiked: post.userHasLiked || false }
          : p
      ));
      console.error(t("errors.networkLike"), error);
      setError(t("errors.networkLike"));

    }
  }, [token, API_URL, posts, triggerNotificationEvent, setError, setPosts]);

  const handleDeleteForum = useCallback(async (forumId) => {
    if (!token) {
      setError(t("messages.loginDel"));
      return;
    }

    const postToDelete = posts.find(p => p.id === forumId);

    setPosts(prev => prev.filter(post => post.id !== forumId));
    setMessages(prev => {
      const newMessages = { ...prev };
      delete newMessages[forumId];
      return newMessages;
    });

    try {
      const response = await fetch(`${API_URL}/forums/${forumId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (postToDelete) {
          setPosts(prev => [...prev, postToDelete].sort((a, b) => new Date(b.time) - new Date(a.time)));
        }

        console.error(t("errors.deleteError"), errorData.error || `Erreur ${response.status}`);
        setError(`${t("errors.deleteError")}: ${errorData.error || `Erreur ${response.status}`}`);
      }
    } catch (error) {
      if (postToDelete) {
        setPosts(prev => [...prev, postToDelete].sort((a, b) => new Date(b.time) - new Date(a.time)));
      }

      console.error(t("errors.networkDelete"), error);
      setError(t("errors.networkDelete"));

    }
  }, [token, API_URL, posts, setError, setPosts]);

  useEffect(() => {
    const loadInitialMessages = async () => {
      if (!token || posts.length === 0) return;

      for (const post of posts) {
        if (!messages[post.id] && post.id) {
          await loadForumMessages(post.id);
        }
      }
    };

    if (posts.length > 0) {
      loadInitialMessages();
    }
  }, [posts, token, messages]);

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader className="animate-spin dark:text-white" size={24} />
        </div>
      ) : finalPosts.length === 0 ? (
        <div className="text-center py-12 dark:text-gray-300">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-xl font-semibold mb-2">{t("messages.noForums")}</h3>
          <p className="text-grayc dark:text-gray-400 mb-6">
            {forumType === "all"
              ? t("messages.firstForum")
              : t("messages.noForumType", {
                type: forumOptions.find(o => o.value === forumType)?.label
              })}
          </p>
        </div>
      ) : (
        finalPosts.map((post) => (
          <ForumItem
            key={post.id}
            post={post}
            messages={messages}
            expandedForums={expandedForums}
            newMessages={newMessages}
            postingMessage={postingMessage}
            loadingMessages={loadingMessages}
            setNewMessages={setNewMessages}
            handleLike={handleLike}
            handlePostMessage={handlePostMessage}
            toggleForumMessages={toggleForumMessages}
            handleDeleteForum={handleDeleteForum}
            getForumTypeLabel={getForumTypeLabel}
            getForumTypeClasses={getForumTypeClasses}
            formatTimeAgo={formatTimeAgo}
            token={token}
            role={role}
            userId={userId}
            setMessages={setMessages}
            setPosts={setPosts}
            API_URL={API_URL}
            triggerNotificationEvent={triggerNotificationEvent}
            t={t}
          />
        ))
      )}
    </div>
  );

}
