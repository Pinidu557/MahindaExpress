import React, { useState, useContext, useEffect, useMemo } from "react";
import PassengerNavbar from "../components/PassengerNavbar";
import Footer from "../components/Footer";
import ChatBot from "../components/ChatBot";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { MapPin, Calendar, Clock, Bus, Loader2 } from "lucide-react";

// Route stops data
const routeStops = {
  "Colombo-Ampara": [
    "Ampara",
    "Uhana",
    "Mahaoya",
    "Padiyathalawa",
    "Beligalla",
    "Mahiyanganaya",
    "Hasalaka",
    "Ududumbara",
    "Hunnasgiriya",
    "Rambukwella",
    "Teldeniya",
    "Digana",
    "Kundasale",
    "Kandy",
    "Getambe",
    "Peradeniya",
    "Pilimathalawa",
    "Kadugannawa",
    "Mawanella",
    "Kegalle",
    "Galigamuwa",
    "Ambepussa",
    "Warakapola",
    "Pasyala",
    "Nittambuwa",
    "Kiribathgoda",
    "Kadawatha",
    "Colombo",
  ],
  "Ampara-Colombo": [
    "Colombo",
    "Kadawatha",
    "Kiribathgoda",
    "Nittambuwa",
    "Pasyala",
    "Warakapola",
    "Ambepussa",
    "Galigamuwa",
    "Kegalle",
    "Mawanella",
    "Kadugannawa",
    "Pilimathalawa",
    "Peradeniya",
    "Getambe",
    "Kandy",
    "Kundasale",
    "Digana",
    "Teldeniya",
    "Rambukwella",
    "Hunnasgiriya",
    "Ududumbara",
    "Hasalaka",
    "Mahiyanganaya",
    "Beligalla",
    "Padiyathalawa",
    "Mahaoya",
    "Uhana",
    "Ampara",
  ],
  "Colombo-Anuradhapura": [
    "Anuradhapura",
    "Kalattewa",
    "Galkulama",
    "Thirappane",
    "Maradankadawala",
    "Kekirawa",
    "Dambulla",
    "Galewela",
    "Melsiripura",
    "Ambanpola",
    "Gokarella",
    "Kurunegala",
    "Dambokka Entrance",
    "Meerigama Entrance",
    "Pasyala",
    "Nittambuwa",
    "Yakkala",
    "Miriswatta",
    "Beliummulla",
    "Mudungoda",
    "Imbulgoda",
    "Kirillawala",
    "Kadawatha",
    "Mahara",
    "Kiribathgoda",
    "Dalugama",
    "Thorana Junction",
    "Orugodawatta",
    "Maligawatta",
    "Colombo",
  ],
  "Anuradhapura-Colombo": [
    "Colombo",
    "Maligawatta",
    "Orugodawatta",
    "Thorana Junction",
    "Dalugama",
    "Kiribathgoda",
    "Mahara",
    "Kadawatha",
    "Kirillawala",
    "Imbulgoda",
    "Mudungoda",
    "Beliummulla",
    "Miriswatta",
    "Yakkala",
    "Nittambuwa",
    "Pasyala",
    "Meerigama Entrance",
    "Dambokka Entrance",
    "Kurunegala",
    "Gokarella",
    "Ambanpola",
    "Melsiripura",
    "Galewela",
    "Dambulla",
    "Kekirawa",
    "Maradankadawala",
    "Thirappane",
    "Galkulama",
    "Kalattewa",
    "Anuradhapura",
  ],
};

