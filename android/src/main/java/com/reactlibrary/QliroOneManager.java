// QliroOneManager.java

package com.reactlibrary;

import static androidx.core.content.ContextCompat.startActivity;

import android.content.Intent;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.EventDispatcher;
import com.facebook.react.common.MapBuilder;

import com.qliro.qliroone.QliroOneCheckout;
import com.qliro.qliroone.QliroOneListener;
import com.qliro.qliroone.models.Address;
import com.qliro.qliroone.models.Customer;
import com.qliro.qliroone.models.Order;
import com.qliro.qliroone.models.OrderItem;
import com.qliro.qliroone.models.PaymentMethod;
import com.qliro.qliroone.models.PurchaseRedirectOptions;
import com.qliro.qliroone.models.Shipping;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

import java.lang.ref.WeakReference;
import java.util.HashMap;
import java.util.Map;

public class QliroOneManager extends SimpleViewManager<QliroOneWrapper> implements QliroOneListener {

    // Commands that can be triggered from RN
    public static final int COMMAND_LOAD_ORDER_HTML = 1;
    public static final int COMMAND_ADD_SESSION_EXPIRED_CALLBACK = 2;
    public static final int COMMAND_REMOVE_SESSION_EXPIRED_CALLBACK = 3;
    public static final int COMMAND_LOCK = 4;
    public static final int COMMAND_UNLOCK = 5;
    public static final int COMMAND_ADD_ORDER_UPDATE_CALLBACK = 6;
    public static final int COMMAND_REMOVE_ORDER_UPDATE_CALLBACK = 7;
    public static final int COMMAND_ENABLE_SCROLLING = 8;
    public static final int COMMAND_EXCLUDE_RESULT_MODULES = 9;
    public static final int COMMAND_ON_SCROLL = 10;

    public static final String REACT_CLASS = "QliroOneCheckout";

    private Map<WeakReference<QliroOneWrapper>, EventDispatcher> viewToDispatcher;
    
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    public QliroOneManager(ReactApplicationContext reactContext) {
        super();
        this.viewToDispatcher = new HashMap<>();
    }

    @Override
    public QliroOneWrapper createViewInstance(ThemedReactContext context) {
        QliroOneWrapper qliroOneWrapper = new QliroOneWrapper(context, null);
        qliroOneWrapper.qliroOneCheckout.setQliroOneListener(this);

        // Each view has its own event dispatcher.
        EventDispatcher dispatcher = context.getNativeModule(UIManagerModule.class).getEventDispatcher();
        viewToDispatcher.put(new WeakReference(qliroOneWrapper), dispatcher);

        return qliroOneWrapper;
    }

    @Override
    public void onDropViewInstance(@NonNull QliroOneWrapper view) {
        WeakReference<QliroOneWrapper> ref = wrapperRefForQliroOne(view.qliroOneCheckout);
        viewToDispatcher.remove(ref);
        super.onDropViewInstance(view);
    }

    @ReactProp(name = "isScrollEnabled")
    public void setIsScrollEnabled(QliroOneWrapper view, Boolean isScrollEnabled) {
        view.qliroOneCheckout.isScrollEnabled = isScrollEnabled;
    }


    /**
     * Commads are methods that RN will expose on the JS side for a view. They can
     * be called via
     * `UIManager.dispatchViewManagerCommand` from react.
     *
     * @return a map of command names to command IDs
     */
    @Nullable
    @Override
    public Map getCommandsMap() {
        return MapBuilder.builder()
                .put("loadOrderHtml", COMMAND_LOAD_ORDER_HTML)
                .put("addSessionExpiredCallback", COMMAND_ADD_SESSION_EXPIRED_CALLBACK)
                .put("removeSessionExpiredCallback", COMMAND_REMOVE_SESSION_EXPIRED_CALLBACK)
                .put("lock", COMMAND_LOCK)
                .put("unlock", COMMAND_UNLOCK)
                .put("addOrderUpdateCallback", COMMAND_ADD_ORDER_UPDATE_CALLBACK)
                .put("removeOrderUpdateCallback", COMMAND_REMOVE_ORDER_UPDATE_CALLBACK)
                .put("enableScrolling", COMMAND_ENABLE_SCROLLING)
                .put("excludeResultModules", COMMAND_EXCLUDE_RESULT_MODULES)
                .put("onScroll", COMMAND_ON_SCROLL)
                .build();
    }

