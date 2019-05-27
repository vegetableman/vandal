import React from 'react';
import { CSSTransition } from 'react-transition-group';
import './style.css';

class Toast extends React.Component {
  render() {
    const { children, show, className = '', exit = 1000 } = this.props;
    return (
      <CSSTransition
        in={show}
        appear={true}
        mountOnEnter={true}
        unmountOnExit={true}
        classNames="vandal__toast-fade"
        timeout={{ enter: 1000, exit }}>
        <div className={`vandal__toast ${className}`}>
          <div className="vandal__toast-wrapper">{children}</div>
        </div>
      </CSSTransition>
    );
  }
}

export default Toast;
