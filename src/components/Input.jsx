const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  error,
  placeholder,
}) => {
  return (
    <div className="mb-5">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      {/* Input Field */}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border rounded-lg bg-gray-50 
        focus:outline-none focus:ring-2 transition duration-200
        ${
          error
            ? "border-red-500 focus:ring-red-400 bg-red-50"
            : "border-gray-300 focus:ring-blue-400 focus:bg-white"
        }`}
      />

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mt-1 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;