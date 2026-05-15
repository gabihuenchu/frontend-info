import React from 'react';
import { Card } from '@gabihuenchu/ui-library';

interface CatastrofesCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  image?: string;
  footer?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'bordered';
  className?: string;
}

const CatastrofesCard: React.FC<CatastrofesCardProps> = ({
  children,
  title,
  subtitle,
  image,
  footer,
  variant = 'default',
  className = '',
}) => {
  const getCatastrofesVariant = () => {
    switch (variant) {
      case 'default':
        return 'default';
      case 'elevated':
        return 'elevated';
      case 'bordered':
        return 'bordered';
      default:
        return 'default';
    }
  };

  return (
    <Card
      title={title}
      subtitle={subtitle}
      image={image}
      footer={footer}
      variant={getCatastrofesVariant()}
      className={`catastrofes-card ${className}`}
    >
      {children}
    </Card>
  );
};

export default CatastrofesCard;
