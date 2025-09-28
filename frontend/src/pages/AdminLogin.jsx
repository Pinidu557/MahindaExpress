import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedin } = useContext(AppContent);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/admin/login", {
        email,
        password,
      });
      if (data.success) {
        setIsLoggedin(true);
        localStorage.setItem("isAdmin", "true"); // ✅ mark admin login
        toast.success("Welcome Admin!");
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid Credentials");
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block w-[30%] h-screen bg-[#09121f]">
        <img
          onClick={() => navigate("/")}
          src={assets.melogo4}
          alt=""
          className="mb-6 w-28 cursor-pointer ml-11 mt-4"
        />
        <img
          src={assets.megirl}
          alt="Login Illustration"
          className="w-[80%] h-[85%] object-cover mx-auto rounded-2xl"
        />
      </div>
      <div className="flex w-full md:w-[70%] items-center justify-center bg-slate-900 p-8">
        <div className="w-full max-w-2xl text-indigo-300">
          <h2 className="text-5xl font-semibold text-white text-center mb-6">
            Admin Login
          </h2>
          <form onSubmit={onSubmitHandler}>
            <div className="mb-4 flex items-center gap-3 w-full px-3 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.mail_icon} alt="" />
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="bg-transparent outline-none text-white w-full"
                type="email"
                placeholder="Admin Email"
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
            <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-green-500 to-green-900 cursor-pointer text-white font-medium">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
