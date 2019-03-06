import React from 'react';
import Slider from 'react-slick';
import cx from 'classnames';
import ArrowRight from './arrow-right.svg';
import ArrowLeft from './arrow-left.svg';
import './style.css';

function NextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <ArrowRight
      style={{ ...style }}
      onClick={onClick}
      className={cx({
        [className]: true,
        'vandal-slide__right-arrow': true
      })}
    />
  );
}

function PrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <ArrowLeft
      style={{ ...style }}
      onClick={onClick}
      className={cx({
        [className]: true,
        'vandal-slide__left-arrow': true
      })}
    />
  );
}

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
    const { images, selectedIndex = 0, getCaption } = this.props;

    return (
      <Slider
        {...settings}
        afterChange={index => {
          this.props.onChange(index);
        }}
        ref={_ref => (this.sliderRef = _ref)}
        initialSlide={selectedIndex}>
        {_.map(images, (src, index) => (
          <div key={index} className="vandal-slide">
            <img src={src} />
          </div>
        ))}
      </Slider>
    );
  }
}

export default Carousel;
