export const STANDARD_GRAVITY = 9.80665;
export const KNOTS_PER_MS = 1.94384449;

function positive(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) throw new RangeError(`${label} harus lebih besar dari nol.`);
  return number;
}

export function aerodynamicForces({ speed, density, area, liftCoefficient, dragCoefficient }) {
  const v = positive(speed, "Kecepatan");
  const rho = positive(density, "Densitas udara");
  const s = positive(area, "Luas sayap");
  const cl = positive(liftCoefficient, "CL");
  const cd = positive(dragCoefficient, "CD");
  const dynamicPressure = 0.5 * rho * v ** 2;
  return { lift: dynamicPressure * s * cl, drag: dynamicPressure * s * cd, dynamicPressure };
}

export function stallSpeed({ mass, density, area, maxLiftCoefficient }) {
  const m = positive(mass, "Massa");
  const rho = positive(density, "Densitas udara");
  const s = positive(area, "Luas sayap");
  const clMax = positive(maxLiftCoefficient, "CL maksimum");
  const speed = Math.sqrt((2 * m * STANDARD_GRAVITY) / (rho * s * clMax));
  return { speed, kmh: speed * 3.6, knots: speed * KNOTS_PER_MS };
}

export function glidePerformance(liftCoefficient, dragCoefficient) {
  const cl = positive(liftCoefficient, "CL");
  const cd = positive(dragCoefficient, "CD");
  const ratio = cl / cd;
  return { ratio, angleDegrees: Math.atan(1 / ratio) * 180 / Math.PI };
}

export function performanceSweep({
  minSpeed = 10,
  maxSpeed = 120,
  steps = 12,
  density,
  area,
  liftCoefficient,
  dragCoefficient
}) {
  const min = positive(minSpeed, "Kecepatan minimum");
  const max = positive(maxSpeed, "Kecepatan maksimum");
  const count = Number(steps);

  if (max <= min) throw new RangeError("Kecepatan maksimum harus lebih besar dari kecepatan minimum.");
  if (!Number.isInteger(count) || count < 2) throw new RangeError("Jumlah titik harus bilangan bulat minimal 2.");

  const interval = (max - min) / (count - 1);
  const points = Array.from({ length: count }, (_, index) => {
    const speed = min + interval * index;
    return { speed, ...aerodynamicForces({ speed, density, area, liftCoefficient, dragCoefficient }) };
  });

  return { minSpeed: min, maxSpeed: max, points };
}


function percentage(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0 || number >= 100) {
    throw new RangeError(`${label} harus lebih besar dari 0 dan lebih kecil dari 100.`);
  }
  return number;
}

export function stallComparison({
  mass,
  density,
  area,
  maxLiftCoefficient,
  spreadPercent = 20
}) {
  const baseMass = positive(mass, "Massa");
  const rho = positive(density, "Densitas udara");
  const baseArea = positive(area, "Luas sayap");
  const clMax = positive(maxLiftCoefficient, "CL maksimum");
  const spread = percentage(spreadPercent, "Rentang perbandingan") / 100;
  const factors = [1 - spread, 1, 1 + spread];

  const masses = factors.map((factor) => baseMass * factor);
  const areas = factors.map((factor) => baseArea * factor);
  const speeds = masses.map((comparisonMass) =>
    areas.map((comparisonArea) =>
      stallSpeed({
        mass: comparisonMass,
        density: rho,
        area: comparisonArea,
        maxLiftCoefficient: clMax
      }).speed
    )
  );

  return {
    spreadPercent: spread * 100,
    masses,
    areas,
    speeds
  };
}

export function stallSensitivity({
  mass,
  density,
  area,
  maxLiftCoefficient,
  uncertaintyPercent = 5
}) {
  const base = {
    mass: positive(mass, "Massa"),
    density: positive(density, "Densitas udara"),
    area: positive(area, "Luas sayap"),
    maxLiftCoefficient: positive(maxLiftCoefficient, "CL maksimum")
  };
  const uncertainty = percentage(uncertaintyPercent, "Ketidakpastian") / 100;
  const baseline = stallSpeed(base);

  const definitions = [
    ["mass", "Massa"],
    ["density", "Densitas udara"],
    ["area", "Luas sayap"],
    ["maxLiftCoefficient", "CL maksimum"]
  ];

  const variables = definitions.map(([key, label]) => {
    const lowInput = base[key] * (1 - uncertainty);
    const highInput = base[key] * (1 + uncertainty);
    const lowCase = stallSpeed({ ...base, [key]: lowInput }).speed;
    const highCase = stallSpeed({ ...base, [key]: highInput }).speed;
    const minSpeed = Math.min(lowCase, highCase);
    const maxSpeed = Math.max(lowCase, highCase);
    const maxDeviationPercent = Math.max(
      Math.abs(lowCase - baseline.speed),
      Math.abs(highCase - baseline.speed)
    ) / baseline.speed * 100;

    return {
      key,
      label,
      lowInput,
      highInput,
      lowSpeed: lowCase,
      highSpeed: highCase,
      minSpeed,
      maxSpeed,
      maxDeviationPercent
    };
  });

  const combinedMin = stallSpeed({
    mass: base.mass * (1 - uncertainty),
    density: base.density * (1 + uncertainty),
    area: base.area * (1 + uncertainty),
    maxLiftCoefficient: base.maxLiftCoefficient * (1 + uncertainty)
  }).speed;

  const combinedMax = stallSpeed({
    mass: base.mass * (1 + uncertainty),
    density: base.density * (1 - uncertainty),
    area: base.area * (1 - uncertainty),
    maxLiftCoefficient: base.maxLiftCoefficient * (1 - uncertainty)
  }).speed;

  return {
    uncertaintyPercent: uncertainty * 100,
    baseline,
    variables,
    combined: {
      minSpeed: combinedMin,
      maxSpeed: combinedMax
    }
  };
}
