import { useState } from "react";
import { useNavigate } from "react-router-dom";
import doctorBanner from "../../assets/10.png"; // Thay thế bằng ảnh phù hợp
import { requestDoctor } from "../../lib/user/info";

export default function ApplyDoctor() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    specialization: "",
    experienceYears: "",
    description: "",
    phoneNumber: "",
    hospital: "",
    certificateImage: null,
    cccdImage: null,
  });

  const [previewCert, setPreviewCert] = useState(null);
  const [previewCccd, setPreviewCccd] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "certificateImage" || name === "cccdImage") {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
      if (name === "certificateImage") setPreviewCert(URL.createObjectURL(file));
      if (name === "cccdImage") setPreviewCccd(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const certificateUrl = "https://example.net/certificate.jpg";
    const cccdUrl = "https://example.net/cccd.jpg";

    try {
      await requestDoctor(formData, certificateUrl, cccdUrl);
      alert("Yêu cầu đã được gửi thành công!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu:", error);
      alert("Gửi yêu cầu thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 px-4 py-12 flex flex-col md:flex-row items-center justify-center gap-10">
      {/* Left: Banner */}
      <div className="w-full md:w-1/2 flex justify-center">
        <img
          src={doctorBanner}
          alt="Doctor Banner"
          className="rounded-3xl shadow-xl w-full max-w-md object-cover"
        />
      </div>

      {/* Right: Form */}
      <div className="w-full md:w-1/2 bg-white shadow-xl rounded-3xl p-10 max-w-xl">
        <h2 className="text-3xl font-extrabold text-center text-blue-700 mb-6">
          Đăng ký trở thành bác sĩ tư vấn
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="specialization"
            placeholder="Chuyên môn (VD: General Psychology)"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none"
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="experienceYears"
            placeholder="Số năm kinh nghiệm"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="description"
            placeholder="Mô tả bản thân (VD: Tốt nghiệp tại...)"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phoneNumber"
            placeholder="Số điện thoại"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="hospital"
            placeholder="Bệnh viện đang công tác"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none"
            onChange={handleChange}
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Ảnh bằng cấp</label>
            <input
              type="file"
              name="certificateImage"
              accept="image/*"
              onChange={handleChange}
              className="text-sm"
              required
            />
            {previewCert && <img src={previewCert} alt="Preview Certificate" className="w-32 rounded-lg" />}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Ảnh CCCD</label>
            <input
              type="file"
              name="cccdImage"
              accept="image/*"
              onChange={handleChange}
              className="text-sm"
              required
            />
            {previewCccd && <img src={previewCccd} alt="Preview CCCD" className="w-32 rounded-lg" />}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Gửi Yêu Cầu
          </button>
        </form>
      </div>
    </div>
  );
}
