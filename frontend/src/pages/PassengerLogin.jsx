import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";

const PassengerLogin = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContent);

  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      axios.defaults.withCredentials = true;
      if (state === "Sign Up") {
        const { data } = await axios.post(backendUrl + "/api/auth/register", {
          name,
          email,
          password,
        });
        if (data.success) {
          setIsLoggedin(true);
          getUserData();
          navigate("/");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/auth/login", {
          email,
          password,
        });
        if (data.success) {
          setIsLoggedin(true);
          getUserData();
          navigate("/");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "An error occurred"
      );
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
          <h2 className="text-5xl font-semibold text-white text-center mb-3">
            {state === "Sign Up" ? "Create Account" : "Login Account"}
          </h2>
          <p className="text-center mb-6 text-md">
            {state === "Sign Up" ? "Create your account" : "Login your account"}
          </p>
          <form onSubmit={onSubmitHandler}>
            {state === "Sign Up" && (
              <div className="mb-4 flex items-center gap-3 w-full px-3 py-2.5 rounded-full bg-[#333A5C]">
                <img src={assets.person_icon} alt="" />
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  className="bg-transparent outline-none text-white w-full"
                  type="text"
                  placeholder="Full Name"
                  required
                />
              </div>
            )}
            <div className="mb-4 flex items-center gap-3 w-full px-3 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.mail_icon} alt="" />
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="bg-transparent outline-none text-white w-full"
                type="email"
                placeholder="Email"
                required
              />
            </div>
            <div className="mb-4 flex items-center gap-3 w-full px-3 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.lock_icon} alt="" />
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className="bg-transparent outline-none text-white w-full"
                type="password"
                placeholder="Password"
                required
              />
            </div>
            <p
              onClick={() => navigate("/reset-password")}
              className="mb-3 text-indigo-500 cursor-pointer text-sm"
            >
              Forget Password
            </p>
            <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 cursor-pointer text-white font-medium">
              {state === "Sign Up" ? "Register" : "Login"}
            </button>
          </form>
          {state === "Sign Up" ? (
            <p className="text-gray-400 text-center mt-4 text-xs">
              Already have an account?{" "}
              <span
                onClick={() => setState("Login")}
                className="text-blue-400 cursor-pointer underline"
              >
                Login Here
              </span>
            </p>
          ) : (
            <p className="text-gray-400 text-center mt-4 text-xs">
              Don't have an account?{" "}
              <span
                onClick={() => setState("Sign Up")}
                className="text-blue-400 cursor-pointer underline"
              >
                Sign Up
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PassengerLogin;
