import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const PassengerNavbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedin } =
    useContext(AppContent);

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-verify-otp"
      );
      if (data.success) {
        navigate("/email-verify");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      data.success && setIsLoggedin(false);
      data.success && setUserData(false);
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="w-full flex justify-between items-center p-4 absolute top-0 sm:p-6 sm:px-24">
      <img src={assets.melogo4} alt="" className="w-60 " />
      <ul className="list-none hidden md:flex gap-10 text-white font-semibold mr-auto ml-10 text-lg">
        <li className="cursor-pointer">Journeys</li>
        <li className="cursor-pointer">About Us</li>
        <li className="cursor-pointer">Contact Us</li>
      </ul>
      {userData ? (
        <div className="w-8 h-8 flex justify-center items-center rounded-full bg-white text-black relative group font-bold">
          {userData.name[0].toUpperCase()}
          <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10">
            <ul className="list-none m-0 p-2 bg-gray-100 text-sm ">
              {!userData.isAccountVerified && (
                <li
                  onClick={sendVerificationOtp}
                  className="py-1 px-2 hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                >
                  Verify Email
                </li>
              )}
              <li
                onClick={logout}
                className="py-1 px-2 hover:bg-red-600 rounded-[5%] cursor-pointer pr-10  bg-red-500 text-white"
              >
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 border border-gray-100 text-white rounded-full px-6 py-2 font-bold hover:bg-blue-900 transition-all cursor-pointer"
        >
          Login <img src={assets.arrow_white} alt="Login" className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default PassengerNavbar;
