//
//  QliroOneCheckoutWrapper.h
//  qliroonoe_reactnative_native
//
//  Created by Elliot Rask on 2022-07-03.
//

#import <React/RCTView.h>
#import <React/RCTUIManager.h>

NS_ASSUME_NONNULL_BEGIN

@interface QliroOneCheckoutWrapper : RCTView

@property (nonatomic, assign) BOOL isScrollEnabled;

@property (nonatomic, weak) RCTUIManager* uiManager;

#pragma mark - QliroOneActions

- (void)loadOrderHtmlWithHtml:(NSString * _Nonnull)html;
- (void)enableCheckoutScrollingWithEnabled:(BOOL)enabled;
- (void)lock;
- (void)unlock;
- (void)addSessionExpiredCallback;
- (void)removeSessionExpiredCallback;
- (void)addOrderUpdateCallback;
- (void)removeOrderUpdateCallback;
- (void)excludeResultModulesWithModules:(NSArray<NSString *> *)modules;
- (void)onScrollWithContainerHeight:(NSNumber *)containerHeight offset:(NSNumber *)offset;

#pragma mark - QliroOneListeners

@property (nonatomic, copy) RCTDirectEventBlock onQCOCheckoutLoaded;
@property (nonatomic, copy) RCTDirectEventBlock onQCOCustomerInfoChangedWithCustomer;
@property (nonatomic, copy) RCTDirectEventBlock onQCOOrderUpdatedWithOrder;
@property (nonatomic, copy) RCTDirectEventBlock onQCOPaymentDeclinedWithDeclineReason;
@property (nonatomic, copy) RCTDirectEventBlock onQCOPaymentMethodChangedWithPaymentMethod;
@property (nonatomic, copy) RCTDirectEventBlock onQCOPaymentProcessEnd;
@property (nonatomic, copy) RCTDirectEventBlock onQCOPaymentProcessStart;
@property (nonatomic, copy) RCTDirectEventBlock onQCOSessionExpired;
@property (nonatomic, copy) RCTDirectEventBlock onQCOShippingMethodChangedWithShipping;
@property (nonatomic, copy) RCTDirectEventBlock onQCOShippingPriceChangedWithNewShippingPrice;
@property (nonatomic, copy) RCTDirectEventBlock onQCOCompletePurchaseRedirectWithOptions;

@end

NS_ASSUME_NONNULL_END
