// components/ui/InputField.jsx
export default function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-200">{label}</label>
      )}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="p-2 rounded-md bg-slate-800 border border-slate-600 text-white focus:ring-2 focus:ring-blue-500"
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
