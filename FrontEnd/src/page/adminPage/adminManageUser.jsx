import { useEffect, useState } from "react";
import { getUsers } from "../../lib/admin/userServices";

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
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border px-3 py-2 rounded w-1/3"
        />
      </div>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Username</th>
            <th className="border p-2">First Name</th>
            <th className="border p-2">Last Name</th>
            <th className="border p-2">Role</th>
          </tr>
        </thead>
        <tbody>
          {users
            .filter((user) => user.username.toLowerCase().includes(filter.toLowerCase()))
            .map((user) => (
              <tr key={user.username} className="hover:bg-gray-50">
                <td className="border p-2">{user.username}</td>
                <td className="border p-2">{user.firstName || "N/A"}</td>
                <td className="border p-2">{user.lastName || "N/A"}</td>
                <td className="border p-2">{user.role.name}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminManageUser;