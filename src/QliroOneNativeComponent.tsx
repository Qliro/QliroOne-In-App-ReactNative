import { requireNativeComponent } from 'react-native';
import { NativeCheckoutIOS } from './QliroOneTypes';

export const QlirOneNativeCheckout: typeof NativeCheckoutIOS =
  requireNativeComponent('QliroOneCheckout');
