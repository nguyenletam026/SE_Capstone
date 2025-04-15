import React from "react";
import { Link } from "react-router-dom";
import teamImage from "../../assets/11.png";
import missionImage from "../../assets/8.png";
import valuesImage from "../../assets/12.png";
import { motion } from "framer-motion";

const AboutUs = () => {
  return (
    <div className="bg-gradient-to-br from-[#f0fdf4] via-[#e0f7ec] to-[#c2f0db] text-gray-800 px-6 py-12 font-sans max-w-7xl mx-auto">
      {/* Title */}
      <motion.h1
        className="text-4xl font-bold mb-6 text-center text-[#2b3a29]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Về Chúng Tôi
      </motion.h1>

      {/* Introduction */}
      <motion.section
        className="mb-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <p className="text-lg leading-relaxed text-justify">
          Student Stress Helper là nền tảng hướng đến việc chăm sóc sức khỏe tinh thần cho học sinh, sinh viên tại Việt Nam. Chúng tôi hiểu rằng áp lực học tập, các mối quan hệ và định hướng tương lai có thể gây ra nhiều căng thẳng, lo âu cho giới trẻ. Vì vậy, Student Stress Helper ra đời với mục tiêu cung cấp công cụ hỗ trợ, tư vấn và kết nối với các chuyên gia tâm lý hàng đầu để đồng hành cùng bạn trên hành trình tìm lại sự cân bằng trong cuộc sống.
        </p>
      </motion.section>

      {/* Mission Section */}
      <motion.section
        className="grid md:grid-cols-2 gap-10 mb-16 items-center"
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <img src={missionImage} alt="Mission" className="rounded-lg shadow-lg" />
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-[#2b3a29]">Sứ Mệnh Của Chúng Tôi</h2>
          <p className="text-md leading-relaxed">
            Chúng tôi cam kết tạo ra một môi trường trực tuyến lành mạnh, nơi các bạn trẻ có thể:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Trò chuyện với chuyên gia tâm lý uy tín.</li>
            <li>Thực hiện đánh giá sức khỏe tinh thần định kỳ.</li>
            <li>Nhận lời khuyên, mẹo giảm stress được cá nhân hóa.</li>
            <li>Tiếp cận thông tin khoa học về tâm lý học lâm sàng.</li>
          </ul>
        </div>
      </motion.section>

      {/* Values Section */}
      <motion.section
        className="grid md:grid-cols-2 gap-10 mb-16 items-center"
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-[#2b3a29]">Giá Trị Cốt Lõi</h2>
          <ul className="list-decimal pl-6 text-md space-y-2">
            <li>Sự lắng nghe không phán xét.</li>
            <li>Tôn trọng quyền riêng tư và bảo mật thông tin người dùng.</li>
            <li>Chuyên môn vững vàng từ đội ngũ tư vấn viên.</li>
            <li>Cam kết cải tiến công nghệ để tối ưu trải nghiệm.</li>
          </ul>
        </div>
        <img src={valuesImage} alt="Values" className="rounded-lg shadow-lg" />
      </motion.section>

      {/* Team Section */}
      <motion.section
        className="text-center mb-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-2xl font-semibold mb-6 text-[#2b3a29]">Đội Ngũ Của Chúng Tôi</h2>
        <p className="mb-4 text-md">
          Student Stress Helper được xây dựng bởi những con người đam mê trong lĩnh vực sức khỏe tinh thần, công nghệ và giáo dục. Chúng tôi kết nối:
        </p>
        <ul className="list-disc list-inside inline-block text-left text-md space-y-1">
          <li>Các nhà tâm lý học lâm sàng.</li>
          <li>Kỹ sư phần mềm, chuyên gia AI.</li>
          <li>Chuyên gia giáo dục và giảng viên đại học.</li>
          <li>Sinh viên với nhiệt huyết lan toả sự tích cực.</li>
        </ul>
        <div className="mt-8 flex justify-center">
          <img src={teamImage} alt="Team" className="rounded-lg shadow-lg w-full max-w-2xl" />
        </div>
      </motion.section>

      {/* Commitment Section */}
      <motion.section
        className="mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-2xl font-semibold mb-4 text-[#2b3a29]">Cam Kết Của Chúng Tôi</h2>
        <p className="text-md leading-relaxed">
          Student Stress Helper luôn đặt người dùng làm trung tâm. Chúng tôi không chỉ cung cấp dịch vụ - chúng tôi đồng hành. Mỗi tính năng đều được thiết kế nhằm thúc đẩy sự phát triển cá nhân, cải thiện đời sống tinh thần và giúp bạn học cách yêu thương bản thân đúng cách.
        </p>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-bold text-[#2b3a29] mb-4">Bạn không cô đơn trên hành trình này</h2>
        <p className="text-md mb-6">Hãy để Student Stress Helper là người bạn đồng hành đáng tin cậy của bạn.</p>
        <Link
          to="/home"
          className="inline-block bg-[#2b3a29] hover:bg-[#1e291e] text-white font-semibold px-6 py-3 rounded-full text-sm transition"
        >
          Bắt đầu hành trình ngay
        </Link>
      </motion.section>
    </div>
  );
};

export default AboutUs;