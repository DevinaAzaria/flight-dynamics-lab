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
