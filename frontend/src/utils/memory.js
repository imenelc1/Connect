export function loadChat(exerciseId) {
  if (!exerciseId) return null;
  const data = localStorage.getItem(`chat_${exerciseId}`);
  return data ? JSON.parse(data) : null;
}

export function saveChat(exerciseId, messages, student) {
  if (!exerciseId) return;
  localStorage.setItem(
    `chat_${exerciseId}`,
    JSON.stringify({
      messages,
      student,
      updatedAt: Date.now()
    })
  );
}
