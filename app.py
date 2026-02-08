from flask import Flask, render_template, request, jsonify
import sqlite3
import os

app = Flask(__name__)

# Path to database (works locally and on Render)
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
    search_type = request.args.get("type", "").strip().lower()
    value = request.args.get("value", "").strip().lower()

    if not value:
        return jsonify([])

    conn = get_db_connection()
    cursor = conn.cursor()

    results = []

    # Search by crop
    if search_type == "crop":
        cursor.execute("""
            SELECT pesticide, crop, health_effect, reason
            FROM pesticide_data
            WHERE LOWER(crop) LIKE ?
        """, (f"%{value}%",))
        rows = cursor.fetchall()
        for row in rows:
            results.append({
                "crop": row["crop"],
                "pesticide": row["pesticide"],
                "health_effect": row["health_effect"],
                "reason": row["reason"]
            })

    # Search by pesticide
    elif search_type == "pesticide":
        cursor.execute("""
            SELECT pesticide, crop, health_effect, reason
            FROM pesticide_data
            WHERE LOWER(pesticide) LIKE ?
        """, (f"%{value}%",))
        rows = cursor.fetchall()
        for row in rows:
            results.append({
                "crop": row["crop"],
                "pesticide": row["pesticide"],
                "health_effect": row["health_effect"],
                "reason": row["reason"]
            })

    conn.close()
    return jsonify(results)



if __name__ == "__main__":
    # Detect port for Render, fallback to local 5000
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
