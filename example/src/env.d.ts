// Types for the virtual '@env' module produced by react-native-dotenv (see babel.config.js).
// Every value is optional: `allowUndefined` is on, so a missing example/.env yields undefined
// rather than breaking the build. src/qliro.ts coerces and reports missing keys at runtime.
declare module '@env' {
  export const QLIRO_BASE_URL: string | undefined;
  export const QLIRO_MERCHANT_API_KEY: string | undefined;
  export const QLIRO_MERCHANT_SECRET: string | undefined;
  export const QLIRO_MERCHANT_BASE_URL: string | undefined;
  export const QLIRO_ORDER_VALIDATION_URL: string | undefined;
  export const QLIRO_TEST_PERSONAL_NUMBER: string | undefined;
  export const QLIRO_TEST_EMAIL: string | undefined;
  export const QLIRO_TEST_MOBILE: string | undefined;
  export const QLIRO_TEST_FIRST_NAME: string | undefined;
  export const QLIRO_TEST_LAST_NAME: string | undefined;
  export const QLIRO_TEST_STREET: string | undefined;
  export const QLIRO_TEST_POSTAL_CODE: string | undefined;
}
