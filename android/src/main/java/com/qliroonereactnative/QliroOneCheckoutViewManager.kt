package com.qliroonereactnative

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.QliroOneCheckoutManagerDelegate
import com.facebook.react.viewmanagers.QliroOneCheckoutManagerInterface

@ReactModule(name = QliroOneCheckoutViewManager.NAME)
class QliroOneCheckoutViewManager :
    SimpleViewManager<QliroOneCheckoutView>(),
    QliroOneCheckoutManagerInterface<QliroOneCheckoutView> {

    // Codegen-generated delegate routes Fabric prop/command calls to the interface methods below,
    // so props and commands bind correctly on the New Architecture (no manual receiveCommand).
    private val delegate = QliroOneCheckoutManagerDelegate(this)

    override fun getDelegate(): ViewManagerDelegate<QliroOneCheckoutView> = delegate

    override fun getName(): String = NAME

    override fun createViewInstance(context: ThemedReactContext): QliroOneCheckoutView {
        val view = QliroOneCheckoutView(context)

        // Events go straight to the Fabric EventDispatcher. Resolving the tag, surface and
        // dispatcher per event (rather than once here) is deliberate: the view has no react tag yet
        // at creation time, and the dispatcher is picked from the tag.
        view.onEventCallback = { eventName: String, params: Map<String, Any?>? ->
            val eventData: WritableMap = if (params != null) {
                convertMapToWritableMap(params)
            } else {
                Arguments.createMap()
            }
            val viewTag = view.id
            UIManagerHelper.getEventDispatcherForReactTag(context, viewTag)?.dispatchEvent(
                QliroOneCheckoutEvent(
                    UIManagerHelper.getSurfaceId(view),
                    viewTag,
                    eventName,
                    eventData
                )
            )
        }

        return view
    }

    // --- Props (QliroOneCheckoutManagerInterface) ---

    override fun setIsScrollEnabled(view: QliroOneCheckoutView, value: Boolean) {
        view.qliroOneCheckout.isScrollEnabled = value
    }

    override fun setApplePayMerchantId(view: QliroOneCheckoutView, value: String?) {
        // No Apple Pay on Android; prop exists for cross-platform API symmetry.
    }

    override fun setAdditionalAllowedUrlSchemes(view: QliroOneCheckoutView, value: ReadableArray?) {
        // iOS only; prop exists for cross-platform API symmetry, like setApplePayMerchantId above.
        // The Android SDK's external-scheme allowlist is a private `val` in WebViewSecurity.kt with
        // no public API to widen it, so there is nothing to forward this to.
        //
        // This override is not optional: declaring the prop in the codegen spec adds an abstract
        // member to the generated QliroOneCheckoutManagerInterface, so omitting it fails the Kotlin
        // compile for every consuming app — not just this module.
    }

    override fun setIsDebugEnabled(view: QliroOneCheckoutView, value: Boolean) {
        view.qliroOneCheckout.isDebugEnabled = value
    }

    override fun setLoadTimeoutMs(view: QliroOneCheckoutView, value: Double) {
        view.qliroOneCheckout.loadTimeoutMs = value.toLong()
    }

    // --- Commands (QliroOneCheckoutManagerInterface) ---

    override fun loadOrderHtml(view: QliroOneCheckoutView, html: String) {
        view.loadOrderHtml(html)
    }

    override fun lock(view: QliroOneCheckoutView) {
        view.lock()
    }

    override fun unlock(view: QliroOneCheckoutView) {
        view.unlock()
    }

    override fun addSessionExpiredCallback(view: QliroOneCheckoutView) {
        view.addSessionExpiredCallback()
    }

    override fun removeSessionExpiredCallback(view: QliroOneCheckoutView) {
        view.removeSessionExpiredCallback()
    }

    override fun addOrderUpdateCallback(view: QliroOneCheckoutView) {
        view.addOrderUpdateCallback()
    }

    override fun removeOrderUpdateCallback(view: QliroOneCheckoutView) {
        view.removeOrderUpdateCallback()
    }

    override fun enableCheckoutScrolling(view: QliroOneCheckoutView, enabled: Boolean) {
        view.enableCheckoutScrolling(enabled)
    }

    override fun excludeResultModules(view: QliroOneCheckoutView, modules: ReadableArray?) {
        val list = mutableListOf<String>()
        if (modules != null) {
            for (i in 0 until modules.size()) {
                modules.getString(i)?.let { list.add(it) }
            }
        }
        view.excludeResultModules(list)
    }

    override fun onScrollWithContainerHeight(
        view: QliroOneCheckoutView,
        containerHeight: Double,
        offset: Double
    ) {
        view.onScrollWithContainerHeight(containerHeight, offset)
    }

    private fun convertMapToWritableMap(map: Map<String, Any?>): WritableMap {
        val writableMap = Arguments.createMap()

        for ((key, value) in map) {
            when (value) {
                null -> writableMap.putNull(key)
                is String -> writableMap.putString(key, value)
                is Int -> writableMap.putInt(key, value)
                is Double -> writableMap.putDouble(key, value)
                is Boolean -> writableMap.putBoolean(key, value)
                is Map<*, *> -> {
                    @Suppress("UNCHECKED_CAST")
                    writableMap.putMap(key, convertMapToWritableMap(value as Map<String, Any?>))
                }
                is List<*> -> {
                    val array = Arguments.createArray()
                    value.forEach { item ->
                        when (item) {
                            is Map<*, *> -> {
                                @Suppress("UNCHECKED_CAST")
                                array.pushMap(convertMapToWritableMap(item as Map<String, Any?>))
                            }
                            is String -> array.pushString(item)
                            is Int -> array.pushInt(item)
                            is Double -> array.pushDouble(item)
                            is Boolean -> array.pushBoolean(item)
                        }
                    }
                    writableMap.putArray(key, array)
                }
            }
        }

        return writableMap
    }

    companion object {
        const val NAME = "QliroOneCheckout"
    }
}
