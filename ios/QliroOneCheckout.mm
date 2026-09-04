#import "QliroOneCheckout.h"

#import <react/utils/FollyConvert.h>
#import <react/renderer/componentregistry/ComponentDescriptorProvider.h>
#import <react/renderer/components/QliroOneCheckoutSpec/RCTComponentViewHelpers.h>
#import <react/renderer/components/QliroOneCheckoutSpec/ComponentDescriptors.h>
#import <react/renderer/components/QliroOneCheckoutSpec/EventEmitters.h>
#import <react/renderer/components/QliroOneCheckoutSpec/Props.h>

#import "RCTFabricComponentsPlugins.h"
#import <PassKit/PassKit.h>

#import <QliroOne/QliroOne-Swift.h>
#import <QliroOne/QliroOne-umbrella.h>


using namespace facebook::react;

static inline std::string safeStringConvert(NSString *str) {
    return str ? std::string([str UTF8String]) : std::string("");
}

@interface RNQliroOneCheckout () <RCTQliroOneCheckoutViewProtocol, QliroOneListener>
@property (nonatomic, strong) QliroOneCheckout *checkoutView;
@end

@implementation RNQliroOneCheckout {
    UIView * _view;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<QliroOneCheckoutComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const QliroOneCheckoutProps>();
        _props = defaultProps;

        self.checkoutView = [[QliroOneCheckout alloc] initWithReactNativeSDKVersion:@"3.0.0"];
        self.checkoutView.qliroOneListener = self;
        self.checkoutView.translatesAutoresizingMaskIntoConstraints = NO;
        self.checkoutView.isScrollEnabled = false;

        _view = [[UIView alloc] init];
        [_view addSubview:self.checkoutView];

        [NSLayoutConstraint activateConstraints:@[
            [self.checkoutView.topAnchor constraintEqualToAnchor:_view.topAnchor],
            [self.checkoutView.bottomAnchor constraintEqualToAnchor:_view.bottomAnchor],
            [self.checkoutView.leadingAnchor constraintEqualToAnchor:_view.leadingAnchor],
            [self.checkoutView.trailingAnchor constraintEqualToAnchor:_view.trailingAnchor]
        ]];

        self.contentView = _view;
    }
    return self;
}

- (void)layoutSubviews {
    [super layoutSubviews];
    self.checkoutView.frame = _view.bounds;
    [self.checkoutView layoutSubviews];
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<QliroOneCheckoutProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<QliroOneCheckoutProps const>(props);

    if (oldViewProps.isScrollEnabled != newViewProps.isScrollEnabled) {
        self.checkoutView.isScrollEnabled = newViewProps.isScrollEnabled;
    }

    if (oldViewProps.applePayMerchantId != newViewProps.applePayMerchantId) {
        // Fabric string props default to "" when the prop is absent, so an unset applePayMerchantId
        // is indistinguishable here from one explicitly set to the empty string. Neither is a usable
        // merchant ID (they must be "merchant.…"), so map both to nil rather than handing the SDK an
        // empty NSString and letting it try to build a PKPaymentRequest from it.
        NSString *merchantId = newViewProps.applePayMerchantId.empty()
            ? nil
            : [NSString stringWithUTF8String:newViewProps.applePayMerchantId.c_str()];
        self.checkoutView.applePayMerchantId = merchantId;
    }

    if (oldViewProps.isDebugEnabled != newViewProps.isDebugEnabled) {
        self.checkoutView.isDebugEnabled = newViewProps.isDebugEnabled;
    }

    if (oldViewProps.loadTimeoutMs != newViewProps.loadTimeoutMs) {
        self.checkoutView.loadTimeoutMs = static_cast<NSInteger>(newViewProps.loadTimeoutMs);
    }

    if (oldViewProps.additionalAllowedUrlSchemes != newViewProps.additionalAllowedUrlSchemes) {
        // `additionalAllowedUrlSchemes` is declared _Nonnull on the Swift side (it defaults to `[]`,
        // not nil), so an absent prop must become an empty array rather than nil — unlike
        // applePayMerchantId above. An empty array is also the correct meaning: nothing added to the
        // SDK's built-in scheme allowlist.
        NSMutableArray<NSString *> *schemes =
            [NSMutableArray arrayWithCapacity:newViewProps.additionalAllowedUrlSchemes.size()];
        for (const auto &scheme : newViewProps.additionalAllowedUrlSchemes) {
            if (!scheme.empty()) {
                [schemes addObject:[NSString stringWithUTF8String:scheme.c_str()]];
            }
        }
        self.checkoutView.additionalAllowedUrlSchemes = schemes;
    }

    [super updateProps:props oldProps:oldProps];
}

