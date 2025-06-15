// src/Dashboard.jsx
import React, { useState, useEffect } from "react";
import ChildrenTable from "./ChildrenTable"; // Kita akan buat ini
import "./Dashboard.css"; // Kita akan buat file CSS ini

function Dashboard({ onLogout }) {
  const userName = localStorage.getItem("userName");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //   useEffect(() => {
  //     const fetchUserData = async () => {
  //       const token = localStorage.getItem("token");
  //       if (!token) {
  //         setError("Tidak ada token ditemukan. Silakan login kembali.");
  //         setLoading(false);
  //         return;
  //       }

  //       try {
  //         const response = await fetch("http://localhost:3001/profile", {
  //           // <-- Endpoint untuk mendapatkan data user (akan kita buat di Node.js)
  //           method: "GET",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${token}`, // Kirim token di header Authorization
  //           },
  //         });

  //         const data = await response.json();

  //         if (response.ok) {
  //           setUserName(data.name || data.email || "User"); // Asumsi server mengembalikan 'name' atau 'email'
  //         } else {
  //           setError(data.message || "Gagal mengambil data user.");
  //           // Jika token tidak valid atau expired, mungkin perlu logout otomatis
  //           if (response.status === 401 || response.status === 403) {
  //             onLogout();
  //           }
  //         }
  //       } catch (err) {
  //         console.error(
  //           "Terjadi kesalahan jaringan saat mengambil data user:",
  //           err
  //         );
  //         setError("Terjadi kesalahan jaringan. Periksa koneksi Anda.");
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //     fetchUserData();
  //   }, [onLogout]);

  //   if (loading) {
  //     return <div className="dashboard-container">Loading data user...</div>;
  //   }

  //   if (error) {
  //     return (
  //       <div className="dashboard-container error">
  //         <p>{error}</p>
  //         <button onClick={onLogout}>Logout</button>
  //       </div>
  //     );
  //   }

  return (
    <div className="dashboard-container">
      <h1>Halo, {userName}!</h1>
      <button onClick={onLogout} className="logout-button">
        Logout
      </button>

      <div className="children-section">
        <h2>Daftar Anak</h2>
        <ChildrenTable />
      </div>
    </div>
  );
}

export default Dashboard;
