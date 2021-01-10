import React, { createContext, useContext, useEffect, useState } from 'react';
import { introDB } from '../utils/storage';

const IntroContext = createContext({ show: true, toggleShow: () => {} });

const IntroProvider = ({ children }) => {
  const [showIntro, toggleIntro] = useState();

  useEffect(() => {
    const loadTheme = async () => {
      const introTheme = await introDB.getIntro();
      toggleIntro(_.isUndefined(introTheme) ? true : introTheme);
    };
    loadTheme();
  }, []);

  useEffect(
    () => {
      if (!showIntro) {
        introDB.setIntro(showIntro);
      }
    },
    [showIntro]
  );

  return (
    <IntroContext.Provider value={{ showIntro, toggleIntro }}>
      {children}
    </IntroContext.Provider>
  );
};

const useIntro = () => {
  const context = useContext(IntroContext);
  return context;
};

export { useIntro, IntroProvider };
