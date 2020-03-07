import _ from 'lodash';

const compareProps = values => (prevProps, newProps) => {
  return !_.some(values, value => {
    return prevProps[value] !== newProps[value];
  });
};

export default compareProps;
