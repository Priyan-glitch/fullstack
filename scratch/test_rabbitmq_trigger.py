import urllib.request
import json
import time

print("1. Sending trigger request to Allocation Service (http://localhost:8083/api/allocations/trigger)...")
payload = {
    "strategy": "graph_clustering",
    "year": 4,
    "runBy": "admin",
    "notes": "Triggered via RabbitMQ Async Test"
}
req = urllib.request.Request(
    "http://localhost:8083/api/allocations/trigger",
    data=json.dumps(payload).encode('utf-8'),
    headers={"Content-Type": "application/json"}
)

try:
    with urllib.request.urlopen(req) as response:
        status_code = response.getcode()
        body = response.read().decode('utf-8')
        print(f"Status Code: {status_code}")
        print(f"Response: {body}")
        data = json.loads(body)
        job_id = data.get("jobId")
        print(f"\nTask accepted! Job ID: {job_id}. Status: {data.get('status')}")
except Exception as e:
    print(f"Request failed: {e}")
    exit(1)

print("Waiting 4 seconds for RabbitMQ Background Worker in Algorithm Engine to process...")
time.sleep(4)

print("\n2. Checking Algorithm Engine runs (http://localhost:8090/api/v1/allocation/runs)...")
runs_req = urllib.request.Request("http://localhost:8090/api/v1/allocation/runs")
with urllib.request.urlopen(runs_req) as response:
    runs_body = response.read().decode('utf-8')
    runs = json.loads(runs_body)
    print(f"Total runs found: {len(runs)}")
    for r in runs[:3]:
        print(f"- Run ID: {r.get('id')} | Status: {r.get('status')} | Notes: {r.get('notes')} | Allocated: {r.get('allocated_count')}/{r.get('total_students')}")
