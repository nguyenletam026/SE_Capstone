import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { analyzeImage } from "../../lib/user/stressServices";

export default function WebcamCapture({ onResult }) {
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const captureAndSend = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      alert("Không thể chụp!");
      return;
    }

    try {
      const blob = await (await fetch(imageSrc)).blob();
      const formData = new FormData();
      formData.append("image", blob, "webcam.jpg");

      setLoading(true);
      const result = await analyzeImage(formData);
      setLoading(false);

      if (result?.code === 200) {
        onResult(result.result);
      } else {
        alert("Phân tích thất bại.");
      }
    } catch (error) {
      setLoading(false);
      alert("Lỗi khi gửi ảnh.");
      console.error(error);
    }
  };

  // Dừng webcam khi component unmount
  useEffect(() => {
    return () => {
      const currentRef = webcamRef.current;
      const video = currentRef?.video;
      if (video && video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
        console.log("📷 Camera stopped from webcamRef.");
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-lg border-4 border-white shadow-lg overflow-hidden">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="w-full max-w-2xl"
          videoConstraints={{
            width: 1280,
            height: 720,
            facingMode: "user",
          }}
        />
      </div>
      <button
        onClick={captureAndSend}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow"
      >
        {loading ? "Đang gửi..." : "Chụp & Phân Tích"}
      </button>
    </div>
  );
}
