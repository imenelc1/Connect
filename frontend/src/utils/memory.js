export function loadChat(exerciseId) {
  const data = localStorage.getItem(`chat_${exerciseId}`);
  return data ? JSON.parse(data) : null;
}

export function saveChat(exerciseId, messages, student) {
  localStorage.setItem(
    `chat_${exerciseId}`,
    JSON.stringify({ messages, student })
  );
}
