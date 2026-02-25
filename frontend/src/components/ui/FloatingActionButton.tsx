labelimport React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface FloatingActionButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
  label?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon: Icon,
  onClick,
  position,
  className = '',
  label
}) => {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  return (
    <button
      onClick={onClick}
      className={`
        fixed ${positionClasses[position]} z-50 
        w-14 h-14 rounded-full
        bg-gradient-to-r from-blue-500 to-purple-600
        text-black shadow-lg hover:shadow-xl
        transform hover:scale-110 transition-all duration-300
        flex items-center justify-center
        group
        ${className}
      `}
      title={label}
    >
      <Icon size={24} className="transition-transform group-hover:rotate-12" />
      {label && (
        <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 
                       bg-gray-900 text-black text-xs px-2 py-1 rounded
                       opacity-0 group-hover:opacity-100 transition-opacity duration-300
                       blackspace-nowrap">
          {label}
        </span>
      )}
    </button>
  );
};