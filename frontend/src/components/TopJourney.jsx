import { assets } from "../assets/assets";

export const JourneySection = () => {
  return (
    <section className="w-full py-16 px-6">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto text-center mb-14">
        <h2 className="text-3xl font-bold text-white">
          Top Bus Routes For You
        </h2>
        <p className="text-gray-300 mt-4 max-w-5xl mx-auto ">
          Experience Sri Lanka's top destinations this season with Mahinda
          Express. Our featured routes are curated for comfort, convenience, and
          unforgettable memories — whether you're heading home for the holidays
          or chasing scenic adventures.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Card 1 - Image Card */}
        <div className="rounded-2xl shadow-lg overflow-hidden flex flex-col bg-gray-800">
          <div className="grid grid-cols-2 h-full">
            <div className="p-6 flex flex-col justify-between pb-8 pt-8">
              <div>
                <h3 className="text-lg font-bold text-white mb-3">
                  Moratuwa → Jaffna: Northern Explorer
                </h3>
                <p className="text-gray-300 text-sm mb-6">
                  Journey from the coastal calm of Moratuwa to the rich heritage
                  of Jaffna. A seasonal ride perfect for long-distance comfort
                  and cultural discovery.
                </p>
              </div>
            </div>
            <img
              src={assets.nightbus}
              alt="Moratuwa → Jaffna"
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        {/* Card 2 - Gradient Indigo */}
        <div className="rounded-2xl shadow-lg overflow-hidden flex flex-col bg-gradient-to-b from-indigo-800 to-purple-800">
          <div className="p-6 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                Colombo → Anuradhapura: Heritage
              </h3>
              <p className="text-gray-100 text-sm">
                Ride from the city’s edge to the island’s sacred ancient
                capital. A cultural journey to Anuradhapura perfect for
                spiritual retreats and exploring timeless history.
              </p>
            </div>
            <img
              src={assets.anu}
              alt="Moratuwa → Jaffna"
              className="object-cover w-full h-50 rounded-2xl mt-2"
            />
          </div>
        </div>

        {/* Card 3 - Gradient Purple */}
        <div className="rounded-2xl shadow-lg overflow-hidden flex flex-col bg-gradient-to-r from-indigo-600 to-indigo-900">
          <div className="p-6 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                Colombo → Ampara: Eastern Escapey
              </h3>
              <p className="text-gray-100 text-sm ">
                Travel east in comfort — from Colombo to Ampara’s serene
                landscapes. Perfect for peaceful seasonal getaways.
              </p>
            </div>
            <img
              src={assets.ampara_journey}
              alt="Moratuwa → Jaffna"
              className="object-cover w-full h-50 rounded-2xl mt-2"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
