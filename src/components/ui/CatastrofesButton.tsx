import React from 'react';

interface CatastrofesButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

const CatastrofesButton: React.FC<CatastrofesButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  className = '',
}) => {
  const getCatastrofesVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'btn-primary';
      case 'secondary':
        return 'btn-secondary';
      case 'danger':
        return 'btn-danger';
      default:
        return 'btn-primary';
    }
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`catastrofes-button ${getCatastrofesVariantClass()} catastrofes-button--${size} ${className}`.trim()}
    >
      {children}
    </button>
  );
};

export default CatastrofesButton;
