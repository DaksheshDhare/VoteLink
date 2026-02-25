import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

export const LanguageDemo: React.FC = () => {
  const { t, currentLanguage } = useTranslation();

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 m-4 border border-orange-200">
      <h3 className="text-lg font-bold text-black mb-2">Language Test</h3>
      <p className="text-sm text-gray-600 mb-2">Current: {currentLanguage}</p>
      <div className="space-y-1 text-sm">
        <p><strong>Title:</strong> {t('title')}</p>
        <p><strong>Subtitle:</strong> {t('subtitle')}</p>
        <p><strong>Start Voting:</strong> {t('startVoting')}</p>
        <p><strong>Learn More:</strong> {t('learnMore')}</p>
      </div>
    </div>
  );
};