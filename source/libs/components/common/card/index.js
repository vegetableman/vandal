import React, { memo, useEffect, useRef, useState } from 'react';
import VirtualList from 'react-tiny-virtual-list';
import PerfectScrollbar from 'perfect-scrollbar';
import cx from 'classnames';

import { toTwelveHourTime, compareProps } from '../../../utils';
import { Icon } from '..';

import styles from './card.module.css';
import Progress from './progress';

const CardList = memo((props) => {
  const scrollContainerRef = useRef(null);

  useEffect(
    () => {
      if (scrollContainerRef && scrollContainerRef.current) {
        new PerfectScrollbar(scrollContainerRef.current.rootNode);
      }
    },
    [props.loadingSnapshots]
  );

  return (
    <React.Fragment>
      {props.loadingSnapshots && <Progress />}
      {!_.isEmpty(props.snapshots) && (
        <div style={{ height: '100%' }}>
          <VirtualList
            ref={scrollContainerRef}
            width={'100%'}
            className={styles.scroll__container}
            height={Math.min(_.size(_.get(props, 'snapshots')) * 25, 400)}
            itemCount={_.size(_.get(props, 'snapshots'))}
            itemSize={25}
            renderItem={({ index, style }) => {
              const t = _.nth(_.get(props, 'snapshots'), index);
              const status = _.get(t, 'status');
              const value = _.get(t, 'value');
              return (
                <div
                  className={cx({
                    [styles.value]: true,
                    [styles.value___selected]: props.selectedTS === value
                  })}
                  key={`ts-${value}-${index}`}
                  onClick={props.onTsClick(value)}
                  style={style}>
                  <span>{toTwelveHourTime(_.toString(value).substr(-6))}</span>
                  {(status === 301 || status === 302) && (
                    <Icon
                      className={cx({
                        [styles.redirectIcon]: true,
                        [styles.redirectIcon___active]:
                          props.redirectTSCollection &&
                          value ===
                            props.redirectTSCollection[props.redirectedTS]
                      })}
                      name="redirect"
                      width={10}
                    />
                  )}
                  {status > 400 && (
                    <Icon
                      className={styles.errorIcon}
                      name="error"
                      title="Error"
                      width={10}
                    />
                  )}
                </div>
              );
            }}
          />
        </div>
      )}
    </React.Fragment>
  );
}, compareProps(['snapshots', 'loadingSnapshots', 'selectedTS', 'redirectedTS', 'redirectTSCollection']));

const Card = memo((props) => {
  const {
    day,
    month,
    ts,
    x,
    y,
    year,
    onCardLeave,
    showCard,
    onTsClick,
    selectedTS,
    redirectedTS,
    redirectTSCollection,
    loadSnaphots,
    abort,
    isLoadingSnapshots,
    __CACHED__
  } = props;

  if (!showCard) {
    return null;
  }

  useEffect(
    () => {
      abort();
      if (!__CACHED__ && _.isEmpty(ts)) {
        loadSnaphots(
          `${year}${_.padStart(month, 2, '0')}${_.padStart(day, 2, '0')}`
        );
      }
    },
    [ts]
  );

  return (
    <div
      className={cx({
        [styles.card]: true,
        [styles.card___empty]: _.isEmpty(ts),
        [styles.card___redirect]: _.some(
          ts,
          (t) =>
            _.indexOf([301, 302], _.get(t, 'status')) > -1 ||
            _.get(t, 'status') > 400
        )
      })}
      style={{ transform: `translate(${x}px, ${y}px)` }}
      onMouseLeave={onCardLeave}>
      <CardList
        loadingSnapshots={isLoadingSnapshots}
        snapshots={ts}
        selectedTS={selectedTS}
        redirectedTS={redirectedTS}
        redirectTSCollection={redirectTSCollection}
        onTsClick={onTsClick}
        day={day}
        month={month}
        year={year}
      />
    </div>
  );
}, compareProps(['day', 'x', 'y', 'ts', 'tsCount', 'year', 'selectedTS', 'redirectedTS', 'redirectTSCollection', '__CACHED__', 'showCard', 'isLoadingSnapshots']));

const CardContainer = memo((props) => {
  const [cardState, setCardState] = useState(
    _.get(props, 'cardRef.state.context', {})
  );

  useEffect(
    () => {
      props.cardRef.onTransition((state) => {
        if (state.changed) {
          console.log('card state:', state);
          setCardState({
            ...state.context.card,
            ...{
              isLoadingSnapshots: state.matches('loadingSnapshots'),
              url: props.url,
              showCard: state.context.showCard,
              onTsClick: props.onTsClick,
              onCardLeave: () => {
                props.cardRef.send('HIDE_CARD');
                props.onCardLeave();
              }
            }
          });
        }
      });
    },
    [_.get(props, 'cardRef')]
  );

  return (
    <Card
      {...cardState}
      selectedTS={props.selectedTS}
      redirectedTS={props.redirectedTS}
      redirectTSCollection={props.redirectTSCollection}
      loadSnaphots={(date) => {
        props.cardRef.send('LOAD_SNAPSHOTS', {
          payload: {
            url: props.url,
            date
          }
        });
      }}
      abort={() => {
        props.cardRef.send('CLEANUP');
      }}
    />
  );
}, compareProps(['cardRef', 'url', 'selectedTS', 'redirectedTS', 'redirectTSCollection']));

Card.defaultProps = {
  ts: [],
  onCardEnter: () => {},
  onCardLeave: () => {},
  onCardMove: () => {}
};

export default CardContainer;
