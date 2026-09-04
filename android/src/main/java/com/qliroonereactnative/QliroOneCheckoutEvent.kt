package com.qliroonereactnative

import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event

/**
 * A checkout event on its way to JS through the Fabric [com.facebook.react.uimanager.events.EventDispatcher].
 *
 * [name] is the JS handler name straight from the codegen spec ("onCheckoutLoaded", …). The C++
 * EventEmitter normalizes it to the "topCheckoutLoaded" form that the generated view config
 * registers, so no mapping table is needed on this side.
 *
 * Coalescing is disabled: every event name here can fire repeatedly with different payloads within
 * one frame (`onLog`, `onStateChanged`, `onTelemetryEvent` in particular), and a coalescing event
 * lets Fabric discard all but the newest of a batch.
 */
internal class QliroOneCheckoutEvent(
    surfaceId: Int,
    viewTag: Int,
    private val name: String,
    private val payload: WritableMap
) : Event<QliroOneCheckoutEvent>(surfaceId, viewTag) {

    override fun getEventName(): String = name

    override fun getEventData(): WritableMap = payload

    override fun canCoalesce(): Boolean = false
}