    /**
     * Handles commands received from RN to a specific view.
     *
     * @param root
     * @param commandId
     * @param args
     */
    @Override
    public void receiveCommand(@Nonnull QliroOneWrapper root, int commandId, @Nullable ReadableArray args) {
        switch (commandId) {
            case COMMAND_LOAD_ORDER_HTML:
                if (args != null) {
                    final String html = args.getString(0);

                    if (html != null) {
                        root.qliroOneCheckout.loadOrderHtml(html);
                    }
                }
                break;
            case COMMAND_ADD_SESSION_EXPIRED_CALLBACK:
                root.qliroOneCheckout.addSessionExpiredCallback();
                break;
            case COMMAND_REMOVE_SESSION_EXPIRED_CALLBACK:
                root.qliroOneCheckout.removeSessionExpiredCallback();
                break;
            case COMMAND_LOCK:
                root.qliroOneCheckout.lock();
                break;
            case COMMAND_UNLOCK:
                root.qliroOneCheckout.unlock();
                break;
            case COMMAND_ADD_ORDER_UPDATE_CALLBACK:
                root.qliroOneCheckout.addOrderUpdateCallback();
                break;
            case COMMAND_REMOVE_ORDER_UPDATE_CALLBACK:
                root.qliroOneCheckout.removeOrderUpdateCallback();
                break;
            case COMMAND_ENABLE_SCROLLING:
                if (args != null) {
                    final Boolean enable = args.getBoolean(0);

                    if (enable != null) {
                        root.qliroOneCheckout.enableCheckoutScrolling(enable);
                    }
                }
                break;
            case COMMAND_EXCLUDE_RESULT_MODULES:
                // TODO: Should we have this?
                break;
            case COMMAND_ON_SCROLL:
                if (args != null) {
                    final int containerHeight = args.getInt(0);
                    final int offset = args.getInt(1);
                    root.qliroOneCheckout.onScroll(containerHeight, offset);
                }
                break;
        }
    }

    /**
     * Exposes direct event types that will be accessible as prop "callbacks" from
     * RN.
     *
     * Structure must follow:
     * { "<eventName>": {"registrationName": "<eventName>"} }
     */
    @Nullable
    @Override
    public Map getExportedCustomDirectEventTypeConstants() {
        return MapBuilder.builder()
                .put(QliroOneEvent.EVENT_NAME_ON_CHECKOUT_LOADED,
                        MapBuilder.of("registrationName", QliroOneEvent.EVENT_NAME_ON_CHECKOUT_LOADED))
                .put(QliroOneEvent.EVENT_NAME_ON_CUSTOMER_INFO_CHANGED,
                        MapBuilder.of("registrationName", QliroOneEvent.EVENT_NAME_ON_CUSTOMER_INFO_CHANGED))
                .put(QliroOneEvent.EVENT_NAME_ON_CUSTOMER_DEAUTHENTICATING,
                        MapBuilder.of("registrationName", QliroOneEvent.EVENT_NAME_ON_CUSTOMER_DEAUTHENTICATING))
                .put(QliroOneEvent.EVENT_NAME_ON_PAYMENT_METHOD_CHANGED,
                        MapBuilder.of("registrationName", QliroOneEvent.EVENT_NAME_ON_PAYMENT_METHOD_CHANGED))
                .put(QliroOneEvent.EVENT_NAME_ON_PAYMENT_DECLINED,
                        MapBuilder.of("registrationName", QliroOneEvent.EVENT_NAME_ON_PAYMENT_DECLINED))
                .put(QliroOneEvent.EVENT_NAME_ON_PAYMENT_PROCESS_START,
                        MapBuilder.of("registrationName", QliroOneEvent.EVENT_NAME_ON_PAYMENT_PROCESS_START))
                .put(QliroOneEvent.EVENT_NAME_ON_PAYMENT_PROCESS_END,
                        MapBuilder.of("registrationName", QliroOneEvent.EVENT_NAME_ON_PAYMENT_PROCESS_END))
                .put(QliroOneEvent.EVENT_NAME_ON_SESSION_EXPIRED,
                        MapBuilder.of("registrationName", QliroOneEvent.EVENT_NAME_ON_SESSION_EXPIRED))
                .put(QliroOneEvent.EVENT_NAME_ON_SHIPPING_METHOD_CHANGED,
                        MapBuilder.of("registrationName", QliroOneEvent.EVENT_NAME_ON_SHIPPING_METHOD_CHANGED))
                .put(QliroOneEvent.EVENT_NAME_ON_SHIPPING_PRICE_CHANGED,
                        MapBuilder.of("registrationName", QliroOneEvent.EVENT_NAME_ON_SHIPPING_PRICE_CHANGED))
                .put(QliroOneEvent.EVENT_NAME_ON_ORDER_UPDATED,
                        MapBuilder.of("registrationName", QliroOneEvent.EVENT_NAME_ON_ORDER_UPDATED))
                .put(QliroOneEvent.EVENT_NAME_ON_COMPLETE_PURCHASE_REDIRECT,
                        MapBuilder.of("registrationName", QliroOneEvent.EVENT_NAME_ON_COMPLETE_PURCHASE_REDIRECT))
                .build();
    }

