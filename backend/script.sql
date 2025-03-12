-- Ensure the schemas exist
CREATE SCHEMA IF NOT EXISTS "Identity";
CREATE SCHEMA IF NOT EXISTS "Domain";

-- Users Table in Identity schema
CREATE TABLE "Identity"."Users" (
    "ID" UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Unique internal user ID
    "FirebaseUID" VARCHAR(128) UNIQUE NOT NULL,      -- Unique Firebase Authentication ID
    "Email" VARCHAR(255) UNIQUE,                     -- User email (nullable for social logins)
    "Name" VARCHAR(255),                             -- Full name from Firebase
    "Provider" VARCHAR(50) NOT NULL,                 -- Auth provider (google, email, etc.)
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- User creation timestamp
    "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Last update timestamp
);

-- Vehicle Owners Table in Domain schema
CREATE TABLE "Domain"."Vehicles" (
    "LicensePlate" VARCHAR(20) PRIMARY KEY,       -- License plate as a unique identifier
    "VehicleType" VARCHAR(50) NOT NULL,           -- Type of vehicle (car, bike, truck, etc.)
    "VehicleModel" VARCHAR(50) NOT NULL,          -- Model name (e.g., Toyota Corolla)
    "VehicleColour" VARCHAR(50) NOT NULL,         -- Vehicle color
    "FirstName" VARCHAR(255) NOT NULL,            -- Owner's first name
    "LastName" VARCHAR(255) NOT NULL,             -- Owner's last name
    "PhoneNumber" VARCHAR(15),                    -- Contact number (ensures uniqueness)
    "Address" TEXT,                               -- Full address of the owner
    "District" VARCHAR(50) NOT NULL,              -- District/Region
    "NIC" VARCHAR(20),                            -- National Identity Card number
    "ChassisNumber" VARCHAR(50) UNIQUE,           -- Unique identifier for the vehicle's chassis
    "EngineNumber" VARCHAR(50) UNIQUE,            -- Unique identifier for the vehicle's engine
    "RegistrationDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When the vehicle was registered
    "LastUpdated" TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Last update timestamp
);

-- Fines Table in Domain schema
CREATE TABLE "Domain"."Fines" (
    "ID" SERIAL PRIMARY KEY,                                -- Unique ID (auto-incremented using SERIAL)
    "LicensePlate" VARCHAR(20) NOT NULL,                    -- License plate of the vehicle
    "FineAmount" DECIMAL(10, 2) NOT NULL,                   -- Amount of the fine
    "Location" VARCHAR(255) NOT NULL,                       -- Location where the fine was issued
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP         -- Ticket creation timestamp
);
