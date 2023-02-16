//
//  QliroOneCheckoutWrapper.m
//  qliroonoe_reactnative_native
//
//  Created by Elliot Rask on 2022-07-03.
//

#import "QliroOneCheckoutWrapper.h"

@import QliroOne;

@interface QliroOneCheckoutWrapper () <QliroOneListener>

@property (nonatomic, strong) QliroOneCheckout* checkoutView;

@end

@implementation QliroOneCheckoutWrapper

- (instancetype)init
{
	self = [super init];
	if (self) {
		self.checkoutView = [[QliroOneCheckout alloc] initWithReactNativeSDKVersion: @"0.1.17"];
		self.checkoutView.qliroOneListener = self;
		self.checkoutView.translatesAutoresizingMaskIntoConstraints = NO;
		self.checkoutView.isScrollEnabled = false;
		
		[self addSubview:self.checkoutView];
		
		[NSLayoutConstraint activateConstraints:[[NSArray alloc] initWithObjects:
													 [self.checkoutView.topAnchor constraintEqualToAnchor:self.topAnchor],
												 [self.checkoutView.bottomAnchor constraintEqualToAnchor:self.bottomAnchor],
												 [self.checkoutView.leadingAnchor constraintEqualToAnchor:self.leadingAnchor],
												 [self.checkoutView.trailingAnchor constraintEqualToAnchor:self.trailingAnchor], nil
												]];
	}
	return self;
}

- (void)layoutSubviews {
	[super layoutSubviews];
	self.checkoutView.frame = self.bounds;
	[self.checkoutView layoutSubviews];
}

- (void)loadOrderHtmlWithHtml:(NSString * _Nonnull)html {
	[self.checkoutView loadOrderHtmlWithHtml:html];
}

- (void)setIsScrollEnabled:(BOOL)isScrollEnabled{
	self.checkoutView.isScrollEnabled = isScrollEnabled;
}

#pragma mark - QliroOneActions

- (void)enableCheckoutScrollingWithEnabled:(BOOL)enabled {
	[self.checkoutView enableCheckoutScrollingWithEnabled:enabled];
}

- (void)lock {
	[self.checkoutView lock];
}

- (void)unlock {
	[self.checkoutView unlock];
}

- (void)addSessionExpiredCallback {
	[self.checkoutView addSessionExpiredCallback];
}

- (void)removeSessionExpiredCallback {
	[self.checkoutView removeSessionExpiredCallback];
}

- (void)addOrderUpdateCallback {
	[self.checkoutView addOrderUpdateCallback];
}

- (void)removeOrderUpdateCallback {
	[self.checkoutView removeOrderUpdateCallback];
}

- (void)excludeResultModulesWithModules:(NSArray<NSString *> *)modules {
	[self.checkoutView excludeResultModulesWithModules:modules];
}

- (void)onScrollWithContainerHeight:(NSNumber *)containerHeight offset:(NSNumber *)offset {
	[self.checkoutView onScrollWithContainerHeight:[containerHeight integerValue] offset:[offset integerValue]];
}

#pragma mark - Helpers

- (void) addIfNotNilWitDictionary:(NSMutableDictionary *)dictionary value:(NSObject *)value key:(NSString *) key {
	if (value == nil) {
		RCTLog([NSString stringWithFormat:@"Tried to insert nil value for key %@", key]);
		return;
	}
	[dictionary setObject:value forKey:key];
}

#pragma mark - QliroOneListeners

- (void)onCheckoutLoaded {
	if (!self.onQCOCheckoutLoaded) {
		RCTLog(@"Missing 'onQCOCheckoutLoaded' callback prop.");
		return;
	}
	
	self.onQCOCheckoutLoaded(@{});
}

