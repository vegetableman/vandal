import React from 'react';
import themeStore from './theme';

const ThemeContext = React.createContext();

export default class ThemeProvider extends React.Component {
  state = {
    theme: themeStore.getState().theme
  };

  render() {
    return (
      <ThemeContext.Provider
        value={{ theme: this.state.theme, setTheme: themeStore.setTheme }}>
        <ThemeContext.Consumer>{this.props.children}</ThemeContext.Consumer>
      </ThemeContext.Provider>
    );
  }

  async componentDidMount() {
    const { theme } = await themeStore.loadTheme();
    this.setState({ theme });
    this.props.onLoad(theme);
    themeStore.subscribe(({ theme }) => {
      this.setState({ theme });
    });
  }
}
