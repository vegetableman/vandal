/* eslint-disable react/forbid-prop-types */

import React from "react";
import PropTypes from "prop-types";
import Slider from "react-slick";
import cx from "classnames";
import Icon from "../icon";
import styles from "./carousel.module.css";
import "./style.css";

const NextArrow = ({ className, style, onClick }) => (
  <Icon
    name="arrowRight"
    style={{ ...style }}
    onClick={onClick}
    className={cx({
      [className]: true,
      [styles.right__arrow]: true
    })}
  />
);

NextArrow.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,
  onClick: PropTypes.func
};

NextArrow.defaultProps = {
  style: null,
  onClick: () => {},
  className: null
};

const PrevArrow = ({ className, style, onClick }) => (
  <Icon
    name="arrowLeft"
    style={{ ...style }}
    onClick={onClick}
    className={cx({
      [className]: true,
      [styles.left__arrow]: true
    })}
  />
);

PrevArrow.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,
  onClick: PropTypes.func
};

PrevArrow.defaultProps = {
  style: null,
  onClick: () => {},
  className: null
};

const settings = {
  dots: false,
  infinite: true,
  speed: 250,
  slidesToShow: 1,
  slidesToScroll: 1,
  nextArrow: <NextArrow />,
  prevArrow: <PrevArrow />
};

class Carousel extends React.Component {
  slideNext() {
    this.sliderRef.slickNext();
  }

  slidePrev() {
    this.sliderRef.slickPrev();
  }

  render() {
    const { images, selectedIndex = 0 } = this.props;

    return (
      <Slider
        {...settings}
        afterChange={(index) => {
          this.props.onChange(index);
        }}
        ref={(_ref) => {
          this.sliderRef = _ref;
        }}
        initialSlide={selectedIndex}
      >
        {_.map(images, (src, index) => (
          <div key={index} className={styles.slide}>
            {src ? <img alt="snapshot" src={src} /> : null}
          </div>
        ))}
      </Slider>
    );
  }
}

Carousel.propTypes = {
  images: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  selectedIndex: PropTypes.number
};

Carousel.defaultProps = {
  selectedIndex: 0
};

export default Carousel;
