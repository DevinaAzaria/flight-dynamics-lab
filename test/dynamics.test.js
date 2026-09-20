import test from "node:test";
import assert from "node:assert/strict";
import {
  aerodynamicForces,
  glidePerformance,
  performanceSweep,
  stallComparison,
  stallSensitivity,
  stallSpeed
} from "../src/dynamics.js";

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

test("performance sweep samples the aerodynamic model across airspeed", () => {
  const result = performanceSweep({
    minSpeed: 10,
    maxSpeed: 100,
    steps: 4,
    density: 1.225,
    area: 16,
    liftCoefficient: 0.5,
    dragCoefficient: 0.03
  });

  assert.equal(result.points.length, 4);
  assert.equal(result.points[0].speed, 10);
  assert.equal(result.points.at(-1).speed, 100);
  assert.ok(Math.abs(result.points.at(-1).dynamicPressure - 6125) < 0.01);
  assert.ok(result.points.at(-1).lift > result.points[0].lift);
  assert.ok(result.points.at(-1).drag > result.points[0].drag);
});

test("stall comparison shows mass and wing-area tradeoffs", () => {
  const result = stallComparison({
    mass: 1200,
    density: 1.225,
    area: 16,
    maxLiftCoefficient: 1.6,
    spreadPercent: 20
  });

  assert.equal(result.masses.length, 3);
  assert.equal(result.areas.length, 3);
  assert.equal(result.speeds.length, 3);

  const baseline = stallSpeed({ mass:1200, density:1.225, area:16, maxLiftCoefficient:1.6 }).speed;
  assert.ok(Math.abs(result.speeds[1][1] - baseline) < 0.0001);

  assert.ok(result.speeds[2][1] > result.speeds[1][1]);
  assert.ok(result.speeds[0][1] < result.speeds[1][1]);
  assert.ok(result.speeds[1][2] < result.speeds[1][1]);
  assert.ok(result.speeds[1][0] > result.speeds[1][1]);
});

test("stall sensitivity returns individual effects and a bounded corner-case range", () => {
  const result = stallSensitivity({
    mass:1200,
    density:1.225,
    area:16,
    maxLiftCoefficient:1.6,
    uncertaintyPercent:10
  });

  assert.equal(result.variables.length, 4);
  assert.ok(result.combined.minSpeed < result.baseline.speed);
  assert.ok(result.combined.maxSpeed > result.baseline.speed);

  const mass = result.variables.find((item) => item.key === "mass");
  const density = result.variables.find((item) => item.key === "density");
  assert.ok(mass.highSpeed > result.baseline.speed);
  assert.ok(density.highSpeed < result.baseline.speed);
  assert.ok(mass.maxDeviationPercent > 0);
});

test("invalid aerodynamic inputs are rejected", () => {
  assert.throws(() => stallSpeed({ mass:0, density:1.225, area:16, maxLiftCoefficient:1.6 }), RangeError);
  assert.throws(() => glidePerformance(0.8, 0), RangeError);
  assert.throws(() => performanceSweep({
    minSpeed: 100,
    maxSpeed: 50,
    steps: 5,
    density: 1.225,
    area: 16,
    liftCoefficient: 0.5,
    dragCoefficient: 0.03
  }), RangeError);
  assert.throws(() => stallComparison({
    mass:1200,
    density:1.225,
    area:16,
    maxLiftCoefficient:1.6,
    spreadPercent:100
  }), RangeError);
  assert.throws(() => stallSensitivity({
    mass:1200,
    density:1.225,
    area:16,
    maxLiftCoefficient:1.6,
    uncertaintyPercent:0
  }), RangeError);
});
