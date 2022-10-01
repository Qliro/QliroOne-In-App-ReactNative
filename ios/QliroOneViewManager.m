//
//  QliroOneViewManager.m
//  qliroonoe_reactnative_native
//
//  Created by Elliot Rask on 2022-07-02.
//

#import "QliroOneViewManager.h"

#import <React/RCTUIManager.h>
#import <React/RCTDefines.h>

#import "QliroOneCheckoutWrapper.h"

@implementation QliroOneViewManager

RCT_EXPORT_MODULE(QliroOneCheckout)

- (UIView *)view
{
	QliroOneCheckoutWrapper *checkoutWrapper = [QliroOneCheckoutWrapper new];
	checkoutWrapper.uiManager = self.bridge.uiManager;
	return checkoutWrapper;
}

RCT_EXPORT_VIEW_PROPERTY(isScrollEnabled, BOOL)
RCT_REMAP_VIEW_PROPERTY(onCheckoutLoaded, onQCOCheckoutLoaded, RCTDirectEventBlock)
RCT_REMAP_VIEW_PROPERTY(onCustomerInfoChanged, onQCOCustomerInfoChangedWithCustomer, RCTDirectEventBlock)
RCT_REMAP_VIEW_PROPERTY(onOrderUpdated, onQCOOrderUpdatedWithOrder, RCTDirectEventBlock)
RCT_REMAP_VIEW_PROPERTY(onPaymentDeclined, onQCOPaymentDeclinedWithDeclineReason, RCTDirectEventBlock)
RCT_REMAP_VIEW_PROPERTY(onPaymentMethodChanged, onQCOPaymentMethodChangedWithPaymentMethod, RCTDirectEventBlock)
RCT_REMAP_VIEW_PROPERTY(onPaymentProcessEnd, onQCOPaymentProcessEnd, RCTDirectEventBlock)
RCT_REMAP_VIEW_PROPERTY(onPaymentProcessStart, onQCOPaymentProcessStart, RCTDirectEventBlock)
RCT_REMAP_VIEW_PROPERTY(onSessionExpired, onQCOSessionExpired, RCTDirectEventBlock)
RCT_REMAP_VIEW_PROPERTY(onShippingMethodChanged, onQCOShippingMethodChangedWithShipping, RCTDirectEventBlock)
RCT_REMAP_VIEW_PROPERTY(onShippingPriceChanged, onQCOShippingPriceChangedWithNewShippingPrice, RCTDirectEventBlock)
RCT_REMAP_VIEW_PROPERTY(onCompletePurchaseRedirect, onQCOCompletePurchaseRedirectWithOptions, RCTDirectEventBlock)
RCT_REMAP_VIEW_PROPERTY(onCustomerDeauthenticating, onQCOCustomerDeauthenticating, RCTDirectEventBlock)

#pragma mark - QliroOneActions

RCT_EXPORT_METHOD(loadOrderHtml:(nonnull NSNumber *)reactTag html: (nonnull NSString*)html) {
	[self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, QliroOneCheckoutWrapper *> *viewRegistry) {
		QliroOneCheckoutWrapper *view = viewRegistry[reactTag];
		if (![view isKindOfClass:[QliroOneCheckoutWrapper class]]) {
			RCTLogError(@"Invalid view returned from registry, expecting QliroOneCheckoutWrapper, got: %@", view);
		} else {
			[view loadOrderHtmlWithHtml:html];
		}
	}];
}

RCT_EXPORT_METHOD(addSessionExpiredCallback:(nonnull NSNumber *)reactTag) {
	[self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, QliroOneCheckoutWrapper *> *viewRegistry) {
		QliroOneCheckoutWrapper *view = viewRegistry[reactTag];
		if (![view isKindOfClass:[QliroOneCheckoutWrapper class]]) {
			RCTLogError(@"Invalid view returned from registry, expecting QliroOneCheckoutWrapper, got: %@", view);
		} else {
			[view addSessionExpiredCallback];
		}
	}];
}

RCT_EXPORT_METHOD(removeSessionExpiredCallback:(nonnull NSNumber *)reactTag) {
	[self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, QliroOneCheckoutWrapper *> *viewRegistry) {
		QliroOneCheckoutWrapper *view = viewRegistry[reactTag];
		if (![view isKindOfClass:[QliroOneCheckoutWrapper class]]) {
			RCTLogError(@"Invalid view returned from registry, expecting QliroOneCheckoutWrapper, got: %@", view);
		} else {
			[view removeSessionExpiredCallback];
		}
	}];
}

