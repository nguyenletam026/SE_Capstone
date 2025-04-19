import { useEffect, useRef, useState } from "react";
import { getDoctorRequests, approveDoctor, rejectDoctor } from "../../lib/admin/adminServices";
import { HiSearch, HiDotsVertical } from "react-icons/hi";
import { FaFileAlt, FaCheckCircle, FaTrashAlt } from "react-icons/fa";

const AdminManageDoctor = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("");
  const [dropdown, setDropdown] = useState(null); // { id, top, left }
  const buttonRefs = useRef({});

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
    setDropdown(null);
  };

  const handleReject = async (id) => {
    await rejectDoctor(id);
    fetchRequests();
    setDropdown(null);
  };

  const toggleDropdown = (id) => {
    const btn = buttonRefs.current[id];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setDropdown((prev) =>
        prev?.id === id
          ? null
          : {
              id,
              top: rect.bottom + window.scrollY + 4, // Cách dưới nút 4px
              left: rect.right + window.scrollX - 192, // Canh phải với width = 192px
            }
      );
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdown &&
        !document.getElementById("dropdown-menu")?.contains(e.target) &&
        !Object.values(buttonRefs.current).some((ref) => ref?.contains(e.target))
      ) {
        setDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdown]);

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        🩺 Manage Doctor Requests
      </h2>

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

      <div className="overflow-x-auto rounded-lg shadow relative">
        <table className="w-full text-left border border-gray-200">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 border-b">Username</th>
              <th className="px-4 py-3 border-b">Specialization</th>
              <th className="px-4 py-3 border-b">Experience</th>
              <th className="px-4 py-3 border-b">Phone</th>
              <th className="px-4 py-3 border-b">Hospital</th>
              <th className="px-4 py-3 border-b">Status</th>
              <th className="px-4 py-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests
              .filter((r) => r.username.toLowerCase().includes(filter.toLowerCase()))
              .map((req) => (
                <tr key={req.requestId} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-4 py-4 border-b font-medium text-gray-800">{req.username}</td>
                  <td className="px-4 py-4 border-b">{req.specialization}</td>
                  <td className="px-4 py-4 border-b">{req.experienceYears} năm</td>
                  <td className="px-4 py-4 border-b">{req.phoneNumber}</td>
                  <td className="px-4 py-4 border-b">{req.hospital}</td>
                  <td className="px-4 py-4 border-b">{req.status}</td>
                  <td className="px-4 py-4 border-b text-right">
                    <button
                      ref={(el) => (buttonRefs.current[req.requestId] = el)}
                      onClick={() => toggleDropdown(req.requestId)}
                      className="text-gray-600 hover:text-black"
                    >
                      <HiDotsVertical className="text-xl" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* 🔽 Dropdown Menu */}
      {dropdown && (
        <div
          id="dropdown-menu"
          className="fixed z-50 bg-white border rounded-xl shadow-lg w-48 animate-fade-in"
          style={{
            top: `${dropdown.top}px`,
            left: `${dropdown.left}px`,
          }}
        >
          <ul className="text-sm text-gray-700">
            <li>
              <a
                href={
                  requests.find((r) => r.requestId === dropdown.id)?.certificateUrl || "#"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 hover:bg-gray-100 text-blue-600"
              >
                <FaFileAlt className="text-sm" />
                <span className="ml-2">View Certificate</span>
              </a>
            </li>
            <li>
              <button
                onClick={() => handleApprove(dropdown.id)}
                className="flex w-full items-center px-4 py-2 hover:bg-gray-100 text-green-600"
              >
                <FaCheckCircle className="text-sm" />
                <span className="ml-2">Approve</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleReject(dropdown.id)}
                className="flex w-full items-center px-4 py-2 hover:bg-gray-100 text-red-600"
              >
                <FaTrashAlt className="text-sm" />
                <span className="ml-2">Reject</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminManageDoctor;
