import React from 'react';
import { useI18n } from '../i18n/LanguageContext';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: 'default' | 'white';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = 'default',
}) => {
  const { t } = useI18n();
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Branded Vector Icon: Navy Location Pin with House Roof & Orange Magnifying Handle */}
      <div className={`relative ${iconSizes[size]} flex-shrink-0 drop-shadow-sm`}>
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
          {/* Saffron/Orange Magnifier Handle */}
          <path
            d="M62 62 L82 82 C85 85 89 85 91 83 C94 80 94 76 91 73 L72 54 Z"
            fill="#ff9827"
            stroke="#ff9827"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Main Navy Location Pin / Lens Circle */}
          <path
            d="M50 8 C30 8 14 24 14 44 C14 62 45 86 48 88.5 C49.2 89.4 50.8 89.4 52 88.5 C55 86 86 62 86 44 C86 24 70 8 50 8 Z"
            fill="#002044"
          />
          {/* White Inner Negative Space Circle */}
          <circle cx="50" cy="44" r="24" fill="#ffffff" />
          {/* Navy House Roof Cutout Inside Lens */}
          <path
            d="M50 28 L66 42 L60 42 L60 56 L40 56 L40 42 L34 42 Z"
            fill="#002044"
          />
          {/* House Chimney */}
          <rect x="58" y="32" width="4" height="7" fill="#002044" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col select-none">
          <div className={`font-extrabold tracking-tight leading-none ${textSizes[size]}`}>
            <span className={textColor === 'white' ? 'text-white' : 'text-[#002044]'}>
              Find
            </span>
            <span className="text-[#ff9827]">
              Ndap
            </span>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-widest -mt-0.5 ${textColor === 'white' ? 'text-blue-200' : 'text-[#8e4f00]'}`}>
            {t('brand.tagline')}
          </span>
        </div>
      )}
    </div>
  );
};
