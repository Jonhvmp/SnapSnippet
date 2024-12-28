import { motion } from "framer-motion";

interface ButtonProps {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
}

export default function PrimaryButton({
  label,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      initial={{ "--x": "100%", scale: 1 }}
      animate={{ "--x": "-100%" }}
      // whileHover={{ scale: 1.05 }}
      // whileTap={{ scale: 0.95 }}
      transition={{
        repeat: Infinity,
        repeatType: "loop",
        repeatDelay: 1,
        type: "spring",
        stiffness: 20,
        damping: 15,
        mass: 2,
      }}
      className={`px-6 py-2 rounded-md relative radial-gradient focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 ${className}`}
      aria-label={label}
    >
      <span className="text-neutral-100 tracking-wide font-light h-full w-full block relative linear-mask">
        {label}
      </span>
      <span className="block absolute inset-0 rounded-md p-px linear-overlay" />
    </motion.button>
  );
}
