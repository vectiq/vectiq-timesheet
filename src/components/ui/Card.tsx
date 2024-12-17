interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-6 ${className}`}>
      {children}
    </div>
  );
}