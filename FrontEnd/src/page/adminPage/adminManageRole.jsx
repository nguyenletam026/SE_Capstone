import { useEffect, useState } from "react";
import { getRoles } from "../../lib/admin/adminServices";
import {
  HiPlus,
  HiSearch,
  HiUserGroup,
  HiShieldCheck,
  HiOutlineUserCircle,
} from "react-icons/hi";

const AdminManageRole = () => {
  const [roles, setRoles] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    const data = await getRoles();
    setRoles(data);
  };

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3 text-gray-800">
          <HiUserGroup className="text-4xl text-blue-600" />
          <h2 className="text-3xl font-bold">Manage Roles</h2>
        </div>

       
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
          <HiSearch className="text-lg" />
        </span>
        <input
          type="text"
          placeholder="Search for a role..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm text-gray-700"
        />
      </div>

      {/* Roles List */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wide">
            <tr>
              <th className="px-6 py-4 flex items-center gap-2">
                <HiOutlineUserCircle className="text-lg" />
                Role Name
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRoles.map((role) => (
              <tr
                key={role.name}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4 text-gray-800 font-medium flex items-center gap-2">
                  <HiShieldCheck className="text-blue-500" />
                  {role.name}
                </td>
              </tr>
            ))}
            {filteredRoles.length === 0 && (
              <tr>
                <td className="px-6 py-6 text-center text-gray-400 italic">
                  No roles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminManageRole;
