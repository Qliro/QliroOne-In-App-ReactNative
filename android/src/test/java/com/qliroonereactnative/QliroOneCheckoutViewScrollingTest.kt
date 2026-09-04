package com.qliroonereactnative

import android.os.Looper
import android.webkit.WebView
import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.Shadows.shadowOf
import org.robolectric.shadows.ShadowWebView

/**
 * Guards the distinction between the native SDK's two scrolling APIs.
 *
 * They are easy to conflate — the names are near-identical — but they control different things:
 *
 * | API | Kind | Effect |
 * |-----|------|--------|
 * | `QliroOneCheckout.isScrollEnabled` | property | whether the checkout's web view scrolls its own content |
 * | `QliroOneCheckout.enableCheckoutScrolling(enabled)` | action | evaluates `q1.enableScrolling(...)`, making the checkout scroll to the payment/shipping option the customer selects |
 *
 * The bridge once wired the `enableCheckoutScrolling` *command* to the `isScrollEnabled`
 * *property*, which both dropped the scroll-to-selection behaviour and silently overrode the
 * merchant's `isScrollEnabled` prop (after which [QliroOneCheckoutView.onCheckoutHeightChanged]
 * stopped applying the content height). iOS was never affected — it calls
 * `enableCheckoutScrollingWithEnabled:`. These tests fail if the two are ever conflated again.
 *
 * Robolectric runs the test body on the thread owning the main looper, so the SDK's `onMain` work
 * applies inline. `evaluateJavascript` is always posted, hence [lastEvaluatedJavascript] draining
 * the looper first.
 */
@RunWith(RobolectricTestRunner::class)
class QliroOneCheckoutViewScrollingTest {

    private lateinit var view: QliroOneCheckoutView

    private val webView: ShadowWebView
        get() = shadowOf(view.qliroOneCheckout as WebView)

    /** The last script handed to `WebView.evaluateJavascript`, after draining the post. */
    private fun lastEvaluatedJavascript(): String? {
        shadowOf(Looper.getMainLooper()).idle()
        return webView.lastEvaluatedJavascript
    }

    @Before
    fun createView() {
        view = QliroOneCheckoutView(ApplicationProvider.getApplicationContext())
    }

    @Test
    fun `enableCheckoutScrolling evaluates the checkout scrolling script`() {
        view.enableCheckoutScrolling(true)
        assertEquals("q1.enableScrolling(true)", lastEvaluatedJavascript())

        view.enableCheckoutScrolling(false)
        assertEquals("q1.enableScrolling(false)", lastEvaluatedJavascript())
    }

    @Test
    fun `enableCheckoutScrolling leaves the isScrollEnabled property untouched`() {
        // The isScrollEnabled prop is the merchant's; the command must not write to it. This is the
        // regression that broke self-sizing: overriding it to true suppressed setCheckoutHeight.
        view.qliroOneCheckout.isScrollEnabled = false

        view.enableCheckoutScrolling(true)

        assertEquals(false, view.qliroOneCheckout.isScrollEnabled)
    }

    @Test
    fun `setting isScrollEnabled does not evaluate the checkout scrolling script`() {
        // The mirror of the test above: the property is local view state and must not leak into
        // the checkout as a q1.enableScrolling call. Compared against the script evaluated before
        // the write rather than against null, so construction evaluating anything of its own
        // cannot turn this into a false pass or a false failure.
        val before = lastEvaluatedJavascript()

        view.qliroOneCheckout.isScrollEnabled = true

        assertEquals(before, lastEvaluatedJavascript())
    }

    @Test
    fun `the two scrolling APIs are distinct members of the native SDK`() {
        // Reflection rather than a behavioural assertion: this fails loudly if a future native SDK
        // ever collapses the action into the property (or vice versa), which would make the two
        // tests above pass for the wrong reason.
        //
        // The setter is `setScrollEnabled`, not `setIsScrollEnabled`: for a property whose name
        // starts with `is`, Kotlin names the getter after the property and forms the setter by
        // replacing `is` with `set`. The signatures are pinned in the native SDK's binary-
        // compatibility dump, ../../qliro-one-android/qliroone/api/qliroone.api.
        val checkoutClass = view.qliroOneCheckout.javaClass

        val action = checkoutClass.getMethod("enableCheckoutScrolling", Boolean::class.java)
        val propertySetter = checkoutClass.getMethod("setScrollEnabled", Boolean::class.java)
        val propertyGetter = checkoutClass.getMethod("isScrollEnabled")

        assertNotEquals(action, propertySetter)
        assertEquals(Boolean::class.java, propertyGetter.returnType)
        assertTrue(action.parameterTypes.contentEquals(propertySetter.parameterTypes))
    }
}
