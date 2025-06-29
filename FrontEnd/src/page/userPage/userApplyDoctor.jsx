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
    if (file.size > 5 * 1024 * 1024) return "File size too large (maximum 5MB)";
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) return "Invalid file format (only JPG/PNG accepted)";
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
    if (!formData.specialization) newErrors.specialization = "Please enter your specialization";
    if (!formData.experienceYears) newErrors.experienceYears = "Please enter years of experience";
    if (!formData.description) newErrors.description = "Please enter a description";
    if (!formData.phoneNumber) newErrors.phoneNumber = "Please enter phone number";
    if (!formData.hospital) newErrors.hospital = "Please enter hospital";
    if (formData.phoneNumber && !/^[0-9]{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number (requires 10 digits)";
    }
    if (!formData.certificateImage) newErrors.certificateImage = "Please upload certificate image";
    if (!formData.cccdImage) newErrors.cccdImage = "Please upload ID card image";
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
    e.preventDefault();    if (!validateForm()) {
      toast.error("Please fill in all information and correct any errors");
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
      );      toast.success("Request sent successfully! Please wait for response.");
      setTimeout(() => navigate("/home"), 1500);

    } catch (error) {      if (error.response) {
        const errorCode = error.response.data?.code;
        const errorMessage = error.response.data?.message || "Unknown error";
        switch (errorCode) {
          case 1013:
            toast.error("Invalid certificate image.");
            setErrors({ ...errors, certificateImage: "Invalid certificate image" });
            break;
          case 1025:
            toast.error("Name on ID card does not match account name.");
            setErrors({ ...errors, cccdImage: "Name mismatch on ID card" });
            break;
          case 1015:
            toast.error("Empty or corrupted image file.");
            break;
          case 1010:
            toast.error("Your account is already a doctor.");
            navigate("/home");
            break;
          case 1037:
            toast.error("Request already sent, please wait for our response.");
            setTimeout(() => navigate("/home"), 2000);
            break;
          case 401:
            toast.error("Session expired. Please log in again.");
            navigate("/login");
            break;
          case 9999:
            if (errorMessage.includes("Query did not return a unique result")) {
              toast.error("Request already sent. Please wait for response.");
              setTimeout(() => navigate("/home"), 2000);
            } else {
              toast.error(`Request failed: ${errorMessage}`);
            }
            break;
          default:
            toast.error(`Request failed: ${errorMessage}`);
        }
      } else if (error.request) {
        toast.error("Cannot connect to server. Please check your connection.");
      } else {
        toast.error("Request failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Modern Field Component
  function Field({ icon, children, error }) {
    return (
      <div>
        <div className={`flex items-center bg-blue-50/50 rounded-xl border px-3 sm:px-4 py-2 sm:py-3 focus-within:ring-2 focus-within:ring-blue-400 transition min-h-[44px] ${error ? "border-red-400" : "border-blue-100"}`}>
          <span className="mr-3 flex-shrink-0">{icon}</span>
          {children}
        </div>
        {error && <p className="text-red-500 text-xs mt-1 ml-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4fbff] via-[#e8f0fe] to-[#e3e7ff] px-4 sm:px-6 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
      {/* Left: Banner with shadow and float icon */}
      <div className="w-full lg:w-1/2 flex flex-col items-center">
        <div className="relative w-full max-w-sm sm:max-w-md">
          <img
            src={doctorBanner}
            alt="Doctor Banner"
            className="rounded-2xl sm:rounded-3xl shadow-2xl w-full object-cover border-2 sm:border-4 border-white"
          />
          <div className="absolute -top-4 sm:-top-7 -left-4 sm:-left-7 bg-blue-100 rounded-full p-3 sm:p-4 shadow-lg animate-bounce">
            {/* Doctor SVG "avatar" */}
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="7" r="4" strokeWidth={2} />
              <path d="M21 20c0-3.866-3.582-7-8-7s-8 3.134-8 7" strokeWidth={2}/>
            </svg>
          </div>
        </div>
        <p className="mt-4 sm:mt-6 text-center text-blue-600 font-bold text-base sm:text-lg flex flex-col sm:flex-row items-center justify-center gap-2">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7" strokeWidth={2} strokeLinecap="round"/></svg>
          <span className="text-center sm:text-left">Trusted - Safe - 24/7 Support</span>
        </p>
      </div>

      {/* Right: Form */}
      <div className="w-full lg:w-1/2 bg-white shadow-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-10 max-w-xl border-[1.5px] border-blue-100">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-center text-blue-700 mb-6 sm:mb-8 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M20 7V6a2 2 0 00-2-2h-1.5a1.5 1.5 0 010-3h-9a1.5 1.5 0 010 3H6a2 2 0 00-2 2v1" strokeWidth={2}/><circle cx="12" cy="13" r="7" strokeWidth={2}/></svg>
          <span>Apply to Become Medical Advisor</span>
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <Field icon={icons.specialization} error={errors.specialization}>
            <input
              type="text"
              name="specialization"
              placeholder="Specialization (e.g., General Psychology)"
              className="w-full bg-transparent border-none focus:ring-0 outline-none text-sm sm:text-base"
              onChange={handleChange}
              value={formData.specialization}
            />
          </Field>
          <Field icon={icons.experience} error={errors.experienceYears}>
            <input
              type="number"
              name="experienceYears"
              placeholder="Years of experience"
              className="w-full bg-transparent border-none focus:ring-0 outline-none text-sm sm:text-base"
              onChange={handleChange}
              value={formData.experienceYears}
            />
          </Field>
          <Field icon={icons.description} error={errors.description}>
            <textarea
              name="description"
              placeholder="Describe yourself and your skills"
              className="w-full bg-transparent border-none focus:ring-0 outline-none text-sm sm:text-base resize-none"
              rows="3"
              onChange={handleChange}
              value={formData.description}
            />
          </Field>
          <Field icon={icons.phone} error={errors.phoneNumber}>
            <input
              type="text"
              name="phoneNumber"
              placeholder="Phone number"
              className="w-full bg-transparent border-none focus:ring-0 outline-none text-sm sm:text-base"
              onChange={handleChange}
              value={formData.phoneNumber}
            />
          </Field>
          <Field icon={icons.hospital} error={errors.hospital}>
            <input
              type="text"
              name="hospital"
              placeholder="Current workplace hospital"
              className="w-full bg-transparent border-none focus:ring-0 outline-none text-sm sm:text-base"
              onChange={handleChange}
              value={formData.hospital}
            />
          </Field>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-blue-600 mb-2 flex items-center gap-2">
              {icons.cert} Certificate Image
            </label>            <label className="flex items-center cursor-pointer bg-blue-50 hover:bg-blue-100 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-blue-200 w-fit min-h-[44px] transition-colors active:scale-95">
              {icons.upload}
              <span className="text-xs sm:text-sm font-medium text-blue-500">Choose file</span>
              <input
                type="file"
                name="certificateImage"
                accept="image/jpeg,image/png"
                onChange={handleChange}
                className="hidden"
              />
            </label>
            {errors.certificateImage && <p className="text-red-500 text-xs mt-1">{errors.certificateImage}</p>}
            {previewCert && <img src={previewCert} alt="Preview Certificate" className="w-24 sm:w-32 rounded-lg mt-2 border border-blue-100 shadow" />}
            <p className="text-xs text-gray-400 mt-2">Only JPG/PNG accepted, maximum 5MB</p>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-blue-600 mb-2 flex items-center gap-2">
              {icons.cccd} ID Card Image
            </label>            <label className="flex items-center cursor-pointer bg-blue-50 hover:bg-blue-100 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-blue-200 w-fit min-h-[44px] transition-colors active:scale-95">
              {icons.upload}
              <span className="text-xs sm:text-sm font-medium text-blue-500">Choose file</span>
              <input
                type="file"
                name="cccdImage"
                accept="image/jpeg,image/png"
                onChange={handleChange}
                className="hidden"
              />
            </label>
            {errors.cccdImage && <p className="text-red-500 text-xs mt-1">{errors.cccdImage}</p>}
            {previewCccd && <img src={previewCccd} alt="Preview CCCD" className="w-24 sm:w-32 rounded-lg mt-2 border border-blue-100 shadow" />}
            <p className="text-xs text-gray-400 mt-2">Only JPG/PNG accepted, maximum 5MB</p>
            <p className="text-xs text-gray-500 font-medium">Name on ID card must match your account name</p>
          </div>
          
          <button
            type="submit"
            className={`w-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-bold py-3 sm:py-4 rounded-xl shadow-xl flex items-center justify-center gap-2 text-base sm:text-lg transition-all duration-150 min-h-[44px] active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={loading}
          >            {loading ? <>
              {icons.loading}
              <span>Processing...</span>
            </> : <>
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7" strokeWidth={2} strokeLinecap="round"/></svg>
              <span>Send Request</span>
            </>}
          </button>
        </form>
      </div>
    </div>
  );
}