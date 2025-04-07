// import React from "react";
import { CiMail } from "react-icons/ci";
import { CiFacebook } from "react-icons/ci";
import { AiFillTwitterCircle } from "react-icons/ai";
import { FaInstagram } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { FaGoogle } from "react-icons/fa";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaPhoneAlt } from "react-icons/fa";
import { GoMail } from "react-icons/go";

const Footer = () => {
  return (
    <footer>
      {/* Subscription Section */}
      <div
        className="grid grid-cols-3 items-center bg-[#9BB168] py-8 px-2"
        style={{ fontFamily: "Jomolhari" }}
      >
        {/* Left Section */}
        <div className="text-left">
          <h2 className="text-[#9e645b] text-lg font-semibold">
            Get the Latest Recipes and Tips
          </h2>
          <p className="text-[#9e645b] text-sm">
            Sign up for our newsletter to receive delicious recipes, cooking tips, and updates directly to your inbox!
          </p>
        </div>

        {/* Middle Section */}
        <div className="flex items-center justify-center space-x-2">
          <CiMail className="text-xl text-[#9e645b]" />
          <input
            type="email"
            placeholder="Enter your Email"
            className="border border-[#9e645b] px-2 py-1 rounded-lg text-[#9e645b] focus:outline-none"
          />
          <button className="bg-[#9e645b] text-white px-4 py-1 rounded-lg">
            SIGN UP
          </button>
        </div>

        {/* Right Section */}
        <div className="flex flex-col items-end justify-center">
          <h2 className="text-[#9e645b] text-lg font-semibold mb-2">
            Connect with Us
          </h2>
          <div className="flex justify-end space-x-4">
            <CiFacebook className="text-3xl text-[#9e645b] hover:text-[#d18b82] cursor-pointer" />
            <AiFillTwitterCircle className="text-3xl text-[#9e645b] hover:text-[#d18b82] cursor-pointer" />
            <FaInstagram className="text-3xl text-[#9e645b] hover:text-[#d18b82] cursor-pointer" />
            <FaYoutube className="text-3xl text-[#9e645b] hover:text-[#d18b82] cursor-pointer" />
            <FaGoogle className="text-3xl text-[#9e645b] hover:text-[#d18b82] cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="grid grid-cols-12 gap-4 bg-[#9BB168] py-8 px-4" style={{ fontFamily: "Jomolhari" }}>
        {/* About Us Section */}
        <div className="col-span-6 text-left">
          <h2 className="text-[#9e645b] text-lg font-semibold">
            About Recipe Haven
          </h2>
          <p className="text-[#9e645b] text-sm">
            Recipe Haven is your go-to source for delicious, easy-to-follow recipes. Whether you`re a home cook or a culinary enthusiast, we`re here to inspire your next meal.
          </p>
          <div className="mt-4 space-y-2">
            <p className="flex items-center text-[#9e645b]">
              <FaMapMarkerAlt className="mr-2" /> 123 Cooking Street, Flavor Town, USA
            </p>
            <p className="flex items-center text-[#9e645b]">
              <FaPhoneAlt className="mr-2" /> 1-800-RECIPE
            </p>
            <p className="flex items-center text-[#9e645b]">
              <GoMail className="mr-2" /> support@recipehaven.com
            </p>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="col-span-2 text-left">
          <h2 className="text-[#9e645b] text-lg font-semibold">Quick Links</h2>
          <ul className="text-[#9e645b] text-sm space-y-1 list-disc list-inside">
            <li>
              <a href="/recipes" className="hover:underline">
                Recipes
              </a>
            </li>
            <li>
              <a href="/tips" className="hover:underline">
                Cooking Tips
              </a>
            </li>
            <li>
              <a href="/about" className="hover:underline">
                About Us
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:underline">
                Contact Us
              </a>
            </li>
          </ul>
        </div>

        {/* Policy Section */}
        <div className="col-span-2 text-left">
          <h2 className="text-[#9e645b] text-lg font-semibold">Policy</h2>
          <ul className="text-[#9e645b] text-sm space-y-1 list-disc list-inside">
            <li>
              <a href="/privacy-policy" className="hover:underline">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/terms-of-service" className="hover:underline">
                Terms of Service
              </a>
            </li>
          </ul>
        </div>

        {/* Customer Support Section */}
        <div className="col-span-2 text-left">
          <h2 className="text-[#9e645b] text-lg font-semibold">Customer Support</h2>
          <ul className="text-[#9e645b] text-sm space-y-1 list-disc list-inside">
            <li>
              <a href="/faq" className="hover:underline">
                FAQ
              </a>
            </li>
            <li>
              <a href="/support" className="hover:underline">
                Support
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="bg-[#9BB168] py-4 border-t-2 border-[#9e645b]">
        <div className="text-center text-[#9e645b] text-sm" style={{ fontFamily: "Jomolhari" }}>
          © {new Date().getFullYear()} Recipe Haven. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;