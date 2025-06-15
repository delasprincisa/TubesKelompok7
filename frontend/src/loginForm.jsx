// src/LoginForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./LoginForm.css";

function LoginForm({ onLoginSuccess }) {
  // Terima prop onLoginSuccess
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // Inisialisasi useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        // Ganti dengan URL backend Anda
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user) {
          localStorage.setItem("userName", data.user.nama_user); // Gunakan 'nama_user'
          localStorage.setItem("userEmail", data.user.email);
          localStorage.setItem("userRole", data.user.role);
          localStorage.setItem("userId", data.user.id_user); // Simpan ID user juga jika perlu
          localStorage.setItem("userNik", data.user.nik_user);
        }

        localStorage.setItem("token", data.token);
        setMessage("Login berhasil!");
        console.log("Token:", data.token);
        console.log("data:", data.user);
        onLoginSuccess(); // Panggil fungsi dari App.jsx
        navigate("/dashboard"); // Redirect ke halaman dashboard
      } else {
        setMessage(data.message || "Login gagal. Coba lagi.");
        console.error("Login Error:", data.message);
      }
    } catch (error) {
      console.error("Terjadi kesalahan jaringan:", error);
      setMessage("Terjadi kesalahan jaringan. Periksa koneksi Anda.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default LoginForm;
