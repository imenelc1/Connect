import { useState, useCallback } from "react";
import { Loader } from "lucide-react";
import ForumItem from "./ForumItem";

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
  formatTimeAgo,
  t
}) {
  const [messages, setMessages] = useState({});
  const [expandedForums, setExpandedForums] = useState({});
  const [loadingMessages, setLoadingMessages] = useState({});
  const [newMessages, setNewMessages] = useState({});
  const [postingMessage, setPostingMessage] = useState({});

  // -------------------- Charger les messages d’un forum --------------------
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

      if (!response.ok) throw new Error(`${t("errors.loadMessages")} (${response.status})`);

      const forumData = await response.json();
      const messagesArray = Array.isArray(forumData) ? forumData : [];

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
      setMessages(prev => ({ ...prev, [forumId]: [] }));
      setError(`${t("errors.loadMessages")}: ${error.message}`);
    } finally {
      setLoadingMessages(prev => ({ ...prev, [forumId]: false }));
    }
  }, [token, API_URL, setPosts, setError, t]);

  // -------------------- Toggle affichage messages --------------------
  const toggleForumMessages = useCallback(async (forumId) => {
    const isExpanded = expandedForums[forumId];

    if (!isExpanded && !messages[forumId]) {
      await loadForumMessages(forumId); // charge les messages UNE SEULE FOIS
    }

    setExpandedForums(prev => ({
      ...prev,
      [forumId]: !isExpanded
    }));
  }, [expandedForums, messages, loadForumMessages]);

  // -------------------- Like d’un forum --------------------
  const handleLike = useCallback(async (forumId) => {
    if (!token) { setError(t("errors.loginLike")); return; }

    const post = posts.find(p => p.id === forumId);
    if (!post) { setError(t("errors.forumNotFound")); return; }

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
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        setPosts(prev => prev.map(p =>
          p.id === forumId
            ? { ...p, likes: post.likes || 0, userHasLiked: post.userHasLiked || false }
            : p
        ));
        const errorData = await response.json().catch(() => ({}));
        setError(`${t("errors.likeError")}: ${errorData.error || t("errors.unknownError")}`);
      } else {
        const data = await response.json();
        setPosts(prev => prev.map(p =>
          p.id === forumId
            ? { ...p, likes: data.likes_count || newLikesCount, userHasLiked: data.user_has_liked || newLikedState }
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
      setError(t("errors.networkLike"));
    }
  }, [token, API_URL, posts, triggerNotificationEvent, setError, setPosts, t]);

  // -------------------- Poster un message --------------------
  const handlePostMessage = useCallback(async (forumId) => {
    const messageContent = newMessages[forumId]?.trim();
    const post = posts.find(p => p.id === forumId);
    if (!post) { setError(t("errors.forumNotFound")); return; }

    if (!messageContent) { setError(t("errors.emptyMessage")); return; }
    if (!token) { setError(t("errors.loginRequired")); return; }

    setPostingMessage(prev => ({ ...prev, [forumId]: true }));
    setError("");

    try {
      const response = await fetch(`${API_URL}/forums/${forumId}/messages/create/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenu_message: messageContent })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `${t("errors.sendMessage")} (${response.status})`);
      }

      const newMessage = await response.json();
      const messageWithExtras = { ...newMessage, user_has_liked: false, nombre_likes: 0, commentaires: [], nombre_commentaires: 0 };

      setMessages(prev => ({
        ...prev,
        [forumId]: [...(prev[forumId] || []), messageWithExtras]
      }));

      setPosts(prev => prev.map(p =>
        p.id === forumId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p
      ));

      setNewMessages(prev => ({ ...prev, [forumId]: "" }));
      if (!expandedForums[forumId]) toggleForumMessages(forumId);

      triggerNotificationEvent();
    } catch (error) {
      setError(`${t("errors.sendMessage")}: ${error.message}`);
    } finally {
      setPostingMessage(prev => ({ ...prev, [forumId]: false }));
    }
  }, [token, API_URL, newMessages, posts, expandedForums, toggleForumMessages, triggerNotificationEvent, setError, setPosts, t]);

  // -------------------- Supprimer un forum --------------------
  const handleDeleteForum = useCallback(async (forumId) => {
    if (!token) { setError(t("messages.loginDel")); return; }

    const postToDelete = posts.find(p => p.id === forumId);

    setPosts(prev => prev.filter(p => p.id !== forumId));
    setMessages(prev => { const newMessages = { ...prev }; delete newMessages[forumId]; return newMessages; });

    try {
      const response = await fetch(`${API_URL}/forums/${forumId}/delete/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (postToDelete) setPosts(prev => [...prev, postToDelete].sort((a, b) => new Date(b.time) - new Date(a.time)));
        setError(`${t("errors.deleteError")}: ${errorData.error || t("errors.unknownError")}`);
      }
    } catch (error) {
      if (postToDelete) setPosts(prev => [...prev, postToDelete].sort((a, b) => new Date(b.time) - new Date(a.time)));
      setError(t("errors.networkDelete"));
    }
  }, [token, API_URL, posts, setError, setPosts, t]);

  // -------------------- Rendu --------------------
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
              : t("messages.noForumType", { type: forumOptions.find(o => o.value === forumType)?.label })}
          </p>
        </div>
      ) : (
        finalPosts.map(post => (
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
