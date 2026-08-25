import os
from dotenv import load_dotenv

load_dotenv()

class Config:
  COGNODB_URI = os.getenv("COGNODB_URI")
  COGNODB_USER = os.getenv("COGNODB_USER")
  COGNODB_PASSWORD = os.getenv("COGNODB_PASSWORD")

  @classmethod
  def validate(cls):
    if not all([cls.COGNODB_URI, cls.COGNODB_USER, cls.COGNODB_PASSWORD]):
      raise ValueError(
        "Missing CognoDB environment variables. "
        "Please check your .env file."
      )
