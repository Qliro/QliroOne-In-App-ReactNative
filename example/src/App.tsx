import {
  isFatalError,
  type Order,
  QliroOneCheckout,
  useQliroOneCheckout,
} from '@qliro/react-native-qliro-one';
import { useRef, useState } from 'react';
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { createOrder, getOrder, PAYLOADS } from './qliro';

interface LogEntry {
  id: number;
  text: string;
}

export default function QliroOneTestScreen() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [orderHtml, setOrderHtml] = useState<string | undefined>();
  const [isOrderControlsExpanded, setIsOrderControlsExpanded] = useState(true);
  const [isLogsExpanded, setIsLogsExpanded] = useState(true);
  // The native checkout view has no intrinsic size under Fabric — JS owns layout — so its height
  // has to be driven from onCheckoutHeightChanged or it lays out at 0 and renders blank.
  const [checkoutHeight, setCheckoutHeight] = useState(0);
  // Log entries are prepended and the list is capped, so the array index is not a stable identity.
  const nextLogId = useRef(0);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    nextLogId.current += 1;
    const entry = { id: nextLogId.current, text: `[${timestamp}] ${message}` };
    setLogs((prev) => [entry, ...prev.slice(0, 19)]);
    console.log('QliroOne:', message);
  };

  // The hook tracks state/lastError and hands back the ref plus lock/unlock, so this screen no
  // longer keeps its own copies. Its own handlers still run — the hook calls them after recording.
  const checkout = useQliroOneCheckout({
    onStateChanged: (state, previousState) => {
      addLog(`onStateChanged: ${previousState} -> ${state}`);
    },
    onError: (code, message) => {
      addLog(
        `onError${isFatalError(code) ? ' (fatal)' : ''}: ${code} - ${message}`
      );
    },
  });

  // Create an order with the given feature payload directly against Qliro
  // staging, then load its checkout HTML snippet.
  const createAndLoad = async (variantKey: string) => {
    const variant = PAYLOADS.find((p) => p.key === variantKey);
    if (!variant) return;
    try {
      addLog(`Creating order: ${variant.label}...`);
      const { OrderId } = await createOrder(variant.build());
      addLog(`Order created: ${OrderId}`);
      const order = await getOrder(OrderId);
      if (order?.OrderHtmlSnippet) {
        setOrderHtml(order.OrderHtmlSnippet);
        addLog('Checkout loaded');
      } else {
        addLog('No OrderHtmlSnippet returned');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      addLog(`Error: ${msg}`);
      Alert.alert('Order failed', msg);
    }
  };

  const onOrderUpdated = (order: Order) => {
    addLog(`onOrderUpdated: Total ${order.totalPrice || 0}`);
    checkout.ref.current?.removeOrderUpdateCallback();
    checkout.unlock();
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setIsOrderControlsExpanded(!isOrderControlsExpanded)}
          >
            <Text style={styles.sectionTitle}>
              {isOrderControlsExpanded ? '▼' : '▶'} Order Controls
            </Text>
          </TouchableOpacity>
          {isOrderControlsExpanded && (
            <View style={styles.controls}>
              {PAYLOADS.map((variant, index) => (
                <View key={variant.key}>
                  {index > 0 && <View style={styles.divider} />}
                  <Button
                    title={variant.label}
                    onPress={() => createAndLoad(variant.key)}
                    color="#00AB84"
                  />
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setIsLogsExpanded(!isLogsExpanded)}
          >
            <Text style={styles.sectionTitle}>
              {isLogsExpanded ? '▼' : '▶'} Event Log ({logs.length})
            </Text>
          </TouchableOpacity>
          {isLogsExpanded && (
            <View style={styles.logContainer}>
              <ScrollView style={styles.logScroll}>
                {logs.map((log) => (
                  <Text key={log.id} style={styles.logText}>
                    {log.text}
                  </Text>
                ))}
                {logs.length === 0 && (
                  <Text style={styles.logTextEmpty}>No events yet.</Text>
                )}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Checkout</Text>
        </View>
        <ScrollView
          onScroll={(event) => checkout.ref.current?.onScroll(event)}
          scrollEventThrottle={16}
        >
          <QliroOneCheckout
            // Carries ref, onStateChanged and onError — spread first so the props below win.
            {...checkout.checkoutProps}
            testID="qliro-checkout"
            style={{ height: checkoutHeight }}
            orderHtml={orderHtml}
            // Must stay false: the SDK only emits onCheckoutHeightChanged while its own web view
            // scrolling is disabled. With it true the height events are suppressed, the view lays
            // out at 0pt and the checkout renders blank. The host ScrollView above does the
            // scrolling and feeds position back via checkout.ref.current.onScroll.
            isScrollEnabled={false}
            isCheckoutScrollEnabled={true}
            // applePayMerchantId is deliberately not set: there is no merchant ID for this test
            // app, and an empty string is not a valid one. Passing it would only make the iOS SDK
            // fail later, with a worse message than "not configured".
            isDebugEnabled={false}
            onLog={(level, message) => {
              addLog(`onLog[${level}]: ${message}`);
            }}
            onCheckoutLoaded={() => {
              addLog('onCheckoutLoaded fired');
            }}
            onCustomerInfoChanged={(customer) => {
              addLog(`onCustomerInfoChanged: ${customer.email || 'N/A'}`);
            }}
            onOrderUpdated={onOrderUpdated}
            onPaymentMethodChanged={(paymentMethod) => {
              addLog(
                `onPaymentMethodChanged: ${paymentMethod.method || 'N/A'}`
              );
            }}
            onShippingMethodChanged={(shipping) => {
              addLog(`onShippingMethodChanged: ${shipping.method || 'N/A'}`);
            }}
            onShippingPriceChanged={(price, total) => {
              addLog(`onShippingPriceChanged: ${price} / ${total}`);
            }}
            onPaymentDeclined={(reason, message) => {
              addLog(`onPaymentDeclined: ${reason} - ${message}`);
            }}
            onPaymentProcessStart={() => {
              addLog('onPaymentProcessStart');
            }}
            onPaymentProcessEnd={() => {
              addLog('onPaymentProcessEnd');
            }}
            onSessionExpired={() => {
              addLog('onSessionExpired');
            }}
            onCheckoutHeightChanged={(height) => {
              addLog(`onCheckoutHeightChanged: ${height}px`);
              setCheckoutHeight(height);
            }}
            onCompletePurchaseRedirect={(options) => {
              addLog(
                `onCompletePurchaseRedirect: ${options.merchantConfirmationUrl || 'N/A'}`
              );
            }}
            onCustomerDeauthenticating={() => {
              addLog('onCustomerDeauthenticating');
            }}
          />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 8,
    borderBottomColor: '#00AB84',
    borderBottomWidth: 4,
  },
  sectionHeader: {
    backgroundColor: '#00AB84',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  controls: {
    padding: 10,
    gap: 8,
  },
  logContainer: {
    padding: 10,
    height: 200,
  },
  logScroll: {
    flex: 1,
  },
  logText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#333',
    marginBottom: 2,
  },
  logTextEmpty: {
    fontStyle: 'italic',
    color: '#999',
  },
  checkoutContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  checkoutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginLeft: 5,
  },
  checkoutScroll: {
    flex: 1,
  },
  checkoutScrollContainer: {
    flex: 1,
  },
  checkout: {
    flex: 1,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#333333',
    opacity: 0.1,
  },
});
