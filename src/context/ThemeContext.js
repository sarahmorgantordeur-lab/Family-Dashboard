import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export const COLORS = {
  light: {
    background: '#F4F4FF',
    surface: '#FFFFFF',
    surfaceAlt: '#EEEEFF',
    border: '#E0E0F0',
    primary: '#5B5BD6',
    primaryLight: '#EDEDFF',
    primaryDark: '#3D3DAA',
    text: '#16163A',
    textSecondary: '#7272A0',
    textMuted: '#ABABCC',
    danger: '#E5534B',
    dangerLight: '#FFEEED',
    success: '#30A46C',
    shadow: '#5B5BD6',
    cardShadow: 'rgba(91, 91, 214, 0.08)',
  },
  dark: {
    background: '#0D0D1A',
    surface: '#16162A',
    surfaceAlt: '#1E1E38',
    border: '#2A2A4A',
    primary: '#7B7BF8',
    primaryLight: '#1E1E40',
    primaryDark: '#9B9BFF',
    text: '#EEEEFF',
    textSecondary: '#8888BB',
    textMuted: '#55557A',
    danger: '#F87171',
    dangerLight: '#2A1A1A',
    success: '#4ADE80',
    shadow: '#000',
    cardShadow: 'rgba(0, 0, 0, 0.4)',
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('@theme').then((val) => {
      if (val !== null) setIsDark(val === 'dark');
    });
  }, []);

  function toggleTheme() {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem('@theme', next ? 'dark' : 'light');
      return next;
    });
  }

  const colors = isDark ? COLORS.dark : COLORS.light;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
