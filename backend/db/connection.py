from neo4j import GraphDatabase
from config import Config
from flask import current_app, has_app_context


class CognoDB:
  def __init__(self):
    self.driver = None

  def _log(self, level, message, exc_info=None):
    """
    Helper method to route log messages to current_app.logger if inside a Flask
    app context, or fallback to print/standard logging when running standalone.
    """
    if has_app_context():
        logger = current_app.logger
        if level == "info":
            logger.info(message)
        elif level == "error":
            logger.error(message, exc_info=exc_info)
    else:
        # Running outside Flask context
        if exc_info:
            print(f"[{level.upper()}] {message} - Exception: {exc_info}")
        else:
            print(f"[{level.upper()}] {message}")

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
        self._log("info", "Database Connection Successful")

      return True
    except Exception as e:
      self._log("error", "Connection Failed", exc_info=e)
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
      self._log("error", "Query failed", exc_info=e)
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
      self._log("error", "Batch query failed", exc_info=e)
      raise