export interface Settings {
  cartId: string;
  settings: {
    [key in Keys]: SettingsEntry<any>;
  };
  skin: string;
  forceNewOrder: boolean;
}

export interface SettingsEntry<T> {
  _id: string;
  name: Keys;
  type: Types;
  group: string;
  __v: number;
  values: T[];
  defaultValue: T;
  value: T;
  defaultValues: { [key in Language]: T };
}

type Language = 'NO' | 'SE';

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

export const LayoutTypes = ['oneScrollView', 'twoScrollView'] as const;
export type Layout = typeof LayoutTypes[number];
