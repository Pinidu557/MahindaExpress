import React, { useContext, useEffect } from "react";
import { assets } from "../assets/assets";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const PassengerEmailVerify = () => {
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();
  const { backendUrl, isLoggedin, userData, getUserData } =
    useContext(AppContent);

  const inputRefs = React.useRef([]);
  const handleInput = (e, index) => {
    if (e.target.value.length > 0) {
      inputRefs.current[index + 1].focus();
    }
  };
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      const otpArray = inputRefs.current.map((e) => e.value);
      const otp = otpArray.join("");
      const { data } = await axios.post(
        backendUrl + "/api/auth/verify-account",
        { otp }
      );
      if (data.success) {
        toast.success(data.message);
        getUserData();
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    isLoggedin && userData && userData.isAccountVerified && navigate("/");
  }, [isLoggedin, userData]);
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block w-[30%] h-screen bg-[#09121f]">
        <img
          src={assets.melogo4}
          alt=""
          className="mb-6 w-28 sm:w-55 cursor-pointer ml-11 mt-4 "
        />
        <img
          src={assets.megirl}
          alt="Login Illustration"
          className="w-[80%] h-[85%] object-cover mx-auto rounded-2xl"
        />
      </div>
      <div className="flex w-full md:w-[70%] items-center justify-center bg-slate-900 p-8">
        <div className="w-full max-w-2xl text-indigo-300">
          <h2 className="text-5xl font-semibold text-white text-center mb-3">
            Verify Your Email
          </h2>
          <p className="text-center mb-6 text-md">
            Enter 6 digit-code sent to your email
          </p>
          <form onSubmit={onSubmitHandler}>
            <div className="mb-4 flex items-center justify-center gap-3 w-full px-3 py-2.5 rounded-full ">
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <input
                    type="text"
                    maxLength="1"
                    key={index}
                    required
                    className="w-full h-13 text-center text-2xl border border-gray-100 rounded bg-transparent outline-none text-white focus:border-indigo-500 transition"
                    ref={(e) => (inputRefs.current[index] = e)}
                    onInput={(e) => handleInput(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                  />
                ))}
            </div>
            <button className="w-full mt-3  py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 cursor-pointer text-white font-medium">
              Verify Email
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PassengerEmailVerify;
