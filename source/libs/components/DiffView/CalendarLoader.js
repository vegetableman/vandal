import ContentLoader from 'react-content-loader';
import React from 'react';

const CalendarLoader = props => (
  <ContentLoader
    height={200}
    width={400}
    speed={2}
    primaryColor="#cccccc"
    secondaryColor="#ecebeb"
    {...props}>
    <rect x="235" y="0" rx="0" ry="0" width="100" height="10" />
    <rect x="55" y="30" rx="0" ry="0" width="280" height="10" />
    <rect x="55" y="60" rx="0" ry="0" width="280" height="10" />
    <rect x="55" y="90" rx="0" ry="0" width="280" height="10" />
    <rect x="55" y="120" rx="0" ry="0" width="280" height="10" />
    <rect x="55" y="150" rx="0" ry="0" width="100" height="10" />
  </ContentLoader>
);

export default CalendarLoader;
