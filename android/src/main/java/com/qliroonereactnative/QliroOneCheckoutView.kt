package com.qliroonereactnative

import android.content.Context
import android.widget.LinearLayout
import com.qliro.qliroone.QliroOneCheckout
import com.qliro.qliroone.QliroOneListener
import com.qliro.qliroone.enums.Module
import com.qliro.qliroone.enums.QliroOneErrorCode
import com.qliro.qliroone.models.*
import org.json.JSONArray
import org.json.JSONObject

/**
 * Bridges the native Android checkout to React Native events.
 *
 * The native SDK delivers every [QliroOneListener] callback on the main thread, so the view work
 * done here is safe without any further marshalling.
 *
 * Layout is deliberately left to Fabric: this view reports the checkout's content height as an
 * event and never sizes itself. See [onCheckoutHeightChanged].
 */
class QliroOneCheckoutView(context: Context) : LinearLayout(context), QliroOneListener {
    
    val qliroOneCheckout: QliroOneCheckout

    var onEventCallback: ((String, Map<String, Any?>?) -> Unit)? = null
    
    init {
        val params = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
        qliroOneCheckout = QliroOneCheckout(context, null, "3.0.0")
        qliroOneCheckout.qliroOneListener = this
        addView(qliroOneCheckout, params)
    }
     
    fun loadOrderHtml(html: String) {
        qliroOneCheckout.loadOrderHtml(html)
    }
    
    fun lock() {
        qliroOneCheckout.lock()
    }
    
    fun unlock() {
        qliroOneCheckout.unlock()
    }
    
    fun addSessionExpiredCallback() {
        qliroOneCheckout.addSessionExpiredCallback()
    }
    
    fun removeSessionExpiredCallback() {
        qliroOneCheckout.removeSessionExpiredCallback()
    }
    
    fun addOrderUpdateCallback() {
        qliroOneCheckout.addOrderUpdateCallback()
    }
    
    fun removeOrderUpdateCallback() {
        qliroOneCheckout.removeOrderUpdateCallback()
    }
    
    // Deliberately NOT `isScrollEnabled`. The native SDK has two distinct scrolling APIs and they
    // mean opposite things:
    //   - `isScrollEnabled` (property) — whether the checkout's own web view scrolls its content,
    //     driven by the `isScrollEnabled` prop and read back in onCheckoutHeightChanged below.
    //   - `enableCheckoutScrolling(enabled)` (action) — evaluates `q1.enableScrolling(enabled)`,
    //     which asks the checkout to scroll to the payment/shipping option the customer picks.
    // Assigning the property here silently overrode the merchant's `isScrollEnabled` prop and
    // never produced the scroll-to-selection behaviour this command exists for. iOS has always
    // called the action (`enableCheckoutScrollingWithEnabled:`).
    fun enableCheckoutScrolling(enabled: Boolean) {
        qliroOneCheckout.enableCheckoutScrolling(enabled)
    }
    
    fun excludeResultModules(modules: List<String>) {
        // Module names cross the bridge as strings (the RN spec cannot express enums). Unknown
        // names are dropped with a warning instead of failing the whole call, mirroring iOS.
        val parsed = mutableListOf<Module>()
        modules.forEach { name ->
            val module = Module.entries.firstOrNull { it.name == name }
            if (module == null) {
                onEventCallback?.invoke(
                    "onLog",
                    mapOf(
                        "level" to "warn",
                        "message" to "excludeResultModules: unknown module '$name'"
                    )
                )
            } else {
                parsed.add(module)
            }
        }
        qliroOneCheckout.excludeResultModules(parsed.toTypedArray())
    }
    
    fun onScrollWithContainerHeight(containerHeight: Double, offset: Double) {
        qliroOneCheckout.onScroll(containerHeight.toInt(), offset.toInt())
    }

    override fun onCheckoutLoaded(view: QliroOneCheckout) {
        view.requestLayout()
        onEventCallback?.invoke("onCheckoutLoaded", null)
    }
    
    override fun onCustomerInfoChanged(view: QliroOneCheckout, customer: Customer) {
        val address = customer.address
        val customerMap = mapOf(
            "email" to customer.email,
            "mobileNumber" to customer.mobileNumber,
            "personalNumber" to customer.personalNumber,
            "organizationNumber" to customer.organizationNumber,
            "address" to mapOf(
                "firstName" to address?.firstName,
                "lastName" to address?.lastName,
                "street" to address?.street,
                "careOf" to address?.careOf,
                "city" to address?.city,
                "postalCode" to address?.postalCode,
                "isMasked" to (address?.isMasked ?: false)
            )
        )
        onEventCallback?.invoke("onCustomerInfoChanged", mapOf("customer" to customerMap))
    }
    
    override fun onCustomerDeauthenticating(view: QliroOneCheckout) {
        onEventCallback?.invoke("onCustomerDeauthenticating", null)
    }
    
    override fun onPaymentMethodChanged(view: QliroOneCheckout, paymentMethod: PaymentMethod) {
        val methodMap = mapOf(
            "method" to paymentMethod.method,
            "subtype" to paymentMethod.subtype,
            "price" to paymentMethod.price,
            "priceExVat" to paymentMethod.priceExVat
        )
        onEventCallback?.invoke("onPaymentMethodChanged", mapOf("paymentMethod" to methodMap))
    }
    
