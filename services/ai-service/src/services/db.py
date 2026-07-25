import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load env file from current or parent directories
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
# Clean up Prisma-specific query params like ?schema=public if psycopg2 complains
if DATABASE_URL and "?" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.split("?")[0]

def get_db_connection():
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable is not set")
    return psycopg2.connect(DATABASE_URL)

def execute_query(query, params=None, fetch=True):
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, params or ())
            if fetch:
                results = cur.fetchall()
                return results
            conn.commit()
            return None
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def execute_insert_or_update(query, params=None):
    return execute_query(query, params, fetch=False)
