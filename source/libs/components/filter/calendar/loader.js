import ContentLoader from 'react-content-loader';
import React from 'react';

const CalendarLoader = ({ theme, ...props }) => (
  <ContentLoader
    height={200}
    width={400}
    speed={2}
    primaryColor={theme === 'dark' ? '#bbbbbb' : '#cccccc'}
    secondaryColor={theme === 'dark' ? '#ffffff' : '#bbbbbb'}
    {...props}>
    <rect x="225" y="0" rx="0" ry="0" width="100" height="10" />
    <rect x="75" y="30" rx="0" ry="0" width="253" height="10" />
    <rect x="75" y="60" rx="0" ry="0" width="253" height="10" />
    <rect x="75" y="90" rx="0" ry="0" width="253" height="10" />
    <rect x="75" y="120" rx="0" ry="0" width="253" height="10" />
    <rect x="75" y="150" rx="0" ry="0" width="100" height="10" />
  </ContentLoader>
);

export default CalendarLoader;
