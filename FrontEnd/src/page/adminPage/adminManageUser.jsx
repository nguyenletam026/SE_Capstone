import { useEffect, useState } from "react";
import { getUsers } from "../../lib/admin/userServices";
import { HiSearch, HiBan, HiCheckCircle, HiUser, HiUserCircle, HiShieldCheck } from "react-icons/hi";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = process.env.REACT_APP_API_URL;

const AdminManageUser = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleBanToggle = async (userId, isBanned) => {
    setLoading(true);
    try {
      const endpoint = isBanned
        ? `${API_URL}/api/users/${userId}/unban`
        : `${API_URL}/api/users/${userId}/ban`;
      await axios.post(endpoint, {}, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setUsers(users.map(user =>
        user.id === userId ? { ...user, banned: !isBanned } : user
      ));
      toast.success(`User ${isBanned ? "unbanned" : "banned"} successfully`);
    } catch (error) {
      toast.error(`Failed to ${isBanned ? "unban" : "ban"} user`);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <HiUser className="text-blue-600 text-4xl" />
            Manage Users
          </h2>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-3 w-full bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-800 text-white text-sm">
                <tr>
                  <th className="px-6 py-4 font-semibold flex items-center gap-2">
                    <HiUserCircle /> Avatar
                  </th>
                  <th className="px-6 py-4 font-semibold">Username</th>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold flex items-center gap-2">
                    <HiShieldCheck /> Role
                  </th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400 italic">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4">
                        <img
                          src={user.avtUrl || "/default-avatar.png"}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full object-cover shadow"
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {user.role?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                            user.banned
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {user.banned ? (
                            <>
                              <HiBan className="text-red-500" /> Banned
                            </>
                          ) : (
                            <>
                              <HiCheckCircle className="text-green-500" /> Active
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleBanToggle(user.id, user.banned)}
                          disabled={loading}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 ${
                            user.banned
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-red-500 hover:bg-red-600"
                          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {user.banned ? (
                            <>
                              <HiCheckCircle className="text-white" />
                              Unban
                            </>
                          ) : (
                            <>
                              <HiBan className="text-white" />
                              Ban
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManageUser;
