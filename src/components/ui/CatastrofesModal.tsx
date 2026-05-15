import React from 'react';
import { Modal } from '@gabihuenchu/ui-library';

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
  const getCatastrofesSize = () => {
    switch (size) {
      case 'small':
        return 'small';
      case 'medium':
        return 'medium';
      case 'large':
        return 'large';
      case 'full':
        return 'full';
      default:
        return 'medium';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={getCatastrofesSize()}
      closeOnOverlayClick={closeOnOverlayClick}
      closeOnEscape={closeOnEscape}
      className={`catastrofes-modal ${className}`}
    >
      {children}
    </Modal>
  );
};

export default CatastrofesModal;
