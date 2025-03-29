// layout/UserLayout.jsx

import Header from "../header/Header";
import Footer from "../footer/userFooter";
import PropTypes from "prop-types";

const UserLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Fixed Header */}
      <Header />

      {/* Main Content - phải chừa padding-top cho header */}
      <main className="flex-grow w-full pt-20 bg-white">
        {children}
      </main>

      <Footer />
    </div>
  );
};

UserLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserLayout;
