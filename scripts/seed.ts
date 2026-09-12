/**
 * Seed script — populates MongoDB Atlas with demo users and franchise data.
 * Run with: npm run seed
 */
import bcrypt from "bcryptjs";
import { connectDB } from "../src/lib/db";
import { User } from "../src/lib/models/User";
import { Operator } from "../src/lib/models/Operator";
import { Driver } from "../src/lib/models/Driver";
import { Vehicle } from "../src/lib/models/Vehicle";
import { Franchise } from "../src/lib/models/Franchise";
import { Violation } from "../src/lib/models/Violation";
import { InspectionLog } from "../src/lib/models/InspectionLog";
import { Counter } from "../src/lib/models/Counter";
import { Config } from "../src/lib/models/Config";

const DEMO_PASSWORD = "Password123!";

const ZONES = ["Poblacion", "Zone 1", "Zone 2", "Zone 3"];

const BARANGAYS = [
  "Poblacion",
  "Balatakan",
  "Sominot",
  "Lower Landian",
  "Upper Landian",
  "Tampilisan",
  "Molos",
  "Guintanan",
];

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

async function main() {
  await connectDB();
  console.log("Connected to MongoDB. Clearing existing demo collections...");

  await Promise.all([
    User.deleteMany({}),
    Operator.deleteMany({}),
    Driver.deleteMany({}),
    Vehicle.deleteMany({}),
    Franchise.deleteMany({}),
    Violation.deleteMany({}),
    InspectionLog.deleteMany({}),
    Counter.deleteMany({}),
    Config.deleteMany({}),
  ]);

  console.log("Seeding users...");
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const [admin, franchisingOfficer, enforcementOfficer] = await User.create([
    {
      name: "Maria Santos",
      email: "admin@midsalip.gov.ph",
      passwordHash,
      role: "admin",
      active: true,
    },
    {
      name: "Pedro Reyes",
      email: "franchising@midsalip.gov.ph",
      passwordHash,
      role: "franchising_officer",
      active: true,
    },
    {
      name: "Ana Cruz",
      email: "enforcement@midsalip.gov.ph",
      passwordHash,
      role: "enforcement_officer",
      active: true,
    },
  ]);

  console.log("Seeding config...");
  await Config.create({
    key: "franchise_config",
    feeSchedule: { tricycle: 500, "habal-habal/motorcycle": 350, other: 400 },
    zones: ZONES,
  });

  console.log("Seeding operators, drivers, and vehicles...");
  const operatorCount = 15;
  const operators = [];
  const drivers = [];
  const vehicles = [];

  const firstNames = [
    "Juan", "Jose", "Antonio", "Ramon", "Ricardo", "Ernesto", "Roberto", "Danilo",
    "Rodel", "Marlon", "Rey", "Noel", "Arnel", "Bong", "Jun",
  ];
  const lastNames = [
    "Dela Cruz", "Reyes", "Bautista", "Garcia", "Torres", "Ramos", "Flores",
    "Villanueva", "Aquino", "Castillo", "Mendoza", "Santos", "Fernandez", "Salazar", "Domingo",
  ];

  for (let i = 0; i < operatorCount; i++) {
    const fullName = `${pick(firstNames, i)} ${pick(lastNames, i + 3)}`;
    const operator = await Operator.create({
      fullName,
      address: `Purok ${(i % 5) + 1}, ${pick(BARANGAYS, i)}, Midsalip, Zamboanga del Sur`,
      contactNumber: `09${String(170000000 + i * 137).padStart(9, "0")}`,
      email: `${fullName.toLowerCase().replace(/[^a-z]/g, ".")}@example.com`,
      dateRegistered: daysFromNow(-365 - i * 10),
    });
    operators.push(operator);

    const driver = await Driver.create({
      fullName: i % 4 === 0 ? `${pick(firstNames, i + 5)} ${pick(lastNames, i)}` : fullName,
      address: operator.address,
      contactNumber: operator.contactNumber,
      driversLicenseNumber: `N0${i}-23-${String(456000 + i).padStart(6, "0")}`,
      licenseExpiry: daysFromNow(365 + i * 20),
      operatorId: operator._id,
    });
    drivers.push(driver);

    const vehicleType =
      i % 3 === 0 ? "tricycle" : i % 3 === 1 ? "habal-habal/motorcycle" : "tricycle";
    const vehicle = await Vehicle.create({
      plateOrBodyNumber: `MSP-${String(1000 + i)}`,
      vehicleType,
      engineNumber: `ENG-${String(20230000 + i)}`,
      chassisNumber: `CHS-${String(88000000 + i)}`,
      color: pick(["Red", "Blue", "Black", "White", "Green", "Yellow"], i),
      model: pick(["Honda TMX", "Yamaha Sniper", "Kawasaki Barako", "Suzuki Raider"], i),
      operatorId: operator._id,
    });
    vehicles.push(vehicle);
  }

  console.log("Seeding franchises with mixed statuses...");
  // Expiry offsets: mix of active (>30d), expiring soon (<=30d), expired (past).
  const expiryOffsets = [
    200, 180, 150, 120, 90, // active
    25, 15, 5, 10, 28, // expiring soon
    -10, -30, -60, // expired
    200, 150, // will be manually suspended/revoked below
  ];

  const franchises = [];
  for (let i = 0; i < operatorCount; i++) {
    const year = new Date().getFullYear();
    const seq = i + 1;
    const franchiseNumber = `MSP-FR-${year}-${String(seq).padStart(4, "0")}`;
    const expiryDate = daysFromNow(expiryOffsets[i]);

    let status: "active" | "expiring_soon" | "expired" | "suspended" | "revoked" = "active";
    if (expiryOffsets[i] < 0) status = "expired";
    else if (expiryOffsets[i] <= 30) status = "expiring_soon";

    if (i === 13) status = "suspended";
    if (i === 14) status = "revoked";

    const franchise = await Franchise.create({
      franchiseNumber,
      driverId: drivers[i]._id,
      vehicleId: vehicles[i]._id,
      operatorId: operators[i]._id,
      routeOrZone: pick(ZONES, i),
      dateIssued: daysFromNow(-400 + i * 5),
      expiryDate,
      status,
      feeAmount: vehicles[i].vehicleType === "tricycle" ? 500 : 350,
      feePaid: i % 3 !== 0,
      renewalHistory:
        i % 5 === 0
          ? [
              {
                renewedAt: daysFromNow(-370),
                renewedBy: franchisingOfficer._id,
                previousExpiryDate: daysFromNow(-370),
                newExpiryDate: expiryDate,
              },
            ]
          : [],
    });
    franchises.push(franchise);
  }
  await Counter.findByIdAndUpdate(
    `franchise-${new Date().getFullYear()}`,
    { $set: { seq: operatorCount } },
    { upsert: true }
  );

  console.log("Seeding violations...");
  await Violation.create([
    {
      relatedFranchiseId: null,
      plateOrBodyNumberChecked: "MSP-9999",
      violationType: "unregistered",
      description: "Vehicle has no franchise record on file.",
      location: "Poblacion Junction",
      officerId: enforcementOfficer._id,
      dateRecorded: daysFromNow(-2),
      fineAmount: 1000,
      status: "recorded",
    },
    {
      relatedFranchiseId: franchises[10]._id,
      plateOrBodyNumberChecked: vehicles[10].plateOrBodyNumber,
      violationType: "expired_franchise",
      description: "Franchise expired over a month ago.",
      location: "Zone 1 Market",
      officerId: enforcementOfficer._id,
      dateRecorded: daysFromNow(-5),
      fineAmount: 750,
      status: "paid",
    },
    {
      relatedFranchiseId: franchises[13]._id,
      plateOrBodyNumberChecked: vehicles[13].plateOrBodyNumber,
      violationType: "suspended_franchise",
      description: "Operating despite suspension.",
      location: "Zone 2 Terminal",
      officerId: enforcementOfficer._id,
      dateRecorded: daysFromNow(-8),
      fineAmount: 1200,
      status: "contested",
    },
    {
      relatedFranchiseId: null,
      plateOrBodyNumberChecked: "MSP-8888",
      violationType: "unregistered",
      description: "Habal-habal operating without registration.",
      location: "Sominot Crossing",
      officerId: enforcementOfficer._id,
      dateRecorded: daysFromNow(-15),
      fineAmount: 1000,
      status: "recorded",
    },
    {
      relatedFranchiseId: franchises[11]._id,
      plateOrBodyNumberChecked: vehicles[11].plateOrBodyNumber,
      violationType: "expired_franchise",
      description: "Flagged during routine checkpoint.",
      location: "Poblacion Junction",
      officerId: enforcementOfficer._id,
      dateRecorded: daysFromNow(-20),
      fineAmount: 750,
      status: "waived",
    },
  ]);

  console.log("Seeding inspection log history...");
  await InspectionLog.create([
    {
      searchedValue: franchises[0].franchiseNumber,
      result: "valid_franchise",
      officerId: enforcementOfficer._id,
      timestamp: daysFromNow(-1),
      linkedFranchiseId: franchises[0]._id,
    },
    {
      searchedValue: "MSP-9999",
      result: "not_found_unregistered",
      officerId: enforcementOfficer._id,
      timestamp: daysFromNow(-2),
      linkedFranchiseId: null,
    },
    {
      searchedValue: vehicles[10].plateOrBodyNumber,
      result: "expired",
      officerId: enforcementOfficer._id,
      timestamp: daysFromNow(-5),
      linkedFranchiseId: franchises[10]._id,
    },
  ]);

  console.log("\nSeed complete.");
  console.log("Demo accounts (all use the same password):");
  console.log(`  ${admin.email}`);
  console.log(`  ${franchisingOfficer.email}`);
  console.log(`  ${enforcementOfficer.email}`);
  console.log(`  Password: ${DEMO_PASSWORD}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
