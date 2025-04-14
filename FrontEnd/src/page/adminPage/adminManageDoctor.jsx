import { useEffect, useState } from "react";
import { getDoctorRequests, approveDoctor, rejectDoctor } from "../../lib/admin/adminServices";
import { HiSearch, HiDotsVertical } from "react-icons/hi";

const AdminManageDoctor = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const data = await getDoctorRequests();
    setRequests(data);
  };

  const handleApprove = async (id) => {
    await approveDoctor(id);
    fetchRequests();
  };

  const handleReject = async (id) => {
    await rejectDoctor(id);
    fetchRequests();
  };

  const toggleDropdown = (id) => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">🩺 Manage Doctor Requests</h2>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full md:w-1/3">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
            <HiSearch />
          </span>
          <input
            type="text"
            placeholder="Search by username..."
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
              <th className="px-6 py-3 border-b font-semibold">Status</th>
              <th className="px-6 py-3 border-b font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests
              .filter((r) =>
                r.username.toLowerCase().includes(filter.toLowerCase())
              )
              .map((req) => (
                <tr key={req.requestId} className="hover:bg-gray-50 transition duration-150 relative">
                  <td className="px-6 py-4 border-b font-medium text-gray-800">{req.username}</td>
                  <td className="px-6 py-4 border-b text-gray-700">{req.status}</td>
                  <td className="px-6 py-4 border-b relative">
                    <button
                      onClick={() => toggleDropdown(req.requestId)}
                      className="text-gray-600 hover:text-black"
                    >
                      <HiDotsVertical className="text-xl" />
                    </button>

                    {openDropdownId === req.requestId && (
                      <div className="absolute z-10 right-6 mt-2 bg-white border rounded shadow w-48">
                        <a
                          href={req.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                        >
                          View Certificate
                        </a>
                        <button
                          onClick={() => handleApprove(req.requestId)}
                          className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(req.requestId)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            {requests.filter((r) =>
              r.username.toLowerCase().includes(filter.toLowerCase())
            ).length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-gray-500 py-6 italic">
                  No doctor requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminManageDoctor;
