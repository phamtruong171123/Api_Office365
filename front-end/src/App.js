import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]); // Danh sách file
  const [base64, setBase64] = useState(""); // Base64 của ảnh
  const [selectedFile, setSelectedFile] = useState(null); // File được chọn
  const [isLoading, setIsLoading] = useState(false); // Trạng thái đang tải
  const [errorMessage, setErrorMessage] = useState(""); // Lỗi

  const API_URL = "http://localhost:3000/file"; // URL Backend

  // Fetch danh sách file khi ứng dụng load
  useEffect(() => {
    fetchFiles();
  }, []);

  // Fetch danh sách file từ server
  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/list`);
      setUploadedFiles(response.data); // Cập nhật danh sách file
      console.log(response.data);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to fetch files."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Upload file thường
  const handleFileUpload = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile); // Key phải là "file"

    try {
      setIsLoading(true);
      await axios.post(`${API_URL}/upload`, formData); // Gửi file lên server
      setSelectedFile(null); // Reset file được chọn
      fetchFiles(); // Refresh danh sách file
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to upload file."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Upload ảnh và lấy base64
  const handleImageUpload = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select an image to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile); // Key phải là "image"

    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/upload-image`, formData); // Gửi ảnh lên server
      setBase64(response.data.base64); // Lưu mã base64 trả về
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to upload image."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>File Uploader</h1>

      {/* Input chọn file */}
      <input
        type="file"
        onChange={(e) => setSelectedFile(e.target.files[0])}
        style={{ display: "block", marginBottom: "10px" }}
      />

      {/* Nút hành động */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={handleFileUpload}
          disabled={!selectedFile || isLoading}
          style={{ padding: "10px 20px" }}
        >
          {isLoading ? "Uploading..." : "Upload File"}
        </button>
        <button
          onClick={handleImageUpload}
          disabled={!selectedFile || isLoading}
          style={{ padding: "10px 20px" }}
        >
          {isLoading ? "Uploading..." : "Upload Image"}
        </button>
      </div>

      {/* Hiển thị lỗi */}
      {errorMessage && (
        <div style={{ color: "red", marginTop: "10px" }}>{errorMessage}</div>
      )}

      {/* Danh sách file */}
      <h2 style={{ marginTop: "20px" }}>Uploaded Files</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : uploadedFiles.length === 0 ? (
        <p>No files uploaded yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                File Name
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                Download Link
              </th>
            </tr>
          </thead>
          <tbody>
            {uploadedFiles.map((file) => (
              <tr key={file.name}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {file.name}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  <a
                    href={`http://localhost:3000${file.url}`}
                    download
                    style={{ color: "blue" }}
                  >
                    Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Hiển thị Base64 */}
      {base64 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Base64 Encoded Image</h3>
          <textarea
            readOnly
            value={base64}
            rows={10}
            style={{
              width: "100%",
              padding: "10px",
              fontFamily: "monospace",
              whiteSpace: "nowrap",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default App;
