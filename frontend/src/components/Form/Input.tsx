// src/components/Form/Input.tsx
interface InputProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export default function Input({ label, type, value, onChange, placeholder }: InputProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
        style={{ color: "black" }}
        required
      />
    </div>
  );
}
