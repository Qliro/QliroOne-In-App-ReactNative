package com.reactlibrary;

import androidx.annotation.IdRes;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.events.Event;
import com.facebook.react.uimanager.events.RCTEventEmitter;

import java.util.HashMap;
import java.util.Map;

/**
 * A `QliroOneEvent` builds the event that will be eventually sent via
 * `on<event>`.
 *
 * It consists of a flat JSON object with a single `name` parameter for the
 * event name as well as
 * other, optional parameters depending on the function that was called.
 */
public class QliroOneEvent extends Event<QliroOneEvent> {

    public static final String EVENT_NAME_ON_CHECKOUT_LOADED = "onCheckoutLoaded";
    public static final String EVENT_NAME_ON_CUSTOMER_INFO_CHANGED = "onCustomerInfoChanged";
    public static final String EVENT_NAME_ON_CUSTOMER_DEAUTHENTICATING = "onCustomerDeauthenticating";
    public static final String EVENT_NAME_ON_PAYMENT_METHOD_CHANGED = "onPaymentMethodChanged";
    public static final String EVENT_NAME_ON_PAYMENT_DECLINED = "onPaymentDeclined";
    public static final String EVENT_NAME_ON_PAYMENT_PROCESS_START = "onPaymentProcessStart";
    public static final String EVENT_NAME_ON_PAYMENT_PROCESS_END = "onPaymentProcessEnd";
    public static final String EVENT_NAME_ON_SESSION_EXPIRED = "onSessionExpired";
    public static final String EVENT_NAME_ON_SHIPPING_METHOD_CHANGED = "onShippingMethodChanged";
    public static final String EVENT_NAME_ON_SHIPPING_PRICE_CHANGED = "onShippingPriceChanged";
    public static final String EVENT_NAME_ON_ORDER_UPDATED = "onOrderUpdated";
    public static final String EVENT_NAME_ON_COMPLETE_PURCHASE_REDIRECT = "onCompletePurchaseRedirect";

    @NonNull
    private final String eventName;

    @Nullable
    private final Map<String, Object> additionalParams;

    public QliroOneEvent(@IdRes int viewId, @NonNull String eventName, @Nullable Map<String, Object> additionalParams) {
        super(viewId);
        this.eventName = eventName;
        this.additionalParams = additionalParams;
    }

    @Override
    public String getEventName() {
        return eventName;
    }

    /**
     * Composes and sends the event JSON object being sent up to JS.
     *
     * @param rctEventEmitter
     */
    @Override
    public void dispatch(RCTEventEmitter rctEventEmitter) {
        Map<String, Object> map = new HashMap<>();

        if (additionalParams != null) {
            map.putAll(additionalParams);
        }

        WritableMap eventData = Arguments.makeNativeMap(map);
        rctEventEmitter.receiveEvent(getViewTag(), getEventName(), eventData);
    }
}