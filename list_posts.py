import json, sys
d = json.load(sys.stdin)
print(f'Total: {d["pagination"]["total"]}')
for p in d['posts']:
    print(f'  - {p["id"][:8]}... {p["title"][:50]} (status={p["status"]}, featured={p["featured"]}, banner={p["featuredBannerImageId"] is not None})')
