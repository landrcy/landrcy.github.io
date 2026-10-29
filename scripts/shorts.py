#!/usr/bin/env python3
"""Fetch every public Short for the LLC/FFC channels -> youtube/shorts.json"""
import json, subprocess, time
CH = {'llc': ['UCT3ciRCc8ouYTix5_Heyrhg','UCCo7JOIyE3W--C9ANfWdObA','UCNBQ7mBPy16upVp0EhbdTgA','UCRegZeMyJ1B5B9n64rfgKAw','UCfDhWTThokF3gKW03iEGijg'],
      'ffc': ['UCIcfr7SXegLIyvpNiDzFLEw','UCGl9SSbOrCg2jgBLrGO4aIw']}
try:
    prev = {v['id']: v.get('first') for g in ('llc','ffc') for v in json.load(open('youtube/shorts.json'))[g]}
except Exception:
    prev = {}
out = {'updated': int(time.time()*1000), 'llc': [], 'ffc': []}
for g, ids in CH.items():
    for cid in ids:
        try:
            d = json.loads(subprocess.run(['yt-dlp','--flat-playlist','-J',f'https://www.youtube.com/channel/{cid}/shorts'],capture_output=True,text=True,timeout=180).stdout)
        except Exception as e:
            print('fail', cid, e); continue
        for e in d.get('entries') or []:
            if e.get('view_count') is None: continue
            out[g].append({'id': e['id'], 'title': e.get('title') or '', 'views': e['view_count'], 'ch': d.get('channel') or cid, 'cid': cid, 'first': prev.get(e['id']) or out['updated']})
json.dump(out, open('youtube/shorts.json','w'), ensure_ascii=False)
print({g: len(out[g]) for g in CH})
