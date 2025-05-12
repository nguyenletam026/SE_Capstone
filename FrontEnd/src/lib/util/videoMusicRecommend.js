import { getToken } from "../../services/localStorageService";

const API_BASE = process.env.REACT_APP_API_URL;

// Lấy danh sách video gợi ý cho bệnh nhân
export const getAllVideoRecommend = async () => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/get-all-video-recommend`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Không thể lấy danh sách video gợi ý");
  return res.json();
};

// Lấy danh sách nhạc gợi ý cho bệnh nhân
export const getAllMusicRecommend = async () => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/get-all-music-recommend`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Không thể lấy danh sách nhạc gợi ý");
  return res.json();
};
