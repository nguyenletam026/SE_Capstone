import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import doctorBanner from "../../assets/10.png"; // Thay thế bằng ảnh phù hợp
import { requestDoctor } from "../../lib/user/info";
import { toast } from "react-toastify";
import axios from "axios";
import { checkPendingDoctorRequest } from "../../lib/admin/adminServices";

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
    // Check if user already has a pending request
    const checkExistingRequest = async () => {
      try {
        const hasPendingRequest = await checkPendingDoctorRequest();
        if (hasPendingRequest) {
          toast.info("Request already sent, please wait for our response.");
          setTimeout(() => {
            navigate("/home");
          }, 2000);
        }
      } catch (error) {
        console.error("Error checking pending request:", error);
      }
    };
    
    checkExistingRequest();
  }, [navigate]);

  // Kiểm tra định dạng file
  const validateFile = (file) => {
    // Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return "Kích thước file quá lớn (tối đa 5MB)";
    }
    
    // Kiểm tra định dạng file (chỉ chấp nhận JPG/PNG)
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return "Định dạng file không hợp lệ (chỉ chấp nhận JPG/PNG)";
    }
    
    return null; // Không có lỗi
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "certificateImage" || name === "cccdImage") {
      const file = files[0];
      if (file) {
        // Kiểm tra file trước khi cập nhật state
        const fileError = validateFile(file);
        if (fileError) {
          setErrors({...errors, [name]: fileError});
          // Reset file input
          e.target.value = '';
          return;
        } else {
          // Xóa lỗi nếu file hợp lệ
          setErrors({...errors, [name]: null});
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
    
    // Kiểm tra các trường bắt buộc
    if (!formData.specialization) newErrors.specialization = "Vui lòng nhập chuyên môn";
    if (!formData.experienceYears) newErrors.experienceYears = "Vui lòng nhập số năm kinh nghiệm";
    if (!formData.description) newErrors.description = "Vui lòng nhập mô tả";
    if (!formData.phoneNumber) newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
    if (!formData.hospital) newErrors.hospital = "Vui lòng nhập bệnh viện";
    
    // Kiểm tra định dạng số điện thoại
    if (formData.phoneNumber && !/^[0-9]{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ (cần 10 chữ số)";
    }
    
    // Kiểm tra file
    if (!formData.certificateImage) newErrors.certificateImage = "Vui lòng tải lên ảnh bằng cấp";
    if (!formData.cccdImage) newErrors.cccdImage = "Vui lòng tải lên ảnh CCCD";
    
    // Kiểm tra định dạng file nếu đã chọn
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
    
    // Kiểm tra form trước khi gửi
    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ thông tin và sửa các lỗi");
      return;
    }
    
    setLoading(true);
    console.log("Starting form submission...");
    
    try {
      // Tạo FormData để gửi dữ liệu form và file
      const formDataToSend = new FormData();
      formDataToSend.append('specialization', formData.specialization);
      formDataToSend.append('experienceYears', formData.experienceYears);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('phoneNumber', formData.phoneNumber);
      formDataToSend.append('hospital', formData.hospital);
      
      // Đảm bảo file hình ảnh được thêm vào form data
      if (formData.certificateImage) {
        console.log("Certificate image added:", formData.certificateImage.name, "Size:", formData.certificateImage.size, "Type:", formData.certificateImage.type);
        formDataToSend.append('certificateImage', formData.certificateImage);
      } else {
        console.log("Certificate image is null or undefined");
      }
      
      if (formData.cccdImage) {
        console.log("CCCD image added:", formData.cccdImage.name, "Size:", formData.cccdImage.size, "Type:", formData.cccdImage.type);
        formDataToSend.append('cccdImage', formData.cccdImage);
      } else {
        console.log("CCCD image is null or undefined");
      }
      
      // Sử dụng axios để gửi FormData
      const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";
      const token = localStorage.getItem("accessToken");
      
      console.log("Sending request to:", `${API_BASE}/doctors/request-doctor`);
      console.log("With token:", token ? "Token exists" : "No token found");
      
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
      
      console.log("Request successful:", response.data);
      toast.success("Your Request Sent Successfully. Please Wait For My Contact");

        setTimeout(() => {
          navigate("/home");
        }, 1500); // chờ 1.5 giây

    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu:", error);
      
      if (error.response) {
        // Xử lý các mã lỗi cụ thể
        const errorCode = error.response.data?.code;
        const errorMessage = error.response.data?.message || "Lỗi không xác định";
        
        console.error("Error response data:", error.response.data);
        console.error("Error status:", error.response.status);
        console.error("Error code:", errorCode);
        console.error("Error message:", errorMessage);
        
        switch (errorCode) {
          case 1013: // Invalid doctor certificate
            toast.error("Ảnh bằng cấp không hợp lệ. Vui lòng tải lên ảnh rõ ràng, định dạng JPG/PNG.");
            setErrors({...errors, certificateImage: "Ảnh bằng cấp không hợp lệ"});
            break;
          case 1025: // CCCD name mismatch
            toast.error("Tên trong CCCD không khớp với tên tài khoản của bạn.");
            setErrors({...errors, cccdImage: "Tên trong CCCD không khớp"});
            break;
          case 1015: // File is null
            toast.error("File ảnh trống hoặc bị lỗi. Vui lòng tải lên lại.");
            break;
          case 1010: // Already doctor
            toast.error("Tài khoản của bạn đã là bác sĩ.");
            navigate("/home");
            break;
          case 1037: // Request already sent
            toast.error("Request already sent, please wait for our response.");
            setTimeout(() => {
              navigate("/home");
            }, 2000);
            break;
          case 401: // Unauthorized
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            navigate("/login");
            break;
          case 9999: // Uncategorized error
            // Check if it's related to duplicate requests
            if (errorMessage.includes("Query did not return a unique result")) {
              toast.error("Your Request Already Sent. Please Wait For Our Response");
              setTimeout(() => {
                navigate("/home");
              }, 2000);
            } else {
              toast.error(`Gửi yêu cầu thất bại: ${errorMessage}`);
            }
            break;
          default:
            toast.error(`Gửi yêu cầu thất bại: ${errorMessage}`);
        }
      } else if (error.request) {
        // Không nhận được phản hồi từ server
        console.error("No response received:", error.request);
        toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối của bạn.");
      } else {
        // Lỗi khác
        console.error("Error message:", error.message);
        toast.error("Gửi yêu cầu thất bại. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
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
          <div>
            <input
              type="text"
              name="specialization"
              placeholder="Chuyên môn (VD: General Psychology)"
              className={`w-full border ${errors.specialization ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none`}
              onChange={handleChange}
              value={formData.specialization}
            />
            {errors.specialization && <p className="text-red-500 text-xs mt-1">{errors.specialization}</p>}
          </div>
          
          <div>
            <input
              type="number"
              name="experienceYears"
              placeholder="Số năm kinh nghiệm"
              className={`w-full border ${errors.experienceYears ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none`}
              onChange={handleChange}
              value={formData.experienceYears}
            />
            {errors.experienceYears && <p className="text-red-500 text-xs mt-1">{errors.experienceYears}</p>}
          </div>
          
          <div>
            <input
              type="text"
              name="description"
              placeholder="Mô tả bản thân (VD: Tốt nghiệp tại...)"
              className={`w-full border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none`}
              onChange={handleChange}
              value={formData.description}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
          
          <div>
            <input
              type="text"
              name="phoneNumber"
              placeholder="Số điện thoại"
              className={`w-full border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none`}
              onChange={handleChange}
              value={formData.phoneNumber}
            />
            {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
          </div>
          
          <div>
            <input
              type="text"
              name="hospital"
              placeholder="Bệnh viện đang công tác"
              className={`w-full border ${errors.hospital ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none`}
              onChange={handleChange}
              value={formData.hospital}
            />
            {errors.hospital && <p className="text-red-500 text-xs mt-1">{errors.hospital}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Ảnh bằng cấp</label>
            <input
              type="file"
              name="certificateImage"
              accept="image/jpeg,image/png"
              onChange={handleChange}
              className={`text-sm ${errors.certificateImage ? 'border border-red-500 rounded p-1' : ''}`}
            />
            {errors.certificateImage && <p className="text-red-500 text-xs mt-1">{errors.certificateImage}</p>}
            {previewCert && <img src={previewCert} alt="Preview Certificate" className="w-32 rounded-lg mt-2" />}
            <p className="text-xs text-gray-500">Chỉ chấp nhận định dạng JPG/PNG</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Ảnh CCCD</label>
            <input
              type="file"
              name="cccdImage"
              accept="image/jpeg,image/png"
              onChange={handleChange}
              className={`text-sm ${errors.cccdImage ? 'border border-red-500 rounded p-1' : ''}`}
            />
            {errors.cccdImage && <p className="text-red-500 text-xs mt-1">{errors.cccdImage}</p>}
            {previewCccd && <img src={previewCccd} alt="Preview CCCD" className="w-32 rounded-lg mt-2" />}
            <p className="text-xs text-gray-500">Chỉ chấp nhận định dạng JPG/PNG</p>
            <p className="text-xs text-gray-500 font-medium">Lưu ý: Tên trong CCCD phải khớp với tên tài khoản của bạn</p>
          </div>

          <button
            type="submit"
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Gửi Yêu Cầu'}
          </button>
        </form>
      </div>
    </div>
  );
}
