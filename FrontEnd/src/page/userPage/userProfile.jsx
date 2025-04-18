import { useEffect, useState } from "react";
import { fetchUserInfo2 } from "../../lib/user/info";

const UserProfile = () => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const result = await fetchUserInfo2();
        setUserInfo(result);
      } catch (error) {
        console.error("Failed to load user info:", error);
      }
    };

    loadUser();
  }, []);

  if (!userInfo) return <div className="text-center py-10">Loading...</div>;

  const fullName = `${userInfo.firstName} ${userInfo.lastName}`;
  const birthday = new Date(userInfo.birthdayDate);
  const age = new Date().getFullYear() - birthday.getFullYear();

  return (
    <div className="bg-[#f3f3f3] min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-10">
        <h2 className="text-gray-400 text-sm font-semibold mb-6">User Profile</h2>

        {/* Avatar and Info */}
        <div className="flex items-center space-x-6 mb-10">
          <img
            src={userInfo.avtUrl}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover"
          />
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{fullName}</h3>
            <p className="text-gray-500">{userInfo.username}</p>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-[#4b2e27] mb-8">Profile</h1>

        {/* Form Fields */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-gray-600 text-sm">Full Name</label>
            <input
              disabled
              type="text"
              value={fullName}
              className="w-full px-4 py-2 mt-1 rounded bg-gray-100"
            />
          </div>

          <div>
            <label className="text-gray-600 text-sm">Nick Name</label>
            <input
              disabled
              type="text"
              value={userInfo.firstName}
              className="w-full px-4 py-2 mt-1 rounded bg-gray-100"
            />
          </div>

          <div>
            <label className="text-gray-600 text-sm">Gender</label>
            <input
              disabled
              type="text"
              value="Not Specified"
              className="w-full px-4 py-2 mt-1 rounded bg-gray-100"
            />
          </div>

          <div>
            <label className="text-gray-600 text-sm">Age</label>
            <input
              disabled
              type="text"
              value={age}
              className="w-full px-4 py-2 mt-1 rounded bg-gray-100"
            />
          </div>

          <div>
            <label className="text-gray-600 text-sm">Email</label>
            <input
              disabled
              type="text"
              value={userInfo.username}
              className="w-full px-4 py-2 mt-1 rounded bg-gray-100"
            />
          </div>

          <div>
            <label className="text-pink-600 text-sm font-semibold">Account Type</label>
            <input
              disabled
              type="text"
              value={userInfo.role?.name || "USER"}
              className="w-full px-4 py-2 mt-1 rounded bg-gray-100 text-gray-800"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="text-center">
          <button className="bg-[#4b2e27] hover:bg-[#3a231d] text-white px-10 py-2 rounded-full text-sm flex items-center justify-center gap-2 mx-auto">
            Lưu <span className="text-xl">➜</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
