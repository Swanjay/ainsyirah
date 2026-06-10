#!/usr/bin/env python3
import urllib.request, json

# Read key from .env.local
key = ''
with open('/home/ubuntu/ai-agent-demo/.env.local') as f:
    for line in f:
        parts = line.strip().split('=', 1)
        if parts[0] == 'OPENROUTER_API_KEY' and len(parts) == 2:
            key = parts[1]
            break

if not key:
    print('No OPENROUTER_API_KEY found')
    exit(1)

print('Key starts with:', key[:12], 'length:', len(key))

req = urllib.request.Request('https://openrouter.ai/api/v1/models', headers={'Authorization': 'Bearer ' + key})
data = json.loads(urllib.request.urlopen(req, timeout=15).read())
models = data.get('data', [])
free = [m for m in models if m.get('pricing',{}).get('prompt','1') in ('0','0.0','0.00') and m.get('pricing',{}).get('completion','1') in ('0','0.0','0.00')]
free.sort(key=lambda x: x.get('name',''))
for m in free:
    print(m['id'] + ' — ' + m.get('name',''))
print('\nTotal free:', len(free), '/', len(models), 'total')
