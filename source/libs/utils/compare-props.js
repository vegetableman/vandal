import _ from "lodash";

// eslint-disable-next-line max-len
const compareProps = (values) => (prevProps, newProps) => !_.some(values, (value) => prevProps[value] !== newProps[value]);

export default compareProps;
