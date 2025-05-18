import { useEffect, useState, useRef } from "react";
import { fetchUserInfo2, updateUserProfile } from "../../lib/user/info";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaSave, FaCamera } from "react-icons/fa";

const UserProfile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthdayDate: "",
  });
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

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
      setAvatarPreview(URL.createObjectURL(file));
      // TODO: Implement avatar upload functionality
      toast.info("Tính năng cập nhật ảnh đại diện đang được phát triển");
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
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Không thể cập nhật thông tin. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  if (!userInfo) return <div className="text-center py-10">Loading...</div>;

  const fullName = `${userInfo.firstName || ""} ${userInfo.lastName || ""}`.trim() || "Chưa cập nhật";
  const birthday = userInfo.birthdayDate ? new Date(userInfo.birthdayDate) : null;
  const age = birthday ? new Date().getFullYear() - birthday.getFullYear() : "N/A";

  return (
    <div className="bg-[#f3f3f3] min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-gray-400 text-sm font-semibold">User Profile</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              <FaEdit /> Chỉnh sửa
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg text-sm"
            >
              Hủy
            </button>
          )}
        </div>

        {/* Avatar and Info */}
        <div className="flex items-center space-x-6 mb-10">
          <div className="relative">
            <img
              src={avatarPreview || userInfo.avtUrl || "https://via.placeholder.com/150"}
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover"
            />
            <button
              onClick={handleAvatarClick}
              className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition"
            >
              <FaCamera size={12} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{fullName}</h3>
            <p className="text-gray-500">{userInfo.username}</p>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-[#4b2e27] mb-8">Profile</h1>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-gray-600 text-sm">First Name</label>
              <input
                type="text"
                name="firstName"
                value={isEditing ? formData.firstName : userInfo.firstName || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 mt-1 rounded ${
                  isEditing ? "bg-white border border-gray-300" : "bg-gray-100"
                }`}
              />
            </div>

            <div>
              <label className="text-gray-600 text-sm">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={isEditing ? formData.lastName : userInfo.lastName || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 mt-1 rounded ${
                  isEditing ? "bg-white border border-gray-300" : "bg-gray-100"
                }`}
              />
            </div>

            <div>
              <label className="text-gray-600 text-sm">Email</label>
              <input
                type="text"
                value={userInfo.username}
                disabled
                className="w-full px-4 py-2 mt-1 rounded bg-gray-100"
              />
            </div>

            <div>
              <label className="text-gray-600 text-sm">Birthday</label>
              <input
                type="date"
                name="birthdayDate"
                value={isEditing ? formData.birthdayDate : userInfo.birthdayDate ? new Date(userInfo.birthdayDate).toISOString().split('T')[0] : ""}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 mt-1 rounded ${
                  isEditing ? "bg-white border border-gray-300" : "bg-gray-100"
                }`}
              />
            </div>

            <div>
              <label className="text-gray-600 text-sm">Age</label>
              <input
                type="text"
                value={age}
                disabled
                className="w-full px-4 py-2 mt-1 rounded bg-gray-100"
              />
            </div>

            <div>
              <label className="text-pink-600 text-sm font-semibold">Account Type</label>
              <input
                type="text"
                value={userInfo.role?.name || "USER"}
                disabled
                className="w-full px-4 py-2 mt-1 rounded bg-gray-100 text-gray-800"
              />
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className={`bg-[#4b2e27] hover:bg-[#3a231d] text-white px-10 py-2 rounded-full text-sm flex items-center justify-center gap-2 mx-auto ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Đang lưu..." : (
                  <>
                    <FaSave /> Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          )}
        </form>

        {/* Change Password Section */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold text-[#4b2e27] mb-4">Bảo mật</h2>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Đổi mật khẩu</h3>
              <p className="text-gray-500 text-sm">Cập nhật mật khẩu của bạn để bảo mật tài khoản</p>
            </div>
            <button
              onClick={() => toast.info("Tính năng đổi mật khẩu đang được phát triển")}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm"
            >
              Đổi mật khẩu
            </button>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default UserProfile;
