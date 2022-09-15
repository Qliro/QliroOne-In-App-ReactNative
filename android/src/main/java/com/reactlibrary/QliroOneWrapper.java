package com.reactlibrary;

import android.util.AttributeSet;
import android.view.View;
import android.widget.LinearLayout;

import com.facebook.react.bridge.GuardedRunnable;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.UIManagerModule;

import com.qliro.qliroone.QliroOneCheckout;

/***
 * Wraps the QliroOneCheckout so we can see when a requestLayout() has been triggered.
 */
public class QliroOneWrapper extends LinearLayout {
    private float displayDensity = 1;
    public QliroOneCheckout qliroOneCheckout;

    public QliroOneWrapper(ReactApplicationContext context, AttributeSet attrs) {
        super(context, attrs);
        // Get density for resizing.
        displayDensity = context.getResources().getDisplayMetrics().density;

        LinearLayout.LayoutParams webViewParams = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT);
        qliroOneCheckout = new QliroOneCheckout(getReactAppContext().getCurrentActivity(), attrs); // Insure we use activity and not application context for dialogs.
        addView(qliroOneCheckout, webViewParams);
    }

    public void setCheckoutHeight(int height) {
        try {
            final int width = getParentViewWidth();
            final float scaledHeight = height * displayDensity;
            getReactAppContext().runOnNativeModulesQueueThread(new GuardedRunnable(getReactAppContext()) {
                @Override
                public void runGuarded() {
                    UIManagerModule uimm = getReactAppContext().getNativeModule(UIManagerModule.class);
                    uimm.updateNodeSize(getId(), width, (int) scaledHeight);
                }
            });
        } catch (Throwable t) {
        }
    }

    /**
     * Returns the parent view's width.
     */
    private int getParentViewWidth() {
        View parentReactView = (View) getParent();
        if (parentReactView == null || !(parentReactView instanceof View)) {
            return 0;
        }
        return parentReactView.getWidth();
    }

    /**
     * Returns the app context the wrapper was initialized with.
     */
    private ReactApplicationContext getReactAppContext() {
        return (ReactApplicationContext) getContext();
    }
}