    /**
     * Creates an event from event name and a map of params. Sends it via the right
     * dispatcher.
     *
     * @param eventName
     * @param additionalParams
     * @param view
     */
    private void dispatchEvent(String eventName, @Nullable Map<String, Object> additionalParams, QliroOneCheckout view) {
        WeakReference<QliroOneWrapper> wrapperRef = wrapperRefForQliroOne(view);
        if(wrapperRef != null) {
            EventDispatcher dispatcher = viewToDispatcher.get(wrapperRef);

            QliroOneEvent event = new QliroOneEvent(wrapperRef.get().getId(), eventName, additionalParams);
            dispatcher.dispatchEvent(event);
        }
    }

    /* -- QliroOneView callback methods -- */

    @Override
    public void onCheckoutLoaded(QliroOneCheckout view) {
        view.requestLayout();
        dispatchEvent(QliroOneEvent.EVENT_NAME_ON_CHECKOUT_LOADED, null, view);
    }

    @Override
    public void onCustomerInfoChanged(QliroOneCheckout view, @NonNull Customer customer) {
        Address address = customer.getAddress();
        Object addressObject = MapBuilder.<String, Object>of(
                "firstName", address.getFirstName(),
                "lastName", address.getLastName(),
                "street", address.getStreet(),
                "careOf", address.getCareOf(),
                "city", address.getCity(),
                "postalCode", address.getPostalCode(),
                "isMasked", address.isMasked());

        dispatchEvent(
                QliroOneEvent.EVENT_NAME_ON_CUSTOMER_INFO_CHANGED,
                MapBuilder.of("customer",
                        MapBuilder.of(
                                "email", customer.getEmail(),
                                "mobileNumber", customer.getMobileNumber(),
                                "address", addressObject,
                                "personalNumber", customer.getPersonalNumber(),
                                "organizationNumber", customer.getOrganizationNumber())),
                view);
    }

    @Override
    public void onCustomerDeauthenticating(QliroOneCheckout view) {
        dispatchEvent(QliroOneEvent.EVENT_NAME_ON_CUSTOMER_DEAUTHENTICATING, null, view);
    }

    @Override
    public void onPaymentMethodChanged(QliroOneCheckout view, @NonNull PaymentMethod paymentMethod) {
        dispatchEvent(
                QliroOneEvent.EVENT_NAME_ON_PAYMENT_METHOD_CHANGED,
                MapBuilder.of("paymentMethod",
                        MapBuilder.of(
                                "method", paymentMethod.getMethod(),
                                "subtype", paymentMethod.getSubtype(),
                                "price", paymentMethod.getPrice(),
                                "priceExVat", paymentMethod.getPriceExVat())),
                view);
    }

    @Override
    public void onPaymentDeclined(QliroOneCheckout view, @NonNull String declineReason,
                                  @NonNull String declineReasonMessage) {
        dispatchEvent(
                QliroOneEvent.EVENT_NAME_ON_PAYMENT_DECLINED,
                MapBuilder.of("reason",
                    MapBuilder.of(
                            "declineReason", declineReason,
                            "declineReasonMessage", declineReasonMessage)),
                view);
    }

    @Override
    public void onPaymentProcessStart(QliroOneCheckout view) {
        dispatchEvent(QliroOneEvent.EVENT_NAME_ON_PAYMENT_PROCESS_START, null, view);
    }

