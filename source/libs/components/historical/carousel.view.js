/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */

import React from "react";
import PropTypes from "prop-types";
import { Carousel, Icon } from "../common";
import styles from "./historical.module.css";

export default class CarouselView extends React.Component {
  state = {
    caption: this.props.getCaption(this.props.selectedIndex)
  };

  componentDidMount() {
    if (this.carouselContainerRef) {
      this.carouselContainerRef.focus();
    }
  }

  handleChange = (index) => {
    this.setState({
      caption: this.props.getCaption(index)
    });
  };

  handleKeydown = (e) => {
    if (e.keyCode === 27) {
      e.preventDefault();
      e.stopPropagation();
      this.props.onClose();
    } else if (e.keyCode === 39 && this.carouselRef) {
      this.carouselRef.slideNext();
    } else if (e.keyCode === 37 && this.carouselRef) {
      this.carouselRef.slidePrev();
    }
  };

  render() {
    const { images, selectedIndex, onClose } = this.props;
    const { caption } = this.state;
    return (
      <div
        role="dialog"
        className={styles.carousel}
        onKeyDown={this.handleKeydown}
        ref={(_ref) => {
          this.carouselContainerRef = _ref;
        }}
      >
        <div className={styles.caption}>
          <span className={styles.caption__title}>
            {_.get(caption, "title")}
          </span>
          <span className="date">{_.get(caption, "date")}</span>
        </div>
        <div className={styles.slider__container}>
          <Carousel
            images={images}
            ref={(_ref) => {
              this.carouselRef = _ref;
            }}
            selectedIndex={selectedIndex}
            getCaption={this.props.getCaption}
            onChange={this.handleChange}
          />
        </div>
        <Icon
          name="carouselClose"
          className={styles.carousel__close}
          onClick={onClose}
        />
      </div>
    );
  }
}

CarouselView.propTypes = {
  getCaption: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedIndex: PropTypes.number,
  images: PropTypes.arrayOf(PropTypes.string)
};

CarouselView.defaultProps = {
  selectedIndex: 0,
  images: []
};
