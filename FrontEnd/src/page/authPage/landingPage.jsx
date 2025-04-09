import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-blue-100 to-white min-h-screen">
      {/* Hero Section */}
      <section className="text-center py-20 bg-blue-500 text-white">
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
          className="mt-6 bg-white text-blue-500 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
          onClick={() => navigate("/login")}
        >
          Get Started
        </button>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <h2 className="text-4xl font-bold text-center text-gray-800">Why Choose Us?</h2>
        <div className="flex flex-wrap justify-center mt-10 gap-6">
          <FeatureCard title="Personalized Stress Analysis" description="AI-powered insights to understand and manage stress effectively." />
          <FeatureCard title="Guided Relaxation Techniques" description="Access meditation, breathing exercises, and focus boosters." />
          <FeatureCard title="Community Support" description="Join a network of students supporting each other." />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-100">
        <h2 className="text-4xl font-bold text-center text-gray-800">What Students Say</h2>
        <div className="flex flex-wrap justify-center mt-10 gap-6">
          <Testimonial name="Nguyễn Minh An" quote="This platform changed the way I handle stress, making me more confident in my studies." />
          <Testimonial name="Lê Hồng Phúc" quote="A great tool for students to balance their studies and mental well-being!" />
          <Testimonial name="Trần Mỹ Linh" quote="Thanks to Student Stress Helper, I feel more relaxed and focused every day." />
        </div>
      </section>

      {/* Policy Section */}
      <section className="py-20">
        <h2 className="text-4xl font-bold text-center text-gray-800">Our Policy</h2>
        <div className="max-w-3xl mx-auto mt-6 text-gray-600">
          <p>We prioritize data security and mental well-being. Your information remains private, and we use AI only to provide helpful insights.</p>
          <p className="mt-4">
            For more details, please read our <Link to="/policy" className="text-blue-500 underline">Privacy Policy</Link>.
          </p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center py-20 bg-blue-600 text-white">
        <h2 className="text-3xl font-bold">Ready to Reduce Stress?</h2>
        <p className="mt-2 text-lg">Join thousands of students who are improving their mental health.</p>
        <button 
          className="mt-6 bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
          onClick={() => navigate("/login")}
        >
          Join Now
        </button>
      </section>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ title, description }) {
  return (
    <motion.div 
      className="bg-white p-6 rounded-lg shadow-lg max-w-sm"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-bold text-blue-600">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </motion.div>
  );
}

// Testimonial Component
function Testimonial({ name, quote }) {
  return (
    <motion.div 
      className="bg-white p-6 rounded-lg shadow-lg max-w-sm"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="italic text-gray-600">"{quote}"</p>
      <p className="mt-4 font-bold text-blue-600">{name}</p>
    </motion.div>
  );
}
