import { useEffect, useState } from "react";
import { getRoles, createRole, updateRole, deleteRole } from "../../lib/admin/adminServices";

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
    await deleteRole(roleName);
    fetchRoles();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search roles..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border px-3 py-2 rounded w-1/3"
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => alert("Add Role Modal")}>
          Add Role
        </button>
      </div>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Permissions</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles
            .filter((role) => role.name.toLowerCase().includes(filter.toLowerCase()))
            .map((role) => (
              <tr key={role.name} className="hover:bg-gray-50">
                <td className="border p-2">{role.name}</td>
                <td className="border p-2">{role.permissions.length ? role.permissions.join(", ") : "None"}</td>
                <td className="border p-2 relative">
                  <button className="text-blue-500 underline" onClick={() => alert("Edit Role")}>Edit</button>
                  <button className="text-red-500 underline ml-4" onClick={() => handleDelete(role.name)}>Delete</button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminManageRole;