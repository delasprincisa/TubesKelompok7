import React, { useState, useEffect } from "react";
import "./ChildrenTable.css"; // Pastikan file CSS ini ada

function ChildrenTable() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imunisasiStatusMap, setImunisasiStatusMap] = useState({});

  useEffect(() => {
    const fetchChildrenDataAndStatus = async () => {
      const token = localStorage.getItem("token");
      const userNik = localStorage.getItem("userNik"); // NIK Ibu yang login

      if (!token) {
        setError("Token tidak ditemukan. Anda tidak terautentikasi.");
        setLoading(false);
        return;
      }

      if (!userNik) {
        setError("NIK Ibu tidak ditemukan di sesi Anda. Harap login ulang.");
        setLoading(false);
        return;
      }

      try {
        // 1. Ambil Daftar Balita dari Service Balita (Port 3002)
        const balitaResponse = await fetch(
          `http://localhost:3002/balita/ibu/${userNik}`,
          {
            // Menggunakan port 3002 untuk service Balita
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const balitaData = await balitaResponse.json();

        if (!balitaResponse.ok) {
          setError(balitaData.message || "Gagal mengambil data balita.");
          setLoading(false);
          return;
        }

        if (!balitaData || balitaData.length === 0) {
          setChildren([]);
          setLoading(false);
          return;
        }

        setChildren(balitaData);

        // 2. Untuk setiap balita, panggil endpoint check-completion dari Service Imunisasi (Port 3003)
        // Ini hanya untuk mendapatkan status, tanpa efek samping PDF generation.
        const statusPromises = balitaData.map(async (child) => {
          const statusResult = { id: child.id_balita, status: "unknown" };

          try {
            // PANGGIL ENDPOINT CHECK-COMPLETION DENGAN PORT 3003
            const response = await fetch(
              `http://localhost:3003/imunisasi/check-completion/${child.id_balita}`,
              {
                method: "GET", // Menggunakan GET
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const data = await response.json();

            if (response.ok && data.status) {
              statusResult.status = data.status; // Ambil status dari respons
            } else if (response.status === 403) {
              // Akses ditolak (jika bukan petugas atau ibu balita)
              statusResult.status = "unauthorized";
              statusResult.message =
                data.message || "Akses ditolak untuk status ini.";
            } else if (response.status === 404) {
              // Balita tidak ditemukan
              statusResult.status = "not_found";
              statusResult.message = data.message || "Balita tidak ditemukan.";
            } else {
              console.error(
                `Error fetching completion status for balita ID ${child.id_balita}:`,
                data.message || response.statusText
              );
              statusResult.status = "error";
              statusResult.message =
                data.message || "Gagal memeriksa status kelengkapan.";
            }
          } catch (err) {
            console.error(
              `Network error when checking completion status for balita ID ${child.id_balita}:`,
              err
            );
            statusResult.status = "error";
            statusResult.message = "Kesalahan jaringan saat memeriksa status.";
          }
          return statusResult;
        });

        const results = await Promise.all(statusPromises);
        const newStatusMap = {};
        results.forEach((result) => {
          newStatusMap[result.id] = {
            status: result.status,
            message: result.message,
          };
        });
        setImunisasiStatusMap(newStatusMap);
      } catch (err) {
        console.error(
          "Terjadi kesalahan jaringan saat mengambil data balita:",
          err
        );
        setError("Terjadi kesalahan jaringan. Periksa koneksi Anda.");
      } finally {
        setLoading(false);
      }
    };

    fetchChildrenDataAndStatus();
  }, []);

  const handleActionButtonClick = async (childId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Anda tidak terautentikasi. Silakan login kembali.");
      return;
    }

    const currentStatus = imunisasiStatusMap[childId]?.status;
    const currentMessage = imunisasiStatusMap[childId]?.message;
    const childName = children.find(
      (c) => c.id_balita === childId
    )?.nama_balita;

    if (currentStatus === "completed") {
      // Ini adalah saat kita memanggil generateSertifikat untuk MEMBUAT dan MENGUNDUH PDF
      try {
        // PANGGIL ENDPOINT GENERATE SERTIFIKAT DENGAN PORT 3004 DAN METODE GET (sesuai routes Anda)
        const response = await fetch(
          `http://localhost:3004/sertifikat/${childId}`,
          {
            // Sesuai router.get('/:id_balita') di sertifikat.route.js
            method: "GET", // <-- MENGGUNAKAN GET SESUAI PERMINTAAN TERAKHIR
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();

        if (response.ok && data.url) {
          // Jika berhasil, controller mengembalikan url
          alert(data.message || `Sertifikat ${childName} berhasil dibuat.`);
          window.open(`http://localhost:3004${data.url}`, "_blank"); // Buka PDF
        } else {
          // Ini akan menangani kasus jika generateSertifikat merespons 400 karena belum lengkap (meskipun status sudah dicek),
          // atau error lain dari service sertifikat.
          alert(
            `Gagal membuat/mendapatkan sertifikat: ${
              data.message || "Terjadi kesalahan."
            }`
          );
        }
      } catch (err) {
        console.error(
          "Error saat memicu pembuatan/pengunduhan sertifikat:",
          err
        );
        alert(
          "Terjadi kesalahan jaringan saat mencoba membuat sertifikat. Coba lagi."
        );
      }
    } else if (currentStatus === "incomplete") {
      alert(
        `Vaksin ${childName} belum lengkap. Silakan lengkapi vaksin terlebih dahulu. ${
          currentMessage ? "(" + currentMessage + ")" : ""
        }`
      );
    } else if (currentStatus === "unauthorized") {
      alert(`Akses ditolak: ${currentMessage}.`);
    } else if (currentStatus === "not_found") {
      alert(`Data balita tidak ditemukan: ${currentMessage}.`);
    } else {
      alert(
        `Status imunisasi ${childName} tidak diketahui atau terjadi kesalahan: ${
          currentMessage || "Coba lagi nanti."
        }`
      );
      // Anda bisa coba panggil ulang API untuk balita ini jika status unknown/error
    }
  };

  if (loading) {
    return <p>Memuat daftar balita...</p>;
  }

  if (error) {
    return <p className="error-message">Error: {error}</p>;
  }

  if (children.length === 0) {
    return <p>Tidak ada data balita yang ditemukan untuk NIK ini.</p>;
  }

  return (
    <table className="children-table">
      <thead>
        <tr>
          <th>ID Balita</th>
          <th>Nama Balita</th>
          <th>Status Imunisasi</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        {children.map((child) => {
          const statusInfo = imunisasiStatusMap[child.id_balita];
          // Defaultkan ke 'loading' jika status belum diambil
          const displayStatus = statusInfo ? statusInfo.status : "loading";

          return (
            <tr key={child.id_balita}>
              <td>{child.id_balita}</td>
              <td>{child.nama_balita}</td>
              <td>
                {displayStatus === "completed" ? (
                  <span style={{ color: "green", fontWeight: "bold" }}>
                    Lengkap
                  </span>
                ) : displayStatus === "incomplete" ? (
                  <span style={{ color: "red", fontWeight: "bold" }}>
                    Belum Lengkap
                  </span>
                ) : displayStatus === "loading" ? (
                  <span>Memuat...</span>
                ) : (
                  <span style={{ color: "orange" }}>Error/Tidak Diketahui</span>
                )}
              </td>
              <td>
                <button
                  // Kelas tombol berdasarkan status kelengkapan
                  className={
                    displayStatus === "completed"
                      ? "download-button"
                      : "incomplete-button"
                  }
                  onClick={() => handleActionButtonClick(child.id_balita)}
                  // Tombol dinonaktifkan jika status tidak memungkinkan aksi
                  disabled={
                    displayStatus === "loading" ||
                    displayStatus === "error" ||
                    displayStatus === "unknown" ||
                    displayStatus === "unauthorized" ||
                    displayStatus === "not_found"
                  }
                >
                  {/* Teks tombol berdasarkan status kelengkapan */}
                  {displayStatus === "completed"
                    ? "Download Sertifikat"
                    : "Lengkapi Vaksin"}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default ChildrenTable;
