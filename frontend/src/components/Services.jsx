import { Shield, RefreshCcw, Headphones } from "lucide-react";

const services = [
  {
    icon: <Shield className="w-10 h-10 text-blue-400 mx-auto mb-4" />,
    title: "Secure Payment",
    description:
      "Integrate secure payment gateways for users to pay for their tickets",
    hover: "hover:shadow-blue-500/30",
  },
  {
    icon: <RefreshCcw className="w-10 h-10 text-yellow-400 mx-auto mb-4" />,
    title: "Refund Policy",
    description:
      "Offer options for the users to purchase refundable tickets with clear terms",
    hover: "hover:shadow-yellow-500/30",
  },
  {
    icon: <Headphones className="w-10 h-10 text-red-400 mx-auto mb-4" />,
    title: "24/7 Support",
    description: "Get assistance anytime through chat, email, or phone",
    hover: "hover:shadow-red-500/30",
  },
];

export const Services = () => {
  return (
    <div className="w-[90%]  grid grid-cols-1 md:grid-cols-3 gap-6 p-8 -mt-2">
      {services.map((service, index) => (
        <div
          key={index}
          className={`bg-[#1A2238] rounded-2xl p-6 text-center shadow-md transition transform hover:shadow-md ${service.hover}`}
        >
          {service.icon}
          <h3 className="text-white font-semibold text-lg mb-2">
            {service.title}
          </h3>
          <p className="text-gray-300 text-sm">{service.description}</p>
        </div>
      ))}
    </div>
  );
};
