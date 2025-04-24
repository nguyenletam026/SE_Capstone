import { CiMail, CiFacebook } from "react-icons/ci";
import { AiFillTwitterCircle } from "react-icons/ai";
import { FaInstagram, FaYoutube, FaGoogle, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import { GoMail } from "react-icons/go";

const Footer = () => {
  return (
    <footer>
      {/* Subscription Section */}
      <div className="grid grid-cols-3 items-center bg-white py-8 px-2 border-black border-t-2" style={{ fontFamily: "Jomolhari" }}>
        {/* Left Section */}
        <div className="text-left">
          <h2 className="text-green-700 text-lg font-semibold">
            Nhận thông tin hỗ trợ mới nhất
          </h2>
          <p className="text-black text-sm">
            Đăng ký nhận bản tin để nhận các lời khuyên sức khỏe tinh thần và cập nhật từ đội ngũ tư vấn của chúng tôi.
          </p>
        </div>

        {/* Middle Section */}
        <div className="flex items-center justify-center space-x-2">
          <CiMail className="text-xl text-black" />
          <input
            type="email"
            placeholder="Nhập Email của bạn"
            className="border border-black px-2 py-1 rounded-lg text-black focus:outline-none"
          />
          <button className="bg-black text-white px-4 py-1 rounded-lg">
            ĐĂNG KÝ
          </button>
        </div>

        {/* Right Section */}
        <div className="flex flex-col items-end justify-center">
          <h2 className="text-green-700 text-lg font-semibold mb-2">
            Kết nối với chúng tôi
          </h2>
          <div className="flex justify-end space-x-4">
            <CiFacebook className="text-3xl text-black hover:text-gray-600 cursor-pointer" />
            <AiFillTwitterCircle className="text-3xl text-black hover:text-gray-600 cursor-pointer" />
            <FaInstagram className="text-3xl text-black hover:text-gray-600 cursor-pointer" />
            <FaYoutube className="text-3xl text-black hover:text-gray-600 cursor-pointer" />
            <FaGoogle className="text-3xl text-black hover:text-gray-600 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="grid grid-cols-12 gap-4 bg-white py-8 px-4" style={{ fontFamily: "Jomolhari" }}>
        {/* About Us Section */}
        <div className="col-span-6 text-left">
          <h2 className="text-green-700 text-lg font-semibold">
            Về Student Stress Helper
          </h2>
          <p className="text-black text-sm">
            Student Stress Helper là nền tảng chăm sóc sức khỏe tinh thần dành cho học sinh, sinh viên. Chúng tôi mang đến các gói tư vấn chuyên sâu, giúp bạn giảm stress và sống tích cực hơn.
          </p>
          <div className="mt-4 space-y-2">
            <p className="flex items-center text-black">
              <FaMapMarkerAlt className="mr-2" /> 123 Đường Sức Khỏe, Quận Tư Duy, TP Hạnh Phúc
            </p>
            <p className="flex items-center text-black">
              <FaPhoneAlt className="mr-2" /> 1900-123-456
            </p>
            <p className="flex items-center text-black">
              <GoMail className="mr-2" /> support@studentstresshelper.vn
            </p>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="col-span-2 text-left">
          <h2 className="text-green-700 text-lg font-semibold">Liên kết nhanh</h2>
          <ul className="text-black text-sm space-y-1 list-disc list-inside">
            <li><a href="/about" className="hover:underline">Về Chúng Tôi</a></li>
            <li><a href="/packages" className="hover:underline">Gói Dịch Vụ</a></li>
            <li><a href="/counselors" className="hover:underline">Tư Vấn Viên</a></li>
            <li><a href="/contact" className="hover:underline">Liên Hệ</a></li>
          </ul>
        </div>

        {/* Policy Section */}
        <div className="col-span-2 text-left">
          <h2 className="text-green-700 text-lg font-semibold">Chính sách</h2>
          <ul className="text-black text-sm space-y-1 list-disc list-inside">
            <li><a href="/privacy-policy" className="hover:underline">Chính sách bảo mật</a></li>
            <li><a href="/terms" className="hover:underline">Điều khoản sử dụng</a></li>
          </ul>
        </div>

        {/* Support Section */}
        <div className="col-span-2 text-left">
          <h2 className="text-green-700 text-lg font-semibold">Hỗ trợ</h2>
          <ul className="text-black text-sm space-y-1 list-disc list-inside">
            <li><a href="/faq" className="hover:underline">Câu hỏi thường gặp</a></li>
            <li><a href="/support" className="hover:underline">Trung tâm hỗ trợ</a></li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-white py-4 border-t-2 border-black">
        <div className="text-center text-black text-sm" style={{ fontFamily: "Jomolhari" }}>
          © {new Date().getFullYear()} Student Stress Helper. Bản quyền được bảo hộ.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
