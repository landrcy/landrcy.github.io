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
SUBS = {}
for g, ids in CH.items():
    for cid in ids:
        try:
            d = json.loads(subprocess.run(['yt-dlp','--flat-playlist','-J',f'https://www.youtube.com/channel/{cid}/shorts'],capture_output=True,text=True,timeout=180).stdout)
        except Exception as e:
            print('fail', cid, e); continue
        ents = d.get('entries') or []
        if d.get('channel_follower_count') is not None: SUBS[cid] = d['channel_follower_count']
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
# upload dates (immutable, cached) -> "started" = first Short of the current regular-posting streak
try:
    oldf = json.load(open('youtube/shorts.json'))
except Exception:
    oldf = {}
pub = oldf.get('pub', {})
for g in CH:
    for v in out[g]:
        if v['id'] in pub: continue
        try:
            r = subprocess.run(['yt-dlp','--skip-download','--print','%(upload_date)s',f'https://www.youtube.com/shorts/{v["id"]}'],capture_output=True,text=True,timeout=60).stdout.strip()
            if re.fullmatch(r'\d{8}', r): pub[v['id']] = f'{r[:4]}-{r[4:6]}-{r[6:]}'
        except Exception as e:
            print('date fail', v['id'], e)
out['pub'] = pub
GAP = 21  # a pause longer than this many days resets the streak
out['started'] = {}
for g in CH:
    for cid in CH[g]:
        ds = sorted(datetime.date.fromisoformat(pub[v['id']]) for v in out[g] if v['cid'] == cid and v['id'] in pub)
        if not ds: continue
        st = ds[0]
        for a, b in zip(ds, ds[1:]):
            if (b - a).days > GAP: st = b
        out['started'][cid] = st.isoformat()
# server-side views history (sum of all Shorts view counts per channel) for an accurate LAST 24H
vh = [p for p in oldf.get('vh', []) if out['updated'] - p['t'] < 8*86400*1000]
vh.append({'t': out['updated'], 's': SUBS, 'v': {cid: sum(v['views'] for v in out[g] if v['cid'] == cid) for g in CH for cid in CH[g] if any(v['cid'] == cid for v in out[g])}})
out['vh'] = vh
# server-computed LAST 24H per channel (Shorts view-sum delta incl. brand-new uploads; subs delta).
# Interpolates across the two snapshots bracketing now-24h; if history is shorter/gappy, scales the
# nearest real span (>=6h): reports the RAW delta over that span (no extrapolation) and flags est.
def base24(k, cid):
    now = out['updated']; tgt = now - 86400*1000
    pts = [p for p in vh if cid in p.get(k, {})]
    lo = next((p for p in reversed(pts) if p['t'] <= tgt), None); hi = next((p for p in pts if p['t'] > tgt), None)
    if lo and hi and hi['t'] - lo['t'] <= 3*3600*1000:
        f = (tgt - lo['t']) / ((hi['t'] - lo['t']) or 1)
        return lo[k][cid] + (hi[k][cid] - lo[k][cid]) * f, 86400*1000, False
    c = min([x for x in (lo, hi) if x], key=lambda x: abs(x['t'] - tgt), default=None)
    if not c or now - c['t'] < 6*3600*1000: return None
    return c[k][cid], now - c['t'], True
out['d24'] = {}
for cid, cur in vh[-1]['v'].items():
    r = {}
    for k, cv in (('v', cur), ('s', SUBS.get(cid))):
        b = base24(k, cid)
        if b is None or cv is None: continue
        r[k] = round(cv - b[0]) if b[2] else round((cv - b[0]) * 86400*1000 / b[1]); r['span'] = b[1]  # est: raw delta over real span, never extrapolated
        if b[2]: r['est'] = True
    out['d24'][cid] = r
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
