// src/components/Layout/Card.tsx
interface CardProps {
  children: React.ReactNode;
}

export default function Card({ children }: CardProps) {
  return (
    <div
      className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg text-gray-800 space-y-4 flex flex-col items-center justify-center">
      {children}
    </div>
  );
}
