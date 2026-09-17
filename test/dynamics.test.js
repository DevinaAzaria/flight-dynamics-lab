import test from "node:test";
import assert from "node:assert/strict";
import { aerodynamicForces, glidePerformance, stallSpeed } from "../src/dynamics.js";

test("standard conditions produce expected lift and drag", () => {
  const result = aerodynamicForces({ speed:60, density:1.225, area:16, liftCoefficient:0.5, dragCoefficient:0.03 });
  assert.ok(Math.abs(result.lift - 17640) < 0.01);
  assert.ok(Math.abs(result.drag - 1058.4) < 0.01);
});

test("stall speed follows the lift balance equation", () => {
  const result = stallSpeed({ mass:1200, density:1.225, area:16, maxLiftCoefficient:1.6 });
  assert.ok(Math.abs(result.speed - 27.3954) < 0.01);
});

test("glide ratio and angle are complementary performance measures", () => {
  const result = glidePerformance(0.8, 0.08);
  assert.equal(result.ratio, 10);
  assert.ok(Math.abs(result.angleDegrees - 5.7106) < 0.001);
});

test("invalid aerodynamic inputs are rejected", () => {
  assert.throws(() => stallSpeed({ mass:0, density:1.225, area:16, maxLiftCoefficient:1.6 }), RangeError);
  assert.throws(() => glidePerformance(0.8, 0), RangeError);
});
