import { ReactNode } from 'react';

interface TableBodyProps {
  children: ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return (
    <tbody className="divide-y divide-gray-200 bg-white [&>tr]:transition-colors [&>tr]:duration-150 [&>tr:hover]:bg-gray-50">
      {children}
    </tbody>
  );
}

export function Td({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <td className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 transition-colors duration-150 ${className}`}>
      {children}
    </td>
  );
}