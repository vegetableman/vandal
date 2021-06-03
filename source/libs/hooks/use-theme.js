import React, { createContext, useContext, useEffect } from "react";
import PropTypes from "prop-types";
import { useMachine } from "@xstate/react";
import themeMachine from "../components/app/theme.machine";

const defaultValue = { theme: "light", setTheme: () => {} };
const ThemeContext = createContext(defaultValue);
const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

const ThemeProvider = ({ children, notifyThemeChanged }) => {
  const [state, send] = useMachine(
    themeMachine.withConfig(
      {
        actions: { notifyThemeChanged }
      },
      {
        theme: darkModeMediaQuery.matches ? "dark" : "light"
      }
    )
  );

  const onThemeChange = (e) => {
    const darkModeOn = e.matches;
    send("SET_THEME", {
      payload: { theme: darkModeOn ? "dark" : "light" }
    });
  };

  useEffect(() => {
    darkModeMediaQuery.addEventListener("change", onThemeChange);
    return () => {
      darkModeMediaQuery.removeEventListener(onThemeChange);
    };
  }, []);

  const value = {
    theme: _.get(state, "context.theme"),
    setTheme: (theme) => {
      send("SET_THEME", {
        payload: { theme }
      });
    }
  };
  return (
    <ThemeContext.Provider value={value}>
      {state.matches("themeLoaded") ? children : null}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.element.isRequired,
  notifyThemeChanged: PropTypes.func.isRequired
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === defaultValue) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export { useTheme, ThemeProvider };
