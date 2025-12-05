import React, { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";
import Mascotte from "../assets/6.svg";

export default function AssistantIA({ onClose: parentOnClose }) {
  const [visible, setVisible] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "bot",
      text:
        "Bonjour ! Je suis votre assistant IA. Je peux vous aider avec votre exercice en C. Posez-moi vos questions !",
      time: "20:16",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  // --- DRAGGABLE ---
  const windowRef = useRef();
  const pos = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

  const startDrag = (e) => {
    pos.current.offsetX = e.clientX - pos.current.x;
    pos.current.offsetY = e.clientY - pos.current.y;
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDrag);
  };

  const drag = (e) => {
    pos.current.x = e.clientX - pos.current.offsetX;
    pos.current.y = e.clientY - pos.current.offsetY;

    windowRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
  };

  const stopDrag = () => {
    document.removeEventListener("mousemove", drag);
    document.removeEventListener("mouseup", stopDrag);
  };
  // --- END DRAGGABLE ---

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  if (!visible) return null;

  const close = () => {
    setVisible(false);
    if (typeof parentOnClose === "function") parentOnClose();
  };

  const sendUserMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg = {
      id: Date.now(),
      from: "user",
      text: trimmed,
      time: "Maintenant",
    };

    setMessages((m) => [...m, userMsg]);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    sendUserMessage(input);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 1,
          from: "bot",
          text:
            "Merci pour votre question ! Pouvez-vous préciser ce que vous souhaitez faire en C ?",
          time: "Maintenant",
        },
      ]);
      setLoading(false);
    }, 900);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* background click → close */}
      <div className="absolute inset-0 bg-black/20" onClick={close} />

      {/* DRAGGABLE WINDOW */}
      <div
        ref={windowRef}
        className="absolute left-1/2 top-20 -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-[#dbe8ff] w-[420px]"
        style={{ userSelect: "none" }}
      >
        {/* HEADER — DRAG HANDLE */}
        <div
          className="bg-[#4a8bff] text-white px-4 py-3 flex items-center justify-between cursor-grab active:cursor-grabbing"
          onMouseDown={startDrag}
        >
          <div className="flex items-center gap-2 min-w-0">
            <img src={Mascotte} className="w-8 h-8 rounded-full" />
            <div>
              <h3 className="text-base font-semibold leading-tight">Assistant IA</h3>
              <p className="text-[12px] opacity-90 leading-tight">
                Posez-moi vos questions en C !
              </p>
            </div>
          </div>

          <button
            aria-label="Fermer"
            onClick={close}
            className="rounded hover:bg-white/10 p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* MESSAGES */}
        <div
          ref={scrollRef}
          className="h-[320px] p-4 overflow-y-auto bg-[#f6f9ff] space-y-3"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.from === "bot" ? "items-start" : "justify-end items-end"
              }`}
            >
              {msg.from === "bot" && (
                <img src={Mascotte} className="w-8 h-8 rounded-full mr-3" />
              )}

              <div
                className={`max-w-[75%] p-3 rounded-2xl shadow-sm text-sm break-words ${
                  msg.from === "bot"
                    ? "bg-[#eef2f6] text-[#1f324f]"
                    : "bg-[#2e6de6] text-white"
                }`}
              >
                <div>{msg.text}</div>
                <div className="text-[9px] opacity-60 mt-1 text-right">
                  {msg.time}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start">
              <img src={Mascotte} className="w-8 h-8 rounded-full mr-3" />
              <div className="bg-white p-2.5 rounded-2xl shadow-sm text-sm text-[#4b5563]">
                L’assistant écrit…
              </div>
            </div>
          )}
        </div>

        {/* INPUT */}
        <div className="px-4 py-3 bg-white border-t border-[#e6efff]">
          <div className="relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Votre question…"
              className="w-full pr-12 py-2.5 pl-4 rounded-full border border-[#e6eefc] text-sm focus:outline-none focus:ring-2 focus:ring-[#bfd7ff]"
            />

            <button
              onClick={handleSend}
              aria-label="Envoyer"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-gradient-to-br from-[#5aa0ff] to-[#2e6de6] flex items-center justify-center shadow text-white"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}