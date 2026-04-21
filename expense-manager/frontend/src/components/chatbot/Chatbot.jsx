import { useState, useRef, useEffect } from "react";
import { Send, Bot } from "lucide-react";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "Xin chào 👋 Tôi có thể giúp bạn quản lý chi tiêu!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    const currentInput = input; 
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }), 
        },
        body: JSON.stringify({
          message: currentInput,
          isFirstMessage: messages.length === 1
        }),
      });

      const data = await res.json();

      console.log("Chat response:", {
        status: res.status,
        data,
        token: token ? "EXISTS" : "MISSING"
      });

      // ❗ Nếu bị unauthorized
      if (res.status === 401) {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: "Bạn cần đăng nhập để sử dụng chatbot. Vui lòng đăng nhập và thử lại!"
          }
        ]);
        return;
      }

      const reply =
        data.reply ||
        data.message ||
        "Không có phản hồi 😢";

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: reply }
      ]);

    } catch (err) {
      console.error("Chat fetch error:", err);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Không kết nối được server 😢"
        }
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 9999,
          backgroundColor: "#4f46e5",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
        }}
      >
        <Bot size={22} />
      </button>

      {/* Chatbox */}
      <div
        style={{
          position: "fixed",
          bottom: "90px",
          right: "20px",
          width: "340px",
          height: "480px",
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
          borderRadius: "16px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          zIndex: 9999,
          transform: open ? "translateY(0)" : "translateY(20px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "all 0.3s ease"
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#4f46e5",
            color: "white",
            padding: "12px",
            textAlign: "center",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
            fontWeight: "bold"
          }}
        >
          AI Assistant
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "10px",
            background: "#f5f5f5"
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                width: "fit-content",
                maxWidth: "75%",
                minWidth: "60px",
                padding: "8px 12px",
                margin: "5px 0",
                borderRadius: "10px",
                background:
                  msg.role === "user" ? "#4f46e5" : "#e5e7eb",
                color: msg.role === "user" ? "white" : "black",
                marginLeft: msg.role === "user" ? "auto" : "0",
                marginRight: msg.role === "user" ? "0" : "auto",
                wordWrap: "break-word",
                whiteSpace: "pre-wrap"
              }}
            >
              {msg.text}
            </div>
          ))}

          {loading && (
            <div style={{ fontSize: "12px", color: "gray", fontStyle: "italic" }}>
              AI đang trả lời...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          style={{
            display: "flex",
            borderTop: "1px solid #ddd"
          }}
        >
          <input
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              outline: "none"
            }}
            placeholder="Nhập câu hỏi..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button
            onClick={sendMessage}
            style={{
              background: "#4f46e5",
              color: "white",
              border: "none",
              padding: "0 15px",
              cursor: "pointer"
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </>
  );
}