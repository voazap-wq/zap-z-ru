
import React from 'react';

interface AvatarProps {
  name: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ name, className = '' }) => {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };

  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 
      'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'
    ];
    return colors[Math.abs(hash) % colors.length];
  };
  
  const initials = getInitials(name).toUpperCase();
  const colorClass = getAvatarColor(name);

  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${colorClass} ${className}`}>
      {initials}
    </div>
  );
};

export default Avatar;