- (void)onCustomerInfoChangedWithCustomer:(Customer * _Nonnull)customer {
	if (!self.onQCOCustomerInfoChangedWithCustomer) {
		RCTLog(@"Missing 'onQCOCustomerInfoChangedWithCustomer callback prop.");
		return;
	}
	NSMutableDictionary *customerData = [NSMutableDictionary new];
	[self addIfNotNilWitDictionary:customerData value:customer.email key:@"email"];
	[self addIfNotNilWitDictionary:customerData value:customer.mobileNumber key:@"mobileNumber"];
	[self addIfNotNilWitDictionary:customerData value:customer.personalNumber key:@"personalNumber"];
	[self addIfNotNilWitDictionary:customerData value:customer.organizationNumber key:@"organizationNumber"];

	if (customer.address != nil) {
		NSMutableDictionary *addressData = [NSMutableDictionary new];
		[self addIfNotNilWitDictionary:addressData value:customer.address.firstName key:@"firstName"];
		[self addIfNotNilWitDictionary:addressData value:customer.address.lastName key:@"lastName"];
		[self addIfNotNilWitDictionary:addressData value:customer.address.street key:@"street"];
		[self addIfNotNilWitDictionary:addressData value:customer.address.careOf key:@"careOf"];
		[self addIfNotNilWitDictionary:addressData value:customer.address.city key:@"city"];
		[self addIfNotNilWitDictionary:addressData value:customer.address.postalCode key:@"postalCode"];
		[self addIfNotNilWitDictionary:addressData value:[NSNumber numberWithBool:customer.address.isMasked] key:@"isMasked"];
		[self addIfNotNilWitDictionary:customerData value:addressData key:@"address"];
	}
	
	self.onQCOCustomerInfoChangedWithCustomer(@{@"customer": customerData});
}


- (void)onPaymentDeclinedWithDeclineReason:(NSString * _Nonnull)declineReason declineReasonMessage:(NSString *)declineReasonMessage {
	if (!self.onQCOPaymentDeclinedWithDeclineReason) {
		RCTLog(@"Missing 'onQCOPaymentDeclinedWithDeclineReason callback prop.");
		return;
	}
	NSMutableDictionary *declineReasonData = [NSMutableDictionary new];
	[self addIfNotNilWitDictionary:declineReasonData value:declineReason key:@"declineReason"];
	[self addIfNotNilWitDictionary:declineReasonData value:declineReason key:@"declineReasonMessage"];
	self.onQCOPaymentDeclinedWithDeclineReason(declineReasonData);
}


- (void)onPaymentMethodChangedWithPaymentMethod:(PaymentMethod * _Nonnull)paymentMethod {
	if (!self.onQCOPaymentMethodChangedWithPaymentMethod) {
		RCTLog(@"Missing 'onQCOPaymentMethodChangedWithPaymentMethod callback prop.");
		return;
	}
	NSMutableDictionary *paymentMethodData = [NSMutableDictionary new];
	[self addIfNotNilWitDictionary:paymentMethodData value:paymentMethod.method key:@"method"];
	[self addIfNotNilWitDictionary:paymentMethodData value:paymentMethod.subtype key:@"subtype"];
	[self addIfNotNilWitDictionary:paymentMethodData value:[NSNumber numberWithDouble:paymentMethod.price] key:@"price"];
	[self addIfNotNilWitDictionary:paymentMethodData value:[NSNumber numberWithDouble:paymentMethod.price] key:@"priceExVat"];
	self.onQCOPaymentMethodChangedWithPaymentMethod(@{@"paymentMethod": paymentMethodData});
}


- (void)onShippingMethodChangedWithShipping:(Shipping * _Nonnull)shipping {
	if (!self.onQCOShippingMethodChangedWithShipping) {
		RCTLog(@"Missing 'onQCOShippingMethodChangedWithShipping callback prop.");
		return;
	}
	NSMutableDictionary *shippingData = [NSMutableDictionary new];
	[self addIfNotNilWitDictionary:shippingData value:shipping.method key:@"method"];
	[self addIfNotNilWitDictionary:shippingData value:shipping.secondaryOption key:@"secondaryOption"];
	[self addIfNotNilWitDictionary:shippingData value:shipping.additionalShippingServices key:@"additionalShippingServices"];
	[self addIfNotNilWitDictionary:shippingData value:[NSNumber numberWithDouble:shipping.price] key:@"price"];
	[self addIfNotNilWitDictionary:shippingData value:[NSNumber numberWithDouble:shipping.priceExVat] key:@"priceExVat"];
	[self addIfNotNilWitDictionary:shippingData value:[NSNumber numberWithDouble:shipping.totalShippingPrice] key:@"totalShippingPrice"];
	[self addIfNotNilWitDictionary:shippingData value:[NSNumber numberWithDouble:shipping.totalShippingPriceExVat] key:@"totalShippingPriceExVat"];
	[self addIfNotNilWitDictionary:shippingData value:shipping.accessCode key:@"accessCode"];
	self.onQCOShippingMethodChangedWithShipping(@{@"shipping": shippingData});
}

