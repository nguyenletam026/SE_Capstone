import React from "react";

const DoctorLandingPage = () => {
  return (
    <div className="font-sans text-gray-800">
      {/* Hero Section */}
      <section className="bg-blue-100 min-h-screen flex flex-col md:flex-row items-center justify-between px-8 md:px-20 py-20">
        <div className="md:w-1/2">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Trusted Healthcare, Anytime, Anywhere
          </h1>
          <p className="text-lg mb-8">
            Book appointments, consult with expert doctors, and access health services at your convenience.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full text-lg font-medium">
            Book an Appointment
          </button>
        </div>
        <div className="md:w-1/2 mt-10 md:mt-0">
          <img
            src="https://cdn.pixabay.com/photo/2016/03/31/19/56/doctor-1295556_1280.png"
            alt="Doctor Illustration"
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white text-center px-6 md:px-20">
        <h2 className="text-3xl md:text-4xl font-semibold mb-12">Why Choose Us</h2>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="shadow-lg rounded-xl p-6 border hover:shadow-xl transition duration-300">
            <img
              src="https://img.icons8.com/ios/100/stethoscope--v1.png"
              alt="Expert Doctors"
              className="mx-auto mb-4 w-16 h-16"
            />
            <h3 className="text-xl font-bold mb-2">Expert Doctors</h3>
            <p>Certified and experienced professionals from top institutions.</p>
          </div>
          <div className="shadow-lg rounded-xl p-6 border hover:shadow-xl transition duration-300">
            <img
              src="https://img.icons8.com/ios/100/schedule.png"
              alt="24/7 Services"
              className="mx-auto mb-4 w-16 h-16"
            />
            <h3 className="text-xl font-bold mb-2">24/7 Services</h3>
            <p>Round-the-clock consultation and emergency support.</p>
          </div>
          <div className="shadow-lg rounded-xl p-6 border hover:shadow-xl transition duration-300">
            <img
              src="https://img.icons8.com/ios/100/online-support.png"
              alt="Online Consultation"
              className="mx-auto mb-4 w-16 h-16"
            />
            <h3 className="text-xl font-bold mb-2">Online Consultation</h3>
            <p>Connect with doctors via chat, voice, or video call.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-blue-50 py-20 px-6 md:px-20">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12">What Our Patients Say</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[1, 2, 3].map((testimonial) => (
            <div
              key={testimonial}
              className="bg-white rounded-xl p-6 shadow-md border hover:shadow-xl transition duration-300"
            >
              <p className="mb-4">
                "This platform helped me book a doctor at midnight and get proper treatment! Highly recommended."
              </p>
              <div className="font-bold">Patient {testimonial}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 text-white text-center py-16 px-6 md:px-20">
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">
          Ready to Take Charge of Your Health?
        </h2>
        <p className="mb-8 text-lg">Sign up today and consult with top doctors.</p>
        <button className="bg-white text-blue-600 px-6 py-3 rounded-full font-medium hover:bg-blue-100 transition">
          Get Started
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 text-gray-700 py-10 px-6 md:px-20">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4 text-xl">HealthCare+</h3>
            <p>Quality medical services at your fingertips.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Services</h4>
            <ul className="space-y-1">
              <li>Online Consultation</li>
              <li>Health Checkup</li>
              <li>Prescription Delivery</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">About</h4>
            <ul className="space-y-1">
              <li>Our Team</li>
              <li>Careers</li>
              <li>Blog</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Contact</h4>
            <ul className="space-y-1">
              <li>Email: support@healthcare.com</li>
              <li>Phone: +123 456 7890</li>
              <li>Location: New York, USA</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-sm text-gray-500 mt-10">
          &copy; 2025 HealthCare+. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default DoctorLandingPage;
