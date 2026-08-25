from neo4j import GraphDatabase
from config import Config
from flask import current_app

class CognoDB:
  def __init__(self):
    self.driver = None

  def connect(self):
    try:
      Config.validate()
      self.driver = GraphDatabase.driver(
        Config.COGNODB_URI,
        auth=(Config.COGNODB_USER, Config.COGNODB_PASSWORD),
        max_connection_lifetime=3600,
      )

      # Verify connectivity
      with self.driver.session() as session:
        session.run("RETURN 1")
        # current_app.logger.info("Database Connection Successful")

      return True
    except Exception as e:
      # current_app.logger.error("Connection Failed", exc_info=e)
      print(f"[ERROR] Connection failed: {e}")
      return False

  def close(self):
    if self.driver:
      self.driver.close()

  def execute_query(self, query, parameters=None):
    """
    Executes a parameterized Cypher query.
    Throws an exception if the database is not connected.
    """
    if not self.driver:
      raise ConnectionError("Database driver is not initialized.")

    try:
      with self.driver.session() as session:
        result = session.run(query, parameters or {})
        # Convert to list of dicts for easy JSON serialization
        return [record.data() for record in result]
    except Exception as e:
      print(f"[ERROR] Query failed: {e}")
      raise

  def execute_batch(self, query, parameters=None):
    """
    Executes a parameterized Cypher batch query (typically with UNWIND)
    and returns the SummaryCounters object (nodes_created, relationships_created, etc.).
    """
    if not self.driver:
      raise ConnectionError("Database driver is not initialized.")

    try:
      with self.driver.session() as session:
        result = session.run(query, parameters or {})
        summary = result.consume()      # Exhausts the stream and releases resources
        return summary.counters         # Returns SummaryCounters object
    except Exception as e:
        print(f"[ERROR] Batch query failed: {e}")
        raise