- (void)onShippingPriceChangedWithNewShippingPrice:(NSInteger)newShippingPrice newTotalShippingPrice:(NSInteger)newTotalShippingPrice {
	if (!self.onQCOShippingPriceChangedWithNewShippingPrice) {
		RCTLog(@"Missing 'onQCOShippingPriceChangedWithNewShippingPrice callback prop.");
		return;
	}
	NSMutableDictionary *newShippingPriceData = [NSMutableDictionary new];
	[self addIfNotNilWitDictionary:newShippingPriceData value:[NSNumber numberWithDouble:newShippingPrice] key:@"newShippingPrice"];
	[self addIfNotNilWitDictionary:newShippingPriceData value:[NSNumber numberWithDouble:newTotalShippingPrice] key:@"newTotalShippingPrice"];
	self.onQCOShippingPriceChangedWithNewShippingPrice(@{@"shippingPrice": newShippingPriceData});
}

- (void)onPaymentProcessEnd {
	if (!self.onQCOPaymentProcessEnd) {
		RCTLog(@"Missing 'onQCOPaymentProcessEnd callback prop.");
		return;
	}
	self.onQCOPaymentProcessEnd(@{});
}


- (void)onPaymentProcessStart {
	if (!self.onQCOPaymentProcessStart) {
		RCTLog(@"Missing 'onQCOPaymentProcessStart callback prop.");
		return;
	}
	self.onQCOPaymentProcessStart(@{});
}

- (void)onSessionExpired {
	if (!self.onQCOSessionExpired) {
		RCTLog(@"Missing 'onQCOSessionExpired callback prop.");
		return;
	}
	self.onQCOSessionExpired(@{});
}

- (void)onCheckoutHeightChangedWithHeight:(NSInteger)height {
	[self.uiManager setIntrinsicContentSize:CGSizeMake(UIViewNoIntrinsicMetric, height) forView:self];
}

- (void)onCompletePurchaseRedirectWithOptions:(PurchaseRedirectOptions * _Nonnull)options {
	
	if (!self.onQCOCompletePurchaseRedirectWithOptions) {
		RCTLog(@"Missing 'onQCOCompletePurchaseRedirectWithOptions callback prop.");
		return;
	}
	NSMutableDictionary *optionsData = [NSMutableDictionary new];
	[self addIfNotNilWitDictionary:optionsData value:options.merchantConfirmationUrl key:@"merchantConfirmationUrl"];
	self.onQCOCompletePurchaseRedirectWithOptions(@{@"options": optionsData});
	return;
}

- (void)onOrderUpdatedWithOrder:(Order * _Nonnull)order {
	if (!self.onQCOOrderUpdatedWithOrder) {
		RCTLog(@"Missing 'onQCOOrderUpdatedWithOrder callback prop.");
		return;
	}
	
	NSMutableDictionary *orderData = [NSMutableDictionary new];
	[self addIfNotNilWitDictionary:orderData value:order.merchantUpdateVersion key:@"merchantUpdateVersion"];
	[self addIfNotNilWitDictionary:orderData value:[NSNumber numberWithDouble:order.totalPrice] key:@"totalPrice"];
	
	NSMutableArray *orderItems = [NSMutableArray new];
	for (OrderItem *orderItem in order.orderItems) {
		NSMutableDictionary *orderItemData = [NSMutableDictionary new];
		[self addIfNotNilWitDictionary:orderItemData value:orderItem.merchantReference key:@"merchantReference"];
		[self addIfNotNilWitDictionary:orderItemData value:[NSNumber numberWithDouble:orderItem.pricePerItemIncVat] key:@"pricePerItemIncVat"];
		[self addIfNotNilWitDictionary:orderItemData value:[NSNumber numberWithInteger:orderItem.quantity] key:@"quantity"];
		[orderItems addObject:orderItemData];
	}
	[self addIfNotNilWitDictionary:orderData value:orderItems key:@"orderItems"];
	self.onQCOOrderUpdatedWithOrder(@{@"order": orderData});
	return;
}

- (void)onCustomerDeauthenticating {
	if (!self.onQCOCustomerDeauthenticating) {
		RCTLog(@"Missing 'onQCOCustomerDeauthenticating callback prop.");
		return;
	}
	self.onQCOCustomerDeauthenticating(@{});
	return;
}

@end
