import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'light' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', variant = 'dark' }) => {
  const sizeClasses = {
    small: {
      container: 'h-8',
      text: 'text-xl',
      clText: 'text-sm'
    },
    medium: {
      container: 'h-12',
      text: 'text-3xl',
      clText: 'text-lg'
    },
    large: {
      container: 'h-16',
      text: 'text-4xl',
      clText: 'text-xl'
    }
  };

  const variantClasses = {
    light: {
      mainBg: 'bg-white',
      border: 'border-verde-oscuro',
      clBg: 'bg-verde-oscuro',
      text: 'text-verde-oscuro',
      clText: 'text-white'
    },
    dark: {
      mainBg: 'bg-verde-oscuro',
      border: 'border-white',
      clBg: 'bg-verde-oliva',
      text: 'text-white',
      clText: 'text-white'
    }
  };

  const currentSize = sizeClasses[size];
  const currentVariant = variantClasses[variant];

  return (
    <div className={`flex items-center ${currentSize.container} font-bold`}>
      {/* Contenedor principal de CATÁSTROFES */}
      <div 
        className={`
          flex items-center px-3 py-1 border-2 ${currentVariant.mainBg} 
          ${currentVariant.border} ${currentVariant.text}
        `}
      >
        <span className={`${currentSize.text} tracking-tight`}>
          CATÁSTROFES
        </span>
      </div>
      
      {/* Contenedor de CL */}
      <div 
        className={`
          flex items-center px-2 py-1 ${currentVariant.clBg} 
          ${currentVariant.clText} border-l-0
        `}
      >
        <span className={`${currentSize.clText} font-semibold`}>
          CL
        </span>
      </div>
    </div>
  );
};

export default Logo;
