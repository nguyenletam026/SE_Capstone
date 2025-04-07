// 📁 components/stress/WebcamCapture.jsx
import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { analyzeImage } from "../../lib/user/stressServices";
export default function WebcamCapture({ onResult }) {
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const captureAndSend = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const blob = await (await fetch(imageSrc)).blob();

    const formData = new FormData();
    formData.append("image", blob, "webcam.jpg");

    setLoading(true);
    const result = await analyzeImage(formData);
    setLoading(false);

    if (result?.code === 200) {
      onResult(result.result);
    } else {
      alert("Không thể phân tích ảnh.");
    }
  };

  return (
    <div className="text-center">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="mx-auto rounded border"
      />
      <button
        onClick={captureAndSend}
        className="mt-4 px-4 py-2 bg-brown-700 text-white rounded"
      >
        {loading ? "Đang gửi..." : "Chụp & Phân tích"}
      </button>
    </div>
  );
}
