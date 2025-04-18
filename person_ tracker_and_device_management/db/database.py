import psycopg2
from loguru import logger
from psycopg2 import Error, OperationalError, DatabaseError
import os

class DatabaseHandler:
    def __init__(self):
        logger.info("Starting Database Handler.")
        self.dbname = os.getenv("DB_NAME")
        self.user = os.getenv("DB_USER")
        self.password = os.getenv("DB_PASSWORD")
        self.host = os.getenv("DB_HOST")
        self.port = os.getenv("DB_PORT")
        self.connection = None
        self.seed = os.getenv("DB_SEED")
        self._connect()

    def _connect(self):
        try:
            self.connection = psycopg2.connect(
                dbname=self.dbname,
                user=self.user,
                password=self.password,
                host=self.host,
                port=self.port
            )
            logger.info("Database connection established")
            if self.seed == "true":
                self.seed_database()
            
        except OperationalError as oe:
            logger.error(f"Operational error connecting to PostgreSQL database: {oe}")
            raise oe
        
        except DatabaseError as de:
            logger.error(f"Database error connecting to PostgreSQL database: {de}")
            raise de
        
        except Exception as e:
            logger.error(f"Error connecting to PostgreSQL database: {e}")
            raise e


    def disconnect(self):
        logger.info("Disconnectng PostgreSQL database connection...")
        if self.connection:
            self.connection.close()

    def execute_query(self, query, parameters=None):
        try:
            logger.info("Executing the query...")
            self.begin_transaction()
            cursor = self.connection.cursor()
            if parameters:
                cursor.execute(query, parameters)
            else:
                cursor.execute(query)
            self.connection.commit()
            self.commit_transaction()
            return cursor
        except Error as e:
            print(f"An unexpected error occusred: {e}")
            self.rollback_transaction()

    def fetch_all_rows(self, cursor):
        try:
            logger.info("Fetching all rows from the database...")
            return cursor.fetchall()
        except Error as e:
            print(f"Error fetching rows: {e}")

    def seed_database(self):
        try:
            logger.info("Seeding database...")
            self.begin_transaction()
            cursor = self.connection.cursor()
            query = """
            CREATE TABLE "Domain"."SurveillanceCount" (
                "ID" SERIAL PRIMARY KEY,
                "LicenseNumber" VARCHAR,
                "Date" DATE,
                "Time" TIME,
                "TrackID" INT,
                "PersonAppearance" VARCHAR(1000)
            );
            """
            cursor.execute(query)
            self.connection.commit()
            self.commit_transaction()
        except Error as e:
            print(f"An unexpected error occusred: {e}")
            self.rollback_transaction()
    
    def begin_transaction(self):
        self.connection.autocommit = False

    def commit_transaction(self):
        self.connection.commit()
        self.connection.autocommit = True

    def rollback_transaction(self):
        self.connection.rollback()
        self.connection.autocommit = True