Class<RCTComponentViewProtocol> QliroOneCheckoutCls(void)
{
    return RNQliroOneCheckout.class;
}

#pragma mark - Commands

- (void)handleCommand:(const NSString *)commandName args:(const NSArray *)args
{
    RCTQliroOneCheckoutHandleCommand(self, commandName, args);
}

- (void)loadOrderHtml:(NSString *)html
{
    [self.checkoutView loadOrderHtmlWithHtml:html];
}

- (void)lock
{
    [self.checkoutView lock];
}

- (void)unlock
{
    [self.checkoutView unlock];
}

- (void)addSessionExpiredCallback
{
    [self.checkoutView addSessionExpiredCallback];
}

- (void)removeSessionExpiredCallback
{
    [self.checkoutView removeSessionExpiredCallback];
}

- (void)addOrderUpdateCallback
{
    [self.checkoutView addOrderUpdateCallback];
}

- (void)removeOrderUpdateCallback
{
    [self.checkoutView removeOrderUpdateCallback];
}

- (void)enableCheckoutScrolling:(BOOL)enabled
{
    [self.checkoutView enableCheckoutScrollingWithEnabled:enabled];
}

- (void)excludeResultModules:(NSArray<NSString *> *)modules
{
    [self.checkoutView excludeResultModulesWithModules:modules];
}

- (void)onScrollWithContainerHeight:(double)containerHeight offset:(double)offset
{
    [self.checkoutView onScrollWithContainerHeight:(NSInteger)containerHeight offset:(NSInteger)offset];
}

#pragma mark - QliroOneListener

- (void)onCheckoutLoaded
{
    if (_eventEmitter) {
        std::dynamic_pointer_cast<const QliroOneCheckoutEventEmitter>(_eventEmitter)
            ->onCheckoutLoaded(QliroOneCheckoutEventEmitter::OnCheckoutLoaded{});
    }
}

- (void)onCustomerInfoChangedWithCustomer:(Customer *)customer
{
    if (_eventEmitter) {
        auto eventEmitter = std::dynamic_pointer_cast<const QliroOneCheckoutEventEmitter>(_eventEmitter);
        
        eventEmitter->onCustomerInfoChanged(QliroOneCheckoutEventEmitter::OnCustomerInfoChanged{
            .customer = {
                .email = safeStringConvert(customer.email),
                .mobileNumber = safeStringConvert(customer.mobileNumber),
                .personalNumber = safeStringConvert(customer.personalNumber),
                .organizationNumber = safeStringConvert(customer.organizationNumber),
                .address = {
                    .firstName = safeStringConvert(customer.address.firstName),
                    .lastName = safeStringConvert(customer.address.lastName),
                    .street = safeStringConvert(customer.address.street),
                    .careOf = safeStringConvert(customer.address.careOf),
                    .city = safeStringConvert(customer.address.city),
                    .postalCode = safeStringConvert(customer.address.postalCode),
                    .isMasked = customer.address ? customer.address.isMasked : false
                }
            }
        });
    }
}

- (void)onPaymentDeclinedWithDeclineReason:(NSString *)declineReason declineReasonMessage:(NSString *)declineReasonMessage
{
    if (_eventEmitter) {
        auto eventEmitter = std::dynamic_pointer_cast<const QliroOneCheckoutEventEmitter>(_eventEmitter);
        
        eventEmitter->onPaymentDeclined(QliroOneCheckoutEventEmitter::OnPaymentDeclined{
            .reason = {
                .declineReason = safeStringConvert(declineReason),
                .declineReasonMessage = safeStringConvert(declineReasonMessage)
            }
        });
    }
}

- (void)onPaymentMethodChangedWithPaymentMethod:(PaymentMethod *)paymentMethod
{
    if (_eventEmitter) {
      auto eventEmitter = std::dynamic_pointer_cast<const QliroOneCheckoutEventEmitter>(_eventEmitter);
              
              eventEmitter->onPaymentMethodChanged(QliroOneCheckoutEventEmitter::OnPaymentMethodChanged{
                  .paymentMethod = {
                      .method = safeStringConvert(paymentMethod.method),
                      .subtype = safeStringConvert(paymentMethod.subtype),
                      .price = paymentMethod.price,
                      .priceExVat = paymentMethod.priceExVat
                  }
              });

    }
}

