import React from 'react';

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
  const getCatastrofesVariantClass = () => {
    switch (variant) {
      case 'default':
        return 'catastrofes-card--default';
      case 'elevated':
        return 'catastrofes-card--elevated';
      case 'bordered':
        return 'catastrofes-card--bordered';
      default:
        return 'catastrofes-card--default';
    }
  };

  return (
    <div className={`catastrofes-card ${getCatastrofesVariantClass()} ${className}`.trim()}>
      {image && <img className="catastrofes-card__image" src={image} alt={title ?? 'Card image'} />}
      {(title || subtitle) && (
        <div className="catastrofes-card__header">
          {title && <h3 className="catastrofes-card__title">{title}</h3>}
          {subtitle && <p className="catastrofes-card__subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="catastrofes-card__body">{children}</div>
      {footer && <div className="catastrofes-card__footer">{footer}</div>}
    </div>
  );
};

export default CatastrofesCard;
