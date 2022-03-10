import React from 'react';
import {
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import {
  Module,
  QliroOneActions,
  QliroOneEvent,
  QliroOneListener,
} from './models';
import { QliroOneProps } from './QliroOneProps';
import * as Scripts from './Scripts';

interface Props extends Partial<QliroOneListener>, QliroOneProps {}

interface State {
  height?: number;
  orderHtml?: string;
  /**
   * Used to reload the webview when orderhtml is changed.
   */
  reloadCount: number;
}

export class QliroOneCheckout
  extends React.Component<Props, State>
  implements QliroOneActions
{
  private webViewRef: React.RefObject<WebView<{}>>;
  private currentSessionExpiredCallback?: () => void;
  private viewRef: React.RefObject<View>;
  private screenHeight: number;

  constructor(props: Props) {
    super(props);
    this.state = { height: undefined, reloadCount: 0 };
    this.webViewRef = React.createRef<WebView>();
    this.viewRef = React.createRef<View>();
    this.screenHeight = Dimensions.get('screen').height;
  }

  // QliroOneActions
  loadOrderHtml = (orderHtml: string) => {
    this.setState({ orderHtml, reloadCount: this.state.reloadCount + 1 });
  };

  lock = () => {
    this.webViewRef.current?.injectJavaScript('q1.lock();');
  };
  unlock = () => {
    this.webViewRef.current?.injectJavaScript('q1.unlock();');
  };

  enableScrolling = (enabled: boolean) => {
    this.webViewRef.current?.injectJavaScript(
      `q1.enableScrolling(${enabled ? 'true' : 'false'});`,
    );
  };

  updateOrders = () => {
    this.addOrderUpdateCallback();
    this.lock();
  };

  onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    this.viewRef.current?.measure((x, y, width, height, pageX, pageY) => {
      this.webViewRef.current?.injectJavaScript(`
        window.dispatchEvent(new CustomEvent("scroll", { detail:  { customHeight: ${this.screenHeight}, customTop: ${pageY} }}));
        true;
      `);
    });
  };

  // TODO: Should this be a prop instead?
  excludeResultModules = (modules: Module[]) => {
    const json = JSON.stringify(modules);
    this.webViewRef.current?.injectJavaScript(
      `q1.excludeResultModules(${json});`,
    );
  };

  // TODO: Should this be a prop instead?
  setSessionExpiredCallback = (callback?: () => void) => {
    this.currentSessionExpiredCallback = callback;
    if (callback) {
      this.webViewRef.current?.injectJavaScript(
        Scripts.onSessionExpiredScript(),
      );
    } else {
      this.webViewRef.current?.injectJavaScript(
        Scripts.onSessionExpiredScript(false),
      );
    }
  };

  private addOrderUpdateCallback = () => {
    this.webViewRef.current?.injectJavaScript(Scripts.orderUpdatedScript());
  };

  private removeOrderUpdateCallback = () => {
    this.webViewRef.current?.injectJavaScript(
      Scripts.orderUpdatedScript(false),
    );
  };

  // WebView JavaScript messages
  private handleMessage = (event: WebViewMessageEvent) => {
    const eventData: QliroOneEvent = JSON.parse(event.nativeEvent.data);
    this.props.onLogged?.(JSON.stringify(eventData));
    switch (eventData.name) {
      case 'onClientHeightChange':
        this.setState({ height: eventData.data });
        break;
      case 'onQliroOneReady':
        this.webViewRef.current?.injectJavaScript(
          Scripts.onCompletePurchaseRedirect(
            this.props.redirectToSuccess ?? true,
          ),
        );
        break;
      case 'onCheckoutLoaded':
        this.props.onCheckoutLoaded?.();
        break;
      case 'onPaymentMethodChanged':
        this.props.onPaymentMethodChanged?.(eventData.data);
        break;
      case 'onPaymentProcessStart':
        this.props.onPaymentProcessStart?.();
        break;
      case 'onPaymentProcessEnd':
        this.props.onPaymentProcessEnd?.();
        break;
      case 'onShippingMethodChanged':
        this.props.onShippingMethodChanged?.(eventData.data);
        break;
      case 'onShippingPriceChanged':
        if (eventData.data) {
          this.props.onShippingPriceChanged?.(eventData.data);
        }
        break;
      case 'onCustomerInfoChanged':
        this.props.onCustomerInfoChanged?.(eventData.data);
        break;
      case 'onOrderUpdated':
        const unlock = this.props.onOrderUpdated?.(eventData.data) ?? true;
        if (unlock) {
          this.removeOrderUpdateCallback();
          this.unlock();
        }
        break;
      case 'onSessionExpired':
        this.currentSessionExpiredCallback?.();
        break;
      case 'onCompletePurchaseRedirect':
        this.props.onCompletePurchaseRedirect?.();
        break;
    }
  };

  // Navigation

  private shouldStartLoadingRequest = (req: ShouldStartLoadRequest) => {
    const elements = req.url.split('/');
    const lastPath = elements[elements.length - 1];

    // WebView
    if (req.url.includes('pago.qit.nu')) {
      return true;
    }

    // Loading initial html
    if (req.url === 'about:blank') {
      return true;
    }

    switch (lastPath) {
      case 'app':
        this.redirectToStore();
        return false;
    }
    const host = req.url.split(':')[0];
    if (host === 'bankid') {
      this.redirectToBankId(req.url);
      return false;
    }
    Linking.openURL(req.url);
    return false;
  };

  // Redirects

  // TODO: redirect?
  private redirectToBankId = (url: string) => {
    if (!url.includes('redirect=')) {
      url += '&redirect=null';
    }
    Linking.openURL(url);
  };

  private redirectToStore = () => {
    if (Platform.OS === 'android') {
      Linking.openURL('market://details?id=com.qliro.qliro');
    } else {
      Linking.openURL(
        'itms://itunes.apple.com/se/app/qliro-betala-i-appen/id1165368803?mt=8',
      );
    }
  };

  render() {
    return (
      <View style={style.wrapper} ref={this.viewRef}>
        <WebView
          key={this.state.reloadCount}
          ref={this.webViewRef}
          style={[
            style.content,
            {
              height: this.state.height ?? '100%',
            },
          ]}
          containerStyle={style.container}
          source={{
            html: `
            ${this.state.orderHtml ?? ''}
            ${Scripts.qliroOneBridge(this.props.scrollEnabled)}
          `,
          }}
          scrollEnabled={!!this.props.scrollEnabled}
          nestedScrollEnabled={!!this.props.scrollEnabled}
          scalesPageToFit={true}
          onMessage={this.handleMessage}
          onShouldStartLoadWithRequest={this.shouldStartLoadingRequest}
          thirdPartyCookiesEnabled={true}
          sharedCookiesEnabled={true}
        />
      </View>
    );
  }
}

const style = StyleSheet.create({
  wrapper: {
    height: '100%',
    width: '100%',
    minHeight: 1,
  },
  content: {
    backgroundColor: 'transparent',
    height: '100%',
    width: '100%',
  },
  container: { backgroundColor: 'transparent' },
});