- (void)onShippingMethodChangedWithShipping:(Shipping *)shipping
{
    if (_eventEmitter) {
      auto eventEmitter = std::dynamic_pointer_cast<const QliroOneCheckoutEventEmitter>(_eventEmitter);
              std::string additionalServicesJson = "";
              if (shipping.additionalShippingServices && [shipping.additionalShippingServices count] > 0) {
                  NSError *error;
                  NSData *jsonData = [NSJSONSerialization dataWithJSONObject:shipping.additionalShippingServices options:0 error:&error];
                  if (!error && jsonData) {
                      NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
                      additionalServicesJson = safeStringConvert(jsonString);
                  }
              }
              
              eventEmitter->onShippingMethodChanged(QliroOneCheckoutEventEmitter::OnShippingMethodChanged{
                  .shipping = {
                      .method = safeStringConvert(shipping.method),
                      .secondaryOption = safeStringConvert(shipping.secondaryOption),
                      .additionalShippingServices = additionalServicesJson,
                      .price = shipping.price,
                      .priceExVat = shipping.priceExVat,
                      .totalShippingPrice = shipping.totalShippingPrice,
                      .totalShippingPriceExVat = shipping.totalShippingPriceExVat,
                      .accessCode = safeStringConvert(shipping.accessCode)
                  }
              });

    }
}

- (void)onShippingPriceChangedWithNewShippingPrice:(double)newShippingPrice newTotalShippingPrice:(double)newTotalShippingPrice
{
    if (_eventEmitter) {
        auto eventEmitter = std::dynamic_pointer_cast<const QliroOneCheckoutEventEmitter>(_eventEmitter);
        
        eventEmitter->onShippingPriceChanged(QliroOneCheckoutEventEmitter::OnShippingPriceChanged{
            .shippingPrice = {
                .newShippingPrice = static_cast<double>(newShippingPrice),
                .newTotalShippingPrice = static_cast<double>(newTotalShippingPrice)
            }
        });
    }
}

- (void)onPaymentProcessEnd
{
    if (_eventEmitter) {
        std::dynamic_pointer_cast<const QliroOneCheckoutEventEmitter>(_eventEmitter)
            ->onPaymentProcessEnd(QliroOneCheckoutEventEmitter::OnPaymentProcessEnd{});
    }
}

- (void)onPaymentProcessStart
{
    if (_eventEmitter) {
        std::dynamic_pointer_cast<const QliroOneCheckoutEventEmitter>(_eventEmitter)
            ->onPaymentProcessStart(QliroOneCheckoutEventEmitter::OnPaymentProcessStart{});
    }
}

- (void)onSessionExpired
{
    if (_eventEmitter) {
        std::dynamic_pointer_cast<const QliroOneCheckoutEventEmitter>(_eventEmitter)
            ->onSessionExpired(QliroOneCheckoutEventEmitter::OnSessionExpired{});
    }
}

- (void)onCheckoutHeightChangedWithHeight:(NSInteger)height
{
    dispatch_async(dispatch_get_main_queue(), ^{
        if (self->_eventEmitter) {
            std::dynamic_pointer_cast<const QliroOneCheckoutEventEmitter>(self->_eventEmitter)
                ->onCheckoutHeightChanged(QliroOneCheckoutEventEmitter::OnCheckoutHeightChanged{
                    .height = static_cast<double>(height)
                });
        }
    });
}

- (void)onCompletePurchaseRedirectWithOptions:(PurchaseRedirectOptions *)options
{
    if (_eventEmitter) {
      auto eventEmitter = std::dynamic_pointer_cast<const QliroOneCheckoutEventEmitter>(_eventEmitter);
        
        eventEmitter->onCompletePurchaseRedirect(QliroOneCheckoutEventEmitter::OnCompletePurchaseRedirect{
            .options = {
                .merchantConfirmationUrl = safeStringConvert(options.merchantConfirmationUrl)
            }
        });
    }
}

