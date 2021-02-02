import _ from "lodash";

const compareProps = (values) => (prevProps, newProps) => (
  !_.some(values, (value) => prevProps[value] !== newProps[value])
);

export default compareProps;
