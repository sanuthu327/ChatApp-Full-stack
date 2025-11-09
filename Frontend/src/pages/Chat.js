import React, { useEffect, useRef, useState } from 'react';
import { getMessages as apiGetMessages, sendMessage as apiSendMessage } from "../lib/api";
import { io } from 'socket.io-client';

let socket;

export default function Chat({ me, onLogout }) {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState({});
  const bottomRef = useRef(null);

  // Load all users
  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.log(err));
  }, []);

  // connect socket
  useEffect(() => {
    const token = localStorage.getItem("token");
    socket = io("http://localhost:5000", {
      auth: { token }
    });

    socket.on("private-message", msg => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on("typing", ({ from, isTyping }) => {
      setTyping(prev => ({ ...prev, [from]: isTyping }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const openChat = async (u) => {
    setSelected(u);
    const token = localStorage.getItem("token");
    const data = await apiGetMessages(token);
    setMessages(data);
  };

  const sendMsg = async () => {
    if (!selected || text.trim() === "") return;
    const token = localStorage.getItem("token");
    await apiSendMessage(token, text);
    setText("");
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="container">
      <header>
        <h1>Real-Time Chat</h1>
        <button onClick={onLogout}>Logout</button>
      </header>

      <main>
        <aside className="users">
          <h3>Users</h3>
          {users.map(u => (
            <div key={u._id} className="userRow" onClick={() => openChat(u)}>
              {u.name} {typing[u._id] && <small>typing...</small>}
            </div>
          ))}
        </aside>

        <section className="chat">
          <div className="messages">
            {messages.map(m => (
              <div key={m._id} className={m.from === me.id ? "bubble me" : "bubble other"}>
                {m.content}
              </div>
            ))}
            <div ref={bottomRef}></div>
          </div>

          <div className="inputBar">
            <input
              placeholder="Type message"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                socket.emit("typing", { to: selected?._id, isTyping: true });
              }}
              onBlur={() => socket.emit("typing", { to: selected?._id, isTyping: false })}
            />
            <button onClick={sendMsg}>Send</button>
          </div>
        </section>
      </main>
    </div>
  );
}
