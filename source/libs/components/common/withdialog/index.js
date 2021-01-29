import React from "react";
import _ from "lodash";

export default function withDialog(Component, { ignoreClickOnClass } = {}) {
  const componentName = Component.displayName || Component.name;

  class DialogComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = { isDialogClosed: false };
    }

    componentDidMount() {
      document.addEventListener("click", this.handleClickOutside, true);
      document.addEventListener("keydown", this.onEscape);
    }

    componentWillUnmount() {
      document.removeEventListener("click", this.handleClickOutside, true);
      document.removeEventListener("keydown", this.onEscape);
    }

    onEscape = ({ keyCode }) => {
      if (keyCode === 27) {
        this.setState({ isDialogClosed: true });
      }
    };

    handleClickOutside = (e) => {
      const path = _.toArray(e.composedPath());
      if (
        ignoreClickOnClass
        && path.some((node) => _.isElement(node) && node.matches(ignoreClickOnClass))
      ) {
        return;
      }

      if (this.dialogNode && !_.includes(path, this.dialogNode)) {
        this.setState({
          isDialogClosed: true
        });
      }
    };

    render() {
      return (
        <Component
          {...this.props}
          isDialogClosed={this.state.isDialogClosed}
          dialogRef={(el) => {
            this.dialogNode = el;
          }}
        />
      );
    }
  }

  DialogComponent.displayName = `withDialog(${componentName})`;

  return DialogComponent;
}
