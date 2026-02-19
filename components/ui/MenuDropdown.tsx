import React, { useEffect, useRef } from 'react';

interface MenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const MenuDropdown: React.FC<MenuDropdownProps> = ({ isOpen, onClose, children }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-zinc-800 rounded-md shadow-lg border border-zinc-200 dark:border-zinc-700 py-1 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-left"
    >
      {children}
    </div>
  );
};

interface MenuItemProps {
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
}

export const MenuItem: React.FC<MenuItemProps> = ({ onClick, children, icon, shortcut, disabled }) => {
  return (
    <button
      onClick={(e) => {
        if (disabled) return;
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between group
        ${disabled
          ? 'text-zinc-400 cursor-not-allowed'
          : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700'
        }`}
    >
      <div className="flex items-center gap-2">
        {icon && <span className="w-4 h-4 flex items-center justify-center text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-zinc-200">{icon}</span>}
        <span>{children}</span>
      </div>
      {shortcut && <span className="text-xs text-zinc-400">{shortcut}</span>}
    </button>
  );
};