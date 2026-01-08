from datasets import load_dataset
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv
import requests
import json
import os
import sys

# =================================================
# Environment
# =================================================
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing")
    sys.exit(1)

# =================================================
# Dataset config
# =================================================
DATASET_NAME = "open-r1/codeforces"
CONFIG_NAME = "default"

# =================================================
# Paths (anchored to file location)
# =================================================
BASE_DIR = Path(__file__).parent
OUTPUT_DIR = BASE_DIR / "output"
NDJSON_FILE = OUTPUT_DIR / "codeforces_questions.ndjson"
METADATA_FILE = OUTPUT_DIR / "metadata.json"

# =================================================
# Helpers
# =================================================
def normalize_example(ex):
    if not isinstance(ex, dict):
        return None
    return {
        "input": ex.get("input"),
        "output": ex.get("output"),
    }

def normalize_row(row):
    examples = row.get("examples") or []
    slug = row["id"].strip().lower()
    return {
        "slug": slug,
        "title": row.get("title"),
        "description": row.get("description"),
        "examples": [
            normalize_example(e) for e in examples if e
        ],
    }

def fetch_dataset_sha():
    url = f"https://huggingface.co/api/datasets/{DATASET_NAME}"
    res = requests.get(url, timeout=30)
    res.raise_for_status()
    return res.json()["sha"]

def upload_to_supabase(local_path: Path, remote_path: str):
    with open(local_path, "rb") as f:
        res = requests.post(
            f"{SUPABASE_URL}/storage/v1/object/ingestion/{remote_path}",
            headers={
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/octet-stream",
                "x-upsert": "true",
            },
            data=f,
            timeout=120,
        )
    res.raise_for_status()

# =================================================
# Main pipeline
# =================================================
def main():
    print("▶ Starting Codeforces ingestion")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print("▶ Fetching Hugging Face dataset SHA")
    sha = fetch_dataset_sha()

    print("▶ Loading dataset (cached if available)")
    dataset = load_dataset(DATASET_NAME, CONFIG_NAME)

    record_count = 0

    print("▶ Generating NDJSON")
    with open(NDJSON_FILE, "w", encoding="utf-8") as f:
        for split in ("train", "test"):
            for row in dataset[split]:
                f.write(
                    json.dumps(
                        normalize_row(row),
                        ensure_ascii=False
                    ) + "\n"
                )
                record_count += 1

    print(f"✔ NDJSON generated ({record_count} records)")

    metadata = {
        "dataset": DATASET_NAME,
        "config": CONFIG_NAME,
        "sha": sha,
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "record_count": record_count,
    }

    with open(METADATA_FILE, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print("✔ metadata.json generated")

    print("▶ Uploading NDJSON to Supabase Storage")
    upload_to_supabase(
        NDJSON_FILE,
        "codeforces/codeforces_questions.ndjson"
    )

    print("▶ Uploading metadata.json to Supabase Storage")
    upload_to_supabase(
        METADATA_FILE,
        "codeforces/metadata.json"
    )

    print("✅ INGESTION COMPLETE")
    print(f"SHA: {sha}")
    print(f"Records: {record_count}")

# =================================================
if __name__ == "__main__":
    main()
