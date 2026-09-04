import { isFatalError } from '../index';

// The fatal/non-fatal split is a published contract shared with both native SDKs
// (QliroOneErrorCode.isFatal in ../../qliro-one-android and ../../qliro-one-ios). These assertions
// are the RN copy of it: if a code's fatality is ever changed on one platform only, this fails.
describe('isFatalError', () => {
  it.each([
    'load_failed',
    'http_error',
    'checkout_load_timeout',
    'webview_terminated',
  ])('reports %s as fatal', (code) => {
    expect(isFatalError(code)).toBe(true);
  });

  it.each(['parse_error', 'open_url_failed', 'untrusted_origin'])(
    'reports %s as not fatal',
    (code) => {
      expect(isFatalError(code)).toBe(false);
    }
  );

  // Documented behaviour: the union is open, and an unknown code must not make an integration show
  // a retry screen over something recoverable. onStateChanged reaching 'error' is the authoritative
  // fatality signal for codes this version does not know.
  it('reports an unknown code as not fatal', () => {
    expect(isFatalError('some_future_code')).toBe(false);
  });

  it('reports the empty string as not fatal', () => {
    expect(isFatalError('')).toBe(false);
  });
});
