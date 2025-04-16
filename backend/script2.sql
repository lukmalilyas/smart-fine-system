CREATE TABLE "Domain"."Restaurants" (
    "RestaurantID" SERIAL PRIMARY KEY,               -- Unique identifier for the restaurant
    "RestaurantName" VARCHAR(100) NOT NULL,          -- Name of the restaurant
    "OwnerFirstName" VARCHAR(255) NOT NULL,          -- Owner's first name
    "OwnerLastName" VARCHAR(255) NOT NULL,           -- Owner's last name
    "PhoneNumber" VARCHAR(15) UNIQUE,                -- Contact number
    "Address" TEXT,                                  -- Full address of the restaurant
    "District" VARCHAR(50) NOT NULL,                 -- District/Region
    "NIC" VARCHAR(20),                               -- National Identity Card number (owner)
    "RegistrationNumber" VARCHAR(50) UNIQUE,         -- Restaurant registration number
    "LicenseNumber" VARCHAR(50) UNIQUE,              -- Health/safety or food license number
    "RegistrationDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When the restaurant was registered
    "LastUpdated" TIMESTAMP DEFAULT CURRENT_TIMESTAMP        -- Last update timestamp
);

CREATE TABLE "Domain"."SurveillanceCount" (
    "LicenseNumber" VARCHAR PRIMARY KEY,
    "Date" DATE,
    "Time" TIME,
    "TrackID" INT,
    "PersonAppearance" VARCHAR(1000)
);