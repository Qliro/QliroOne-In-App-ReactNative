import React from 'react';
import { View } from 'react-native';

const QliroOneCheckoutNativeComponent = React.forwardRef((props: any, ref) => {
  return React.createElement(View, {
    ...props,
    ref,
    testID: 'native-checkout',
  });
});

QliroOneCheckoutNativeComponent.displayName = 'QliroOneCheckoutNativeComponent';

export default QliroOneCheckoutNativeComponent;

export const Commands = {
  loadOrderHtml: jest.fn(),
  lock: jest.fn(),
  unlock: jest.fn(),
  addSessionExpiredCallback: jest.fn(),
  removeSessionExpiredCallback: jest.fn(),
  addOrderUpdateCallback: jest.fn(),
  removeOrderUpdateCallback: jest.fn(),
  enableCheckoutScrolling: jest.fn(),
  excludeResultModules: jest.fn(),
  onScrollWithContainerHeight: jest.fn(),
};
