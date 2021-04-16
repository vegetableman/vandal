/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */

import React from "react";
import PropTypes from "prop-types";
import { Icon } from "../common";
import styles from "./frame.module.css";
import { trackDonate } from "../../utils";

const About = ({ toggleAbout }) => (
  <div
    role="dialog"
    className={styles.modal__container}
    onClick={(e) => {
      if (e.target && !e.target.closest("[data-parent=\"dialog\"]")) {
        toggleAbout(false);
      }
    }}
  >
    <div className={styles.modal} data-parent="dialog">
      <Icon
        name="close"
        className={styles.about__close__icon}
        onClick={() => {
          toggleAbout(false);
        }}
      />
      <div className={styles.cover}>
        <img
          alt="icon"
          className={styles.icon}
          width={90}
          height={90}
          src={chrome.runtime.getURL("build/images/icon-black.png")}
        />
        <img
          alt="logo"
          className={styles.icon__title}
          width={200}
          height={35}
          src={chrome.runtime.getURL("build/images/logo-title.png")}
        />
        <div className={styles.version}>Version 1.0.0</div>
      </div>
      <div className={styles.about}>
        <div style={{ fontSize: 14 }}>
          <div>
            Built by: Vignesh Anand
            {" "}
            <a rel="noreferrer" href="https://twitter.com/vghanand" target="_blank">
              @vghanand
            </a>
          </div>
          <div>
            Source Code:
            {" "}
            <a rel="noreferrer" href="https://github.com/vegetableman/vandal" target="_blank">
              Github
            </a>
            ,
            &nbsp;
            <a rel="noreferrer" href="https://github.com/vegetableman/vandal/issues/new/choose" target="_blank">
              Report Issue
            </a>
          </div>
          <div>
            Built using the
            {" "}
            <img alt="wayback" width={78} height={22} className={styles.wayback_logo} src={chrome.runtime.getURL("build/images/wayback.png")} />
            {" "}
            API by Internet Archive.
          </div>
        </div>
        <div className={styles.ack}>
          <p style={{ color: "#333" }}>
            The web is always changing and these changes may not be in the
            best interests of those seeking information. The
            {" "}
            <b style={{ color: "#555" }}>Internet Archive</b>
            {" "}
            is an excellent resource to navigate
            through those changing tides of thought, censorship and
            access.&nbsp;
            <a
              href="https://archive.org/donate/?referer=vandal"
              target="blank"
              onClick={() => {
                trackDonate();
              }}
            >
              Please support the Internet Archive to encourage this ongoing
              work
            </a>
            . Thank you!
          </p>
        </div>
        <div style={{ fontSize: 13 }}>
          Icons by:
          {" "}
          <a
            rel="noreferrer"
            href="https://thenounproject.com/christian_antonius/"
            target="_blank"
          >
            Christian Antonius
          </a>
          ,
          {" "}
          <a rel="noreferrer" href="https://thenounproject.com/ralfschmitzer/" target="_blank">
            Ralf Schmitzer
          </a>
          ,
          {" "}
          <a
            rel="noreferrer"
            href="https://thenounproject.com/parksunghyo126/"
            target="_blank"
          >
            Park Sung Hyo
          </a>
          ,
          <a
            rel="noreferrer"
            href="https://thenounproject.com/bhuvan.mahes/"
            target="_blank"
          >
            Bhuvan
          </a>
          ,
          <a rel="noreferrer" href="https://thenounproject.com/cosmac/" target="_blank">
            Sewon Park
          </a>
          ,
          {" "}
          <a rel="noreferrer" href="https://thenounproject.com/alfadesign/" target="_blank">
            Alfa Design
          </a>
          ,
          {" "}
          <a rel="noreferrer" href="https://thenounproject.com/emmanuelroy/" target="_blank">
            Emmanuel Roy
          </a>
          ,
          {" "}
          <a rel="noreferrer" href="https://thenounproject.com/unlimicon/" target="_blank">
            unlimicon
          </a>
          ,
          {" "}
          <a rel="noreferrer" href="https://thenounproject.com/hui_qin/" target="_blank">
            Hui Qin Ng
          </a>
          ,
          {" "}
          <a rel="noreferrer" href="https://thenounproject.com/bluetip/" target="_blank">
            Bluetip Design
          </a>
          ,
          {" "}
          <a rel="noreferrer" href="https://thenounproject.com/imicons/" target="_blank">
            iconsmind.com
          </a>
          ,
          {" "}
          <a rel="noreferrer" href="https://thenounproject.com/mikicon/" target="_blank">
            mikicon
          </a>
          ,
          {" "}
          <a
            rel="noreferrer"
            href="https://thenounproject.com/bharatkumara321"
            target="_blank"
          >
            Bharat
          </a>
          ,
          {" "}
          <a rel="noreferrer" href="https://thenounproject.com/inspign/" target="_blank">
            Aaron K. Kim
          </a>
          ,
          {" "}
          <a rel="noreferrer" href="https://thenounproject.com/iconsguru/" target="_blank">
            i cons
          </a>
        </div>
      </div>
    </div>
  </div>
);

About.propTypes = {
  toggleAbout: PropTypes.func.isRequired
};

export default About;