RCT_EXPORT_METHOD(lock:(nonnull NSNumber *)reactTag) {
	[self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, QliroOneCheckoutWrapper *> *viewRegistry) {
		QliroOneCheckoutWrapper *view = viewRegistry[reactTag];
		if (![view isKindOfClass:[QliroOneCheckoutWrapper class]]) {
			RCTLogError(@"Invalid view returned from registry, expecting QliroOneCheckoutWrapper, got: %@", view);
		} else {
			[view lock];
		}
	}];
}

RCT_EXPORT_METHOD(unlock:(nonnull NSNumber *)reactTag) {
	[self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, QliroOneCheckoutWrapper *> *viewRegistry) {
		QliroOneCheckoutWrapper *view = viewRegistry[reactTag];
		if (![view isKindOfClass:[QliroOneCheckoutWrapper class]]) {
			RCTLogError(@"Invalid view returned from registry, expecting QliroOneCheckoutWrapper, got: %@", view);
		} else {
			[view unlock];
		}
	}];
}

RCT_EXPORT_METHOD(addOrderUpdateCallback:(nonnull NSNumber *)reactTag) {
	[self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, QliroOneCheckoutWrapper *> *viewRegistry) {
		QliroOneCheckoutWrapper *view = viewRegistry[reactTag];
		if (![view isKindOfClass:[QliroOneCheckoutWrapper class]]) {
			RCTLogError(@"Invalid view returned from registry, expecting QliroOneCheckoutWrapper, got: %@", view);
		} else {
			[view addOrderUpdateCallback];
		}
	}];
}

RCT_EXPORT_METHOD(removeOrderUpdateCallback:(nonnull NSNumber *)reactTag) {
	[self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, QliroOneCheckoutWrapper *> *viewRegistry) {
		QliroOneCheckoutWrapper *view = viewRegistry[reactTag];
		if (![view isKindOfClass:[QliroOneCheckoutWrapper class]]) {
			RCTLogError(@"Invalid view returned from registry, expecting QliroOneCheckoutWrapper, got: %@", view);
		} else {
			[view removeOrderUpdateCallback];
		}
	}];
}

RCT_EXPORT_METHOD(enableScrolling:(nonnull NSNumber *)reactTag enabled: (BOOL)enabled) {
	[self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, QliroOneCheckoutWrapper *> *viewRegistry) {
		QliroOneCheckoutWrapper *view = viewRegistry[reactTag];
		if (![view isKindOfClass:[QliroOneCheckoutWrapper class]]) {
			RCTLogError(@"Invalid view returned from registry, expecting QliroOneCheckoutWrapper, got: %@", view);
		} else {
			[view enableCheckoutScrollingWithEnabled:enabled];
		}
	}];
}

RCT_EXPORT_METHOD(excludeResultModules:(nonnull NSNumber *)reactTag modules: (NSArray<NSString *> *)modules) {
	[self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, QliroOneCheckoutWrapper *> *viewRegistry) {
		QliroOneCheckoutWrapper *view = viewRegistry[reactTag];
		if (![view isKindOfClass:[QliroOneCheckoutWrapper class]]) {
			RCTLogError(@"Invalid view returned from registry, expecting QliroOneCheckoutWrapper, got: %@", view);
		} else {
			[view excludeResultModulesWithModules:modules];
		}
	}];
}

RCT_EXPORT_METHOD(onScroll:(nonnull NSNumber *)reactTag containerHeight: (nonnull NSNumber *)containerHeight offset:(nonnull NSNumber *)offset) {
	[self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, QliroOneCheckoutWrapper *> *viewRegistry) {
		QliroOneCheckoutWrapper *view = viewRegistry[reactTag];
		if (![view isKindOfClass:[QliroOneCheckoutWrapper class]]) {
			RCTLogError(@"Invalid view returned from registry, expecting QliroOneCheckoutWrapper, got: %@", view);
		} else {
			[view onScrollWithContainerHeight:containerHeight offset:offset];
		}
	}];
}

@end