    override fun onPaymentDeclined(view: QliroOneCheckout, declineReason: String, declineReasonMessage: String) {
        val reasonMap = mapOf(
            "declineReason" to declineReason,
            "declineReasonMessage" to declineReasonMessage
        )
        onEventCallback?.invoke("onPaymentDeclined", mapOf("reason" to reasonMap))
    }
    
    override fun onPaymentProcessStart(view: QliroOneCheckout) {
        onEventCallback?.invoke("onPaymentProcessStart", null)
    }
    
    override fun onPaymentProcessEnd(view: QliroOneCheckout) {
        onEventCallback?.invoke("onPaymentProcessEnd", null)
    }
    
    override fun onSessionExpired(view: QliroOneCheckout) {
        onEventCallback?.invoke("onSessionExpired", null)
    }
    
    override fun onShippingMethodChanged(view: QliroOneCheckout, shipping: Shipping) {
        val shippingMap = mutableMapOf<String, Any?>(
            "method" to shipping.method,
            "secondaryOption" to shipping.secondaryOption,
            "price" to shipping.price,
            "priceExVat" to shipping.priceExVat,
            "totalShippingPrice" to shipping.totalShippingPrice,
            "totalShippingPriceExVat" to shipping.totalShippingPriceExVat
        )
        // additionalShippingServices crosses the bridge as a JSON string (the RN spec declares it
        // as a string and JS JSON.parses it). Omitted when empty, mirroring iOS.
        shipping.additionalShippingServices?.takeIf { it.isNotEmpty() }?.let {
            shippingMap["additionalShippingServices"] = JSONArray(it).toString()
        }
        shipping.accessCode?.let { shippingMap["accessCode"] = it }
        onEventCallback?.invoke("onShippingMethodChanged", mapOf("shipping" to shippingMap))
    }
    
    override fun onShippingPriceChanged(view: QliroOneCheckout, newShippingPrice: Double, newTotalShippingPrice: Double) {
        val priceMap = mapOf(
            "newShippingPrice" to newShippingPrice,
            "newTotalShippingPrice" to newTotalShippingPrice
        )
        onEventCallback?.invoke("onShippingPriceChanged", mapOf("shippingPrice" to priceMap))
    }
    
    override fun onOrderUpdated(view: QliroOneCheckout, order: Order) {
        val orderMap = mutableMapOf<String, Any?>(
            "totalPrice" to order.totalPrice
        )
        // orderItems crosses the bridge as a JSON string (the RN spec declares it as a string and
        // JS JSON.parses it). Omitted when empty, mirroring iOS.
        if (order.orderItems.isNotEmpty()) {
            val orderItems = JSONArray()
            order.orderItems.forEach { item ->
                orderItems.put(
                    JSONObject()
                        .put("merchantReference", item.merchantReference)
                        .put("pricePerItemIncVat", item.pricePerItemIncVat)
                        .put("quantity", item.quantity)
                )
            }
            orderMap["orderItems"] = orderItems.toString()
        }
        order.merchantUpdateVersion?.let { orderMap["merchantUpdateVersion"] = it }
        
        onEventCallback?.invoke("onOrderUpdated", mapOf("order" to orderMap))
    }
    
    override fun onCompletePurchaseRedirect(view: QliroOneCheckout, options: PurchaseRedirectOptions) {
        val optionsMap = mapOf(
            "merchantConfirmationUrl" to options.merchantConfirmationUrl
        )
        onEventCallback?.invoke("onCompletePurchaseRedirect", mapOf("options" to optionsMap))
    }
    
    // Reported, not applied. Fabric owns this view's layout from the shadow tree, so writing
    // layoutParams here fought the next layout pass; the JS component already applies the height to
    // the wrapper View it renders around us (src/index.tsx), and the native view fills that wrapper.
    //
    // This used to look harmless only because of the enableCheckoutScrolling bug above: that bug
    // forced isScrollEnabled to true, so the guard below never let the native write run. Fixing the
    // bug would have switched the native write back on and started the fight for real.
    //
    // The height is in dp, which is also what React Native style units are — no density conversion
    // belongs on the JS value.
    override fun onCheckoutHeightChanged(view: QliroOneCheckout, height: Int) {
        onEventCallback?.invoke("onCheckoutHeightChanged", mapOf("height" to height))
    }

    override fun onClosePopup(view: QliroOneCheckout) {
        onEventCallback?.invoke("onClosePopup", null)
    }

    // code.value, not code.name: the JS side of the bridge has always received the snake_case
    // wire form ("parse_error", …), and iOS sends the same strings.
    override fun onError(view: QliroOneCheckout, code: QliroOneErrorCode, message: String) {
        onEventCallback?.invoke("onError", mapOf("code" to code.value, "message" to message))
    }

    override fun onLog(view: QliroOneCheckout, level: String, message: String) {
        onEventCallback?.invoke("onLog", mapOf("level" to level, "message" to message))
    }

    override fun onStateChanged(view: QliroOneCheckout, state: String, previousState: String) {
        onEventCallback?.invoke(
            "onStateChanged",
            mapOf("state" to state, "previousState" to previousState)
        )
    }

    override fun onTelemetryEvent(
        view: QliroOneCheckout,
        name: String,
        durationMs: Long?,
        metadata: Map<String, String>?
    ) {
        val map = mutableMapOf<String, Any?>("name" to name)
        durationMs?.let { map["durationMs"] = it.toDouble() }
        // metadata crosses the bridge as a JSON string (the RN spec cannot express arbitrary maps).
        metadata?.let { map["metadata"] = JSONObject(it as Map<*, *>).toString() }
        onEventCallback?.invoke("onTelemetryEvent", map)
    }
}