from flask import Flask, render_template, request, jsonify
import sqlite3
import os

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_NAME = os.path.join(BASE_DIR, "pesticide.db")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/check")
def check():
    return jsonify({"status": "Backend is running"})


@app.route("/search")
def search():

    search_type = request.args.get("type", "")
    value = request.args.get("value", "")

    print("SEARCH HIT:", search_type, value)

    search_type = request.args.get("type", "").lower()
    value = request.args.get("value", "").strip().lower()

    if not search_type or not value:
        return jsonify([])

    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    if search_type == "crop":
        query = """
        SELECT crop, pesticide, health_effect, reason
        FROM pesticide_data
        WHERE crop LIKE ?
        """
    elif search_type == "pesticide":
        query = """
        SELECT crop, pesticide, health_effect, reason
        FROM pesticide_data
        WHERE pesticide LIKE ?
        """
    else:
        conn.close()
        return jsonify([])

    cur.execute(query, (f"%{value}%",))
    rows = cur.fetchall()
    conn.close()

    return jsonify([dict(row) for row in rows])


if __name__ == "__main__":
    app.run()

