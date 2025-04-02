import React, { createContext, useState, useContext } from "react";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(localStorage.getItem("language") || "en");

    const toggleLanguage = () => {
        const newLanguage = language === "en" ? "ko" : "en";
        setLanguage(newLanguage);
        localStorage.setItem("language", newLanguage); // Persist language choice
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
