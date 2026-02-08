from flask import Flask, render_template, request, jsonify
import sqlite3
import os

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "pesticide.db")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/check")
def health_check():
    return jsonify({"status": "Backend is running"})


@app.route("/search", methods=["GET"])
def search():
    crop = request.args.get("crop", "").strip().lower()

    if not crop:
        return jsonify([])

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            crop_name,
            pesticide_name,
            quantity_used,
            health_effects
        FROM pesticides
        WHERE LOWER(crop_name) LIKE ?
    """, (f"%{crop}%",))

    rows = cursor.fetchall()
    conn.close()

    results = []
    for row in rows:
        results.append({
            "crop": row["crop_name"],
            "pesticide": row["pesticide_name"],
            "quantity": row["quantity_used"],
            "health_effects": row["health_effects"]
        })

    return jsonify(results)


if __name__ == "__main__":
    # For deployment platforms (Render, Railway, etc.)
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
