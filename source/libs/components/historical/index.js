/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */

import React, {
  useRef, useEffect, useState, useCallback
} from "react";
import PropTypes from "prop-types";
import { useMachine } from "@xstate/react";
import ReactTooltip from "react-tooltip";
import _ from "lodash";
import cx from "classnames";
import { CSSTransition } from "react-transition-group";
import ImageLoader from "./loader";
import CarouselView from "./carousel.view";
import {
  toTwelveHourTime,
  getDateTsFromURL,
  longMonthNames,
  trackDonate
} from "../../utils";
import { historicalDB } from "../../utils/storage";
import { VerticalMenu, Icon } from "../common";
import Progress from "./progress";
import historicalMachine, {
  fetchSnapshot,
  cleanUp
} from "./historical.machine";
import styles from "./historical.module.css";
import { useTheme, useTimeTravel } from "../../hooks";

const options = [
  {
    value: "openInVandal",
    text: "Open in Vandal"
  },
  {
    value: "openInNewTab",
    text: "Open in New Tab"
  },
  {
    value: "retry",
    text: "Retry"
  }
];

const Error = ({ err, onRetry }) => (err === "mismatch" ? (
  <div className={styles.err_container}>
    <Icon
      name="image"
      className={styles.err}
      title={err}
      width={30}
      height={30}
    />
    <div className={styles.not_found__err}>NOT FOUND</div>
  </div>
) : (
  <div className={styles.err_container}>
    <Icon name="error" className={styles.err} title={err} />
    <button
      type="button"
      className={styles.retry__btn}
      onClick={(e) => {
        e.stopPropagation();
        onRetry();
      }}
    >
      Retry
    </button>
  </div>
));

Error.propTypes = {
  err: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired
};

