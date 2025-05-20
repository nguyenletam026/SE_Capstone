// FPT.AI Face Authentication Service

/**
 * Thực hiện xác thực liveness và matching khuôn mặt với API FPT.AI
 * @param {File} videoFile - Video quay khuôn mặt người dùng
 * @param {File} idCardFile - Hình ảnh CMND/CCCD
 * @returns {Promise<{success: boolean, data: Object}>} Kết quả xác thực
 */
export const verifyFaceAuth = async (videoFile, idCardFile) => {
  try {
    // Kiểm tra tham số đầu vào
    if (!videoFile || !idCardFile) {
      return {
        success: false,
        message: 'Thiếu video khuôn mặt hoặc hình ảnh CMND/CCCD.'
      };
    }

    // Kiểm tra kích thước file
    if (videoFile.size > 10 * 1024 * 1024) { // 10MB limit for video
      return {
        success: false,
        message: 'Video quá lớn. Kích thước tối đa là 10MB.'
      };
    }

    if (idCardFile.size > 5 * 1024 * 1024) { // 5MB limit for image
      return {
        success: false,
        message: 'Hình ảnh CMND/CCCD quá lớn. Kích thước tối đa là 5MB.'
      };
    }

    // Tạo FormData để gửi các file
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('cmnd', idCardFile);

    // Gọi API FPT.AI với timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch('https://api.fpt.ai/dmp/liveness/v3', {
      method: 'POST',
      headers: {
        'api-key': 'bWmhtIibnR2k64EuFUlpHEGPgjJB33WI',
        // Không set Content-Type vì browser sẽ tự thiết lập khi dùng FormData
      },
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Kiểm tra response status
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      return {
        success: false,
        message: `Lỗi API (${response.status}): ${response.statusText || 'Không xác định'}`
      };
    }

    // Xử lý response
    const data = await response.json();
    console.log('FPT.AI Response:', data);

    // Ghi log chi tiết kết quả
    logAuthResult(data);

    // Kiểm tra kết quả
    if (data.code === '200' && data.face_match?.isMatch === 'true') {
      // Lưu thời gian xác thực thành công
      saveLastAuthTime();
      return { 
        success: true, 
        data,
        message: 'Xác thực khuôn mặt thành công!'
      };
    } else {
      const errorReason = getErrorReason(data);
      return { 
        success: false, 
        data,
        message: errorReason
      };
    }
  } catch (error) {
    console.error('Lỗi khi xác thực khuôn mặt:', error);
    
    // Xử lý lỗi timeout
    if (error.name === 'AbortError') {
      return {
        success: false,
        data: null,
        message: 'Quá thời gian chờ phản hồi từ máy chủ. Vui lòng thử lại sau.'
      };
    }
    
    return { 
      success: false, 
      data: null,
      message: 'Đã xảy ra lỗi khi xác thực khuôn mặt. Vui lòng thử lại sau.'
    };
  }
};

/**
 * Phân tích lỗi trả về từ API để hiển thị thông báo phù hợp
 * @param {Object} data - Dữ liệu phản hồi từ API
 * @returns {string} Thông báo lỗi
 */
const getErrorReason = (data) => {
  if (!data) return 'Không nhận được phản hồi từ máy chủ.';
  
  // Kiểm tra lỗi từ mã code
  if (data.code !== '200') {
    switch(data.code) {
      case '400':
        return 'Dữ liệu không hợp lệ. Vui lòng thử lại.';
      case '401':
        return 'Lỗi xác thực API. Vui lòng liên hệ quản trị viên.';
      case '429':
        return 'Quá nhiều yêu cầu. Vui lòng thử lại sau.';
      case '500':
        return 'Lỗi máy chủ. Vui lòng thử lại sau.';
      default:
        return `Lỗi ${data.code}: ${data.message || 'Không xác định'}`;
    }
  }
  
  // Kiểm tra lỗi từ liveness detection
  if (data.liveness?.isLive === 'false') {
    return 'Không phát hiện khuôn mặt sống. Vui lòng thử lại với video rõ nét hơn.';
  }
  
  // Kiểm tra lỗi từ face matching
  if (data.face_match?.isMatch === 'false') {
    return 'Khuôn mặt không khớp với CMND/CCCD. Vui lòng kiểm tra lại.';
  }
  
  return data.face_match?.message || data.message || 'Xác thực khuôn mặt thất bại.';
};

/**
 * Ghi log kết quả xác thực để debug
 * @param {Object} data - Dữ liệu phản hồi từ API
 */
const logAuthResult = (data) => {
  if (!data) {
    console.error('Không có dữ liệu phản hồi để ghi log');
    return;
  }
  
  console.group('Kết quả xác thực khuôn mặt');
  console.log('Mã code:', data.code);
  console.log('Thông báo:', data.message);
  
  if (data.liveness) {
    console.log('Liveness:', data.liveness.isLive === 'true' ? 'Thành công' : 'Thất bại');
    console.log('Điểm liveness:', data.liveness.liveness_score);
  }
  
  if (data.face_match) {
    console.log('Face matching:', data.face_match.isMatch === 'true' ? 'Thành công' : 'Thất bại');
    console.log('Điểm match:', data.face_match.matching_score);
  }
  
  console.log('Thời gian xử lý:', data.processing_time, 'ms');
  console.log('RequestID:', data.request_id);
  console.groupEnd();
};

/**
 * Lưu thời gian xác thực thành công gần nhất
 */
const saveLastAuthTime = () => {
  localStorage.setItem('faceAuthLastVerified', Date.now().toString());
};

/**
 * Lấy thời gian xác thực gần nhất
 * @returns {number|null} Thời gian xác thực gần nhất hoặc null nếu chưa xác thực
 */
export const getLastAuthTime = () => {
  const time = localStorage.getItem('faceAuthLastVerified');
  return time ? parseInt(time) : null;
};

/**
 * Kiểm tra xem xác thực có còn hiệu lực không (trong vòng AUTH_VALID_DURATION)
 * @param {number} validDuration - Thời gian hiệu lực tính bằng ms (mặc định 4 giờ)
 * @returns {boolean} Trạng thái hiệu lực của xác thực
 */
export const isAuthValid = (validDuration = 4 * 60 * 60 * 1000) => {
  const lastAuthTime = getLastAuthTime();
  if (!lastAuthTime) return false;
  
  const now = Date.now();
  return now - lastAuthTime < validDuration;
};

/**
 * Kiểm tra xem người dùng đã hoàn thành xác thực chưa
 * @returns {boolean} Trạng thái xác thực
 */
export const getFaceAuthStatus = () => {
  return localStorage.getItem('faceAuthVerified') === 'true';
};

/**
 * Lưu trạng thái xác thực vào localStorage
 * @param {boolean} status - Trạng thái xác thực
 */
export const setFaceAuthStatus = (status) => {
  localStorage.setItem('faceAuthVerified', status ? 'true' : 'false');
  
  if (status) {
    saveLastAuthTime();
  }
};

/**
 * Reset trạng thái xác thực khi đăng xuất
 */
export const resetFaceAuthStatus = () => {
  localStorage.removeItem('faceAuthVerified');
  localStorage.removeItem('faceAuthLastVerified');
}; 