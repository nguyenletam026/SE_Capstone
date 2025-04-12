import { useEffect, useState } from "react";
import { getUsers } from "../../lib/admin/userServices";
import { HiSearch } from "react-icons/hi";

const AdminManageUser = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const data = await getUsers();
    setUsers(data);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">👤 Manage Users</h2>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full md:w-1/3">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
            <HiSearch />
          </span>
          <input
            type="text"
            placeholder="Search users..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="w-full text-left border border-gray-200">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-6 py-3 border-b font-semibold">Username</th>
              <th className="px-6 py-3 border-b font-semibold">First Name</th>
              <th className="px-6 py-3 border-b font-semibold">Last Name</th>
              <th className="px-6 py-3 border-b font-semibold">Role</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter((user) =>
                user.username.toLowerCase().includes(filter.toLowerCase())
              )
              .map((user) => (
                <tr
                  key={user.username}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className="px-6 py-4 border-b font-medium text-gray-800">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 border-b text-gray-700">
                    {user.firstName || "N/A"}
                  </td>
                  <td className="px-6 py-4 border-b text-gray-700">
                    {user.lastName || "N/A"}
                  </td>
                  <td className="px-6 py-4 border-b text-gray-700">
                    {user.role?.name || "N/A"}
                  </td>
                </tr>
              ))}
            {users.filter((u) =>
              u.username.toLowerCase().includes(filter.toLowerCase())
            ).length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-gray-500 py-6 italic">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminManageUser;
