// components/ui/Button.jsx
export default function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
}) {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-600 text-white hover:bg-gray-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
