from flask import Flask, render_template, request, jsonify
import os
import logging
from logging.handlers import RotatingFileHandler
from db.connection import CognoDB
from db.queries import (
  find_shortest_path,
  find_indirect_alumnus,
  get_largest_squads,
)

# Setup file logging
def setup_logging(app):
  # Ensure logs directory exists
  log_dir = "logs"
  os.makedirs(log_dir, exist_ok=True)

  # Log Format (Timestamp | Level | Module/Line | Message)
  formatter = logging.Formatter(
    "[%(asctime)s] %(levelname)s in %(module)s (line %(lineno)d): %(message)s"
  )

  # 2. General App Log Handler (INFO and above -> logs/app.log)
  app_handler = RotatingFileHandler(
    os.path.join(log_dir, "app.log"),
    maxBytes=10 * 1024 * 1024,  # 10 MB per file
    backupCount=5,               # Keep up to 5 rolled backup files
    encoding="utf-8"
  )
  app_handler.setLevel(logging.INFO)
  app_handler.setFormatter(formatter)

  # 3. Error Log Handler (ERROR and above -> logs/error.log)
  error_handler = RotatingFileHandler(
    os.path.join(log_dir, "error.log"),
    maxBytes=10 * 1024 * 1024,  # 10 MB per file
    backupCount=5,
    encoding="utf-8"
  )
  error_handler.setLevel(logging.ERROR)
  error_handler.setFormatter(formatter)

  # 4. Attach handlers to Flask's logger
  app.logger.setLevel(logging.INFO)
  app.logger.addHandler(app_handler)
  app.logger.addHandler(error_handler)


app = Flask(__name__)
setup_logging(app)
db = CognoDB()

# Global flag to track DB status
db_ready = False

def initialize_db():
  global db_ready
  try:
    db_ready = db.connect()
    if not db_ready:
      app.logger.error("CognoDB connection failed on startup.")
  except Exception as e:
    app.logger.error(f"Startup error: {e}")
    db_ready = False

# run initialization
with app.app_context():
  initialize_db()

@app.route("/api/health")
def health():
  """Simple health check for the frontend to display DB status."""
  return jsonify({"database_connected": db_ready})


# ================================================================
# SHORTEST PATH ENDPOINT
# ================================================================
@app.route("/api/path")
def get_path():
  if not db_ready:
    return jsonify({"error": "Database is not reachable."}), 503

  player_a = request.args.get("player1", "").strip()
  player_b = request.args.get("player2", "").strip()

  if not player_a or not player_b:
    return jsonify({"error": "Please provide both player1 and player2."}), 400

  try:
    results = find_shortest_path(db, player_a, player_b)
    if not results:
      return jsonify(
        {
          "message": f"No connection found between {player_a} and {player_b}.",
          "results": [],
        }
      )
    return jsonify({"results": results})
  except Exception as e:
    app.logger.error(f"Path query error: {e}")
    return jsonify({"error": "An internal server error occurred."}), 500


# ================================================================
# INDIRECT TEAMMATES ENDPOINT
# ================================================================
@app.route("/api/indirect")
def get_indirect():
  if not db_ready:
    return jsonify({"error": "Database is not reachable."}), 503

  star = request.args.get("player", "").strip()
  exclude = request.args.get("exclude", "").strip()

  if not star or not exclude:
    return jsonify({"error": "Provide both 'player' and 'exclude' (club name)."}), 400

  try:
    results = find_indirect_alumnus(db, star, exclude)
    if not results:
      return jsonify(
        {
          "message": f"No distant teammates found for {star} excluding {exclude}.",
          "results": [],
        }
      )
    return jsonify({"results": results})
  except Exception as e:
    app.logger.error(f"Indirect query error: {e}")
    return jsonify({"error": "An internal server error occurred."}), 500


# ================================================================
# LARGEST SQUADS ENDPOINT
# ================================================================
@app.route("/api/squads")
def get_squads():
  if not db_ready:
    return jsonify({"error": "Database is not reachable."}), 503

  try:
    results = get_largest_squads(db)
    return jsonify({"results": results})
  except Exception as e:
    app.logger.error(f"Squad query error: {e}")
    return jsonify({"error": "An internal server error occurred."}), 500


if __name__ == "__main__":
  # The app will handle errors gracefully via the API health checks.
  app.run(debug=True, host="0.0.0.0", port=5000)
