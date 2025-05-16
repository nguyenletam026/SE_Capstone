// 📁 pages/LandingPage.jsx
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import aiImg from "../../assets/4.png";
import relaxImg from "../../assets/1.png";
import communityImg from "../../assets/1.png";
import anAvatar from "../../assets/3.png";
import phucAvatar from "../../assets/3.png";
import linhAvatar from "../../assets/3.png";
import Footer from "../../components/footer/userFooter";
// import { removeToken } from "../../services/localStorageService";

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // removeToken();
    console.log("🧹 Đã xóa token/localStorage khi vào trang Landing");
  }, []);

  return (
    <div className="bg-gradient-to-b from-green-100 to-white min-h-screen">
      <section className="text-center py-20 bg-green-600 text-white">
        <motion.h1
          className="text-5xl font-bold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Welcome to Student Stress Helper ✨
        </motion.h1>
        <p className="mt-4 text-lg">
          Empowering students, reducing stress, and unlocking potential.
        </p>
        <button
          className="mt-6 bg-white text-green-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
          onClick={() => navigate("/login")}
        >
          Get Started
        </button>
      </section>

      <section className="py-20">
        <h2 className="text-4xl font-bold text-center text-gray-800">Why Choose Us?</h2>
        <div className="flex flex-wrap justify-center mt-10 gap-6">
          <FeatureCard
            title="Personalized Stress Analysis"
            description="AI-powered insights to understand and manage stress effectively."
            image={aiImg}
          />
          <FeatureCard
            title="Guided Relaxation Techniques"
            description="Access meditation, breathing exercises, and focus boosters."
            image={relaxImg}
          />
          <FeatureCard
            title="Community Support"
            description="Join a network of students supporting each other."
            image={communityImg}
          />
        </div>
      </section>

      <section className="py-20 bg-gray-100">
        <h2 className="text-4xl font-bold text-center text-gray-800">What Students Say</h2>
        <div className="flex flex-wrap justify-center mt-10 gap-6">
          <Testimonial name="Nguyễn Minh An" quote="This platform changed the way I handle stress." avatar={anAvatar} />
          <Testimonial name="Lê Hồng Phúc" quote="A great tool to balance studies and mental well-being!" avatar={phucAvatar} />
          <Testimonial name="Trần Mỹ Linh" quote="I feel more relaxed and focused every day." avatar={linhAvatar} />
        </div>
      </section>

      <section className="py-20 bg-white">
        <motion.div
          className="max-w-5xl mx-auto text-gray-700 px-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-10">Our Policy</h2>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <PolicyItem title="Privacy First" text="We never share your data. All information stays secure and encrypted." />
            <PolicyItem title="Ethical AI" text="Our AI only assists in giving insights – never replaces professional judgment." />
            <PolicyItem title="User Support" text="We provide clear support channels and transparent policies for users." />
            <PolicyItem title="Data Transparency" text="Users can view, download, or delete their data at any time." />
          </div>
          <p className="mt-8 text-center">
            Read our full <Link to="/policy" className="text-green-600 underline">Privacy Policy</Link> for more details.
          </p>
        </motion.div>
      </section>

      <section className="text-center py-20 bg-green-700 text-white">
        <h2 className="text-3xl font-bold">Ready to Reduce Stress?</h2>
        <p className="mt-2 text-lg">Join thousands of students improving their mental health.</p>
        <button
          className="mt-6 bg-white text-green-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
          onClick={() => navigate("/login")}
        >
          Join Now
        </button>
      </section>

      <Footer />
    </div>
  );
}

function FeatureCard({ title, description, image }) {
  return (
    <motion.div
      className="bg-white p-6 rounded-xl shadow-md max-w-sm text-center border border-gray-200 hover:shadow-xl transition"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-36 h-36 mx-auto mb-6 rounded-lg overflow-hidden border border-gray-300">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <h3 className="text-xl font-bold text-green-600">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </motion.div>
  );
}

function Testimonial({ name, quote, avatar }) {
  return (
    <motion.div
      className="bg-white p-6 rounded-xl shadow-md max-w-sm text-center border border-gray-200 hover:shadow-xl transition"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-24 h-24 mx-auto mb-4 rounded-lg overflow-hidden border border-gray-300">
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      </div>
      <p className="italic text-gray-600">"{quote}"</p>
      <p className="mt-4 font-bold text-green-600">{name}</p>
    </motion.div>
  );
}

function PolicyItem({ title, text }) {
  return (
    <div className="flex items-start space-x-4">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-lg">
        ✓
      </div>
      <div>
        <h3 className="text-xl font-semibold text-green-600">{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}
