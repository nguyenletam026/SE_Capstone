import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import doctorBanner from "../../assets/10.png"; // Thay thế bằng ảnh phù hợp
import { requestDoctor } from "../../lib/user/info";
import { toast } from "react-toastify";
import axios from "axios";
import { checkPendingDoctorRequest } from "../../lib/admin/adminServices";
const icons = {
  specialization: (
    <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M12 6.5v11M18.5 12h-11" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  experience: (
    <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth={2}/>
      <path d="M12 8v4l3 3" strokeWidth={2} strokeLinecap="round"/>
    </svg>
  ),
  description: (
    <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeWidth={2}/>
    </svg>
  ),
  phone: (
    <svg className="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M3 5a2 2 0 012-2h3.28a2 2 0 011.7 1.06l1.1 2.22a2 2 0 01-.45 2.37l-1.27 1.27a16 16 0 006.36 6.36l1.27-1.27a2 2 0 012.37-.45l2.22 1.1a2 2 0 011.06 1.7V19a2 2 0 01-2 2h-1C7.38 21 3 16.62 3 11V5z" strokeWidth={2}/>
    </svg>
  ),
  hospital: (
    <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect width="18" height="18" x="3" y="3" rx="2" strokeWidth={2}/>
      <path d="M12 8v8M8 12h8" strokeWidth={2}/>
    </svg>
  ),
  cert: (
    <svg className="w-6 h-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M8 12l2 2 4-4M12 19a7 7 0 100-14 7 7 0 000 14z" strokeWidth={2}/>
    </svg>
  ),
  cccd: (
    <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect width="20" height="14" x="2" y="5" rx="2" strokeWidth={2}/>
      <circle cx="8" cy="12" r="2" strokeWidth={2}/>
      <path d="M14 12h4" strokeWidth={2}/>
    </svg>
  ),
  upload: (
    <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 9l5-5 5 5M12 4v12" strokeWidth={2}/>
    </svg>
  ),
  loading: (
    <svg className="animate-spin w-6 h-6 text-blue-500 mx-auto" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
  )
};

