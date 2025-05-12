import { CiMail, CiFacebook } from "react-icons/ci";
import { AiFillTwitterCircle } from "react-icons/ai";
import { FaInstagram, FaYoutube, FaGoogle, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import { GoMail } from "react-icons/go";

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t-2 border-gray-300 font-[Roboto] text-base">
      <div className="flex flex-col lg:flex-row justify-between items-center px-4 py-3 space-y-3 lg:space-y-0 lg:space-x-4">
        <div className="text-center lg:text-left">
          <h2 className="text-green-700 text-lg font-semibold mb-1">Nhận thông tin hỗ trợ mới nhất</h2>
          <p className="text-gray-700">Nhận lời khuyên sức khỏe tinh thần và cập nhật từ đội ngũ tư vấn.</p>
        </div>

        <div className="flex items-center space-x-4">
          <CiFacebook className="text-2xl text-black hover:text-gray-600 cursor-pointer" />
          <AiFillTwitterCircle className="text-2xl text-black hover:text-gray-600 cursor-pointer" />
          <FaInstagram className="text-2xl text-black hover:text-gray-600 cursor-pointer" />
          <FaYoutube className="text-2xl text-black hover:text-gray-600 cursor-pointer" />
          <FaGoogle className="text-2xl text-black hover:text-gray-600 cursor-pointer" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 px-4 py-4 text-black">
        <div>
          <h2 className="text-green-700 font-semibold text-lg mb-2">Về Student Stress Helper</h2>
          <p>Chăm sóc tinh thần cho học sinh, sinh viên. Giảm stress và sống tích cực hơn.</p>
          <div className="mt-3 space-y-1 text-gray-700">
            <p className="flex items-center"><FaMapMarkerAlt className="mr-2 text-green-600" /> 123 Đường Sức Khỏe, TP Hạnh Phúc</p>
            <p className="flex items-center"><FaPhoneAlt className="mr-2 text-green-600" /> 1900-123-456</p>
            <p className="flex items-center"><GoMail className="mr-2 text-green-600" /> support@studentstresshelper.vn</p>
          </div>
        </div>

        <div>
          <h2 className="text-green-700 font-semibold text-lg mb-2">Liên kết nhanh</h2>
          <ul className="space-y-1">
            <li><a href="/about" className="hover:underline text-gray-600">Về Chúng Tôi</a></li>
            <li><a href="/packages" className="hover:underline text-gray-600">Gói Dịch Vụ</a></li>
            <li><a href="/counselors" className="hover:underline text-gray-600">Tư Vấn Viên</a></li>
            <li><a href="/contact" className="hover:underline text-gray-600">Liên Hệ</a></li>
          </ul>
        </div>

        <div>
          <h2 className="text-green-700 font-semibold text-lg mb-2">Chính sách</h2>
          <ul className="space-y-1">
            <li><a href="/privacy-policy" className="hover:underline text-gray-600">Bảo mật</a></li>
            <li><a href="/terms" className="hover:underline text-gray-600">Điều khoản</a></li>
          </ul>
        </div>

        <div>
          <h2 className="text-green-700 font-semibold text-lg mb-2">Hỗ trợ</h2>
          <ul className="space-y-1">
            <li><a href="/faq" className="hover:underline text-gray-600">Câu hỏi thường gặp</a></li>
            <li><a href="/support" className="hover:underline text-gray-600">Trung tâm hỗ trợ</a></li>
          </ul>
        </div>
      </div>

      <div className="flex justify-end px-4 pb-2">
        <div className="flex items-center space-x-2">
          <CiMail className="text-xl text-black" />
          <input
            type="email"
            placeholder="Nhập Email của bạn"
            className="border border-gray-300 px-3 py-2 rounded-md text-base"
          />
          <button className="bg-green-600 text-white px-5 py-2 rounded-md text-base hover:bg-green-700 transition-all">
            ĐĂNG KÝ
          </button>
        </div>
      </div>

      <div className="text-center py-2 border-t-2 border-gray-300 text-gray-600 text-base">
        © {new Date().getFullYear()} Student Stress Helper. Bản quyền được bảo hộ.
      </div>
    </footer>
  );
};

export default Footer;
