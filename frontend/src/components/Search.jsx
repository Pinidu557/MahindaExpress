import { useState } from "react";
import { MapPin, Search } from "lucide-react";

const mapPins = {
  icons: <MapPin className="w-6 h-6 text-white mr-2" />,
  icons2: <Search className="w-6 h-6 text-black mr-2 mt-0.2" />,
};

const locations = [
  "Colombo",
  "Galle",
  "Kandy",
  "Jaffna",
  "Negombo",
  "Matara",
  "Kurunegala",
];

function SearchSection() {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [date, setDate] = useState("");

  return (
    <div className="flex justify-center mt-10 shadow-lg rounded-2xl ">
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-800  p-6 rounded-2xl flex flex-wrap gap-4 items-center ">
        {/* Pickup Location */}
        <form action="" className="flex flex-wrap gap-4 items-center">
          <div className="flex justify-center align-items-center relative border border-white px-2 py-3 rounded-lg gap-0">
            {mapPins.icons}
            <input
              type="text"
              placeholder="Pickup Location"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className=" w-50 focus:outline-none text-white font-bold placeholder-white"
              list="pickup-list"
            />
            <datalist id="pickup-list">
              {locations.map((loc, i) => (
                <option key={i} value={loc} />
              ))}
            </datalist>
          </div>

          {/* Drop Location */}
          <div className="flex justify-center align-items-center relative border border-white px-2 py-3 rounded-lg gap-0">
            {mapPins.icons}
            <input
              type="text"
              placeholder="Drop Location"
              value={drop}
              onChange={(e) => setDrop(e.target.value)}
              className=" w-50 focus:outline-none text-white font-bold placeholder-white"
              list="drop-list"
            />
            <datalist id="drop-list">
              {locations.map((loc, i) => (
                <option key={i} value={loc} />
              ))}
            </datalist>
          </div>

          {/* Date */}
          <input
            type="date"
            value={date}
            placeholder="Date"
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-3 rounded-lg w-60  border border-white focus:outline-none text-white font-bold placeholder-white"
          />

          {/* Search Button */}
          <div className="flex justify-center align-items-center bg-yellow-400 px-4 py-3 rounded-lg gap-0 hover:bg-yellow-500 transition cursor-pointer">
            {mapPins.icons2}
            <button
              className="  text-black font-bold cursor-pointer"
              onClick={() =>
                alert(`Searching buses from ${pickup} to ${drop} on ${date}`)
              }
            >
              Search Bus
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SearchSection;