const Historical = ({ onClose, openURL, ...props }) => {
  const containerRef = useRef(null);
  const { theme } = useTheme();
  const { state: ttstate } = useTimeTravel();
  const [showInfoModal, toggleInfoModal] = useState(false);
  const [state, send, service] = useMachine(
    historicalMachine.withConfig(
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
        years: _.keys(_.get(ttstate, "context.sparkline")),
        snapshots: [],
        archiveURLs: [],
        isHistoricalEnabled: true
      }
    )
  );
  const { context: ctx } = state;

  const onOptionSelect = useCallback(
    (index, year) => async (option) => {
      const archiveURL = _.nth(_.get(service, "state.context.archiveURLs"), index);
      if (option === "retry") {
        service.send("SET_SNAPSHOT", { payload: { index, value: null } });
        const [snapshot, newArchiveURL] = await fetchSnapshot({
          url: props.url,
          year,
          archiveURL
        });

        if (newArchiveURL) {
          service.send("SET_ARCHIVE_URL", { payload: { index, value: newArchiveURL } });
        }
        const [data, err] = snapshot;
        service.send("SET_SNAPSHOT", { payload: { index, value: { data, err } } });
      } else if (option === "showMonths") {
        service.send("TOGGLE_MONTH_VIEW_OPEN", {
          payload: { show: true, year }
        });
      } else if (option === "openInNewTab") {
        window.open(archiveURL, "_blank");
      } else if (option === "openInVandal") {
        openURL(archiveURL);
        onClose();
      }
    },
    [openURL, onClose, props.url, service]
  );

  const getCaption = useCallback((index) => {
    if (ctx.carouselMode === "month") {
      return { title: ctx.selectedYear, date: longMonthNames[index] };
    }
    return { title: "YEAR", date: ctx.years[index] };
  }, [ctx.carouselMode, ctx.selectedYear, ctx.years]);

  const onKeyDown = useCallback((e) => {
    e.stopPropagation();
    if (e.keyCode === 27) {
      cleanUp();
      service.stop();
      onClose();
    }
  }, [onClose, service]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    if (containerRef) {
      containerRef.current.focus();
    }
    service.onStop(() => {
      cleanUp();
    });
    const loadInfo = async () => {
      const infoCount = await historicalDB.getInfo();
      if (!infoCount || _.parseInt(infoCount) > 10) {
        toggleInfoModal(true);
      } else {
        historicalDB.setInfo(_.parseInt(infoCount) + 1);
      }
    };
    loadInfo();
  }, [service]);

  useEffect(
    () => {
      if (!_.isEmpty(ctx.years)) {
        send("INIT_HISTORICAL", {
          payload: { years: ctx.years, url: props.url }
        });
      }
    },
    [props.url]
  );

  if (!!ttstate.matches("loadingSparkline") || (!ttstate.matches("sparklineError") && _.isEmpty(ctx.years))) {
    return (
      <div
        role="dialog"
        className={styles.modal__container}
        onKeyDown={onKeyDown}
        ref={containerRef}
        tabIndex="0"
      >
        <div className={styles.loading_text}>No Data Found</div>
      </div>
    );
  }

  if (!!ttstate.matches("sparklineError") || _.isEmpty(ctx.years)) {
    return (
      <div
        role="dialog"
        className={styles.modal__container}
        onKeyDown={onKeyDown}
        ref={containerRef}
        tabIndex="0"
      >
        <div className={styles.no_data_text}>No data found</div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      className={styles.modal__container}
      onKeyDown={onKeyDown}
      ref={containerRef}
      tabIndex="0"
    >
      {state.matches("historicalUnAvailable") && (
        <div className={styles.disabled__overlay}>
          <div className={styles.disabled__modal}>
            <div className={styles.disabled__cover__container}>
              <img alt="warning" src={browser.runtime.getURL("build/images/warning.png")} />
            </div>
            <div style={{ padding: "0 10px 10px 10px" }}>
              <h2 style={{ fontSize: "14px", fontWeight: 600 }}>
                Historical View is not currently operational!
              </h2>
              <p style={{ fontSize: "14px" }}>
                <i>
                  &quot;No! I am out of Power! Wish I hadn&apos;t destroyed this planet
                  and disrupted the gravitational balance in the solar
                  system.... Well, time for lunch !&quot;
                </i>
                <br />
                - Vandal
              </p>
              <span style={{ fontSize: "14px" }}>
                To know more, click
                {" "}
                <a
                  rel="noopener noreferrer"
                  target="_blank"
                  href="https://github.com/vegetableman/vandal/issues/1"
                >
                  here
                </a>
              </span>
            </div>
          </div>
        </div>
      )}
      <div role="dialog" className={styles.container} onKeyDown={onKeyDown} tabIndex="0">
        <div
          className={cx({
            [styles.year__container]: true,
            [styles.year__container__month]: ctx.isViewResized
          })}
        >
          {_.map(ctx.years, (year, index) => {
            const archiveURL = ctx.archiveURLs[index];
            const dateObj = getDateTsFromURL(archiveURL);
            const snapshot = ctx.snapshots[index];
            return (
              <div
                className={cx({
                  [styles.year]: true,
                  [styles.year__selected]: ctx.selectedYear === year
                })}
                key={year}
              >
                <div
                  role="button"
                  className={styles.body}
                  tabIndex="0"
                  onClick={() => {
                    if (!_.get(snapshot, "err")) {
                      send("TOGGLE_CAROUSEL_OPEN", {
                        payload: {
                          index,
                          mode: "year",
                          show: true,
                          images: _.map(ctx.snapshots, "data")
                        }
                      });
                    }
                  }}
                >
                  {snapshot ? (
                    <>
                      {(_.get(snapshot, "err") && (
                      <Error
                        err={_.get(snapshot, "err")}
                        onRetry={() => {
                          onOptionSelect(index, year)("retry");
                        }}
                      />
                      )) || (
                      <img
                        alt=""
                        className={styles.snapshot}
                        src={_.get(snapshot, "data")}
                      />
                      )}
                      <div className={styles.highlight} />
                      {dateObj && (
                      <div
                        className={styles.info}
                        data-for={`vandal-historical-year--info-${year}`}
                        data-tip={`${dateObj.date}, ${toTwelveHourTime(
                          dateObj.time
                        )}`}
                      >
                        i
                      </div>
                      )}
                      <ReactTooltip
                        className={styles.info__tooltip}
                        id={`vandal-historical-year--info-${year}`}
                        effect="solid"
                        place="right"
                        insecure={false}
                        type="dark"
                      />
                    </>
                  ) : (
                    <ImageLoader theme={theme} />
                  )}
                </div>
                <div className={styles.footer}>
                  <div className={styles.value}>{year}</div>
                  <VerticalMenu
                    iconClass={styles.menu__icon}
                    className={styles.menu}
                    listClass={styles.list}
                    options={options}
                    onSelect={(option) => onOptionSelect(index, year)(option)}
                  />
                </div>
              </div>
            );
          })}
          <div style={{ height: 255 }} />
        </div>
        {ctx.showCarousel && (
          <CarouselView
            images={ctx.images}
            selectedIndex={ctx.selectedIndex}
            getCaption={getCaption}
            onClose={() => {
              send("TOGGLE_CAROUSEL_CLOSE");
            }}
          />
        )}
      </div>
      <div className={styles.action__container}>
        <Icon name="close" className={styles.close} onClick={onClose} />
      </div>
      {showInfoModal ? (
        <div className={styles.info__modal__container}>
          <CSSTransition
            in
            appear
            mountOnEnter
            unmountOnExit
            classNames={{
              appear: styles.modal__appear,
              appearActive: styles.modal__appear__active,
              enter: styles.modal__enter,
              enterActive: styles.modal__enter__active,
              exit: styles.modal__exit,
              exitActive: styles.modal__exit__active
            }}
            timeout={{ enter: 1000, exit: 1000 }}
          >
            <div className={styles.info__modal}>
              <img
                alt="cover"
                className={styles.info__cover}
                src={browser.runtime.getURL("build/images/historical-cover-art.png")}
              />
              <div
                style={{
                  padding: "0 20px"
                }}
              >
                <p style={{ fontSize: 14 }}>
                  It&apos;s 3000 PA (Post Apocalypse), the cockroaches have taken
                  over. And the Zero point energy generator that could power the
                  timetravel machine has been stolen by a colony of giant
                  roaches.
                </p>
                <p style={{ fontSize: 14, marginBottom: 0 }}>
                  Resources are low.
                  {" "}
                  Fund the Internet Archive to keep Vandal running.
                </p>
              </div>
              <div className={styles.info__container}>
                <button
                  type="button"
                  className={styles.info__button}
                  onClick={() => {
                    window.open("https://archive.org/donate/?referer=vandal", "_blank");
                    toggleInfoModal(false);
                    historicalDB.setInfo(1);
                    trackDonate();
                  }}
                >
                  <span className={styles.info__button__text}>Donate</span>
                </button>
                <div
                  role="link"
                  className={styles.info__link}
                  tabIndex={0}
                  onClick={() => {
                    toggleInfoModal(false);
                    historicalDB.setInfo(1);
                  }}
                >
                  Later
                </div>
              </div>
              <h3
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#777",
                  padding: "0px 20px"
                }}
              >
                Note: The Historical View is experimental and might be disabled
                in the possible future.
              </h3>
            </div>
          </CSSTransition>
        </div>
      ) : null}
      <Progress
        total={_.size(ctx.years)}
        current={_.size(ctx.snapshots) + 1}
        show={state.matches("loadingHistorical")}
      />
    </div>
  );
};

Historical.propTypes = {
  url: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  openURL: PropTypes.func.isRequired
};

export default Historical;
