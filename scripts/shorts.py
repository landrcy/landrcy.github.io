#!/usr/bin/env python3
"""Fetch every public Short for the LLC/FFC channels -> youtube/shorts.json"""
import json, subprocess, time, re, urllib.request, datetime
CH = {'llc': ['UCT3ciRCc8ouYTix5_Heyrhg','UCCo7JOIyE3W--C9ANfWdObA','UCNBQ7mBPy16upVp0EhbdTgA','UCRegZeMyJ1B5B9n64rfgKAw','UCfDhWTThokF3gKW03iEGijg'],
      'ffc': ['UCIcfr7SXegLIyvpNiDzFLEw','UCGl9SSbOrCg2jgBLrGO4aIw']}
try:
    prev = {v['id']: v.get('first') for g in ('llc','ffc') for v in json.load(open('youtube/shorts.json'))[g]}
except Exception:
    prev = {}
out = {'updated': int(time.time()*1000), 'llc': [], 'ffc': [], 'latest': {}}
for g, ids in CH.items():
    for cid in ids:
        try:
            d = json.loads(subprocess.run(['yt-dlp','--flat-playlist','-J',f'https://www.youtube.com/channel/{cid}/shorts'],capture_output=True,text=True,timeout=180).stdout)
        except Exception as e:
            print('fail', cid, e); continue
        ents = d.get('entries') or []
        if ents: out['latest'][cid] = {'id': ents[0]['id'], 'title': ents[0].get('title') or ''}  # /shorts tab is newest-first
        for e in ents:
            if e.get('view_count') is None: continue
            out[g].append({'id': e['id'], 'title': e.get('title') or '', 'views': e['view_count'], 'ch': d.get('channel') or cid, 'cid': cid, 'first': prev.get(e['id']) or out['updated']})
try:
    oldj = json.load(open('youtube/shorts.json')).get('joined', {})
except Exception:
    oldj = {}
out['joined'] = {}
for cid in [c for ids in CH.values() for c in ids]:
    j = oldj.get(cid)
    if not j:
        try:
            h = urllib.request.urlopen(urllib.request.Request(f'https://www.youtube.com/channel/{cid}/about', headers={'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'en-US'}), timeout=30).read().decode('utf8', 'ignore')
            m = re.search(r'"joinedDateText":\{"content":"Joined ([A-Za-z]{3} \d{1,2}, \d{4})"', h)
            if m: j = datetime.datetime.strptime(m.group(1), '%b %d, %Y').strftime('%Y-%m-%d')
        except Exception as e:
            print('joined fail', cid, e)
    if j: out['joined'][cid] = j
# best comments: top comments on each channel's 4 most-viewed shorts; refreshed every 3h
try:
    oldc = json.load(open('youtube/shorts.json')).get('comments')
except Exception:
    oldc = None
if oldc and out['updated'] - oldc.get('t', 0) < 3*3600*1000:
    out['comments'] = oldc
else:
    cm = []
    for g in ('llc', 'ffc'):
        for cid in CH[g]:
            for v in sorted([v for v in out[g] if v['cid'] == cid], key=lambda v: -v['views'])[:4]:
                try:
                    d = json.loads(subprocess.run(['yt-dlp','--skip-download','-J','--write-comments','--extractor-args','youtube:max_comments=15,all,0,0;comment_sort=top',f'https://www.youtube.com/shorts/{v["id"]}'],capture_output=True,text=True,timeout=120).stdout)
                except Exception as e:
                    print('comments fail', v['id'], e); continue
                for c in (d or {}).get("comments") or []:
                    if c.get('author_is_uploader') or not (c.get('text') or '').strip(): continue
                    cm.append({'text': c['text'][:220], 'author': c.get('author') or '', 'likes': c.get('like_count') or 0, 'vid': v['id'], 'ch': v['ch'], 'g': g})
    cm.sort(key=lambda c: -c['likes'])
    out['comments'] = {'t': out['updated'], 'list': cm[:24]} if cm else (oldc or {'t': 0, 'list': []})
json.dump(out, open('youtube/shorts.json','w'), ensure_ascii=False)
print({g: len(out[g]) for g in CH})
