import React from 'react';
import { Icon } from '../common';
import styles from './frame.module.css';

const About = ({ toggleAbout }) => {
  return (
    <div
      className={styles.modal__container}
      onClick={(e) => {
        if (e.target && !e.target.closest('[data-parent="dialog"]')) {
          toggleAbout(false);
        }
      }}>
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
            className={styles.icon}
            src={chrome.runtime.getURL('images/icon-black.png')}
          />
          <img
            className={styles.icon__title}
            src={chrome.runtime.getURL('images/logo-title.png')}
          />
          <div className={styles.version}>Version 1.0.0</div>
        </div>
        <div className={styles.about}>
          <div style={{ fontSize: 14 }}>
            <div>
              Created by: Vignesh Anand{' '}
              <a href="https://twitter.com/vgnanand" target="_blank">
                @vgnanand
              </a>
            </div>
            <div>
              Built using the{' '}
              <Icon name="archive" className={styles.archive__icon} />{' '}
              <b>Internet Archive</b> API.
            </div>
            <div>
              Source Code:{' '}
              <a href="https://github.com/vegetableman/vandal" target="_blank">
                Github
              </a>
            </div>
          </div>
          <div className={styles.ack}>
            <p style={{ color: '#333333' }}>
              The web is always changing and these changes may not be in the
              best interests of those seeking information. The{' '}
              <b>Internet Archive</b> is an excellent resource to navigate
              through those changing tides of thought, censorship and
              access.&nbsp;
              <a
                href="https://archive.org/donate/?ref=vandal"
                target="blank"
                style={{ fontWeight: 'bold' }}>
                Please support the Internet Archive to encourage this ongoing
                work
              </a>. Thank you!
            </p>
          </div>
          <div style={{ fontSize: 13 }}>
            Icons by:{' '}
            <a
              href="https://thenounproject.com/christian_antonius/"
              target="_blank">
              Christian Antonius
            </a>,{' '}
            <a href="https://thenounproject.com/ralfschmitzer/" target="_blank">
              Ralf Schmitzer
            </a>,{' '}
            <a
              href="https://thenounproject.com/parksunghyo126/"
              target="_blank">
              Park Sung Hyo
            </a>,<a
              href="https://thenounproject.com/bhuvan.mahes/"
              target="_blank">
              Bhuvan
            </a>
            <a href="https://thenounproject.com/cosmac/" target="_blank">
              Sewon Park
            </a>,{' '}
            <a href="https://thenounproject.com/alfadesign/" target="_blank">
              Alfa Design
            </a>,{' '}
            <a href="https://thenounproject.com/emmanuelroy/" target="_blank">
              Emmanuel Roy
            </a>,{' '}
            <a href="https://thenounproject.com/unlimicon/" target="_blank">
              unlimicon
            </a>,{' '}
            <a href="https://thenounproject.com/hui_qin/" target="_blank">
              Hui Qin Ng
            </a>,{' '}
            <a href="https://thenounproject.com/bluetip/" target="_blank">
              Bluetip Design
            </a>,{' '}
            <a href="https://thenounproject.com/imicons/" target="_blank">
              iconsmind.com
            </a>,{' '}
            <a href="https://thenounproject.com/mikicon/" target="_blank">
              mikicon
            </a>,{' '}
            <a
              href="https://thenounproject.com/bharatkumara321"
              target="_blank">
              Bharat
            </a>,{' '}
            <a href="https://thenounproject.com/inspign/" target="_blank">
              Aaron K. Kim
            </a>,{' '}
            <a href="https://thenounproject.com/iconsguru/" target="_blank">
              i cons
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
