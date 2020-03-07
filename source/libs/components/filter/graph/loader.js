import ContentLoader from 'react-content-loader';
import React from 'react';

const GraphLoader = ({ theme, ...props }) => {
  return (
    <ContentLoader
      height={55}
      width={145}
      speed={2}
      primaryColor={theme === 'dark' ? '#bbbbbb' : '#cccccc'}
      secondaryColor={theme === 'dark' ? '#ffffff' : '#bbbbbb'}
      {...props}>
      <polygon points="0,50 0.00,50.00 12.50,12.50 25.00,50.00 37.50,0.00 50.00,50.00 62.50,37.50 75.00,50.00 87.50,25.00 100.00,50.00 100,50" />
    </ContentLoader>
  );
};

export default GraphLoader;
