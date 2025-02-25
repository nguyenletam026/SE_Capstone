import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../services/localStorageService";

export default function Home() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const accessToken = getToken();
    if (!accessToken) navigate("/login");

    fetch("http://localhost:8080/users/myInfo", {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => response.json())
      .then((data) => setUserDetails(data.result));
  }, [navigate]);

  if (!userDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <p className="text-lg font-semibold text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 shadow-lg rounded-xl max-w-sm w-full text-center">
        <h2 className="text-xl font-bold">Welcome back, {userDetails.username}!</h2>
        <p className="text-gray-600">{`${userDetails.firstName} ${userDetails.lastName}`}</p>
        <p className="text-gray-500">{userDetails.dob}</p>
      </div>
    </div>
  );
}
