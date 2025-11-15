
import React from 'react';

interface BadgeProps {
  content: React.ReactNode;
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ content, children }) => {
  return (
    <div className="relative inline-block">
      {children}
      {content ? (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-primary rounded-full">
          {content}
        </span>
      ) : null}
    </div>
  );
};

export default Badge;