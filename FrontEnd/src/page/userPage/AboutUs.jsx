import React from "react";
import { Link } from "react-router-dom";
import teamImage from "../../assets/11.png";
import missionImage from "../../assets/8.png";
import valuesImage from "../../assets/12.png";
import { motion } from "framer-motion";

const SectionTitle = ({ children }) => (
  <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-[#2b3a29]">{children}</h2>
);

const AboutUs = () => {
  return (    <div className="bg-gradient-to-br from-[#f0fdf4] via-[#e0f7ec] to-[#c2f0db] text-gray-800 px-4 sm:px-6 py-8 sm:py-12 font-sans min-h-screen w-full">
      <motion.h1
        className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 text-center text-[#2b3a29]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        About Us
      </motion.h1>      <motion.section
        className="mb-12 sm:mb-16 px-2 sm:px-6 lg:px-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >        <p className="text-base sm:text-lg leading-relaxed text-justify">
          Student Stress Helper is a platform focused on mental health care for students in Vietnam.
          We understand that academic pressure, relationships and future direction can cause a lot of stress and anxiety for young people.
          Therefore, Student Stress Helper was born with the goal of providing support tools, counseling and connecting with leading psychology experts
          to accompany you on your journey to regain balance in life.
        </p>
      </motion.section>      <motion.section
        className="grid md:grid-cols-2 gap-6 sm:gap-10 mb-12 sm:mb-16 items-center"
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <img src={missionImage} alt="Mission" className="rounded-lg shadow-lg w-full" />
        <div>          <SectionTitle>Our Mission</SectionTitle>
          <p className="text-sm sm:text-md leading-relaxed">
            We are committed to creating a healthy online environment where young people can:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-sm sm:text-base">
            <li>Chat with reputable psychology experts.</li>
            <li>Conduct regular mental health assessments.</li>
            <li>Receive personalized advice and stress reduction tips.</li>
            <li>Access scientific information about clinical psychology.</li>
          </ul>
        </div>
      </motion.section>      <motion.section
        className="grid md:grid-cols-2 gap-6 sm:gap-10 mb-12 sm:mb-16 items-center"
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="order-2 md:order-1">          <SectionTitle>Core Values</SectionTitle>
          <ul className="list-decimal pl-6 text-sm sm:text-md space-y-2">
            <li>Non-judgmental listening.</li>
            <li>Respecting privacy and user information security.</li>
            <li>Strong expertise from our counseling team.</li>
            <li>Commitment to improving technology for optimal experience.</li>
          </ul>
        </div>
        <img src={valuesImage} alt="Values" className="rounded-lg shadow-lg w-full order-1 md:order-2" />
      </motion.section>      <motion.section
        className="grid md:grid-cols-2 gap-6 sm:gap-10 mb-16 sm:mb-20 items-center px-2 sm:px-6 lg:px-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <img src={teamImage} alt="Team" className="rounded-lg shadow-lg w-full max-w-2xl mx-auto" />

        <div>          <SectionTitle>Our Team</SectionTitle>
          <p className="mb-4 text-sm sm:text-md">
            Student Stress Helper is built by passionate people in the fields of mental health, technology and education. We connect:
          </p>
          <ul className="list-disc pl-6 text-sm sm:text-md space-y-1">
            <li>Clinical psychologists.</li>
            <li>Software engineers and AI experts.</li>
            <li>Educational experts and university lecturers.</li>
            <li>Students with passion to spread positivity.</li>
          </ul>
        </div>
      </motion.section>      <motion.section
        className="mb-12 sm:mb-16 px-2 sm:px-6 lg:px-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >        <SectionTitle>Our Commitment</SectionTitle>
        <p className="text-base sm:text-lg leading-relaxed text-justify">
          Student Stress Helper always puts users at the center. We don't just provide services - we accompany you.
          Every feature is designed to promote personal development, improve mental well-being and help you learn to love yourself properly.
        </p>
      </motion.section>

      <motion.section
        className="text-center px-4"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >        <h2 className="text-xl sm:text-2xl font-bold text-[#2b3a29] mb-4">You are not alone on this journey</h2>
        <p className="text-sm sm:text-md mb-6">Let Student Stress Helper be your trusted companion.</p>
        <Link
          to="/home"
          className="inline-block bg-[#2b3a29] hover:bg-[#1e291e] text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm transition w-full sm:w-auto max-w-xs"
        >
          Start your journey now
        </Link>
      </motion.section>
    </div>
  );
};

export default AboutUs;
