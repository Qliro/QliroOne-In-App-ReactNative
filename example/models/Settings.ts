export interface Settings {
  cartId: string;
  settings: {
    [key in Keys]: SettingsEntry<any>;
  };
  skin: string;
  forceNewOrder: boolean;
}

interface SettingsEntry<T> {
  _id: string;
  name: Keys;
  type: Types;
  group: string;
  __v: number;
  values: T[];
  defaultValue: T;
  value: T;
}

type Types =
  | 'color'
  | 'color'
  | 'number'
  | 'number'
  | 'color'
  | 'color'
  | 'checkbox'
  | 'dropdown'
  | 'toggleinput'
  | 'dropdown'
  | 'dropdown'
  | 'toggleinput'
  | 'toggleinput'
  | 'toggleradio'
  | 'number'
  | 'address'
  | 'checkbox'
  | 'checkbox'
  | 'checkbox'
  | 'checkbox'
  | 'checkbox'
  | 'dropdown'
  | 'text'
  | 'text'
  | 'checkbox'
  | 'toggleinput'
  | 'toggleinput'
  | 'checkbox'
  | 'checkbox'
  | 'text';

type Keys =
  | 'primaryColor'
  | 'callToActionColor'
  | 'callToActionRadius'
  | 'cornerRadius'
  | 'backgroundColor'
  | 'callToActionHoverColor'
  | 'askForNewsletterSignup'
  | 'currency'
  | 'mobileNumber'
  | 'country'
  | 'language'
  | 'email'
  | 'personalNumber'
  | 'enforcedJuridicalType'
  | 'buttonCornerRadius'
  | 'address'
  | 'lockCustomerInformation'
  | 'lockCustomerEmail'
  | 'lockCustomerMobileNumber'
  | 'lockCustomerPersonalNumber'
  | 'lockCustomerAddress'
  | 'merchantApiKey'
  | 'overrideMerchantKey'
  | 'overrideMerchantSecret'
  | 'availableShippingMethods'
  | 'merchantCheckoutStatusPushUrl'
  | 'merchantOrderManagementStatusPushUrl'
  | 'hideQliroOneInitially'
  | 'overwriteOnSessionExpired'
  | 'organizationNumber';
