import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

let iso8601ToSeconds;

before(async () => {
  ({ iso8601ToSeconds } = await import('./iso8601ToSeconds.js'));
});

describe('ISO-8601 parsing', () => {
  it('parses Y/M/D:H/M/S individually', () => {
    // seconds
    assert.equal(iso8601ToSeconds('PT0.3S'), 0.3);
    assert.equal(iso8601ToSeconds('PT6S'), 6);
    assert.equal(iso8601ToSeconds('PT12S'), 12);
    assert.equal(iso8601ToSeconds('PT108S'), 108);
    // minutes
    assert.equal(iso8601ToSeconds('PT0.3M'), 60 * 0.3);
    assert.equal(iso8601ToSeconds('PT6M'), 60 * 6);
    assert.equal(iso8601ToSeconds('PT12M'), 60 * 12);
    assert.equal(iso8601ToSeconds('PT108M'), 60 * 108);
    // hours
    assert.equal(iso8601ToSeconds('PT0.3H'), 60 * 60 * 0.3);
    assert.equal(iso8601ToSeconds('PT6H'), 60 * 60 * 6);
    assert.equal(iso8601ToSeconds('PT12H'), 60 * 60 * 12);
    assert.equal(iso8601ToSeconds('PT108H'), 60 * 60 * 108);
    // days
    assert.equal(iso8601ToSeconds('P0.3D'), 24 * 60 * 60 * 0.3);
    assert.equal(iso8601ToSeconds('P6D'), 24 * 60 * 60 * 6);
    assert.equal(iso8601ToSeconds('P12D'), 24 * 60 * 60 * 12);
    assert.equal(iso8601ToSeconds('P108D'), 24 * 60 * 60 * 108);
    // months
    assert.equal(iso8601ToSeconds('P0.3M'), Math.round(30.41666666 * 24 * 60 * 60 * 0.3));
    assert.equal(iso8601ToSeconds('P6M'), Math.round(30.41666666 * 24 * 60 * 60 * 6));
    assert.equal(iso8601ToSeconds('P12M'), Math.round(30.41666666 * 24 * 60 * 60 * 12));
    assert.equal(iso8601ToSeconds('P108M'), Math.round(30.41666666 * 24 * 60 * 60 * 108));
    // years
    assert.equal(iso8601ToSeconds('P0.3Y'), 365 * 24 * 60 * 60 * 0.3);
    assert.equal(iso8601ToSeconds('P6Y'), 365 * 24 * 60 * 60 * 6);
    assert.equal(iso8601ToSeconds('P12Y'), 365 * 24 * 60 * 60 * 12);
    assert.equal(iso8601ToSeconds('P108Y'), 365 * 24 * 60 * 60 * 108);
  });

  it('parses compounding elements', () => {
    // years + seconds
    assert.equal(iso8601ToSeconds('P2YT0.3S'), 365 * 24 * 60 * 60 * 2 + 0.3);
    // years + minutes
    assert.equal(iso8601ToSeconds('P3YT0.3M'), 365 * 24 * 60 * 60 * 3 + 60 * 0.3);
    // years + hours
    assert.equal(iso8601ToSeconds('P4YT0.3H'), 365 * 24 * 60 * 60 * 4 + 60 * 60 * 0.3);
    // years + days
    assert.equal(iso8601ToSeconds('P5Y0.3D'), 365 * 24 * 60 * 60 * 5 + 24 * 60 * 60 * 0.3);
    // years + months
    assert.equal(
      iso8601ToSeconds('P6Y0.3M'),
      365 * 24 * 60 * 60 * 6 + Math.round(30.41666666 * 24 * 60 * 60 * 0.3)
    );
    // months + seconds
    assert.equal(iso8601ToSeconds('P2MT0.3S'), Math.round(30.41666666 * 24 * 60 * 60 * 2) + 0.3);
    // months + minutes
    assert.equal(
      iso8601ToSeconds('P3MT0.3M'),
      Math.round(30.41666666 * 24 * 60 * 60 * 3) + 60 * 0.3
    );
    // months + hours
    assert.equal(
      iso8601ToSeconds('P4MT0.3H'),
      Math.round(30.41666666 * 24 * 60 * 60 * 4) + 60 * 60 * 0.3
    );
    // months + days
    assert.equal(
      iso8601ToSeconds('P5M0.3D'),
      Math.round(30.41666666 * 24 * 60 * 60 * 5) + 24 * 60 * 60 * 0.3
    );
    // days + seconds
    assert.equal(iso8601ToSeconds('P2DT0.3S'), 24 * 60 * 60 * 2 + 0.3);
    // days + minutes
    assert.equal(iso8601ToSeconds('P3DT0.3M'), 24 * 60 * 60 * 3 + 60 * 0.3);
    // days + hours
    assert.equal(iso8601ToSeconds('P4DT0.3H'), 24 * 60 * 60 * 4 + 60 * 60 * 0.3);
    // hours + seconds
    assert.equal(iso8601ToSeconds('PT2H0.3S'), 60 * 60 * 2 + 0.3);
    // hours + minutes
    assert.equal(iso8601ToSeconds('PT3H0.3M'), 60 * 60 * 3 + 60 * 0.3);
    // minutes + seconds
    assert.equal(iso8601ToSeconds('PT2M0.3S'), 60 * 2 + 0.3);
    // days + hours + seconds
    assert.equal(iso8601ToSeconds('P12DT6H0.3S'), 24 * 60 * 60 * 12 + 60 * 60 * 6 + 0.3);
  });
});
