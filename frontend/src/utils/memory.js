export const chatKey = (studentId, type, targetId = "global") =>
  `chat:${studentId}:${type}:${targetId}`;

export const loadChat = (studentId, type, targetId = "global") => {
  try {
    return JSON.parse(localStorage.getItem(chatKey(studentId, type, targetId)));
  } catch {
    return null;
  }
};

export const saveChat = (studentId, type, targetId = "global", messages) => {
  localStorage.setItem(
    chatKey(studentId, type, targetId),
    JSON.stringify({ studentId, type, targetId, messages, updatedAt: Date.now() })
  );
};
