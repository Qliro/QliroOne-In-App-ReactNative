const disableZoom = `
  var head = document.getElementsByTagName('head')[0];
  var meta = document.createElement('meta');
  meta.setAttribute('content', 'initial-scale=1 maximum-scale=1, user-scalable=0');
  meta.setAttribute('name', 'viewport');
  head.appendChild(meta);
`;

const ifResizeObserverUnSupported = `
  let previousHeight;
  const root = document.querySelector('body > div');
  setInterval(function findDialogBox() {
    var height = Math.max( root.scrollHeight, root.offsetHeight );
    if(previousHeight != height) {
      sendMessage({"name": "onClientHeightChange", "data": { height }});
      previousHeight = height
    }
  }, 100)
`;

const resizeObserver = `
  let previous;
  // create an Observer instance
  try {
    const resizeObserver = new ResizeObserver(function(entries) {
      const height = entries[entries.length - 1].target.clientHeight;
      if (height != previous) {
        sendMessage({"name": "onClientHeightChange", "data": { height }});
        previous = height;
      }
    });

    const root = document.querySelector('body > div');
    if (root) {
      // start observing a DOM node
      resizeObserver.observe(root);
    }
  } catch (e) {
    ${ifResizeObserverUnSupported}
  }
`;

const helpers = `
  function sendMessage(data) {
    window.ReactNativeWebView.postMessage(JSON.stringify(data));
  }
`;

export const qliroOneBridge = (scrollEnabled?: boolean) => `
  <script type="text/javascript">
    ${scrollEnabled ? '' : resizeObserver}
    ${helpers}
    ${disableZoom}

    window.q1Ready = function(q1) {
      q1.onCheckoutLoaded(function callback() {
          sendMessage({"name": "onCheckoutLoaded", "data": { arguments: [...arguments] }});
      });

      q1.onPaymentMethodChanged(function callback() {
          sendMessage({"name": "onPaymentMethodChanged", "data": { arguments: [...arguments] }});
      });

      q1.onPaymentProcess(function start() {
          sendMessage({"name": "onPaymentProcessStart", "data": { arguments: [...arguments] }});
      }, function end() {
          sendMessage({"name": "onPaymentProcessEnd", "data": { arguments: [...arguments] }});
      });

      q1.onShippingMethodChanged(function callback(arg) {
          sendMessage({"name": "onShippingMethodChanged", "data": { arguments: [...arguments] }});
      });

      q1.onShippingPriceChanged(function callback() {
          sendMessage({"name": "onShippingPriceChanged", "data": { arguments: [...arguments] }});
      });

      q1.onCustomerInfoChanged(function callback() {
          sendMessage({"name": "onCustomerInfoChanged", "data": { arguments: [...arguments] }});
      });

      q1.onCustomerDeauthenticating(function callback() {
        sendMessage({"name": "onCustomerDeauthenticating", "data": { arguments: [...arguments] }});
      });

      q1.onPaymentDeclined(function callback() {
        sendMessage({"name": "onPaymentDeclined", "data": { arguments: [...arguments] }});
      });

      sendMessage({"name": "onQliroOneReady"});
    }
  </script>
`;

export const onSessionExpiredScript = (insertCallback = true) => {
  const callback = `function callback() {
    sendMessage({"name": "onSessionExpired", "data": { arguments: [...arguments] }});
  }`;
  return `q1.onSessionExpired(${insertCallback ? callback : 'null'});`;
};

/**
 * Attach this script in order to listen on changes to the order.
 */
export const orderUpdatedScript = (insertCallback = true) => {
  const callback = `function callback() {
    sendMessage({"name": "onOrderUpdated", "data": { arguments: [...arguments] }});
  }`;
  return `q1.onOrderUpdated(${insertCallback ? callback : 'null'});`;
};

/**
 * Attach this script in order to listen on the redirect event after a completed purchase.
 * We split the arguments as the first argument is the redirect callback.
 */
export const onCompletePurchaseRedirect = () => {
  const callback = `function callback(redirect) {
    sendMessage({ "name": "onCompletePurchaseRedirect", "data": { arguments: [...arguments].slice(1) } });
  }`;
  return `q1.onCompletePurchaseRedirect(${callback}, false);`;
};
