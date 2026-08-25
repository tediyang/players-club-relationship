import csv
from pathlib import Path
from datetime import datetime
from db.connection import CognoDB


BATCH_SIZE = 200          # Players per batch
CSV_PATH = "football_players_career_history.csv"

def read_csv_in_batches(csv_path, batch_size):
  """Yields batches of player data from the CSV."""
  with open(csv_path, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)

    if "Player Name" not in reader.fieldnames or "Clubs Played For" not in reader.fieldnames:
      raise ValueError("CSV must have columns: 'Player Name' and 'Clubs Played For'")

    current_batch = []

    for row in reader:
      player = row["Player Name"].strip()
      clubs_str = row["Clubs Played For"].strip()

      if not player or not clubs_str:
        continue

      clubs = [c.strip() for c in clubs_str.split(",") if c.strip()]
      if not clubs:
        continue

      current_batch.append({"player": player, "clubs": clubs})

      if len(current_batch) >= batch_size:
        yield current_batch
        current_batch = []

    if current_batch:
      yield current_batch

def load_data_sync(csv_path, batch_size=200):
  """Loads data synchronously with batched UNWIND queries."""
  csv_path = Path(csv_path)
  if not csv_path.exists():
    print(f"CSV file not found: {csv_path}")
    return

  # 1. Instantiate and connect
  db = CognoDB()
  if not db.connect():
    print("Could not connect to CognoDB. Check your .env file.")
    return

  print("Connected to CognoDB successfully.\n")

  # 2. Read CSV into batches
  batches = list(read_csv_in_batches(csv_path, batch_size))
  total_batches = len(batches)

  if total_batches == 0:
    print("No data found in CSV.")
    db.close()
    return

  print(f"Total batches to process: {total_batches}")
  print(f"Batch size: {batch_size} players\n")

  # 3. Define the batch Cypher query (using UNWIND)
  query = """
  UNWIND $batch AS row
  MERGE (p:Player {name: row.player})
  WITH p, row
  UNWIND row.clubs AS clubName
  MERGE (c:Club {name: clubName})
  MERGE (p)-[:PLAYED_FOR]->(c)
  """

  # 4. Process each batch using the centralized execute_query method
  start_time = datetime.now()
  total_nodes = 0
  total_rels = 0

  for idx, batch in enumerate(batches):
    try:
      # execute_batch returns SummaryCounters directly
      counters = db.execute_batch(query, {"batch": batch})

      total_nodes += counters.nodes_created
      total_rels += counters.relationships_created

      print(
        f"Batch {idx+1}/{total_batches} | "
        f"Nodes created: {counters.nodes_created} | "
        f"Relationships created: {counters.relationships_created}"
      )

    except Exception as e:
      print(f"Batch {idx+1} failed: {e}")
      db.close()
      return

  elapsed = datetime.now() - start_time

  print(f"\n{'='*50}")
  print(f"LOAD COMPLETE")
  print(f"{'='*50}")
  print(f"Total nodes created: {total_nodes}")
  print(f"Total relationships created: {total_rels}")
  print(f"Total time: {elapsed.total_seconds():.2f} seconds")
  print(f"{'='*50}")

  db.close()


if __name__ == "__main__":
  load_data_sync(CSV_PATH, BATCH_SIZE)