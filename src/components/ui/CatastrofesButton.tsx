import React from 'react';
import { Button } from '@gabihuenchu/ui-library';

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
  const getCatastrofesVariant = () => {
    switch (variant) {
      case 'primary':
        return 'primary';
      case 'secondary':
        return 'secondary';
      case 'danger':
        return 'danger';
      default:
        return 'primary';
    }
  };

  return (
    <Button
      variant={getCatastrofesVariant()}
      size={size}
      disabled={disabled}
      onClick={onClick}
      className={`catastrofes-button ${className}`}
    >
      {children}
    </Button>
  );
};

export default CatastrofesButton;
