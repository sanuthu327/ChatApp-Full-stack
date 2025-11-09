import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

export default function App() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const s = io("http://localhost:5000");
    setSocket(s);

    s.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => s.disconnect();
  }, []);

  const sendMessage = () => {
    if (text.trim() === "") return;
    socket.emit("message", text);
    setText("");
  };

  return (
    <div style={styles.container}>
      <h2>💬 Real Time Chat</h2>

      <div style={styles.chatBox}>
        {messages.map((m, i) => (
          <div key={i} style={styles.bubble}>{m}</div>
        ))}
      </div>

      <div style={styles.inputBar}>
        <input
          style={styles.input}
          placeholder="type message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button style={styles.btn} onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

const styles = {
  container: { width: 350, margin: "40px auto", textAlign: "center", fontFamily: "sans-serif" },
  chatBox: { height: 300, overflowY: "auto", border: "1px solid #ccc", padding: 10, marginBottom: 10 },
  bubble: { background: "#0B93F6", color: "white", padding: 8, borderRadius: 8, marginBottom: 6, textAlign: "left" },
  inputBar: { display: "flex", gap: 5 },
  input: { flex: 1, padding: 8 },
  btn: { padding: "8px 12px", background: "#0B93F6", color: "white", border: "none", borderRadius: 6 }
};
