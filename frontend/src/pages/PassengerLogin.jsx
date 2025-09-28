import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets.js";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContent } from "../context/AppContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

const PassengerLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContent);

  const [state, setState] = useState("Login");
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if all form fields are valid
  const isFormValid = () => {
    if (state === "Sign Up") {
      return (
        firstname.trim() !== "" &&
        lastname.trim() !== "" &&
        email.trim() !== "" &&
        password.trim() !== "" &&
        !emailError &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ); // Basic email validation
    } else {
      return (
        email.trim() !== "" &&
        password.trim() !== "" &&
        !emailError &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ); // Basic email validation
    }
  };

  // Reset fields when switching between login and signup
  useEffect(() => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setEmailError("");
    setFirstNameError(false);
    setLastNameError(false);
  }, [state]);

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      setIsLoading(true);
      axios.defaults.withCredentials = true;
      if (state === "Sign Up") {
        const { data } = await axios.post(backendUrl + "/api/auth/register", {
          firstname,
          lastname,
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
          // Check if we need to redirect to a specific page after login
          if (location.state?.redirectAfterLogin) {
            // Navigate to the redirect path with the booking data
            navigate(location.state.redirectAfterLogin, {
              state: location.state.bookingData,
            });
          } else {
            // Default navigation after login
            navigate("/");
          }
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "An error occurred"
      );
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
          <h2 className="text-5xl font-semibold text-white text-center mb-3">
            {state === "Sign Up" ? "Create Account" : "Login Account"}
          </h2>
          <p className="text-center mb-6 text-md">
            {state === "Sign Up" ? "Create your account" : "Login your account"}
          </p>
          <form onSubmit={onSubmitHandler}>
            {state === "Sign Up" && (
              <div className="mb-4">
                <div className="flex items-center gap-3 w-full px-3 py-2.5 rounded-full bg-[#333A5C] focus-within:ring-2 focus-within:ring-indigo-500 transition-all duration-200">
                  <img src={assets.person_icon} alt="" />
                  <input
                    onChange={(e) => {
                      // Allow only letters (no numbers or special characters)
                      if (
                        /^[A-Za-z\s]*$/.test(e.target.value) ||
                        e.target.value === ""
                      ) {
                        setFirstName(e.target.value);
                        // If valid input, reset error state
                        if (firstNameError) setFirstNameError(false);
                      }
                    }}
                    onKeyDown={(e) => {
                      // Block keys that are numbers or special characters
                      if (
                        !/^[A-Za-z\s]$/.test(e.key) &&
                        e.key !== "Backspace" &&
                        e.key !== "Delete" &&
                        e.key !== "ArrowLeft" &&
                        e.key !== "ArrowRight" &&
                        e.key !== "Tab"
                      ) {
                        // Set error state when invalid key is pressed
                        setFirstNameError(true);
                        e.preventDefault();
                      }
                    }}
                    value={firstname}
                    className="bg-transparent outline-none text-white w-full focus:placeholder-indigo-300"
                    type="text"
                    placeholder="First Name"
                    required
                  />
                </div>
                {firstNameError && (
                  <p className="text-red-400 text-xs ml-4 mt-2">
                    Only letters are allowed
                  </p>
                )}
              </div>
            )}
            {state == "Sign Up" && (
              <div className="mb-4">
                <div className="flex items-center gap-3 w-full px-3 py-2.5 rounded-full bg-[#333A5C] focus-within:ring-2 focus-within:ring-indigo-500 transition-all duration-200">
                  <img src={assets.person_icon} alt="" />
                  <input
                    onChange={(e) => {
                      // Allow only letters (no numbers or special characters)
                      if (
                        /^[A-Za-z\s]*$/.test(e.target.value) ||
                        e.target.value === ""
                      ) {
                        setLastName(e.target.value);
                        // If valid input, reset error state
                        if (lastNameError) setLastNameError(false);
                      }
                    }}
                    onKeyDown={(e) => {
                      // Block keys that are numbers or special characters
                      if (
                        !/^[A-Za-z\s]$/.test(e.key) &&
                        e.key !== "Backspace" &&
                        e.key !== "Delete" &&
                        e.key !== "ArrowLeft" &&
                        e.key !== "ArrowRight" &&
                        e.key !== "Tab"
                      ) {
                        // Set error state when invalid key is pressed
                        setLastNameError(true);
                        e.preventDefault();
                      }
                    }}
                    value={lastname}
                    className="bg-transparent outline-none text-white w-full focus:placeholder-indigo-300"
                    type="text"
                    placeholder="Last Name"
                    required
                  />
                </div>
                {lastNameError && (
                  <p className="text-red-400 text-xs ml-4 mt-2">
                    Only letters are allowed
                  </p>
                )}
              </div>
            )}
            <div className="mb-4">
              <div className="flex items-center gap-3 w-full px-3 py-2.5 rounded-full bg-[#333A5C] focus-within:ring-2 focus-within:ring-indigo-500 transition-all duration-200">
                <img src={assets.mail_icon} alt="" />
                <input
                  onChange={(e) => {
                    const value = e.target.value;
                    setEmail(value);
                    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                      setEmailError("Please enter a valid email address");
                    } else {
                      setEmailError("");
                    }
                  }}
                  value={email}
                  className="bg-transparent outline-none text-white w-full focus:placeholder-indigo-300"
                  type="email"
                  placeholder="Email"
                  required
                />
              </div>
              {emailError && (
                <p className="text-red-400 text-xs ml-4 mt-1">{emailError}</p>
              )}
            </div>
            <div className="mb-4 flex items-center gap-3 w-full px-3 py-2.5 rounded-full bg-[#333A5C] focus-within:ring-2 focus-within:ring-indigo-500 transition-all duration-200">
              <img src={assets.lock_icon} alt="" />
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className="bg-transparent outline-none text-white w-full focus:placeholder-indigo-300"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-indigo-300 hover:text-indigo-100"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                    <line x1="2" x2="22" y1="2" y2="22"></line>
                  </svg>
                )}
              </button>
            </div>
            <p
              onClick={() => navigate("/reset-password")}
              className="mb-3 text-indigo-500 cursor-pointer text-sm"
            >
              Forget Password
            </p>
            <button
              disabled={isLoading || !isFormValid()}
              className={`w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 hover:from-indigo-600 hover:to-indigo-800 text-white font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                isFormValid() ? "cursor-pointer" : "cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  {state === "Sign Up" ? "Creating Account" : "Logging in"}
                </>
              ) : state === "Sign Up" ? (
                "Register"
              ) : (
                "Login"
              )}
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
