/* eslint-disable jsx-a11y/click-events-have-key-events */

import React, {
  memo, useEffect, useRef, useState
} from "react";
import VirtualList from "react-tiny-virtual-list";
import PerfectScrollbar from "perfect-scrollbar";
import cx from "classnames";
import PropTypes from "prop-types";

import { toTwelveHourTime, compareProps } from "../../../utils";
import { Icon } from "..";

import styles from "./card.module.css";
import Progress from "./progress";

const SnapshotList = memo((props) => {
  const scrollContainerRef = useRef(null);

  useEffect(
    () => {
      if (!props.loadingSnapshots && scrollContainerRef && scrollContainerRef.current) {
        // const ps = new PerfectScrollbar(scrollContainerRef.current.rootNode);
        PerfectScrollbar.initialize(scrollContainerRef.current.rootNode);
      }
    },
    [props.loadingSnapshots]
  );

  return (
    <>
      {props.loadingSnapshots && <Progress />}
      {!_.isEmpty(props.snapshots) && (
        <div style={{ height: "100%" }}>
          <VirtualList
            ref={scrollContainerRef}
            width="100%"
            className={styles.scroll__container}
            height={Math.min(_.size(_.get(props, "snapshots")) * 25, 400)}
            itemCount={_.size(_.get(props, "snapshots"))}
            itemSize={25}
            renderItem={({ index, style }) => {
              const t = _.nth(_.get(props, "snapshots"), index);
              const status = _.get(t, "status");
              const value = _.get(t, "value");
              return (
                <div
                  aria-roledescription="link"
                  role="link"
                  tabIndex={0}
                  className={cx({
                    [styles.value]: true,
                    [styles.value___selected]: props.selectedTS === value
                  })}
                  key={`ts-${value}-${index}`}
                  onClick={props.onTsClick(value)}
                  style={style}
                >
                  <span>{toTwelveHourTime(_.toString(value).substr(-6))}</span>
                  {(status === 301 || status === 302) && (
                    <Icon
                      className={cx({
                        [styles.redirectIcon]: true,
                        [styles.redirectIcon___active]:
                          props.redirectTSCollection
                          && value
                            === props.redirectTSCollection[props.redirectedTS]
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
    </>
  );
}, compareProps(["snapshots", "loadingSnapshots", "selectedTS", "redirectedTS", "redirectTSCollection"]));

SnapshotList.propTypes = {
  loadingSnapshots: PropTypes.bool.isRequired
};

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
    loadingSnapshots,
    snapshotsError,
    cancelLoadSnapshots,
    retry,
    __CACHED__
  } = props;

  useEffect(
    () => {
      if (_.isNull(showCard)) return;

      if (showCard) {
        if (!__CACHED__ && _.isEmpty(ts)) {
          loadSnaphots(
            `${year}${_.padStart(month, 2, "0")}${_.padStart(day, 2, "0")}`
          );
        } else {
          abort();
        }
      } else {
        cancelLoadSnapshots();
      }
    },
    [__CACHED__, abort, cancelLoadSnapshots, day, loadSnaphots, month, showCard, ts, year]
  );

  if (!showCard) {
    return null;
  }

  return (
    <div
      className={cx({
        [styles.card]: true,
        [styles.card___empty]: _.isEmpty(ts),
        [styles.card___redirect]: _.some(
          ts,
          (t) => _.indexOf([301, 302], _.get(t, "status")) > -1
            || _.get(t, "status") > 400
        )
      })}
      style={{ transform: `translate(${x}px, ${y}px)` }}
      onMouseLeave={onCardLeave}
    >
      {snapshotsError ? (
        <button type="button" className={styles.retry__btn} onClick={retry}>
          Retry
        </button>
      ) : null}
      <SnapshotList
        loadingSnapshots={loadingSnapshots || (!__CACHED__ && _.isEmpty(ts))}
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
}, compareProps(["day", "x", "y", "ts", "tsCount", "year", "selectedTS", "redirectedTS", "redirectTSCollection", "__CACHED__", "showCard", "loadingSnapshots"]));

let cardInterpreter;
const CardContainer = memo((props) => {
  const [cardState, setCardState] = useState(
    _.get(props, "cardRef.state.context", {})
  );
  const loadSnaphots = (date) => {
    props.cardRef.send("LOAD_SNAPSHOTS", {
      payload: {
        url: props.url,
        date
      }
    });
  };
  const debouncedLoadSnapshots = useRef(_.debounce(loadSnaphots, 1000));

  useEffect(
    () => {
      if (!props.cardRef) return;
      cardInterpreter = props.cardRef.onTransition((state) => {
        if (state.changed) {
          setCardState({
            ...state.context.card,
            ...{
              loadingSnapshots: state.matches("loadingSnapshots"),
              snapshotsError:
                state.matches("snapshotsError.rejected")
                || state.matches("snapshotsError.timeout"),
              url: props.url,
              showCard: state.context.showCard,
              onTsClick: props.onTsClick,
              onCardLeave: () => {
                props.cardRef.send("HIDE_CARD");
                props.onCardLeave();
              }
            }
          });
        }
      });
    },
    [props, props.cardRef]
  );

  useEffect(() => {
    if (cardInterpreter) {
      cardInterpreter.start();
    }
    return () => {
      if (cardInterpreter) {
        cardInterpreter.stop();
      }
    };
  }, []);

  return (
    <Card
      {...cardState}
      ts={_.get(cardState, "ts")}
      selectedTS={props.selectedTS}
      redirectedTS={props.redirectedTS}
      redirectTSCollection={props.redirectTSCollection}
      loadSnaphots={debouncedLoadSnapshots.current}
      cancelLoadSnapshots={() => {
        debouncedLoadSnapshots.current.cancel();
      }}
      retry={() => {
        props.cardRef.send("RETRY");
      }}
      abort={() => {
        props.cardRef.send("CLEANUP");
      }}
    />
  );
}, compareProps(["cardRef", "url", "selectedTS", "redirectedTS", "redirectTSCollection"]));

CardContainer.propTypes = {
  cardRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  url: PropTypes.string.isRequired,
  onCardLeave: PropTypes.func.isRequired,
  onTsClick: PropTypes.func.isRequired
};

Card.defaultProps = {
  ts: [],
  onCardEnter: () => {},
  onCardLeave: () => {},
  onCardMove: () => {},
  selectedTS: null
};

export default CardContainer;