export default function ApplyDoctor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    specialization: "",
    experienceYears: "",
    description: "",
    phoneNumber: "",
    hospital: "",
    certificateImage: null,
    cccdImage: null,
  });
  const [errors, setErrors] = useState({});
  const [previewCert, setPreviewCert] = useState(null);
  const [previewCccd, setPreviewCccd] = useState(null);

  useEffect(() => {
    const checkExistingRequest = async () => {
      try {
        const hasPendingRequest = await checkPendingDoctorRequest();
        if (hasPendingRequest) {
          toast.info("Request already sent, please wait for our response.");
          setTimeout(() => navigate("/home"), 2000);
        }
      } catch (error) {
        console.error("Error checking pending request:", error);
      }
    };
    checkExistingRequest();
  }, [navigate]);

  // Validate file
  const validateFile = (file) => {
    if (file.size > 5 * 1024 * 1024) return "Kích thước file quá lớn (tối đa 5MB)";
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) return "Định dạng file không hợp lệ (chỉ chấp nhận JPG/PNG)";
    return null;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "certificateImage" || name === "cccdImage") {
      const file = files[0];
      if (file) {
        const fileError = validateFile(file);
        if (fileError) {
          setErrors({ ...errors, [name]: fileError });
          e.target.value = '';
          return;
        } else {
          setErrors({ ...errors, [name]: null });
        }
        setFormData({ ...formData, [name]: file });
        if (name === "certificateImage") setPreviewCert(URL.createObjectURL(file));
        if (name === "cccdImage") setPreviewCccd(URL.createObjectURL(file));
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.specialization) newErrors.specialization = "Vui lòng nhập chuyên môn";
    if (!formData.experienceYears) newErrors.experienceYears = "Vui lòng nhập số năm kinh nghiệm";
    if (!formData.description) newErrors.description = "Vui lòng nhập mô tả";
    if (!formData.phoneNumber) newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
    if (!formData.hospital) newErrors.hospital = "Vui lòng nhập bệnh viện";
    if (formData.phoneNumber && !/^[0-9]{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ (cần 10 chữ số)";
    }
    if (!formData.certificateImage) newErrors.certificateImage = "Vui lòng tải lên ảnh bằng cấp";
    if (!formData.cccdImage) newErrors.cccdImage = "Vui lòng tải lên ảnh CCCD";
    if (formData.certificateImage) {
      const certError = validateFile(formData.certificateImage);
      if (certError) newErrors.certificateImage = certError;
    }
    if (formData.cccdImage) {
      const cccdError = validateFile(formData.cccdImage);
      if (cccdError) newErrors.cccdImage = cccdError;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ thông tin và sửa các lỗi");
      return;
    }
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('specialization', formData.specialization);
      formDataToSend.append('experienceYears', formData.experienceYears);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('phoneNumber', formData.phoneNumber);
      formDataToSend.append('hospital', formData.hospital);
      if (formData.certificateImage) formDataToSend.append('certificateImage', formData.certificateImage);
      if (formData.cccdImage) formDataToSend.append('cccdImage', formData.cccdImage);

      const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        `${API_BASE}/doctors/request-doctor`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success("Yêu cầu gửi thành công! Vui lòng chờ phản hồi.");
      setTimeout(() => navigate("/home"), 1500);

    } catch (error) {
      if (error.response) {
        const errorCode = error.response.data?.code;
        const errorMessage = error.response.data?.message || "Lỗi không xác định";
        switch (errorCode) {
          case 1013:
            toast.error("Ảnh bằng cấp không hợp lệ.");
            setErrors({ ...errors, certificateImage: "Ảnh bằng cấp không hợp lệ" });
            break;
          case 1025:
            toast.error("Tên trong CCCD không khớp với tên tài khoản.");
            setErrors({ ...errors, cccdImage: "Tên trong CCCD không khớp" });
            break;
          case 1015:
            toast.error("File ảnh trống hoặc bị lỗi.");
            break;
          case 1010:
            toast.error("Tài khoản của bạn đã là bác sĩ.");
            navigate("/home");
            break;
          case 1037:
            toast.error("Request already sent, please wait for our response.");
            setTimeout(() => navigate("/home"), 2000);
            break;
          case 401:
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            navigate("/login");
            break;
          case 9999:
            if (errorMessage.includes("Query did not return a unique result")) {
              toast.error("Yêu cầu đã gửi. Vui lòng chờ phản hồi.");
              setTimeout(() => navigate("/home"), 2000);
            } else {
              toast.error(`Gửi yêu cầu thất bại: ${errorMessage}`);
            }
            break;
          default:
            toast.error(`Gửi yêu cầu thất bại: ${errorMessage}`);
        }
      } else if (error.request) {
        toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối.");
      } else {
        toast.error("Gửi yêu cầu thất bại. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Modern Field Component
  function Field({ icon, children, error }) {
    return (
      <div>
        <div className={`flex items-center bg-blue-50/50 rounded-xl border px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400 transition ${error ? "border-red-400" : "border-blue-100"}`}>
          <span className="mr-3">{icon}</span>
          {children}
        </div>
        {error && <p className="text-red-500 text-xs mt-1 ml-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4fbff] via-[#e8f0fe] to-[#e3e7ff] px-4 py-12 flex flex-col md:flex-row items-center justify-center gap-12">
      {/* Left: Banner with shadow and float icon */}
      <div className="w-full md:w-1/2 flex flex-col items-center">
        <div className="relative w-full max-w-md">
          <img
            src={doctorBanner}
            alt="Doctor Banner"
            className="rounded-3xl shadow-2xl w-full object-cover border-4 border-white"
          />
          <div className="absolute -top-7 -left-7 bg-blue-100 rounded-full p-4 shadow-lg animate-bounce">
            {/* Doctor SVG "avatar" */}
            <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="7" r="4" strokeWidth={2} />
              <path d="M21 20c0-3.866-3.582-7-8-7s-8 3.134-8 7" strokeWidth={2}/>
            </svg>
          </div>
        </div>
        <p className="mt-6 text-center text-blue-600 font-bold text-lg flex items-center justify-center gap-2">
          <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7" strokeWidth={2} strokeLinecap="round"/></svg>
          Đáng tin cậy - An toàn - Hỗ trợ 24/7
        </p>
      </div>

      {/* Right: Form */}
      <div className="w-full md:w-1/2 bg-white shadow-2xl rounded-3xl p-10 max-w-xl border-[1.5px] border-blue-100">
        <h2 className="text-3xl font-extrabold text-center text-blue-700 mb-8 flex items-center justify-center gap-3">
          <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M20 7V6a2 2 0 00-2-2h-1.5a1.5 1.5 0 010-3h-9a1.5 1.5 0 010 3H6a2 2 0 00-2 2v1" strokeWidth={2}/><circle cx="12" cy="13" r="7" strokeWidth={2}/></svg>
          Đăng ký bác sĩ tư vấn
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field icon={icons.specialization} error={errors.specialization}>
            <input
              type="text"
              name="specialization"
              placeholder="Chuyên môn (VD: General Psychology)"
              className="w-full bg-transparent border-none focus:ring-0 outline-none text-sm"
              onChange={handleChange}
              value={formData.specialization}
            />
          </Field>
          <Field icon={icons.experience} error={errors.experienceYears}>
            <input
              type="number"
              name="experienceYears"
              placeholder="Số năm kinh nghiệm"
              className="w-full bg-transparent border-none focus:ring-0 outline-none text-sm"
              onChange={handleChange}
              value={formData.experienceYears}
            />
          </Field>
          <Field icon={icons.description} error={errors.description}>
            <input
              type="text"
              name="description"
              placeholder="Mô tả bản thân (VD: Tốt nghiệp tại...)"
              className="w-full bg-transparent border-none focus:ring-0 outline-none text-sm"
              onChange={handleChange}
              value={formData.description}
            />
          </Field>
          <Field icon={icons.phone} error={errors.phoneNumber}>
            <input
              type="text"
              name="phoneNumber"
              placeholder="Số điện thoại"
              className="w-full bg-transparent border-none focus:ring-0 outline-none text-sm"
              onChange={handleChange}
              value={formData.phoneNumber}
            />
          </Field>
          <Field icon={icons.hospital} error={errors.hospital}>
            <input
              type="text"
              name="hospital"
              placeholder="Bệnh viện đang công tác"
              className="w-full bg-transparent border-none focus:ring-0 outline-none text-sm"
              onChange={handleChange}
              value={formData.hospital}
            />
          </Field>
          <div>
            <label className="block text-sm font-semibold text-blue-600 mb-1 flex items-center gap-2">
              {icons.cert} Ảnh bằng cấp
            </label>
            <label className="flex items-center cursor-pointer bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg border border-blue-200 w-fit">
              {icons.upload}
              <span className="text-xs font-medium text-blue-500">Chọn file</span>
              <input
                type="file"
                name="certificateImage"
                accept="image/jpeg,image/png"
                onChange={handleChange}
                className="hidden"
              />
            </label>
            {errors.certificateImage && <p className="text-red-500 text-xs mt-1">{errors.certificateImage}</p>}
            {previewCert && <img src={previewCert} alt="Preview Certificate" className="w-32 rounded-lg mt-2 border border-blue-100 shadow" />}
            <p className="text-xs text-gray-400 mt-2">Chỉ chấp nhận JPG/PNG, tối đa 5MB</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-600 mb-1 flex items-center gap-2">
              {icons.cccd} Ảnh CCCD
            </label>
            <label className="flex items-center cursor-pointer bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg border border-blue-200 w-fit">
              {icons.upload}
              <span className="text-xs font-medium text-blue-500">Chọn file</span>
              <input
                type="file"
                name="cccdImage"
                accept="image/jpeg,image/png"
                onChange={handleChange}
                className="hidden"
              />
            </label>
            {errors.cccdImage && <p className="text-red-500 text-xs mt-1">{errors.cccdImage}</p>}
            {previewCccd && <img src={previewCccd} alt="Preview CCCD" className="w-32 rounded-lg mt-2 border border-blue-100 shadow" />}
            <p className="text-xs text-gray-400">Chỉ chấp nhận JPG/PNG, tối đa 5MB</p>
            <p className="text-xs text-gray-500 font-medium">Tên trong CCCD phải khớp với tên tài khoản của bạn</p>
          </div>
          <button
            type="submit"
            className={`w-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-bold py-3 rounded-xl shadow-xl flex items-center justify-center gap-2 text-lg transition-all duration-150 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? <>
              {icons.loading}
              Đang xử lý...
            </> : <>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7" strokeWidth={2} strokeLinecap="round"/></svg>
              Gửi Yêu Cầu
            </>}
          </button>
        </form>
      </div>
    </div>
  );
}