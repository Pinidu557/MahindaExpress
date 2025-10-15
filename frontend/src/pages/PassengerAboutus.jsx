import React from "react";
import PassengerNavbar from "../components/PassengerNavbar";
import { assets } from "../assets/assets";
import { Star, Armchair, CreditCard } from "lucide-react";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { useState, useEffect } from "react";

const imageSources = [assets.auimg, assets.mebus, assets.mission];

const PassengerAboutus = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let loadedCount = 0;

    imageSources.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = img.onerror = () => {
        loadedCount++;
        if (loadedCount === imageSources.length) {
          setLoading(false);
        }
      };
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
      {loading ? (
        <Loader />
      ) : (
        <>
          <PassengerNavbar />
          {/* Hero Section */}
          <div className="relative h-[350px] w-full mt-20">
            <img
              src={assets.auimg}
              alt="About Banner"
              className="background-cover w-full h-full object-cover brightness-25"
            />
            <div className="absolute inset-0  bg-opacity-100 flex flex-col justify-center px-10">
              {/* Title */}
              <h1 className="text-8xl font-bold text-white ml-43 leading-23 ">
                Discover <br /> Our Commitment
              </h1>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row gap-8 items-center mt-5 justify-center">
              <div className="md:w-1/2 mt-5">
                <img
                  src={assets.mebus}
                  alt="Bus Travel"
                  className="rounded-xl shadow-blue-800 shadow-sm "
                />
              </div>
              <div className="text-gray-300 mt-6 text-md md:w-1/2  leading-6">
                <h2 className="text-4xl text-white mb-3 font-medium">
                  Who We Are
                </h2>
                <p>
                  Mahinda Express has grown into a trusted name in Sri Lanka's
                  passenger transport sector, beginning its journey with a single
                  bus serving the Colombo – Anuradhapura route. Over the years,
                  the company has expanded steadily, now operating a modern fleet
                  comprising Super Luxury coaches, Luxury coaches, and Standard
                  passenger buses. Guided by Mr. Mahinda's dedication to quality
                  and innovation, Mahinda Express remains committed to offering
                  safe, reliable, and comfortable travel experiences. From modest
                  origins, the company has become a hallmark of service
                  excellence, continuously focusing on customer satisfaction and
                  delivering diverse, high-standard mobility solutions across Sri
                  Lanka.
                </p>
              </div>
            </div>
          </div>
          {/* Content Section */}
          {/* Content Section */}
          <div className="max-w-6xl mx-auto px-6 py-12 mt-5">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Left Text */}
              <div className="md:w-1/2">
                <h2 className="text-4xl  mb-12  text-white font-medium">
                  Your Journey, Our Mission
                </h2>
                <p className="text-xl text-white mb-4">
                  Welcome aboard Mahinda Express – your ultimate solution for
                  swift and effortless public transit seat bookings across Sri
                  Lanka!
                </p>
                <p className="text-gray-400">
                  Here at Magiya, we understand the value of your time and the
                  importance of reliable travel. Our mission is to make your
                  journey smoother, more accessible, and stress-free by
                  providing a digital-first approach to public transport
                  booking.
                </p>
              </div>

              {/* Right Image */}
              <div className="md:w-1/2">
                <img
                  src={assets.mission} // replace with bus/travel image
                  alt="Bus Travel"
                  className="rounded-xl shadow-blue-800 shadow-sm "
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 py-12 px-6">
            <h2 className="text-4xl  text-center mb-10 text-white font-medium">
              Key Features of Mahinda Express
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Feature 1 */}
              <div className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-lg mb-4 ">
                  <Star size={22} className="text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Intuitive User Interface
                </h3>
                <p className="text-gray-400 text-sm">
                  A user-friendly interface that is easy to navigate, allowing
                  users to quickly search for and book bus seats without
                  encountering complications.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-lg mb-4">
                  <Armchair size={22} className="text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Real-Time Seat Availability
                </h3>
                <p className="text-gray-400 text-sm">
                  Provide live updates on seat availability, enabling users to
                  make informed decisions based on current bus occupancy.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-lg mb-4">
                  <CreditCard size={22} className="text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Secure Online Payments
                </h3>
                <p className="text-gray-400 text-sm">
                  Integration with secure payment gateways to facilitate
                  seamless and safe online transactions, instilling confidence
                  in users about the safety of their financial information.
                </p>
              </div>
            </div>
          </div>
          <Footer />
        </>
      )}
    </div>
  );
};

export default PassengerAboutus;
