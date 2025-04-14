import React, { useState } from "react";

export default function UserProfile() {
  const [form, setForm] = useState({
    fullName: "",
    nickName: "",
    gender: "",
    age: "",
    email: "",
    accountType: "User",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form data:", form);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 bg-white rounded-lg shadow-md">
      {/* Avatar + Info */}
      <div className="flex flex-col items-center mb-10">
        <img
          src="/avatar.png"
          alt="Avatar"
          className="w-24 h-24 rounded-full border-4 border-pink-300 mb-2"
        />
        <p className="font-semibold text-lg">Alexa Rawles</p>
        <p className="text-sm text-gray-500">alexarawles@gmail.com</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <h2 className="text-2xl font-bold text-brown-700 mb-4">Profile</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Your First Name"
              className="w-full border rounded px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Nick Name</label>
            <input
              type="text"
              name="nickName"
              value={form.nickName}
              onChange={handleChange}
              placeholder="Your First Name"
              className="w-full border rounded px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full border rounded px-4 py-2"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Age</label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              placeholder="Your First Name"
              className="w-full border rounded px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Your First Name"
              className="w-full border rounded px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-pink-500">Account Type</label>
            <input
              type="text"
              name="accountType"
              value={form.accountType}
              readOnly
              className="w-full border rounded px-4 py-2 bg-gray-100"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="text-center">
          <button
            type="submit"
            className="mt-6 bg-brown-700 hover:bg-brown-800 text-white font-semibold py-3 px-8 rounded-full"
          >
            Lưu →
          </button>
        </div>
      </form>
    </div>
  );
}
