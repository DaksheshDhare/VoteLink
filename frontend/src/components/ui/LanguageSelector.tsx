import React, { useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { Language } from '../../services/i18nService';
import { useTranslation } from '../../hooks/useTranslation';

export const LanguageSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentLanguage, changeLanguage, availableLanguages, t } = useTranslation();

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  const currentLang = availableLanguages.find((lang: Language) => lang.code === currentLanguage);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm 
                   rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300
                   text-black hover:text-black/80"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">
          {currentLang?.flag} {currentLang?.nativeName}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full mt-2 right-0 z-20 bg-white/95 backdrop-blur-lg 
                         rounded-2xl shadow-2xl border border-orange-200/50 min-w-64 py-2">
            <div className="px-4 py-2 text-xs font-semibold text-black/60 border-b border-gray-200">
              {t('selectLanguage')} / भाषा चुनें
            </div>
            
            {availableLanguages.map((language: Language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-orange-50 
                         transition-colors duration-200 text-left"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{language.flag}</span>
                  <div>
                    <div className="text-sm font-medium text-black">{language.nativeName}</div>
                    <div className="text-xs text-black/60">{language.name}</div>
                  </div>
                </div>
                
                {currentLanguage === language.code && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
              </button>
            ))}
            
            <div className="px-4 py-2 mt-2 text-xs text-black/60 border-t border-gray-200">
              {t('moreLanguages')}
            </div>
          </div>
        </>
      )}
    </div>
  );
};