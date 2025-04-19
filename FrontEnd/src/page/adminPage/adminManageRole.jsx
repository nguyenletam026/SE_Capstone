import { useEffect, useState } from "react";
import {
  getRoles,
  deleteRole,
} from "../../lib/admin/adminServices";
import { HiPlus, HiTrash, HiPencil, HiSearch } from "react-icons/hi";

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

  const handleDelete = async (roleName) => {
    const confirmDelete = window.confirm(`Delete role "${roleName}"?`);
    if (confirmDelete) {
      await deleteRole(roleName);
      fetchRoles();
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">🔐 Manage Roles</h2>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full md:w-1/3">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
            <HiSearch />
          </span>
          <input
            type="text"
            placeholder="Search roles..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition"
          onClick={() => alert("Add Role Modal")}
        >
          <HiPlus className="text-lg" />
          Add Role
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="w-full text-left border border-gray-200">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-6 py-3 border-b font-semibold">Role Name</th>
              <th className="px-6 py-3 border-b font-semibold">Permissions</th>
              <th className="px-6 py-3 border-b font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles
              .filter((role) =>
                role.name.toLowerCase().includes(filter.toLowerCase())
              )
              .map((role) => (
                <tr
                  key={role.name}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className="px-6 py-4 border-b font-medium text-gray-800">
                    {role.name}
                  </td>
                  <td className="px-6 py-4 border-b text-sm text-gray-600">
                    {role.permissions?.length
                      ? role.permissions.join(", ")
                      : "None"}
                  </td>
                  <td className="px-6 py-4 border-b space-x-4">
                    <button
                      className="text-blue-600 hover:text-blue-800 transition"
                      onClick={() => alert("Edit Role")}
                    >
                      <HiPencil className="inline mr-1" />
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800 transition"
                      onClick={() => handleDelete(role.name)}
                    >
                      <HiTrash className="inline mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            {roles.filter((role) =>
              role.name.toLowerCase().includes(filter.toLowerCase())
            ).length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-gray-500 py-6 italic">
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