    @Override
    public void onPaymentProcessEnd(QliroOneCheckout view) {
        dispatchEvent(QliroOneEvent.EVENT_NAME_ON_PAYMENT_PROCESS_END, null, view);
    }

    @Override
    public void onSessionExpired(QliroOneCheckout view) {
        dispatchEvent(QliroOneEvent.EVENT_NAME_ON_SESSION_EXPIRED, null, view);
    }

    @Override
    public void onShippingMethodChanged(QliroOneCheckout view, @NonNull Shipping shipping) {
        MapBuilder.Builder builder = MapBuilder.builder()
                .put("method", shipping.getMethod())
                .put("secondaryOption", shipping.getSecondaryOption())
                .put("additionalShippingServices", shipping.getAdditionalShippingServices())
                .put("price", shipping.getPrice())
                .put("priceExVat", shipping.getPriceExVat())
                .put("totalShippingPrice", shipping.getTotalShippingPrice())
                .put("totalShippingPriceExVat", shipping.getTotalShippingPriceExVat());

        if(shipping.getAccessCode() != null) {
            builder.put("accessCode", shipping.getAccessCode());
        }
        dispatchEvent(
                QliroOneEvent.EVENT_NAME_ON_SHIPPING_METHOD_CHANGED,
                MapBuilder.of(
                        "shipping", builder.build()),
                view);
    }

    @Override
    public void onShippingPriceChanged(QliroOneCheckout view, int newShippingPrice, int newTotalShippingPrice) {
        dispatchEvent(
                QliroOneEvent.EVENT_NAME_ON_SHIPPING_PRICE_CHANGED,
                MapBuilder.of("shippingPrice",
                        MapBuilder.of(
                                "newShippingPrice", newShippingPrice,
                                "newTotalShippingPrice", newTotalShippingPrice)),
                view);
    }

    @Override
    public void onOrderUpdated(QliroOneCheckout view, @NonNull Order order) {
        WritableNativeArray orderItemsArray = new WritableNativeArray();
        for (OrderItem orderItem : order.getOrderItems()) {
            WritableNativeMap orderItemMap = new WritableNativeMap();
            orderItemMap.putString("merchantReference", orderItem.getMerchantReference());
            orderItemMap.putDouble("pricePerItemIncVat", orderItem.getPricePerItemIncVat());
            orderItemMap.putInt("quantity", orderItem.getQuantity());
            orderItemsArray.pushMap(orderItemMap);
        }

        MapBuilder.Builder builder = MapBuilder.builder()
                .put("totalPrice", order.getTotalPrice())
                .put("orderItems", orderItemsArray);

        if(order.getMerchantUpdateVersion() != null) {
            builder.put("merchantUpdateVersion", order.getMerchantUpdateVersion());
        }

        dispatchEvent(
                QliroOneEvent.EVENT_NAME_ON_ORDER_UPDATED,
                MapBuilder.of(
                        "order", builder.build()),
                view);
    }

    @Override
    public void onCompletePurchaseRedirect(QliroOneCheckout view, @NonNull PurchaseRedirectOptions options) {
        dispatchEvent(
                QliroOneEvent.EVENT_NAME_ON_COMPLETE_PURCHASE_REDIRECT,
                MapBuilder.of(
                        "options", MapBuilder.of(
                                "merchantConfirmationUrl", options.getMerchantConfirmationUrl())),
                view);
    }

    @Override
    public void onCheckoutHeightChanged(QliroOneCheckout view, @NonNull int height) {
        WeakReference<QliroOneWrapper> wrapperRef = wrapperRefForQliroOne(view);
        if(wrapperRef != null) {
            QliroOneWrapper wrapper = wrapperRef.get();
            if(wrapper.qliroOneCheckout.isScrollEnabled == false) {
                wrapper.setCheckoutHeight(height);
            }
        }
    }

    private WeakReference<QliroOneWrapper> wrapperRefForQliroOne(QliroOneCheckout qliroOneView) {
        for (WeakReference<QliroOneWrapper> reference : viewToDispatcher.keySet()) {
            QliroOneWrapper wrapper = reference.get();

            if (wrapper != null && wrapper.qliroOneCheckout == qliroOneView) {
                return reference;
            }
        }
        return null;
    }
}