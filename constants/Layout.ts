import { Dimensions } from 'react-native';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const spacing = (number: number): number => {
  switch (number) {
    case 1:
      return 4;
    case 2:
      return 8;
    case 3:
      return 12;
    case 4:
      return 16;
    case 5:
      return 32;
    case 6:
      return 64;
    default:
      return 12;
  }
};

export default {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  spacing,
};
