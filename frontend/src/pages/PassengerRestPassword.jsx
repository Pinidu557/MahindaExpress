import { assets } from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext.jsx";
import { useContext, useState } from "react";
import React from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

const PassengerLogin = () => {
  const { backendUrl } = useContext(AppContent);
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otp, setOtp] = useState(0);
  const [isOtpSubmited, setIsOtpSubmited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-reset-otp",
        { email }
      );
      data.success ? toast.success(data.message) : toast.error(data.message);
      data.success && setIsEmailSent(true);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const otpArray = inputRefs.current.map((e) => e.value);
      setOtp(otpArray.join(""));
      setIsOtpSubmited(true);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/reset-password",
        { email, otp, newPassword, confirmPassword }
      );
      data.success ? toast.success(data.message) : toast.error(data.message);
      data.success && navigate("/login");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block w-[30%] h-screen bg-[#09121f]">
        <img
          onClick={() => navigate("/")}
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
          {!isEmailSent && (
            <form onSubmit={onSubmitEmail}>
              <h2 className="text-5xl font-semibold text-white text-center mb-3">
                Reset Your Password
              </h2>
              <p className="text-center mb-6 text-md">
                Enter your registered email to reset your account
              </p>
              <div className="mb-2 flex items-center gap-3 w-full px-3 py-3.5 rounded-full bg-[#333A5C] focus-within:ring-2 focus-within:ring-indigo-500 transition-all duration-200">
                <img src={assets.mail_icon} alt="" />
                <input
                  className="bg-transparent outline-none text-white w-full focus:placeholder-indigo-300"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button 
                disabled={isLoading}
                className="w-full py-3 mt-5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 hover:from-indigo-600 hover:to-indigo-800 cursor-pointer text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    Sending Email
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </form>
          )}
          {/* otp input form */}
          {!isOtpSubmited && isEmailSent && (
            <form onSubmit={onSubmitOtp}>
              <h2 className="text-5xl font-semibold text-white text-center mb-3">
                Reset password otp
              </h2>
              <p className="text-center mb-6 text-md">
                Enter 6 digit-code sent to your registered email
              </p>
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
              <button 
                disabled={isLoading}
                className="w-full mt-3 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 hover:from-indigo-600 hover:to-indigo-800 cursor-pointer text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    Verifying OTP
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </form>
          )}
          {/* Enter new password form */}
          {isOtpSubmited && isEmailSent && (
            <form onSubmit={onSubmitNewPassword}>
              <h2 className="text-5xl font-semibold text-white text-center mb-3">
                New Password
              </h2>
              <p className="text-center mb-6 text-md">
                Enter the new password to reset your account
              </p>
              <div className="mb-4 flex items-center gap-3 w-full px-3 py-3.5 rounded-full bg-[#333A5C] focus-within:ring-2 focus-within:ring-indigo-500 transition-all duration-200">
                <img src={assets.mail_icon} alt="" />
                <input
                  className="bg-transparent outline-none text-white w-full focus:placeholder-indigo-300"
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4 flex items-center gap-3 w-full px-3 py-3.5 rounded-full bg-[#333A5C] focus-within:ring-2 focus-within:ring-indigo-500 transition-all duration-200">
                <img src={assets.mail_icon} alt="" />
                <input
                  className="bg-transparent outline-none text-white w-full focus:placeholder-indigo-300"
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button 
                disabled={isLoading}
                className="w-full py-3 mt-5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 hover:from-indigo-600 hover:to-indigo-800 cursor-pointer text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    Resetting Password
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PassengerLogin;
