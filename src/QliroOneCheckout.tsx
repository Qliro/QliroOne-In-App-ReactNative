import React, {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from "react";
import {
  findNodeHandle,
  UIManager,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
  View,
} from "react-native";
import * as Models from "./models";
import { QlirOneNativeCheckout } from "./QliroOneNativeComponent";
import { QliroOneProps } from "./QliroOneProps";
import { NativeCheckoutIOS } from "./QliroOneTypes";
import { QliroOneListener } from "./QliroOneListener";

type Actions = {
  lock: () => void;
  unlock: () => void;
  addOrderUpdateCallback: () => void;
  removeOrderUpdateCallback: () => void;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export const QliroOneCheckout = forwardRef<
  Actions,
  QliroOneProps & QliroOneListener
>((props, ref) => {
  const scrollThrottled = useRef(false);
  const checkoutRef = useRef<NativeQliroOneCheckout>(null);
  const viewRef = useRef<View>(null);
  const [checkoutLoaded, setCheckoutLoaded] = useState(false);
  useImperativeHandle(ref, () => ({
    lock: () => {
      checkoutRef.current?.lock();
    },
    unlock: () => {
      checkoutRef.current?.unlock();
    },
    addOrderUpdateCallback: () => {
      checkoutRef.current?.addOrderUpdateCallback();
    },
    removeOrderUpdateCallback: () => {
      checkoutRef.current?.removeOrderUpdateCallback();
    },
    // TODO: Is it possible to absorb this event as a ref? I don't think so?
    onScroll: (_) => {
      if (!scrollThrottled.current) {
        const { height } = Dimensions.get("screen");
        viewRef.current?.measure((_x, _y, _w, _h, _pX, pageY) => {
          checkoutRef.current?.onScroll(height, pageY);
        });
        scrollThrottled.current = true;
        setTimeout(() => (scrollThrottled.current = false), 250);
      }
    },
  }));

  useEffect(() => {
    if (props.orderHtml) {
      checkoutRef.current?.loadOrderHtml(props.orderHtml);
    }
  }, [props.orderHtml]);

  useEffect(() => {
    if (!checkoutLoaded) {
      return;
    }
    if (typeof props.isCheckoutScrollEnabled === "boolean") {
      checkoutRef.current?.enableCheckoutScrolling(
        props.isCheckoutScrollEnabled
      );
    }
  }, [checkoutLoaded, props.isCheckoutScrollEnabled]);

  useEffect(() => {
    if (!checkoutLoaded) {
      return;
    }
    checkoutRef.current?.excludeResultModules(
      props.excludedResultModules ?? []
    );
  }, [checkoutLoaded, props.excludedResultModules]);

  useEffect(() => {
    if (!checkoutLoaded) {
      return;
    }
    if (props.onSessionExpired) {
      checkoutRef.current?.addSessionExpiredCallback();
    } else {
      checkoutRef.current?.removeSessionExpiredCallback();
    }
  }, [checkoutLoaded, props.onSessionExpired]);

  // collapsable set to false to make viewRef.current.measure work on android
  // https://github.com/facebook/react-native/issues/3282
  return (
    <View ref={viewRef} collapsable={false}>
      <NativeQliroOneCheckout
        ref={checkoutRef}
        {...props}
        onCheckoutLoaded={() => {
          setCheckoutLoaded(true);
          props.onCheckoutLoaded?.();
        }}
      />
    </View>
  );
});

class NativeQliroOneCheckout extends React.Component<
  QliroOneListener & QliroOneProps
> {
  webViewRef = React.createRef<NativeCheckoutIOS>();

  private getCommands() {
    return UIManager.getViewManagerConfig("QliroOneCheckout").Commands;
  }

  private getCheckoutHandle() {
    const nodeHandle = findNodeHandle(this.webViewRef.current);
    return nodeHandle as number;
  }

  loadOrderHtml(html: string) {
    UIManager.dispatchViewManagerCommand(
      this.getCheckoutHandle(),
      this.getCommands().loadOrderHtml,
      [html]
    );
  }

  addSessionExpiredCallback() {
    UIManager.dispatchViewManagerCommand(
      this.getCheckoutHandle(),
      this.getCommands().addSessionExpiredCallback,
      undefined
    );
  }

  removeSessionExpiredCallback() {
    UIManager.dispatchViewManagerCommand(
      this.getCheckoutHandle(),
      this.getCommands().removeSessionExpiredCallback,
      undefined
    );
  }

  lock() {
    UIManager.dispatchViewManagerCommand(
      this.getCheckoutHandle(),
      this.getCommands().lock,
      undefined
    );
  }

  unlock() {
    UIManager.dispatchViewManagerCommand(
      this.getCheckoutHandle(),
      this.getCommands().unlock,
      undefined
    );
  }

  addOrderUpdateCallback() {
    UIManager.dispatchViewManagerCommand(
      this.getCheckoutHandle(),
      this.getCommands().addOrderUpdateCallback,
      undefined
    );
  }

  removeOrderUpdateCallback() {
    UIManager.dispatchViewManagerCommand(
      this.getCheckoutHandle(),
      this.getCommands().removeOrderUpdateCallback,
      undefined
    );
  }

  enableCheckoutScrolling(enabled: boolean) {
    UIManager.dispatchViewManagerCommand(
      this.getCheckoutHandle(),
      this.getCommands().enableScrolling,
      [enabled]
    );
  }

  excludeResultModules(modules: Models.Module[]) {
    UIManager.dispatchViewManagerCommand(
      this.getCheckoutHandle(),
      this.getCommands().excludeResultModules,
      [modules]
    );
  }

  onScroll(containerHeight: number, offset: number) {
    UIManager.dispatchViewManagerCommand(
      this.getCheckoutHandle(),
      this.getCommands().onScroll,
      [containerHeight, offset]
    );
  }

  render() {
    return (
      <QlirOneNativeCheckout
        {...this.props}
        ref={this.webViewRef}
        onCheckoutLoaded={() => {
          return this.props.onCheckoutLoaded?.();
        }}
        onOrderUpdated={(event) => {
          return this.props.onOrderUpdated?.(event.nativeEvent.order);
        }}
        onCustomerInfoChanged={(event) => {
          return this.props.onCustomerInfoChanged?.(event.nativeEvent.customer);
        }}
        onCustomerDeauthenticating={() => {
          return this.props.onCustomerDeauthenticating?.();
        }}
        onPaymentMethodChanged={(event) => {
          return this.props.onPaymentMethodChanged?.(
            event.nativeEvent.paymentMethod
          );
        }}
        onPaymentDeclined={(event) => {
          return this.props.onPaymentDeclined?.(
            event.nativeEvent.reason.declineReason,
            event.nativeEvent.reason.declineReasonMessage
          );
        }}
        onPaymentProcessEnd={() => {
          return this.props.onPaymentProcessEnd?.();
        }}
        onPaymentProcessStart={() => {
          return this.props.onPaymentProcessStart?.();
        }}
        onSessionExpired={() => {
          return this.props.onSessionExpired?.();
        }}
        onShippingMethodChanged={(event) => {
          return this.props.onShippingMethodChanged?.(
            event.nativeEvent.shipping
          );
        }}
        onShippingPriceChanged={(event) => {
          return this.props.onShippingPriceChanged?.(
            event.nativeEvent.shippingPrice.newShippingPrice,
            event.nativeEvent.shippingPrice.newTotalShippingPrice
          );
        }}
        onCompletePurchaseRedirect={(event) => {
          return this.props.onCompletePurchaseRedirect?.(
            event.nativeEvent.options
          );
        }}
      />
    );
  }
}
