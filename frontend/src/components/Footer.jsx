import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-gray-300 py-12 px-8 mt-8 w-full">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8">
        {/* General */}
        <div>
          <h3 className="text-white font-semibold mb-4">GENERAL</h3>
          <ul className="space-y-2">
            <li>About Us</li>
            <li>Contact Us</li>
            <li>Journeys</li>
          </ul>
        </div>

        {/* Helpful Resources */}
        <div>
          <h3 className="text-white font-semibold mb-4">HELPFUL RESOURCES</h3>
          <ul className="space-y-2">
            <li>FAQs</li>
            <li>Booking related FAQs</li>
            <li>Booking Guide</li>
          </ul>
        </div>

        {/* Top Routes */}
        <div>
          <h3 className="text-white font-semibold mb-4">TOP ROUTES</h3>
          <ul className="space-y-2">
            <li>Makumbura - Badulla</li>
            <li>Moratuwa - Jaffna</li>
            <li>Vavuniya - Pettah</li>
            <li className="text-blue-400 cursor-pointer">View All →</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-4">CONTACT US</h3>
          <p>
            Mahind Express (Pvt) Ltd
            <br />
            10 Raymond Rd, Nugegoda 10250, Sri Lanka
          </p>
          <p className="mt-2"> Hotline: +94 704222777</p>
          <p>Support: info@magiya.lk</p>
        </div>

        {/* App & Social */}
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-sm gap-2 md:w-7xl mx-auto">
        <div className="flex space-x-4 mt-2 md:mt-0">
          <span className="text-blue-400 font-bold">VISA</span>
          <span className="text-red-400 font-bold">MasterCard</span>
          <span className="text-blue-300 font-bold">AMEX</span>
        </div>
        <div className="flex gap-2">
          <h2 className="text-xl">Follow us on :</h2>
          <div className="flex space-x-4 text-xl">
            <a href="#">
              <img src={assets.facebooklogo} alt="" className="h-7 w-7" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
