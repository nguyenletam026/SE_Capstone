import { useEffect, useState, useRef } from "react";
import { fetchUserInfo2, updateUserProfile } from "../../lib/user/info";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaSave, FaCamera, FaLock, FaUser, FaCalendarAlt, FaEnvelope, FaIdCard, FaShieldAlt, FaUserCircle } from "react-icons/fa";
import { HiOutlineCheck, HiOutlineX, HiBadgeCheck, HiOutlineMail, HiOutlineRefresh, HiOutlinePhotograph } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthdayDate: "",
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const result = await fetchUserInfo2();
        setUserInfo(result);
        setFormData({
          firstName: result.firstName || "",
          lastName: result.lastName || "",
          birthdayDate: result.birthdayDate ? new Date(result.birthdayDate).toISOString().split('T')[0] : "",
        });
      } catch (error) {
        console.error("Failed to load user info:", error);
        toast.error("Không thể tải thông tin người dùng");
      }
    };

    loadUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingAvatar(true);
      setAvatarPreview(URL.createObjectURL(file));
      // Simulate upload delay
      setTimeout(() => {
        setUploadingAvatar(false);
        toast.info("Tính năng cập nhật ảnh đại diện đang được phát triển", {
          icon: <HiOutlinePhotograph className="text-blue-500 text-xl" />
        });
      }, 1500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateUserProfile(userInfo.id, formData);
      
      // Update local user info
      setUserInfo({
        ...userInfo,
        ...formData,
      });
      
      setIsEditing(false);
      toast.success("Cập nhật thông tin thành công!", {
        icon: <HiOutlineCheck className="text-green-500 text-xl" />
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Không thể cập nhật thông tin. Vui lòng thử lại sau.", {
        icon: <HiOutlineX className="text-red-500 text-xl" />
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    navigate("/forgot-password");
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        <p className="mt-4 text-indigo-800 font-medium">Đang tải thông tin...</p>
      </div>
    );
  }

  const fullName = `${userInfo.firstName || ""} ${userInfo.lastName || ""}`.trim() || "Chưa cập nhật";
  const birthday = userInfo.birthdayDate ? new Date(userInfo.birthdayDate) : null;
  const age = birthday ? new Date().getFullYear() - birthday.getFullYear() : "N/A";
  
  // Get user role display info
  const getUserRoleBadge = () => {
    const role = userInfo.role?.name || "USER";
    switch(role) {
      case "ADMIN":
        return {
          name: "Quản trị viên",
          color: "bg-red-100 text-red-700 border-red-200",
          icon: <HiBadgeCheck className="text-red-500" />
        };
      case "DOCTOR":
        return {
          name: "Bác sĩ",
          color: "bg-purple-100 text-purple-700 border-purple-200",
          icon: <HiBadgeCheck className="text-purple-500" />
        };
      default:
        return {
          name: "Người dùng",
          color: "bg-blue-100 text-blue-700 border-blue-200",
          icon: <HiBadgeCheck className="text-blue-500" />
        };
    }
  };
  
  const roleBadge = getUserRoleBadge();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faff] to-[#f0f4ff] py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-indigo-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-700">
              Hồ sơ của bạn
            </h1>
            <p className="text-gray-500 mt-1">
              Xem và quản lý thông tin cá nhân của bạn
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all font-medium"
              >
                <FaEdit /> Chỉnh sửa
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 bg-gray-100 text-gray-600 px-5 py-2.5 rounded-xl hover:bg-gray-200 transition-all font-medium"
              >
                <HiOutlineX /> Hủy
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Profile Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 text-center">
              {/* Avatar with Upload Button */}
              <div className="relative inline-block mb-4">
                <div className={`rounded-full h-28 w-28 mx-auto overflow-hidden border-4 border-indigo-100 ${uploadingAvatar ? 'animate-pulse' : ''}`}>
                  {uploadingAvatar ? (
                    <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                      <HiOutlineRefresh className="animate-spin text-indigo-500 text-2xl" />
                    </div>
                  ) : (
                    <img
                      src={avatarPreview || userInfo.avtUrl || "https://via.placeholder.com/150"}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                
                <button
                  onClick={handleAvatarClick}
                  className="absolute bottom-1 right-1 bg-indigo-600 text-white p-2.5 rounded-full hover:bg-indigo-700 transition shadow-md"
                >
                  <FaCamera size={14} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              
              {/* User Name & Email */}
              <h3 className="text-xl font-semibold text-gray-800 mb-1">{fullName}</h3>
              <div className="flex items-center justify-center gap-1.5 text-gray-500 mb-4">
                <HiOutlineMail className="text-indigo-400" />
                <p className="text-sm">{userInfo.username}</p>
              </div>
              
              {/* Role Badge */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${roleBadge.color} border text-sm font-medium`}>
                {roleBadge.icon}
                {roleBadge.name}
              </div>
              

              
              {/* Quick Actions */}
              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={handleChangePassword}
                  className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-xl w-full transition text-sm"
                >
                  <FaLock className="text-indigo-500" />
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center gap-2">
                <FaUserCircle className="text-indigo-500" />
                Thông tin cá nhân
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* First Name */}
                <div>
                  <label className="flex items-center gap-1.5 text-gray-700 text-sm font-medium mb-1.5">
                    <FaUser className="text-indigo-400" />
                    Họ
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={isEditing ? formData.lastName : userInfo.lastName || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Nhập họ của bạn"
                    className={`w-full px-4 py-2.5 rounded-xl ${
                      isEditing 
                        ? "border-2 border-indigo-200 focus:border-indigo-500 bg-white" 
                        : "bg-gray-50 border border-gray-100"
                    } transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100`}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="flex items-center gap-1.5 text-gray-700 text-sm font-medium mb-1.5">
                    <FaUser className="text-indigo-400" />
                    Tên
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={isEditing ? formData.firstName : userInfo.firstName || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Nhập tên của bạn"
                    className={`w-full px-4 py-2.5 rounded-xl ${
                      isEditing 
                        ? "border-2 border-indigo-200 focus:border-indigo-500 bg-white" 
                        : "bg-gray-50 border border-gray-100"
                    } transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100`}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-1.5 text-gray-700 text-sm font-medium mb-1.5">
                    <FaEnvelope className="text-indigo-400" />
                    Email
                  </label>
                  <input
                    type="text"
                    value={userInfo.username}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Email của bạn không thể thay đổi</p>
                </div>

                {/* Birthday */}
                <div>
                  <label className="flex items-center gap-1.5 text-gray-700 text-sm font-medium mb-1.5">
                    <FaCalendarAlt className="text-indigo-400" />
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    name="birthdayDate"
                    value={isEditing ? formData.birthdayDate : userInfo.birthdayDate ? new Date(userInfo.birthdayDate).toISOString().split('T')[0] : ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2.5 rounded-xl ${
                      isEditing 
                        ? "border-2 border-indigo-200 focus:border-indigo-500 bg-white" 
                        : "bg-gray-50 border border-gray-100"
                    } transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100`}
                  />
                </div>

                {/* Account Type */}
                <div>
                  <label className="flex items-center gap-1.5 text-gray-700 text-sm font-medium mb-1.5">
                    <FaIdCard className="text-indigo-400" />
                    Loại tài khoản
                  </label>
                  <input
                    type="text"
                    value={userInfo.role?.name || "USER"}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-indigo-600 font-medium"
                  />
                </div>
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="flex justify-center pt-4 border-t">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white px-8 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all ${
                      loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <FaSave /> Lưu thay đổi
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>

            {/* Security Section */}
            <div className="bg-white rounded-2xl shadow-md p-8 mt-6">
              <h2 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center gap-2">
                <FaShieldAlt className="text-indigo-500" />
                Bảo mật
              </h2>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Mật khẩu và bảo mật</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Cập nhật mật khẩu của bạn thường xuyên để bảo vệ tài khoản
                  </p>
                </div>
                <button
                  onClick={handleChangePassword}
                  className="mt-3 md:mt-0 flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-5 py-2.5 rounded-xl transition font-medium"
                >
                  <FaLock />
                  Đổi mật khẩu
                </button>
              </div>
              
              <hr className="my-6" />
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Bảo vệ tài khoản</h3>
                <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center">
                  <div className="p-2 bg-green-100 rounded-full mr-4">
                    <HiOutlineCheck className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-green-800 font-medium">Tài khoản của bạn đang được bảo mật</p>
                    <p className="text-green-600 text-sm">Không có vấn đề bảo mật nào được phát hiện</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
};

export default UserProfile;