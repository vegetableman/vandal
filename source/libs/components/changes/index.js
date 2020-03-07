import React, { useEffect, useRef } from 'react';
import { useMachine } from '@xstate/react';
import styles from './changes.module.css';
import ChangeMachine from './changes.machine';
import { Icon } from '../common';

const Grid = () => {
  return (
    <svg width="100%" height="100%">
      <defs>
        <pattern
          id="small-grid"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" className={styles.gridLines__small} />
        </pattern>
        <pattern
          id="grid"
          width="100"
          height="100"
          patternUnits="userSpaceOnUse"
          patternTransform="translate(0,0)">
          <rect width="100" height="100" fill="url(#small-grid)" />
          <path d="M 100 0 L 0 0 0 100" className={styles.gridLines} />
        </pattern>
      </defs>
      <rect
        className={styles.background__grid}
        width="100%"
        height="100%"
        fill="url(#grid)"></rect>
      <g transform="translate(0,0) scale(1)"></g>
    </svg>
  );
};

const Changes = props => {
  const containerRef = useRef(null);

  const [state, send] = useMachine(
    ChangeMachine.withConfig(
      {
        actions: {
          notifyCarouselClose() {
            if (containerRef) {
              containerRef.current.focus();
            }
          }
        }
      },
      {
        url: props.url,
        years: props.years
      }
    )
  );

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    if (containerRef) {
      containerRef.current.focus();
    }
  }, []);

  const onKeyDown = e => {
    if (e.keyCode === 27) {
      props.onClose();
    }
  };

  // const years = [
  //   {
  //     year: "2019",
  //     values: [{color: "", weight: 0, ts: []}, {color: "", weight: 0, ts:[]}, {color: "", weight: 0, ts:[]}]
  //   }
  // ]

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    if (containerRef) {
      containerRef.current.focus();
    }
    send('LOAD_CHANGES');
    return () => {
      send('CLEANUP');
    };
  }, []);

  return (
    <div
      className={styles.modal__container}
      onKeyDown={onKeyDown}
      ref={containerRef}
      tabIndex="0">
      <div className={styles.container} onKeyDown={onKeyDown} tabIndex="0">
        <Grid />
      </div>
      <div className={styles.misc__container}>
        <Icon name="close" className={styles.close} onClick={props.onClose} />
      </div>
    </div>
  );
};

export default Changes;
