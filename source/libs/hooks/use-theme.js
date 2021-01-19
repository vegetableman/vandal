import React, { createContext, useContext, useEffect } from 'react';
import themeMachine from '../components/app/theme.machine';
import { useMachine } from '@xstate/react';

const defaultValue = { theme: 'light', setTheme: () => {} };
const ThemeContext = createContext(defaultValue);

const ThemeProvider = ({ children, notifyThemeChanged }) => {
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const [state, send] = useMachine(
    themeMachine.withConfig(
      {
        actions: { notifyThemeChanged }
      },
      {
        theme: darkModeMediaQuery.matches ? 'dark' : 'light'
      }
    )
  );

  useEffect(() => {
    darkModeMediaQuery.addEventListener('change', (e) => {
      const darkModeOn = e.matches;
      send('SET_THEME', {
        payload: { theme: darkModeOn ? 'dark' : 'light' }
      });
    });
  }, []);

  const value = {
    theme: _.get(state, 'context.theme'),
    setTheme: (theme) => {
      send('SET_THEME', {
        payload: { theme }
      });
    }
  };
  return (
    <ThemeContext.Provider value={value}>
      {state.matches('themeLoaded') ? children : null}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === defaultValue) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export { useTheme, ThemeProvider };
