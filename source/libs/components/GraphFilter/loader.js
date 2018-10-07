import ContentLoader from "react-content-loader";
import React from 'react';

const GraphLoader = props => (
  <ContentLoader
    height={55}
    width={145}
    speed={2}
    primaryColor="#cccccc"
    secondaryColor="#ecebeb"
    {...props}
  >
    {/*<polygon points="0,50 0.00,47.50 16.67,12.50 33.33,47.50 50.00,0.00 66.67,47.50 83.33,25.00 100.00,47.50 100,50"></polygon>*/}
    <polygon points="0,50 0.00,50.00 12.50,12.50 25.00,50.00 37.50,0.00 50.00,50.00 62.50,37.50 75.00,50.00 87.50,25.00 100.00,50.00 100,50"></polygon>
  </ContentLoader>
);

export default GraphLoader;