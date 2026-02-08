import os
import sqlite3
import csv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_NAME = os.path.join(BASE_DIR, "pesticide.db")

conn = sqlite3.connect(DB_NAME)
cur = conn.cursor()

# Drop old table if exists
cur.execute("DROP TABLE IF EXISTS pesticide_data")

# Create table
cur.execute("""
CREATE TABLE pesticide_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pesticide TEXT,
    crop TEXT,
    health_effect TEXT,
    reason TEXT
)
""")

# Load dataset
with open(os.path.join(BASE_DIR, "datasets", "pesticide_health.csv"),
          newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        pesticide = row["Pesticide"].strip().lower()
        crops = row["Crops_Used_On"].split(",")

        for crop in crops:
            cur.execute("""
                INSERT INTO pesticide_data (pesticide, crop, health_effect, reason)
                VALUES (?, ?, ?, ?)
            """, (
                pesticide,
                crop.strip().lower(),
                row["Human_Health_Effects"],
                row["Reason_for_Health_Impact"]
            ))

conn.commit()
conn.close()

print("Database created and data inserted successfully.")
