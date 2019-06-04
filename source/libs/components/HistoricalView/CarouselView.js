import React from 'react';
import { Carousel, Icon } from '../Common';

export default class CarouselView extends React.Component {
  state = {
    caption: this.props.getCaption(this.props.selectedIndex)
  };

  handleKeydown = e => {
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

  handleChange = index => {
    this.setState({
      caption: this.props.getCaption(index)
    });
  };

  render() {
    const { images, selectedIndex, onClose } = this.props;
    const { caption } = this.state;
    return (
      <div
        className="vandal-historical-carousel"
        onKeyDown={this.handleKeydown}
        ref={_ref => (this.carouselContainerRef = _ref)}
        tabIndex="0">
        <div className="vandal-historical-caption">
          <span className="title">{_.get(caption, 'title')}</span>
          <span className="date">{_.get(caption, 'date')}</span>
        </div>
        <div className="vandal-historical-slider-container">
          <Carousel
            images={images}
            ref={_ref => (this.carouselRef = _ref)}
            selectedIndex={selectedIndex}
            getCaption={this.props.getCaption}
            onChange={this.handleChange}
          />
        </div>
        <Icon
          name="carouselClose"
          className="vandal-historical-carousel__close"
          onClick={onClose}
        />
      </div>
    );
  }

  componentDidMount() {
    if (this.carouselContainerRef) {
      this.carouselContainerRef.focus();
    }
  }
}
