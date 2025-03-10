CREATE TABLE users (
    ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Unique internal user ID
    FirebaseUID VARCHAR(128) UNIQUE NOT NULL,      -- Unique Firebase Authentication ID
    Email VARCHAR(255) UNIQUE,                      -- User email (nullable for social logins)
    FirstName VARCHAR(255),                      -- Full name from Firebase
    lastName VARCHAR(255),                      -- Full name from Firebase
    Provider VARCHAR(50) NOT NULL,                  -- Auth provider (google, email, etc.)
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- User creation timestamp
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Last update timestamp
);

CREATE TABLE VehicleOwners (
    LicensePlate VARCHAR(20) PRIMARY KEY,       -- License plate as a unique identifier
    VehicleType VARCHAR(50) NOT NULL,           -- Type of vehicle (car, bike, truck, etc.)
    VehicleModel VARCHAR(50) NOT NULL,          -- Model name (e.g., Toyota Corolla)
    VehicleColour VARCHAR(50) NOT NULL,         -- Vehicle color
    FirstName VARCHAR(255) NOT NULL,            -- Owner's first name
    LastName VARCHAR(255) NOT NULL,             -- Owner's last name
    PhoneNumber VARCHAR(15),             -- Contact number (ensures uniqueness)
    Address TEXT,                               -- Full address of the owner
    District VARCHAR(50) NOT NULL,              -- District/Region
    NIC VARCHAR(20) UNIQUE,                     -- National Identity Card number
    ChassisNumber VARCHAR(50) UNIQUE,           -- Unique identifier for the vehicle's chassis
    EngineNumber VARCHAR(50) UNIQUE,            -- Unique identifier for the vehicle's engine
    RegistrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When the vehicle was registered
    LastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Last update timestamp
);

