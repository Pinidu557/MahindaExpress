import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-gray-300 py-12 px-8 mt-8 w-full">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8">
        {/* General */}
        <div>
          <h3 className="text-white font-semibold mb-4">GENERAL</h3>
          <ul className="space-y-2">
            <li
              className="cursor-pointer hover:text-blue-400 transition-colors"
              onClick={() => {
                navigate("/");
                window.scrollTo(0, 0);
              }}
            >
              Home
            </li>
            <li
              className="cursor-pointer hover:text-blue-400 transition-colors"
              onClick={() => {
                navigate("/aboutus");
                window.scrollTo(0, 0);
              }}
            >
              About Us
            </li>
            <li
              className="cursor-pointer hover:text-blue-400 transition-colors"
              onClick={() => {
                navigate("/contactus");
                window.scrollTo(0, 0);
              }}
            >
              Contact Us
            </li>
            <li
              className="cursor-pointer hover:text-blue-400 transition-colors"
              onClick={() => {
                navigate("/journeys");
                window.scrollTo(0, 0);
              }}
            >
              Journeys
            </li>
          </ul>
        </div>

        {/* Helpful Resources */}
        <div>
          <h3 className="text-white font-semibold mb-4">HELPFUL RESOURCES</h3>
          <ul className="space-y-2">
            <li
              className="cursor-pointer hover:text-blue-400 transition-colors"
              onClick={() => {
                navigate("/faqs");
                window.scrollTo(0, 0);
              }}
            >
              FAQs
            </li>
            <li
              className="cursor-pointer hover:text-blue-400 transition-colors"
              onClick={() => {
                navigate("/faqs#booking");
                window.scrollTo(0, 0);
              }}
            >
              Booking related FAQs
            </li>
            <li className="cursor-pointer hover:text-blue-400 transition-colors">
              Booking Guide
            </li>
          </ul>
        </div>

        {/* Top Routes */}
        <div>
          <h3 className="text-white font-semibold mb-4">TOP ROUTES</h3>
          <ul className="space-y-2">
            <li
              className="cursor-pointer hover:text-blue-400 transition-colors"
              onClick={() => {
                navigate("/journeys");
                window.scrollTo(0, 0);
              }}
            >
              Colombo-Anuradhapura
            </li>
            <li
              className="cursor-pointer hover:text-blue-400 transition-colors"
              onClick={() => {
                navigate("/journeys");
                window.scrollTo(0, 0);
              }}
            >
              Colombo-Ampara
            </li>
            <li
              className="cursor-pointer hover:text-blue-400 transition-colors"
              onClick={() => {
                navigate("/journeys");
                window.scrollTo(0, 0);
              }}
            >
              Kaduwela-Migamuwa
            </li>
            <li
              className="text-blue-400 cursor-pointer"
              onClick={() => {
                navigate("/journeys");
                window.scrollTo(0, 0);
              }}
            >
              View All →
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-4">CONTACT US</h3>
          <p>
            Mahind Express (Pvt) Ltd
            <br />
            No: 523/1, New Kandy Road, Biyagama
          </p>
          <p className="mt-2"> Hotline: 076 374 1736</p>
          <p>Support: info@mahindaexpress.lk</p>
        </div>

        {/* App & Social */}
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-sm gap-2 md:w-7xl mx-auto">
        <div className="flex space-x-4 mt-2 md:mt-0">
          <span className="text-blue-400 font-bold">VISA</span>
          <span className="text-red-400 font-bold">MasterCard</span>
          <span className="text-blue-300 font-bold">Bank Transfers</span>
        </div>
        <div className="flex gap-2">
          <h2 className="text-xl">Follow us on :</h2>
          <div className="flex space-x-4 text-xl ">
            <a
              href="https://www.facebook.com/mahinda.express"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={assets.facebooklogo}
                alt="Facebook"
                className="h-7 w-7 hover:opacity-80 transition-opacity"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
