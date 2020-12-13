import ContentLoader from 'react-content-loader';
import React from 'react';

const ImageLoader = ({ theme, ...props }) => (
  <ContentLoader
    height={90}
    width={90}
    speed={1}
    primaryColor="#cccccc"
    secondaryColor="#ecebeb"
    primaryColor={theme === 'dark' ? '#ffffff' : '#777777'}
    secondaryColor={theme === 'dark' ? '#bbbbbb' : '#555555'}
    style={{
      width: 40,
      height: 40
    }}
    title="Fetching Snapshot..."
    {...props}>
    <path
      width="90"
      height="90"
      fill="#000000"
      d="M16.639,25.919v48.79h66.725v-48.79H16.639z M79.241,30.042V50.01L67.802,37.688L49.943,56.926   l-12.04-12.969L20.762,62.422V30.042H79.241z"
    />
    <circle fill="#000000" cx="48.54" cy="40.608" r="4.896" />
  </ContentLoader>
);

export default ImageLoader;
