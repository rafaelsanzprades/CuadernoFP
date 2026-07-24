"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";

export const LANGUAGES = [
  { code: "ba", label: "Balear" },
  { code: "ca", label: "Català" },
  { code: "es", label: "Español" },
  { code: "eu", label: "Euskara" },
  { code: "gl", label: "Galego" },
  { code: "va", label: "Valencià" },
  { code: "en", label: "English" }
];

export function useAccessibility() {
  const { i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const [fontSizeScale, setFontSizeScale] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const savedFontSize = localStorage.getItem("a11y-font-size");
    if (savedFontSize) {
      const parsed = parseInt(savedFontSize, 10);
      setFontSizeScale(parsed);
      document.documentElement.style.fontSize = `${parsed}%`;
    }

    const savedContrast = localStorage.getItem("a11y-high-contrast") === "true";
    if (savedContrast) {
      setHighContrast(true);
      document.documentElement.classList.add("high-contrast");
    }

    const savedMotion = localStorage.getItem("a11y-reduce-motion") === "true";
    if (savedMotion) {
      setReduceMotion(true);
      document.documentElement.classList.add("reduce-motion");
    }

    const savedTts = localStorage.getItem("a11y-tts") === "true";
    if (savedTts) {
      setTtsEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (!ttsEnabled) {
      window.speechSynthesis.cancel();
      return;
    }
    function handleGlobalClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const textElement = target.closest("p, h1, h2, h3, h4, h5, h6, span, button, a, li, label, th, td") as HTMLElement | null;
      if (textElement && textElement.textContent) {
        window.speechSynthesis.cancel();
        const text = textElement.textContent.trim();
        if (text) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = "es-ES";
          window.speechSynthesis.speak(utterance);
          const originalOutline = textElement.style.outline;
          textElement.style.outline = "2px solid var(--accent-color)";
          textElement.style.outlineOffset = "2px";
          utterance.onend = () => { textElement.style.outline = originalOutline; };
          utterance.onerror = () => { textElement.style.outline = originalOutline; };
        }
      }
    }
    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, [ttsEnabled]);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
  };

  const changeFontSize = (scale: number) => {
    setFontSizeScale(scale);
    document.documentElement.style.fontSize = `${scale}%`;
    localStorage.setItem("a11y-font-size", scale.toString());
  };

  const toggleHighContrast = () => {
    const newVal = !highContrast;
    setHighContrast(newVal);
    localStorage.setItem("a11y-high-contrast", newVal.toString());
    if (newVal) document.documentElement.classList.add("high-contrast");
    else document.documentElement.classList.remove("high-contrast");
  };

  const toggleReduceMotion = () => {
    const newVal = !reduceMotion;
    setReduceMotion(newVal);
    localStorage.setItem("a11y-reduce-motion", newVal.toString());
    if (newVal) document.documentElement.classList.add("reduce-motion");
    else document.documentElement.classList.remove("reduce-motion");
  };

  const toggleTts = () => {
    const newVal = !ttsEnabled;
    setTtsEnabled(newVal);
    localStorage.setItem("a11y-tts", newVal.toString());
  };

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];
  const hasActiveA11y = fontSizeScale !== 100 || highContrast || ttsEnabled || reduceMotion;

  return {
    theme,
    setTheme,
    currentLang,
    changeLanguage,
    fontSizeScale,
    changeFontSize,
    highContrast,
    toggleHighContrast,
    reduceMotion,
    toggleReduceMotion,
    ttsEnabled,
    toggleTts,
    hasActiveA11y,
    LANGUAGES
  };
}