- (void)onOrderUpdatedWithOrder:(Order *)order
{
    if (_eventEmitter) {
      auto eventEmitter = std::dynamic_pointer_cast<const QliroOneCheckoutEventEmitter>(_eventEmitter);
              
              std::string orderItemsJson = "";
              if (order.orderItems && [order.orderItems count] > 0) {
                  NSMutableArray *orderItems = [NSMutableArray new];
                  for (OrderItem *orderItem in order.orderItems) {
                      NSMutableDictionary *orderItemData = [NSMutableDictionary new];
                      if (orderItem.merchantReference) orderItemData[@"merchantReference"] = orderItem.merchantReference;
                      orderItemData[@"pricePerItemIncVat"] = @(orderItem.pricePerItemIncVat);
                      orderItemData[@"quantity"] = @(orderItem.quantity);
                      [orderItems addObject:orderItemData];
                  }
                  
                  NSError *error;
                  NSData *jsonData = [NSJSONSerialization dataWithJSONObject:orderItems options:0 error:&error];
                  if (!error && jsonData) {
                      NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
                      orderItemsJson = safeStringConvert(jsonString);
                  }
              }
              
              eventEmitter->onOrderUpdated(QliroOneCheckoutEventEmitter::OnOrderUpdated{
                  .order = {
                      .merchantUpdateVersion = safeStringConvert(order.merchantUpdateVersion),
                      .totalPrice = order.totalPrice,
                      .orderItems = orderItemsJson
                  }
              });
    }
}

- (void)onCustomerDeauthenticating
{
    if (_eventEmitter) {
        std::dynamic_pointer_cast<const QliroOneCheckoutEventEmitter>(_eventEmitter)
            ->onCustomerDeauthenticating(QliroOneCheckoutEventEmitter::OnCustomerDeauthenticating{});
    }
}

- (void)onClosePopup
{
    if (_eventEmitter) {
        std::dynamic_pointer_cast<const QliroOneCheckoutEventEmitter>(_eventEmitter)
            ->onClosePopup(QliroOneCheckoutEventEmitter::OnClosePopup{});
    }
}

- (void)makePaymentRequestWithPaymentData:(NSDictionary *)paymentData
{
    if (_eventEmitter) {
        std::string json = "";
        if (paymentData && [NSJSONSerialization isValidJSONObject:paymentData]) {
            NSError *error;
            NSData *data = [NSJSONSerialization dataWithJSONObject:paymentData options:0 error:&error];
            if (!error && data) {
                json = safeStringConvert([[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding]);
            }
        }
        std::dynamic_pointer_cast<const QliroOneCheckoutEventEmitter>(_eventEmitter)
            ->onApplePayPaymentRequest(QliroOneCheckoutEventEmitter::OnApplePayPaymentRequest{
                .paymentData = json
            });
    }
}

- (void)onErrorWithCode:(NSString *)code message:(NSString *)message
{
    if (_eventEmitter) {
        std::dynamic_pointer_cast<const QliroOneCheckoutEventEmitter>(_eventEmitter)
            ->onError(QliroOneCheckoutEventEmitter::OnError{
                .code = safeStringConvert(code),
                .message = safeStringConvert(message)
            });
    }
}

- (void)onLogWithLevel:(NSString *)level message:(NSString *)message
{
    if (_eventEmitter) {
        std::dynamic_pointer_cast<const QliroOneCheckoutEventEmitter>(_eventEmitter)
            ->onLog(QliroOneCheckoutEventEmitter::OnLog{
                .level = safeStringConvert(level),
                .message = safeStringConvert(message)
            });
    }
}

- (void)onStateChangedWithState:(NSString *)state previousState:(NSString *)previousState
{
    if (_eventEmitter) {
        std::dynamic_pointer_cast<const QliroOneCheckoutEventEmitter>(_eventEmitter)
            ->onStateChanged(QliroOneCheckoutEventEmitter::OnStateChanged{
                .state = safeStringConvert(state),
                .previousState = safeStringConvert(previousState)
            });
    }
}

- (void)onTelemetryEventWithName:(NSString *)name durationMs:(NSNumber *)durationMs metadata:(NSDictionary<NSString *, NSString *> *)metadata
{
    if (_eventEmitter) {
        std::string metadataJson = "";
        if (metadata && [metadata count] > 0) {
            NSError *error;
            NSData *jsonData = [NSJSONSerialization dataWithJSONObject:metadata options:0 error:&error];
            if (!error && jsonData) {
                metadataJson = safeStringConvert([[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding]);
            }
        }
        std::dynamic_pointer_cast<const QliroOneCheckoutEventEmitter>(_eventEmitter)
            ->onTelemetryEvent(QliroOneCheckoutEventEmitter::OnTelemetryEvent{
                .name = safeStringConvert(name),
                .durationMs = durationMs ? [durationMs doubleValue] : 0,
                .metadata = metadataJson
            });
    }
}

@end