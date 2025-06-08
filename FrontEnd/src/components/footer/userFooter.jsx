import { CiMail, CiFacebook } from "react-icons/ci";
import { AiFillTwitterCircle } from "react-icons/ai";
import { FaInstagram, FaYoutube, FaGoogle, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import { GoMail } from "react-icons/go";

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t-2 border-gray-300 font-[Roboto] text-base">
      <div className="flex flex-col lg:flex-row justify-between items-center px-4 py-3 space-y-3 lg:space-y-0 lg:space-x-4">        <div className="text-center lg:text-left">
          <h2 className="text-green-700 text-lg font-semibold mb-1">Get the latest support information</h2>
          <p className="text-gray-700">Receive mental health advice and updates from our counseling team.</p>
        </div>

        <div className="flex items-center space-x-4">
          <CiFacebook className="text-2xl text-black hover:text-gray-600 cursor-pointer" />
          <AiFillTwitterCircle className="text-2xl text-black hover:text-gray-600 cursor-pointer" />
          <FaInstagram className="text-2xl text-black hover:text-gray-600 cursor-pointer" />
          <FaYoutube className="text-2xl text-black hover:text-gray-600 cursor-pointer" />
          <FaGoogle className="text-2xl text-black hover:text-gray-600 cursor-pointer" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 px-4 py-4 text-black">        <div>
          <h2 className="text-green-700 font-semibold text-lg mb-2">About Student Stress Helper</h2>
          <p>Mental care for students. Reduce stress and live more positively.</p>
          <div className="mt-3 space-y-1 text-gray-700">
            <p className="flex items-center"><FaMapMarkerAlt className="mr-2 text-green-600" /> 123 Health Street, Happiness City</p>
            <p className="flex items-center"><FaPhoneAlt className="mr-2 text-green-600" /> 1900-123-456</p>
            <p className="flex items-center"><GoMail className="mr-2 text-green-600" /> support@studentstresshelper.vn</p>
          </div>
        </div>        <div>
          <h2 className="text-green-700 font-semibold text-lg mb-2">Quick Links</h2>
          <ul className="space-y-1">
            <li><a href="/about" className="hover:underline text-gray-600">About Us</a></li>
            <li><a href="/packages" className="hover:underline text-gray-600">Service Packages</a></li>
            <li><a href="/counselors" className="hover:underline text-gray-600">Counselors</a></li>
            <li><a href="/contact" className="hover:underline text-gray-600">Contact</a></li>
          </ul>
        </div>

        <div>
          <h2 className="text-green-700 font-semibold text-lg mb-2">Policies</h2>
          <ul className="space-y-1">
            <li><a href="/privacy-policy" className="hover:underline text-gray-600">Privacy</a></li>
            <li><a href="/terms" className="hover:underline text-gray-600">Terms</a></li>
          </ul>
        </div>

        <div>
          <h2 className="text-green-700 font-semibold text-lg mb-2">Support</h2>
          <ul className="space-y-1">
            <li><a href="/faq" className="hover:underline text-gray-600">FAQ</a></li>
            <li><a href="/support" className="hover:underline text-gray-600">Support Center</a></li>
          </ul>
        </div>
      </div>

      <div className="flex justify-end px-4 pb-2">
        <div className="flex items-center space-x-2">
          <CiMail className="text-xl text-black" />          <input
            type="email"
            placeholder="Enter your email"
            className="border border-gray-300 px-3 py-2 rounded-md text-base"
          />
          <button className="bg-green-600 text-white px-5 py-2 rounded-md text-base hover:bg-green-700 transition-all">
            SUBSCRIBE
          </button>
        </div>
      </div>      <div className="text-center py-2 border-t-2 border-gray-300 text-gray-600 text-base">
        © {new Date().getFullYear()} Student Stress Helper. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
