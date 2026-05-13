// src/context/LanguageContext.jsx
import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const t = (key) => {
    const translations = {
      en: {
        paymentTitle: 'Make Payment',
        paymentSubtitle: 'Complete your payment information',
        payerName: "Payer's Name",
        recipientName: "Recipient's Name",
        amount: 'Amount (RWF)',
        selectChild: 'Select Child (Optional)',
        paymentCode: 'Payment Code',
        uploadProof: 'Upload Payment Proof (Screenshot)',
        requiredHelp: 'PNG, JPG files accepted',
        payNow: 'Pay Here',
        fixedCodeInfo: 'Use code: 1395770 - Name: Guy',
        loading: 'Loading...',
        success: 'Success!',
        error: 'Error occurred',
      },
      rw: {
        paymentTitle: 'Kwishyura',
        paymentSubtitle: 'Uzuzuze amakuru yishyura',
        payerName: 'Amazina y\'uwishyuye',
        recipientName: 'Amazina y\'uwishyuriwe',
        amount: 'Amafaranga (RWF)',
        selectChild: 'Hitamo umwana (Bishoboka)',
        paymentCode: 'Kode y\'ishyura',
        uploadProof: 'Shyiramo ibimenyetso byishyura',
        requiredHelp: 'PNG, JPG (PNG, JPG)',
        payNow: 'Tanga Ishuri',
        fixedCodeInfo: 'Koresha kode: 1395770 - Amazina: Guy',
        loading: 'Birimo...',
        success: 'Byakunze!',
        error: 'Habaye ikibazo',
      }
    };
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isDarkMode, setIsDarkMode }}>
      {children}
    </LanguageContext.Provider>
  );
}