const SeatBooking = () => {
  const { backendUrl } = useContext(AppContent);
  const location = useLocation();
  const navigate = useNavigate();
  const routeData = useMemo(() => location.state || {}, [location.state]);

  // Track bookingId for update
  const [bookingId, setBookingId] = useState(routeData.bookingId || null);
  
  console.log("PassengerCheckout - routeData:", routeData);
  console.log("PassengerCheckout - bookingId:", bookingId);

  // Sample seat layout (rows with seat numbers)
  const seatLayout = [
    [1, 2, null, 3, 4],
    [5, 6, null, 7, 8],
    [9, 10, null, 11, 12],
    [13, 14, null, 15, 16],
    [17, 18, null, 19, 20],
    [21, 22, null, 23, 24],
    [25, 26, null, 27, 28],
    [29, 30, null, 31, 32],
    [null, null, null, 33, 34],
    [null, null, null, 35, 36],
    [37, 38, 39, 40, 41, 42],
  ];

  const [bookedSeats, setBookedSeats] = useState([]);
  const [bookedSeatGenders, setBookedSeatGenders] = useState({}); // Track gender for booked seats
  const [pendingSeats, setPendingSeats] = useState([]);
  const [pendingVerificationSeats, setPendingVerificationSeats] = useState([]);
  const [isLoadingSeats, setIsLoadingSeats] = useState(true);

  const [seats, setSeats] = useState([]);
  const [seatGenders, setSeatGenders] = useState({}); // Track gender for each seat
  const [PassengerName, setPassengerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [boardingPoint, setBoardingPoint] = useState("");
  const [dropoffPoint, setDropoffPoint] = useState("");
  const [journeyDate, setJourneyDate] = useState("");
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [selectedSeatForGender, setSelectedSeatForGender] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableStops, setAvailableStops] = useState([]);
  const [routeKey, setRouteKey] = useState("");

  // Validation states
  const [nameError, setNameError] = useState(false);
  const [mobileError, setMobileError] = useState(false);
  const [mobileErrorMessage, setMobileErrorMessage] = useState("");
  const [mobileKeyError, setMobileKeyError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [seatLimitError, setSeatLimitError] = useState(false);

  // Set default journey details from route data
  useEffect(() => {
    if (routeData.startLocation && routeData.endLocation) {
      // Start with empty values so the "Select..." options show by default
      setBoardingPoint("");
      setDropoffPoint("");

      // Determine route key based on start and end locations
      let key = "";
      if (
        (routeData.startLocation === "Colombo" &&
          routeData.endLocation === "Ampara") ||
        (routeData.startLocation === "Ampara" &&
          routeData.endLocation === "Colombo")
      ) {
        key = `${routeData.startLocation}-${routeData.endLocation}`;
        setRouteKey(key);
        setAvailableStops(routeStops[key] || []);
      } else if (
        (routeData.startLocation === "Colombo" &&
          routeData.endLocation === "Anuradhapura") ||
        (routeData.startLocation === "Anuradhapura" &&
          routeData.endLocation === "Colombo")
      ) {
        key = `${routeData.startLocation}-${routeData.endLocation}`;
        setRouteKey(key);
        setAvailableStops(routeStops[key] || []);
      } else {
        // For other routes, reset to empty key and stops
        setRouteKey("");
        setAvailableStops([]);
      }
    }

    // Always use today's date for the journey
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setJourneyDate(`${year}-${month}-${day}`);

    // If bookingId is passed from navigation, set it
    if (routeData.bookingId) {
      setBookingId(routeData.bookingId);
    }
  }, [routeData]);

  // Fetch booked seats when route or journey date changes
  useEffect(() => {
    const fetchBookedSeats = async () => {
      if (!routeData.routeId || !journeyDate) {
        setIsLoadingSeats(false);
        return;
      }
      setIsLoadingSeats(true);
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/bookings/booked-seats`,
          {
            params: {
              routeId: routeData.routeId,
              journeyDate: journeyDate,
              excludeBookingId: bookingId, // Exclude current booking when editing
            },
          }
        );
        if (data.success) {
          console.log("Booked seats data:", data);
          const bookedSeats = data.bookedSeats || [];
          const bookedSeatGenders = data.bookedSeatGenders || {};
          
          // If no gender info is provided, assign random genders for demonstration
          if (Object.keys(bookedSeatGenders).length === 0 && bookedSeats.length > 0) {
            const randomGenders = {};
            bookedSeats.forEach((seat, index) => {
              randomGenders[seat] = index % 2 === 0 ? 'Male' : 'Female';
            });
            setBookedSeatGenders(randomGenders);
            console.log("Assigned random genders:", randomGenders);
          } else {
            setBookedSeatGenders(bookedSeatGenders);
          }
          
          setBookedSeats(bookedSeats);
          setPendingSeats(data.pendingSeats || []);
          setPendingVerificationSeats(data.pendingVerificationSeats || []);
        } else {
          toast.error("Could not load seat availability");
        }
      } catch (error) {
        toast.error("Failed to check seat availability", error.message);
      } finally {
        setIsLoadingSeats(false);
      }
    };
    fetchBookedSeats();
  }, [backendUrl, routeData.routeId, journeyDate, bookingId]);

  // Fetch booking details if bookingId exists (for update)
  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        console.log("No bookingId found, skipping fetch");
        return;
      }
      console.log("Fetching booking details for bookingId:", bookingId);
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/bookings/${bookingId}`
        );
        if (data.success) {
          console.log("Successfully fetched booking:", data.booking);
          setPassengerName(data.booking.passengerName);
          setMobileNumber(data.booking.mobileNumber);
          setEmail(data.booking.email);
          setSeats(data.booking.seats);
          setSeatGenders(data.booking.seatGenders || {}); // Load seat genders
          setBoardingPoint(data.booking.boardingPoint);
          setDropoffPoint(data.booking.dropoffPoint);
          setJourneyDate(
            new Date(data.booking.journeyDate).toISOString().split("T")[0]
          );
        }
      } catch (error) {
        console.error("Error fetching booking details:", error);
        console.error("Request URL:", `${backendUrl}/api/bookings/${bookingId}`);
        toast.error("Failed to fetch booking details");
      }
    };
    fetchBookingDetails();
  }, [bookingId, backendUrl]);

  // Filter out current user's seats from pending status when editing
  useEffect(() => {
    if (bookingId && seats.length > 0) {
      // Remove current user's seats from pending verification list
      setPendingVerificationSeats(prev => 
        prev.filter(seat => !seats.includes(seat))
      );
      // Also remove from pending seats list
      setPendingSeats(prev => 
        prev.filter(seat => !seats.includes(seat))
      );
    }
  }, [bookingId, seats]);

  // Helper function to get adjacent seats
  const getAdjacentSeats = (seat) => {
    const adjacent = [];
    for (const row of seatLayout) {
      const seatIndex = row.indexOf(seat);
      if (seatIndex !== -1) {
        // Check left and right in the same row
        if (seatIndex > 0 && row[seatIndex - 1] !== null) {
          adjacent.push(row[seatIndex - 1]);
        }
        if (seatIndex < row.length - 1 && row[seatIndex + 1] !== null) {
          adjacent.push(row[seatIndex + 1]);
        }
        break;
      }
    }
    return adjacent;
  };

  // Check if selecting a gender for a seat would violate adjacency rules
  const checkGenderAdjacency = (seat, gender) => {
    const adjacentSeats = getAdjacentSeats(seat);
    const otherGender = gender === "Male" ? "Female" : "Male";
    
    for (const adjacentSeat of adjacentSeats) {
      if (seats.includes(adjacentSeat) && seatGenders[adjacentSeat] === otherGender) {
        return false; // Would create male-female adjacency
      }
    }
    return true; // Safe to select
  };

  // Handle seat selection
  const toggleSeat = (seat) => {
    if (!seat) return;
    
    // Allow selection of user's own seats even if they're in pending status
    const isUserOwnSeat = seats.includes(seat);
    
    if (
      bookedSeats.includes(seat) ||
      (!isUserOwnSeat && (pendingSeats.includes(seat) || pendingVerificationSeats.includes(seat)))
    )
      return;
      
    if (seats.includes(seat)) {
      // Remove seat and its gender
      setSeats(seats.filter((s) => s !== seat));
      const newSeatGenders = { ...seatGenders };
      delete newSeatGenders[seat];
      setSeatGenders(newSeatGenders);
      // Clear seat limit error when removing seats
      if (seatLimitError) setSeatLimitError(false);
    } else {
      // Check seat limit before adding new seat
      if (seats.length >= 6) {
        setSeatLimitError(true);
        toast.error("Maximum 6 seats can be selected");
        return;
      }
      // Add seat and show gender selection modal
      setSelectedSeatForGender(seat);
      setShowGenderModal(true);
    }
  };

  // Handle gender selection for a seat
  const handleGenderSelection = (gender) => {
    if (!selectedSeatForGender) return;

    if (!checkGenderAdjacency(selectedSeatForGender, gender)) {
      toast.error(`Cannot select ${gender} seat next to ${gender === "Male" ? "Female" : "Male"} seat!`);
      return;
    }

    // Add seat with selected gender
    setSeats([...seats, selectedSeatForGender]);
    setSeatGenders({
      ...seatGenders,
      [selectedSeatForGender]: gender
    });

    setShowGenderModal(false);
    setSelectedSeatForGender(null);
  };

  // Calculate total fare
  const totalFare = seats.length * (routeData.fare || 895);

  // Check if all required form fields are filled
  const isFormValid = () => {
    return (
      seats.length > 0 &&
      seats.length <= 6 &&
      PassengerName.trim() !== "" &&
      mobileNumber.trim() !== "" &&
      mobileNumber.length === 10 &&
      boardingPoint.trim() !== "" &&
      dropoffPoint.trim() !== "" &&
      !nameError &&
      !mobileError &&
      !mobileKeyError &&
      !emailError &&
      !seatLimitError
    );
  };

  // Handle form submission (create or update booking)
  const onSubmieHandler = async (e) => {
    e.preventDefault();

    if (seats.length === 0) {
      toast.error("Please select at least one seat.");
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        routeId: routeData.routeId || "64f9a3b3b6e351d5f13e3a20",
        passengerName: PassengerName,
        mobileNumber: mobileNumber,
        email: email || "no-email@example.com",
        seats: seats,
        seatGenders: seatGenders, // Include seat gender information
        boardingPoint: boardingPoint,
        dropoffPoint: dropoffPoint,
        journeyDate: new Date(journeyDate).toISOString(),
        totalFare: totalFare,
        status: "pending",
      };

      let data;
      if (bookingId) {
        // Update booking
        const response = await axios.put(
          `${backendUrl}/api/bookings/${bookingId}`,
          bookingData
        );
        data = response.data;
      } else {
        // Create booking
        const response = await axios.post(
          `${backendUrl}/api/bookings/checkout`,
          bookingData
        );
        data = response.data;
        if (data.success && data.booking?._id) {
          setBookingId(data.booking._id);
        }
      }

      if (data.success) {
        toast.success("Booking successful! Redirecting to payment");
        setTimeout(() => {
          navigate("/journeys/checkout/payment", {
            state: { 
              bookingId: bookingId || data.booking._id,
              ...routeData // Include all route data
            },
          });
        }, 1500);
      } else {
        toast.error(data.message || "Something went wrong");
        setIsSubmitting(false);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create/update booking"
      );
      setIsSubmitting(false);
    }
  };

  // Format the journey date for display - always use current date
  const getCurrentFormattedDate = () => {
    const today = new Date();
    return today.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  const formattedJourneyDate = getCurrentFormattedDate();

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
      <PassengerNavbar />

      {/* Journey Details Banner */}
      {routeData.startLocation && (
        <div className="bg-slate-800 w-[80%] p-6 rounded-xl mt-35 mb-8 shadow-lg">
          <h1 className="text-2xl font-bold mb-4 text-center text-slate-200">
            {routeData.startLocation} to {routeData.endLocation} -{" "}
            {routeData.busType || "Express Bus"}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-2">
              <MapPin className="text-indigo-400" size={20} />
              <div>
                <p className="text-gray-400 text-xs">From (Route Start)</p>
                <p className="font-semibold">{routeData.startLocation}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="text-indigo-400" size={20} />
              <div>
                <p className="text-gray-400 text-xs">To (Route End)</p>
                <p className="font-semibold">{routeData.endLocation}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="text-indigo-400" size={20} />
              <div>
                <p className="text-gray-400 text-xs">Date</p>
                <p className="font-semibold">{formattedJourneyDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="text-indigo-400" size={20} />
              <div>
                <p className="text-gray-400 text-xs">Departure Time</p>
                <p className="font-semibold">{routeData.departureTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="text-indigo-400" size={20} />
              <div>
                <p className="text-gray-400 text-xs">Arrival Time</p>
                <p className="font-semibold">{routeData.arrivalTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Bus className="text-indigo-400" size={20} />
              <div>
                <p className="text-gray-400 text-xs">Fare</p>
                <p className="font-semibold">LKR {routeData.fare}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-4 mt-4 text-center text-blue-400">
        Select Seats & Fill Form
      </h1>

      <div className="flex flex-row gap-10 items-center justify-center min-h-screen w-[90%] mx-auto mb-10">
        {/* Seat Layout */}
        <div className="bg-slate-800 p-5 rounded-2xl shadow-lg w-[30%] flex-shrink-0">
          <div className="flex justify-center mb-4">
            <span className="bg-slate-700 px-4 py-2 rounded-lg">Front</span>
          </div>

          {isLoadingSeats ? (
            // Show loading spinner while fetching seats
            <div className="flex flex-col items-center justify-center p-10">
              <Loader2
                className="animate-spin text-indigo-500 mb-2"
                size={30}
              />
              <p className="text-gray-300">Loading seat availability...</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {seatLayout.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-3">
                  {row.map((seat, index) =>
                    seat ? (
                      <button
                        key={index}
                        onClick={() => toggleSeat(seat)}
                        className={`w-10 h-10 rounded-lg text-sm font-bold flex items-center justify-center cursor-pointer
                          ${
                            bookedSeats.includes(seat)
                              ? bookedSeatGenders[seat] === 'Male' 
                                ? "bg-blue-600 cursor-not-allowed" // Male booked seat - blue
                                : bookedSeatGenders[seat] === 'Female'
                                ? "bg-pink-600 cursor-not-allowed" // Female booked seat - pink
                                : "bg-red-800 cursor-not-allowed" // General booked seat color
                              : (pendingSeats.includes(seat) ||
                                pendingVerificationSeats.includes(seat)) &&
                                !seats.includes(seat) // Don't show as pending if it's the user's own seat
                              ? "bg-orange-600 cursor-not-allowed"
                              : seats.includes(seat)
                              ? "bg-purple-600 hover:bg-purple-500" // User selected seats - purple
                              : "bg-green-600 hover:bg-green-500"
                          }`}
                        disabled={
                          bookedSeats.includes(seat) ||
                          (pendingSeats.includes(seat) ||
                          pendingVerificationSeats.includes(seat)) &&
                          !seats.includes(seat) // Don't disable if it's the user's own seat
                        }
                      >
                        {seat}
                      </button>
                    ) : (
                      <div key={index} className="w-10 h-10"></div>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Seat Details Form */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg w-[35%] flex-shrink-0">
          <h2 className="text-xl font-semibold mb-4">Seat Details</h2>
          <div className="mb-2">
            <div className="mb-2">
              <p className="text-gray-300">Selected Seats:</p>
            </div>
            {seats.length > 0 ? (
              <div className="space-y-1">
                {seats.map(seat => (
                  <div key={seat} className="flex items-center gap-2">
                    <span className="text-indigo-400 font-semibold">Seat {seat}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      seatGenders[seat] === 'Male' 
                        ? 'bg-blue-600 text-white' 
                        : seatGenders[seat] === 'Female'
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-600 text-white'
                    }`}>
                      {seatGenders[seat] || 'Not Selected'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-gray-400">None</span>
            )}
            {seatLimitError && (
              <p className="text-red-400 text-xs mt-2">
                Maximum 6 seats allowed
              </p>
            )}
          </div>
          <p className="mb-4">
            Total: <span className="text-green-400 font-bold">{totalFare}</span>{" "}
            LKR
          </p>

          <form className="flex flex-col gap-8" onSubmit={onSubmieHandler}>
            <div className="flex flex-col w-full">
              <input
                type="text"
                placeholder="Passenger Name"
                className={`px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 border ${
                  nameError
                    ? "border-red-500"
                    : "border-transparent hover:border-slate-600"
                }`}
                value={PassengerName}
                onChange={(e) => {
                  // Allow only letters and spaces (no numbers or special characters)
                  if (
                    /^[A-Za-z\s]*$/.test(e.target.value) ||
                    e.target.value === ""
                  ) {
                    setPassengerName(e.target.value);
                    // Reset error when valid input is entered
                    if (nameError) setNameError(false);
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
                    setNameError(true);
                    e.preventDefault();
                  }
                }}
                required
              />
              {nameError && (
                <p className="text-red-400 text-xs ml-2 mt-1">
                  Only letters are allowed
                </p>
              )}
            </div>
            <div className="flex flex-col w-full">
              <input
                type="text"
                placeholder="Mobile Number"
                className={`px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 border ${
                  mobileError
                    ? "border-red-500"
                    : "border-transparent hover:border-slate-600"
                }`}
                value={mobileNumber}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow only numbers and limit to 10 digits
                  if (/^[0-9]*$/.test(value) && value.length <= 10) {
                    setMobileNumber(value);
                    // Clear errors when valid input is entered
                    if (mobileError) {
                      setMobileError(false);
                      setMobileErrorMessage("");
                    }
                    if (mobileKeyError) {
                      setMobileKeyError("");
                    }
                  }
                }}
                onKeyDown={(e) => {
                  // Show alert if user tries to type when already at 10 digits
                  if (mobileNumber.length >= 10 && /^[0-9]$/.test(e.key)) {
                    e.preventDefault();
                    setMobileKeyError("Phone number cannot exceed 10 digits");
                    return;
                  }
                  // Block keys that are not numbers or control keys
                  if (
                    !/^[0-9]$/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "Delete" &&
                    e.key !== "ArrowLeft" &&
                    e.key !== "ArrowRight" &&
                    e.key !== "Tab"
                  ) {
                    e.preventDefault();
                    setMobileKeyError("Only numbers are allowed");
                    return;
                  }
                  // Clear key error when valid key is pressed
                  if (mobileKeyError) {
                    setMobileKeyError("");
                  }
                }}
                onBlur={() => {
                  // Validate on blur
                  if (mobileNumber.length > 0 && mobileNumber.length !== 10) {
                    setMobileError(true);
                    setMobileErrorMessage("Phone number must be exactly 10 digits");
                  }
                }}
                required
              />
              {(mobileError || mobileKeyError) && (
                <p className="text-red-400 text-xs ml-2 mt-1">
                  {mobileKeyError || mobileErrorMessage || "Only numbers are allowed"}
                </p>
              )}
            </div>

            <div className="flex flex-col w-full">
              <input
                type="email"
                placeholder="Email address"
                className={`px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 border ${
                  emailError
                    ? "border-red-500"
                    : "border-transparent hover:border-slate-600"
                }`}
                value={email}
                onChange={(e) => {
                  const value = e.target.value;
                  setEmail(value);
                  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    setEmailError("Please enter a valid email address");
                  } else {
                    setEmailError("");
                  }
                }}
              />
              {emailError && (
                <p className="text-red-400 text-xs ml-2 mt-1">{emailError}</p>
              )}
            </div>
            <div>
              {availableStops.length > 0 ? (
                <>
                  <select
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 border border-transparent hover:border-slate-600"
                    value={boardingPoint}
                    onChange={(e) => {
                      setBoardingPoint(e.target.value);
                      // Reset dropoff point when boarding point changes to prevent invalid selections
                      setDropoffPoint("");
                    }}
                    required
                  >
                    <option value="" className="text-gray-400">
                      Select Boarding Point
                    </option>
                    {availableStops.map((stop, index) => (
                      <option key={index} value={stop}>
                        {stop}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Select Boarding Point"
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 border border-transparent hover:border-slate-600"
                    value={boardingPoint}
                    onChange={(e) => setBoardingPoint(e.target.value)}
                    required
                  />
                </>
              )}
            </div>

            <div>
              {availableStops.length > 0 ? (
                <>
                  <select
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 border border-transparent hover:border-slate-600"
                    value={dropoffPoint}
                    onChange={(e) => setDropoffPoint(e.target.value)}
                    required
                    disabled={!boardingPoint}
                  >
                    <option value="" className="text-gray-400">
                      Select Dropoff Point
                    </option>
                    {availableStops
                      .map((stop, index) => {
                        // Get the indices of the boarding point and current stop
                        const boardingPointIndex =
                          availableStops.indexOf(boardingPoint);
                        const currentStopIndex = index;

                        // For routes starting with Colombo, dropoff must come before boarding point in the list
                        // For routes starting with Ampara or Anuradhapura, dropoff must come after boarding point in the list
                        const isValidStop = routeKey.startsWith("Colombo")
                          ? currentStopIndex < boardingPointIndex // For Colombo to destination routes
                          : currentStopIndex > boardingPointIndex; // For destination to Colombo routes

                        // Only show stops that make sense based on the boarding point selected
                        return boardingPoint && isValidStop ? (
                          <option key={index} value={stop}>
                            {stop}
                          </option>
                        ) : null;
                      })
                      .filter(Boolean)}{" "}
                    {/* Filter out null values */}
                  </select>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Select Dropoff Point"
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 border border-transparent hover:border-slate-600"
                    value={dropoffPoint}
                    onChange={(e) => setDropoffPoint(e.target.value)}
                    required
                  />
                </>
              )}
            </div>
            <div>
              <input
                disabled
                type="date"
                placeholder="Journey Date"
                className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-white cursor-not-allowed focus:outline-none border border-transparent"
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                required
              />
              <p className="text-xs text-slate-400 mt-1">
                Journey date cannot be changed
              </p>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid()}
              className="bg-blue-600 py-2 rounded-lg font-semibold mt-3 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Processing...
                </>
              ) : (
                "Continue to Pay"
              )}
            </button>
          </form>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 gap-4 text-sm w-[10%] flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-green-600 rounded"></span> Available
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-purple-600 rounded"></span> Selected
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-orange-600 rounded"></span> Pending
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-blue-600 rounded"></span> Male Booked
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-pink-600 rounded"></span> Female Booked
          </div>
        </div>
      </div>

      {/* Gender Selection Modal */}
      {showGenderModal && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Select Gender for Seat {selectedSeatForGender}
            </h3>
            <p className="text-gray-400 text-sm mb-6 text-center">
              Choose the gender for this seat. Male and female seats cannot be adjacent.
            </p>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => handleGenderSelection("Male")}
                className="cursor-pointer px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Male
              </button>
              <button
                onClick={() => handleGenderSelection("Female")}
                className="cursor-pointer px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors"
              >
                Female
              </button>
            </div>
            
            <button
              onClick={() => {
                setShowGenderModal(false);
                setSelectedSeatForGender(null);
              }}
              className="w-full mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <Footer />
      <ChatBot />
    </div>
  );
};

export default SeatBooking;
