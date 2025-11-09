const BASE_URL = "http://localhost:5000";

export async function registerUser(data) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function loginUser(data) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getMessages(token) {
  const res = await fetch(`${BASE_URL}/api/chat/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function sendMessage(token, msg) {
  const res = await fetch(`${BASE_URL}/api/chat/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: msg }),
  });
  return res.json();
}
