// tests/pricing.test.js
const pricingService = require('../src/services/pricingService');

describe('Pricing Service', () => {
  it('calculates fare correctly', () => {
    expect(pricingService.calculate(35, 12, 5)).toBe(95);
    expect(pricingService.calculate(35, 12, 0)).toBe(35);
    expect(pricingService.calculate(50, 10, 10)).toBe(150);
  });

  it('returns defaults', () => {
    const defaults = pricingService.getDefaults();
    expect(defaults.baseFare).toBe(35);
    expect(defaults.perKmRate).toBe(12);
  });
});
