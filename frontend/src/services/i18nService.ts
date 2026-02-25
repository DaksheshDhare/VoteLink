export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const supportedLanguages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'ma', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' }
];

export const translations = {
  en: {
    // Landing Page
    title: 'VoteLink',
    subtitle: 'Secure, Transparent, and Accessible Digital Voting Platform',
    startVoting: 'Start Voting',
    learnMore: 'Learn More',
    whyChoose: 'Why Choose VoteLink?',
    howItWorks: 'How VoteLink Works',
    securityTransparency: 'Security & Transparency',
    
    // Features
    secureVoting: 'Secure Voting',
    secureVotingDesc: 'End-to-end encryption with biometric verification ensures your vote is protected',
    transparentProcess: 'Transparent Process',
    transparentProcessDesc: 'Real-time monitoring and audit trails for complete transparency',
    accessibleDesign: 'Accessible Design',
    accessibleDesignDesc: 'Full accessibility support for voters with disabilities',
    remoteVoting: 'Remote Voting',
    remoteVotingDesc: 'Vote securely from anywhere with proper identity verification',
    
    // Authentication
    loginTitle: 'Login to VoteLink',
    loginSubtitle: 'Your Secure Digital Voting Platform',
    emailLabel: 'Email Address',
    emailPlaceholder: 'Enter your email',
    mobileLabel: 'Mobile Number',
    mobilePlaceholder: 'Enter your mobile number',
    continueGoogle: 'Continue with Google',
    demoMode: 'Demo Mode (Skip Auth)',
    
    // Voting Steps
    registerVerify: 'Register & Verify',
    registerVerifyDesc: 'Upload your Voter ID and complete identity verification',
    authentication: 'Authentication',
    authenticationDesc: 'Multi-factor authentication with OTP verification',
    castVote: 'Cast Your Vote',
    castVoteDesc: 'Select your candidate and confirm your choice',
    verificationReceipt: 'Verification Receipt',
    verificationReceiptDesc: 'Get your digital voting certificate',
    
    // Instructions
    votingInstructions: 'Voting Instructions',
    instructionsSubtitle: 'Please read carefully before proceeding to vote',
    votingRules: 'Voting Rules',
    voteSecrecy: 'Vote Secrecy',
    securityGuidelines: 'Security Guidelines',
    accessibilitySupport: 'Accessibility Support',
    proceedToVoting: 'Proceed to Voting',
    
    // Voting Interface
    selectParty: 'Select Your Political Party',
    selectPartyDesc: 'Choose your preferred political party by clicking on their card. Review your selection carefully before casting your vote.',
    confirmVote: 'Confirm Your Vote',
    reviewSelection: 'Please review your selection carefully',
    importantNotice: 'Important Notice:',
    cannotUndo: 'This action cannot be undone. You will only be able to vote once.',
    cancel: 'Cancel',
    
    // Common
    voter: 'Voter',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    next: 'Next',
    back: 'Back',
    submit: 'Submit',
    confirm: 'Confirm',
    
    // Language selector
    selectLanguage: 'Select Language',
    moreLanguages: 'More languages coming soon...',
    
    // Help & Support
    needHelp: 'Need Help?',
    needHelpDesc: 'We\'re here to assist you throughout the voting process',
    voterHelpline: 'Voter Helpline',
    voterHelplineDesc: 'Call our 24/7 support helpline for immediate assistance',
    accessibilityHelpline: 'Accessibility Support',
    accessibilityHelplineDesc: 'Specialized assistance for voters with disabilities',
    onlineSupport: 'Online Support',
    onlineSupportDesc: 'Live chat support and comprehensive FAQ'
  },
  
  hi: {
    // Landing Page
    title: 'वोटलिंक',
    subtitle: 'सुरक्षित, पारदर्शी और सुलभ डिजिटल मतदान मंच',
    startVoting: 'मतदान शुरू करें',
    learnMore: 'और जानें',
    whyChoose: 'वोटलिंक क्यों चुनें?',
    howItWorks: 'वोटलिंक कैसे काम करता है',
    securityTransparency: 'सुरक्षा और पारदर्शिता',
    
    // Features
    secureVoting: 'सुरक्षित मतदान',
    secureVotingDesc: 'बायोमेट्रिक सत्यापन के साथ एंड-टू-एंड एन्क्रिप्शन आपके वोट की सुरक्षा सुनिश्चित करता है',
    transparentProcess: 'पारदर्शी प्रक्रिया',
    transparentProcessDesc: 'पूर्ण पारदर्शिता के लिए रीयल-टाइम निगरानी और ऑडिट ट्रेल्स',
    accessibleDesign: 'सुलभ डिज़ाइन',
    accessibleDesignDesc: 'विकलांग मतदाताओं के लिए पूर्ण पहुंच सहायता',
    remoteVoting: 'रिमोट वोटिंग',
    remoteVotingDesc: 'उचित पहचान सत्यापन के साथ कहीं से भी सुरक्षित रूप से वोट करें',
    
    // Authentication
    loginTitle: 'वोटलिंक में लॉगिन करें',
    loginSubtitle: 'आपका सुरक्षित डिजिटल मतदान मंच',
    emailLabel: 'ईमेल पता',
    emailPlaceholder: 'अपना ईमेल दर्ज करें',
    mobileLabel: 'मोबाइल नंबर',
    mobilePlaceholder: 'अपना मोबाइल नंबर दर्ज करें',
    continueGoogle: 'गूगल के साथ जारी रखें',
    demoMode: 'डेमो मोड (प्रमाणीकरण छोड़ें)',
    
    // Voting Steps
    registerVerify: 'पंजीकरण और सत्यापन',
    registerVerifyDesc: 'अपनी वोटर आईडी अपलोड करें और पहचान सत्यापन पूरा करें',
    authentication: 'प्रमाणीकरण',
    authenticationDesc: 'ओटीपी सत्यापन के साथ बहु-कारक प्रमाणीकरण',
    castVote: 'अपना वोट डालें',
    castVoteDesc: 'अपने उम्मीदवार का चयन करें और अपनी पसंद की पुष्टि करें',
    verificationReceipt: 'सत्यापन रसीद',
    verificationReceiptDesc: 'अपना डिजिटल मतदान प्रमाणपत्र प्राप्त करें',
    
    // Instructions
    votingInstructions: 'मतदान निर्देश',
    instructionsSubtitle: 'कृपया मतदान के लिए आगे बढ़ने से पहले ध्यान से पढ़ें',
    votingRules: 'मतदान नियम',
    voteSecrecy: 'वोट गुप्तता',
    securityGuidelines: 'सुरक्षा दिशानिर्देश',
    accessibilitySupport: 'पहुंच सहायता',
    proceedToVoting: 'मतदान के लिए आगे बढ़ें',
    
    // Voting Interface
    selectParty: 'अपनी राजनीतिक पार्टी का चयन करें',
    selectPartyDesc: 'उनके कार्ड पर क्लिक करके अपनी पसंदीदा राजनीतिक पार्टी चुनें। अपना वोट डालने से पहले अपने चयन की सावधानीपूर्वक समीक्षा करें।',
    confirmVote: 'अपने वोट की पुष्टि करें',
    reviewSelection: 'कृपया अपने चयन की सावधानीपूर्वक समीक्षा करें',
    importantNotice: 'महत्वपूर्ण सूचना:',
    cannotUndo: 'इस कार्य को पूर्ववत नहीं किया जा सकता। आप केवल एक बार वोट कर सकेंगे।',
    cancel: 'रद्द करें',
    
    // Common
    voter: 'मतदाता',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    next: 'अगला',
    back: 'वापस',
    submit: 'जमा करें',
    confirm: 'पुष्टि करें',
    
    // Language selector
    selectLanguage: 'भाषा चुनें',
    moreLanguages: 'और भाषाएं जल्द ही आने वाली हैं...',
    
    // Help & Support
    needHelp: 'मदद चाहिए?',
    needHelpDesc: 'हम पूरी मतदान प्रक्रिया के दौरान आपकी सहायता के लिए यहाँ हैं',
    voterHelpline: 'मतदाता हेल्पलाइन',
    voterHelplineDesc: 'तत्काल सहायता के लिए हमारी 24/7 सहायता हेल्पलाइन पर कॉल करें',
    accessibilityHelpline: 'पहुंच सहायता',
    accessibilityHelplineDesc: 'विकलांग मतदाताओं के लिए विशेष सहायता',
    onlineSupport: 'ऑनलाइन सहायता',
    onlineSupportDesc: 'लाइव चैट सहायता और व्यापक FAQ'
  }
};

export class I18nService {
  private currentLanguage: string = 'en';
  private translations = translations;

  setLanguage(languageCode: string) {
    if (this.translations[languageCode as keyof typeof translations]) {
      this.currentLanguage = languageCode;
      localStorage.setItem('selectedLanguage', languageCode);
      document.documentElement.lang = languageCode;
      
      // Update document direction for RTL languages if needed
      const rtlLanguages = ['ar', 'ur', 'he'];
      document.documentElement.dir = rtlLanguages.includes(languageCode) ? 'rtl' : 'ltr';
      
      // Dispatch event to notify all components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: languageCode } }));
      }
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  getTranslation(key: string): string {
    const langTranslations = this.translations[this.currentLanguage as keyof typeof translations];
    return langTranslations?.[key as keyof typeof langTranslations] || key;
  }

  getSupportedLanguages() {
    return supportedLanguages;
  }

  initializeLanguage() {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    const browserLanguage = navigator.language.split('-')[0];
    const defaultLanguage = savedLanguage || 
      (this.translations[browserLanguage as keyof typeof translations] ? browserLanguage : 'en');
    
    this.setLanguage(defaultLanguage);
  }
}

export const i18nService = new I18nService();