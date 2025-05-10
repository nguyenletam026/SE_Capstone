import { useEffect, useRef, useState } from "react";
import { getDoctorRequests, approveDoctor, rejectDoctor } from "../../lib/admin/adminServices";
import { 
  HiSearch, 
  HiDotsVertical,
  HiOutlineChartPie,
  HiOutlineDocumentText,
  HiOutlineOfficeBuilding,
  HiOutlinePhone,
  HiOutlineClock,
  HiOutlineAcademicCap,
  HiOutlineIdentification,
  HiOutlineRefresh,
  HiOutlineFilter,
  HiOutlineClipboardCheck
} from "react-icons/hi";
import { 
  FaRegCheckCircle, 
  FaRegTimesCircle, 
  FaRegFileAlt, 
  FaRegEye,
  FaRegClock
} from "react-icons/fa";
import { 
  RiStethoscopeLine, 
  RiUserHeartLine,
  RiHospitalLine,
  RiMedalLine 
} from "react-icons/ri";

const AdminManageDoctor = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("");
  const [dropdown, setDropdown] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState("2025-05-24 11:31:31");
  const currentUser = "admin";
  const [filterStatus, setFilterStatus] = useState("ALL");
  
  const buttonRefs = useRef({});

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      const now = new Date();
      const formattedDate = now.toISOString().split('T')[0];
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setCurrentDateTime(`${formattedDate} ${hours}:${minutes}:${seconds}`);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getDoctorRequests();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching doctor requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveDoctor(id);
      fetchRequests();
      setDropdown(null);
    } catch (error) {
      console.error("Error approving doctor:", error);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectDoctor(id);
      fetchRequests();
      setDropdown(null);
    } catch (error) {
      console.error("Error rejecting doctor:", error);
    }
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
              top: rect.bottom + window.scrollY + 4,
              left: rect.right + window.scrollX - 192,
            }
      );
    }
  };

  const openDetailModal = (request) => {
    setDetailModal(request);
    setDropdown(null);
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

  // Filter requests by status
  const filteredRequests = requests
    .filter(r => r.username.toLowerCase().includes(filter.toLowerCase()))
    .filter(r => filterStatus === "ALL" || r.status === filterStatus);

  // Format status with color and icon
  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            <FaRegCheckCircle className="text-emerald-500" />
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
            <FaRegTimesCircle className="text-rose-500" />
            Rejected
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
            <FaRegClock className="text-amber-500" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8 relative">
      {/* Top Header with Stats */}
      <div className="bg-white rounded-2xl shadow-md mb-8 overflow-hidden border border-indigo-100">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <RiStethoscopeLine className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Doctor Management</h1>
                <p className="text-indigo-100">Review and process doctor registration requests</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{requests.filter(r => r.status === "PENDING").length}</div>
                <div className="text-indigo-200 text-sm">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{requests.filter(r => r.status === "APPROVED").length}</div>
                <div className="text-indigo-200 text-sm">Approved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{requests.filter(r => r.status === "REJECTED").length}</div>
                <div className="text-indigo-200 text-sm">Rejected</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* User & Time Info */}
        <div className="px-6 py-4 bg-indigo-50/50 border-t border-indigo-100 flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="flex items-center space-x-3">
            <img 
              src={`https://api.dicebear.com/6.x/initials/svg?seed=${currentUser}`} 
              alt="User" 
              className="w-8 h-8 rounded-full border border-indigo-200"
            />
            <span className="text-indigo-700 font-medium">{currentUser}</span>
          </div>
          <div className="flex items-center mt-2 md:mt-0 space-x-2 text-indigo-700">
            <FaRegClock className="text-indigo-400" />
            <span>{currentDateTime} (UTC)</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <HiSearch className="text-xl" />
            </div>
            <input
              type="text"
              placeholder="Search by username..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl w-full focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <HiOutlineFilter className="text-xl" />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-10 py-3 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            
            <button 
              onClick={fetchRequests}
              className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <HiOutlineRefresh className="mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <HiOutlineClipboardCheck className="mr-2 text-indigo-500" />
              Doctor Requests
            </h2>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-3 py-1 rounded-full">
              {filteredRequests.length} requests
            </span>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-20 text-center text-gray-500">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-gray-100">
                <HiSearch className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">No requests found</h3>
            <p>Try adjusting your filters or search criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600 text-sm">
                  <th className="px-6 py-4 font-medium">Username</th>
                  <th className="px-6 py-4 font-medium">Specialization</th>
                  <th className="px-6 py-4 font-medium">Experience</th>
                  <th className="px-6 py-4 font-medium">Hospital</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.map((req) => (
                  <tr key={req.requestId} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 mr-3">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <RiUserHeartLine className="h-5 w-5 text-indigo-600" />
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{req.username}</div>
                          <div className="text-gray-500 text-sm">{req.phoneNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0 mr-2 rounded-lg bg-blue-100 flex items-center justify-center">
                          <HiOutlineAcademicCap className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-gray-900">{req.specialization}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0 mr-2 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <HiOutlineClock className="h-4 w-4 text-emerald-600" />
                        </div>
                        <span className="text-gray-900">{req.experienceYears} years</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0 mr-2 rounded-lg bg-purple-100 flex items-center justify-center">
                          <RiHospitalLine className="h-4 w-4 text-purple-600" />
                        </div>
                        <span className="text-gray-900">{req.hospital}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        ref={(el) => (buttonRefs.current[req.requestId] = el)}
                        onClick={() => toggleDropdown(req.requestId)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                      >
                        <HiDotsVertical />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dropdown Menu */}
      {dropdown && (
        <div
          id="dropdown-menu"
          className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-lg w-56 animate-fade-in"
          style={{
            top: `${dropdown.top}px`,
            left: `${dropdown.left}px`,
          }}
        >
          <div className="py-2 px-3 bg-gray-50 text-gray-600 text-xs font-medium rounded-t-xl border-b border-gray-200">
            Available Actions
          </div>
          <ul className="py-2">
            <li>
              <button
                onClick={() => openDetailModal(requests.find((r) => r.requestId === dropdown.id))}
                className="flex w-full items-center px-4 py-2.5 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 transition-colors"
              >
                <FaRegEye className="text-lg mr-3 text-indigo-500" />
                <span>View Details</span>
              </button>
            </li>
            <li>
              <a
                href={
                  requests.find((r) => r.requestId === dropdown.id)?.certificateUrl || "#"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2.5 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 transition-colors"
              >
                <FaRegFileAlt className="text-lg mr-3 text-indigo-500" />
                <span>View Certificate</span>
              </a>
            </li>
            <li className="border-t border-gray-100 mt-1 pt-1">
              <button
                onClick={() => handleApprove(dropdown.id)}
                className="flex w-full items-center px-4 py-2.5 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 transition-colors"
              >
                <FaRegCheckCircle className="text-lg mr-3 text-emerald-500" />
                <span>Approve</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleReject(dropdown.id)}
                className="flex w-full items-center px-4 py-2.5 hover:bg-rose-50 text-gray-700 hover:text-rose-700 transition-colors"
              >
                <FaRegTimesCircle className="text-lg mr-3 text-rose-500" />
                <span>Reject</span>
              </button>
            </li>
          </ul>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-auto overflow-hidden animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center text-white">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <RiStethoscopeLine className="text-xl" />
                </div>
                <h3 className="text-xl font-semibold">Doctor Request Details</h3>
              </div>
              <button
                onClick={() => setDetailModal(null)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="bg-indigo-50 rounded-xl p-4 flex-1">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center mr-3">
                      <HiOutlineIdentification className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-indigo-900">Username</h4>
                      <p className="text-lg font-semibold text-indigo-700">{detailModal.username}</p>
                    </div>
                  </div>
                  <div className="border-t border-indigo-100 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-medium text-indigo-400 uppercase">Status</h4>
                        <div className="mt-1">{getStatusBadge(detailModal.status)}</div>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-indigo-400 uppercase">Phone</h4>
                        <div className="flex items-center mt-1 text-gray-700">
                          <HiOutlinePhone className="mr-1 text-indigo-500" />
                          {detailModal.phoneNumber}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-indigo-50 rounded-xl p-4 flex-1">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center mr-3">
                      <RiMedalLine className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-indigo-900">Qualifications</h4>
                      <p className="text-sm text-indigo-500">Professional background</p>
                    </div>
                  </div>
                  <div className="border-t border-indigo-100 pt-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <h4 className="text-xs font-medium text-indigo-400 uppercase">Specialization</h4>
                        <p className="mt-1 text-gray-700 font-medium">{detailModal.specialization}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-indigo-400 uppercase">Experience</h4>
                        <p className="mt-1 text-gray-700 font-medium">{detailModal.experienceYears} years</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-indigo-400 uppercase">Hospital</h4>
                        <p className="mt-1 text-gray-700 font-medium">{detailModal.hospital}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <div className="flex items-start mb-4">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3 mt-1">
                    <HiOutlineDocumentText className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Description</h4>
                    <p className="text-gray-700 mt-2 whitespace-pre-line">
                      {detailModal.description || "No description provided"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-5">
                <div className="flex items-start mb-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3 mt-1">
                    <FaRegFileAlt className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Certificate</h4>
                    <p className="text-blue-700 text-sm mt-1">Verification documents</p>
                  </div>
                </div>
                
                {detailModal.certificateUrl ? (
                  <div className="mt-4 flex justify-center">
                    <a
                      href={detailModal.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block"
                    >
                      <img
                        src={detailModal.certificateUrl}
                        alt="Certificate"
                        className="max-h-64 rounded-lg border border-blue-200 shadow-md hover:opacity-90 transition-opacity"
                      />
                    </a>
                  </div>
                ) : (
                  <div className="text-center p-8 border border-dashed border-blue-200 rounded-lg">
                    <p className="text-blue-500">No certificate uploaded</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              {detailModal.status === "PENDING" && (
                <>
                  <button
                    onClick={() => {
                      handleApprove(detailModal.requestId);
                      setDetailModal(null);
                    }}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-shadow flex items-center"
                  >
                    <FaRegCheckCircle className="mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleReject(detailModal.requestId);
                      setDetailModal(null);
                    }}
                    className="px-5 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-shadow flex items-center"
                  >
                    <FaRegTimesCircle className="mr-2" />
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => setDetailModal(null)}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Fixed User Info Panel */}
      <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-lg border border-indigo-100 p-3 flex items-center space-x-3 text-sm">
        <div className="text-gray-500">
          <FaRegClock className="inline mr-1" />
          {currentDateTime}
        </div>
        <div className="h-4 border-r border-gray-300"></div>
        <div className="flex items-center">
          <img 
            src={`https://api.dicebear.com/6.x/initials/svg?seed=${currentUser}`} 
            alt="User" 
            className="w-6 h-6 rounded-full border border-indigo-200 mr-2"
          />
          <span className="text-indigo-700 font-medium">{currentUser}</span>
        </div>
      </div>
    </div>
  );
};

export default AdminManageDoctor;