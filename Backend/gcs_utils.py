import os
from google.cloud import storage

BUCKET_NAME = os.environ.get("GCS_BUCKET_NAME", "braintube-vector-store")

def get_storage_client():
    try:
        return storage.Client()
    except Exception as e:
        print("Warning: Google Cloud Storage client could not be initialized. Using local memory only.", e)
        return None

def download_from_gcs(blob_name, destination_file_name):
    client = get_storage_client()
    if not client: return False
    try:
        bucket = client.bucket(BUCKET_NAME)
        blob = bucket.blob(blob_name)
        if blob.exists():
            os.makedirs(os.path.dirname(destination_file_name), exist_ok=True)
            blob.download_to_filename(destination_file_name)
            return True
        return False
    except Exception as e:
        print(f"Error downloading {blob_name} from GCS: {e}")
        return False

def upload_to_gcs(source_file_name, blob_name):
    client = get_storage_client()
    if not client: return False
    try:
        bucket = client.bucket(BUCKET_NAME)
        blob = bucket.blob(blob_name)
        blob.upload_from_filename(source_file_name)
        return True
    except Exception as e:
        print(f"Error uploading {blob_name} to GCS: {e}")
        return False

def delete_from_gcs(blob_name):
    client = get_storage_client()
    if not client: return False
    try:
        bucket = client.bucket(BUCKET_NAME)
        blob = bucket.blob(blob_name)
        if blob.exists():
            blob.delete()
            return True
        return False
    except Exception as e:
        print(f"Error deleting {blob_name} from GCS: {e}")
        return False
