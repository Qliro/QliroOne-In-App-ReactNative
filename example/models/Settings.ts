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
  | 'number'
  | 'checkbox'
  | 'dropdown'
  | 'toggleinput'
  | 'toggleradio'
  | 'address'
  | 'text';

export type Keys =
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
