import React, { useState, useEffect } from "react";
import "./ChildrenTable.css";

function ChildrenTable() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imunisasiStatusMap, setImunisasiStatusMap] = useState({});

  useEffect(() => {
    const fetchChildrenDataAndStatus = async () => {
      const token = localStorage.getItem("token");
      const userNik = localStorage.getItem("userNik");

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

        // 2. Untuk setiap balita, panggil endpoint CHECK-COMPLETION dari Service Imunisasi (Port 3003)
        const statusPromises = balitaData.map(async (child) => {
          const statusResult = { id: child.id_balita, status: "unknown" };

          try {
            const response = await fetch(
              `http://localhost:3003/imunisasi/check-completion/${child.id_balita}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            let data = {};
            try {
              data = await response.json();
            } catch (jsonError) {
              console.error(
                "Failed to parse JSON response for status check:",
                jsonError
              );
              data = { message: "Respons bukan JSON yang valid atau kosong." };
            }
            // Ini adalah bagian yang mengambil 'status' dari respons imunisasi service.
            if (
              response.ok &&
              (data.status === "completed" || data.status === "incomplete")
            ) {
              statusResult.status = data.status;
              if (data.status === "incomplete" && data.missing_vaksins) {
                statusResult.message = `Vaksin yang belum lengkap: ${data.missing_vaksins.join(
                  ", "
                )}`;
              }
            } else if (response.status === 403) {
              statusResult.status = "unauthorized";
              statusResult.message =
                data.message || "Akses ditolak untuk status ini.";
            } else if (response.status === 404) {
              statusResult.status = "not_found";
              statusResult.message = data.message || "Balita tidak ditemukan.";
            } else {
              console.error(
                `Error fetching completion status for balita ID ${child.id_balita}:`,
                `HTTP Status: ${response.status}`,
                `Server Message: ${data.message || response.statusText}`,
                `Server Error Details: ${data.error || "N/A"}`
              );
              statusResult.status = "error";
              statusResult.message =
                data.message || "Gagal memeriksa status kelengkapan.";
            }
          } catch (err) {
            console.error(
              `Network error when checking completion status for balita ID ${child.id_balita}:`,
              `Message: ${err.message}`,
              `Code: ${err.code || "N/A"}`
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
      // Ketika status 'completed', panggil endpoint untuk GENERATE dan SIMPAN sertifikat
      try {
        // Endpoint untuk MENGGENERASI dan MENYIMPAN PDF (mengembalikan URL)
        // Ini sesuai dengan rute '/generate/:id_balita' di sertifikat-service.
        const response = await fetch(
          `http://localhost:3004/generate/${childId}`, // Panggil endpoint generate
          {
            method: "GET", // Sesuai dengan route GET /generate/:id_balita.
            headers: {
              "Content-Type": "application/json", // Pastikan header ini sesuai jika server mengharapkannya
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json(); // Mengasumsikan server mengembalikan JSON dengan 'url'

        if (response.ok && data.url) {
          // Jika sukses dan ada URL
          alert(data.message || `Sertifikat ${childName} berhasil dibuat.`);
          // Sekarang gunakan URL yang dikembalikan server untuk mendownload file statis
          // Pastikan http://localhost:3004 adalah base URL untuk file statis
          window.open(`http://localhost:3004${data.url}`, "_blank");
        } else {
          // Penanganan error jika respons bukan ok atau tidak ada URL
          console.error(
            `Error generating/downloading certificate for balita ID ${childId}:`,
            `Status: ${response.status}`,
            `Message: ${data.message || response.statusText}`
          );
          alert(
            `Gagal membuat/mendapatkan sertifikat: ${
              data.message || "Terjadi kesalahan."
            }`
          );
        }
      } catch (err) {
        console.error(
          "Terjadi kesalahan jaringan saat memicu pembuatan sertifikat:",
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
                  className={
                    displayStatus === "completed"
                      ? "download-button"
                      : "incomplete-button"
                  }
                  onClick={() => handleActionButtonClick(child.id_balita)}
                  disabled={
                    displayStatus === "loading" ||
                    displayStatus === "error" ||
                    displayStatus === "unknown" ||
                    displayStatus === "unauthorized" ||
                    displayStatus === "not_found"
                  }
                >
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
