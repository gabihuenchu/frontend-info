import React, { useEffect } from 'react';

interface CatastrofesModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

const CatastrofesModal: React.FC<CatastrofesModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'medium',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
}) => {
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeOnEscape, isOpen, onClose]);

  const getCatastrofesSizeClass = () => {
    switch (size) {
      case 'small':
        return 'catastrofes-modal--small';
      case 'medium':
        return 'catastrofes-modal--medium';
      case 'large':
        return 'catastrofes-modal--large';
      case 'full':
        return 'catastrofes-modal--full';
      default:
        return 'catastrofes-modal--medium';
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="catastrofes-modal__overlay" onClick={closeOnOverlayClick ? onClose : undefined}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`catastrofes-modal ${getCatastrofesSizeClass()} ${className}`.trim()}
        onClick={(event) => event.stopPropagation()}
      >
        {title && <header className="catastrofes-modal__header"><h2>{title}</h2></header>}
        <div className="catastrofes-modal__body">{children}</div>
      </div>
    </div>
  );
};

export default CatastrofesModal;
