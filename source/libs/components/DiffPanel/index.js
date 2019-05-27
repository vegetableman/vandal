import React, { useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import './style.css';

const DiffPanel = ({ show, takeDiff }) => {
  return (
    <CSSTransition
      in={show}
      appear={true}
      mountOnEnter={true}
      unmountOnExit={true}
      classNames="vandal-diff__panel-fade"
      timeout={{ enter: 1000 }}>
      <div className="vandal-diff-panel">
        <div className="vandal-diff-panel__current">
          11th Aug, 2019 11:29:01 pm
        </div>
        <button onClick={takeDiff}>Diff</button>
      </div>
    </CSSTransition>
  );
};

export default DiffPanel;
