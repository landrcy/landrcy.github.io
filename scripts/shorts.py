#!/usr/bin/env python3
"""Fetch every public Short for the LLC/FFC channels -> youtube/shorts.json"""
import base64, json, subprocess, time, re, urllib.request, datetime

def channel_identity(cid, playlist):
    """Display name and @ URL for this channel id. None means the playlist is a different channel."""
    if not isinstance(playlist, dict):
        return None
    if playlist.get('channel_id') and playlist.get('channel_id') != cid:
        return None
    url = playlist.get('uploader_url') or ''
    name = playlist.get('channel') or ''
    handle = url.rsplit('/', 1)[-1] if isinstance(url, str) else ''
    if isinstance(url, str) and url.startswith('https://www.youtube.com/@') and name and re.fullmatch(r'@[A-Za-z0-9._-]{3,30}', handle):
        return {'name': name, 'url': url}
    return {}
# Channel ids are the identity. UCRegZeMyJ1B5B9n64rfgKAw was RedditStoryADay and is now
# JudeLow Daily (@judelowdaily). UCfDhWTThokF3gKW03iEGijg was SAT in a Minute and is now
# Donut Vault (@donutvaultshorts). Names and @ links come from the playlist response.
CH = {'llc': ['UCT3ciRCc8ouYTix5_Heyrhg','UCCo7JOIyE3W--C9ANfWdObA','UCNBQ7mBPy16upVp0EhbdTgA','UCRegZeMyJ1B5B9n64rfgKAw','UCfDhWTThokF3gKW03iEGijg'],
      'ffc': ['UCIcfr7SXegLIyvpNiDzFLEw','UCGl9SSbOrCg2jgBLrGO4aIw']}
try:
    prev = {v['id']: v.get('first') for g in ('llc','ffc') for v in json.load(open('youtube/shorts.json'))[g]}
except Exception:
    prev = {}
out = {'updated': int(time.time()*1000), 'llc': [], 'ffc': [], 'latest': {}}
SUBS = {}
HANDLES = {}
NOSHORTS = set()
for g, ids in CH.items():
    for cid in ids:
        try:
            r = subprocess.run(['yt-dlp','--flat-playlist','-J',f'https://www.youtube.com/channel/{cid}/shorts'],capture_output=True,text=True,timeout=180)
            d = json.loads(r.stdout or 'null')
        except Exception as e:
            print('fail', cid, e); continue
        if not d:
            # channel currently has zero public Shorts (YouTube: "does not have a shorts tab") -> real 0, don't crash the whole scrape
            if 'does not have a shorts tab' in (r.stderr or ''): NOSHORTS.add(cid)
            else: print('fail', cid, (r.stderr or '')[-200:])
            continue
        ident = channel_identity(cid, d)
        if ident is None:
            print('channel id mismatch', cid, d.get('channel_id'), d.get('channel'), flush=True)
            continue
        ents = d.get('entries') or []
        if d.get('channel_follower_count') is not None: SUBS[cid] = d['channel_follower_count']
        if ident: HANDLES[cid] = ident
        if ents: out['latest'][cid] = {'id': ents[0]['id'], 'title': ents[0].get('title') or ''}  # /shorts tab is newest-first
        for e in ents:
            if e.get('view_count') is None: continue
            out[g].append({'id': e['id'], 'title': e.get('title') or '', 'views': e['view_count'], 'ch': d.get('channel') or cid, 'cid': cid, 'first': prev.get(e['id']) or out['updated']})
out['handles'] = HANDLES
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
vh.append({'t': out['updated'], 's': SUBS, 'v': {**{cid: sum(v['views'] for v in out[g] if v['cid'] == cid) for g in CH for cid in CH[g] if any(v['cid'] == cid for v in out[g])}, **{cid: 0 for cid in NOSHORTS}}})
out['vh'] = vh
# per-day (America/New_York) end-of-day Shorts view sums from REAL snapshots only (for streaks); kept 120 days
try:
    from zoneinfo import ZoneInfo
    _tz = ZoneInfo('America/New_York')
except Exception:
    _tz = None
daily = dict(oldf.get('daily', {}))
for p in vh:
    k = datetime.datetime.fromtimestamp(p['t']/1000, _tz).strftime('%Y-%m-%d')
    daily[k] = {**daily.get(k, {}), **p['v']}
out['daily'] = {k: daily[k] for k in sorted(daily)[-120:]}
# server-computed LAST 24H per channel (Shorts view-sum delta incl. brand-new uploads; subs delta).
# Uses ONLY real scraped snapshots: newest snapshot at/before now-24h (else the oldest available);
# reports the RAW delta over that real span. No interpolation, scaling, or extrapolation. span not ~24h => est (page shows 'last Nh').
def base24(k, cid):
    now = out['updated']; tgt = now - 86400*1000
    pts = [p for p in vh if cid in p.get(k, {})]
    if len(pts) < 2: return None
    lo = next((p for p in reversed(pts) if p['t'] <= tgt), None) or pts[0]
    span = now - lo['t']
    if span <= 0: return None
    return lo[k][cid], span, abs(span - 86400*1000) > 30*60*1000  # label real span if it isn't ~24h (shorter OR longer, e.g. after a scrape gap)
out['d24'] = {}
for cid, cur in vh[-1]['v'].items():
    r = {}
    for k, cv in (('v', cur), ('s', SUBS.get(cid))):
        b = base24(k, cid)
        if b is None or cv is None: continue
        r[k] = round(cv - b[0]); r['span'] = b[1]  # raw delta over real span, never scaled
        if b[2]: r['est'] = True
    out['d24'][cid] = r
def comment_likes(toolbar):
    """likeCountNotliked is the displayed count ('7', '1.2K'); empty means zero."""
    raw = str((toolbar or {}).get('likeCountNotliked') or '').strip().replace(',', '')
    mult = 1
    if raw and raw[-1] in 'KkMm':
        mult = 1000 if raw[-1] in 'Kk' else 1000000
        raw = raw[:-1]
    if raw:
        try:
            return int(float(raw) * mult)
        except ValueError:
            pass
    m = re.search(r'([\d,.]+)\s*([KkMm])?', str((toolbar or {}).get('likeCountA11y') or ''))
    if not m:
        return 0
    suf = m.group(2) or ''
    mult = 1000 if suf in ('K', 'k') else 1000000 if suf in ('M', 'm') else 1
    try:
        return int(float(m.group(1).replace(',', '')) * mult)
    except ValueError:
        return 0

def parse_comment_page(data):
    """Top-level comments from a watch-next continuation response. Skips the uploader and replies."""
    muts = (((data or {}).get('frameworkUpdates') or {}).get('entityBatchUpdate') or {}).get('mutations') or []
    rows = []
    for m in muts:
        p = ((m.get('payload') or {}).get('commentEntityPayload') or {})
        if not p:
            continue
        props, author = p.get('properties') or {}, p.get('author') or {}
        if props.get('replyLevel') or author.get('isCreator'):
            continue
        text = re.sub(r'\n{3,}', '\n\n', ((props.get('content') or {}).get('content') or '')).strip()
        if not text:
            continue
        rows.append({'text': text[:220], 'author': author.get('displayName') or '', 'likes': comment_likes(p.get('toolbar'))})
    return rows

def video_comments(vid):
    """Top comments for one Short. The public watch-next continuation, not yt-dlp's player extract
    (that path is bot-walled from GitHub Actions and was collapsing the board to a single note)."""
    if not re.fullmatch(r'[A-Za-z0-9_-]{11}', vid or ''):
        return []
    token = f'\x12\r\x12\x0b{vid}\x18\x062\'"\x11"\x0b{vid}0\x00x\x020\x00B\x10comments-section'
    body = json.dumps({
        'context': {'client': {'clientName': 'WEB', 'clientVersion': '2.20251101.01.00', 'hl': 'en', 'gl': 'US'}},
        'continuation': base64.b64encode(token.encode()).decode(),
    }).encode()
    last = None
    for attempt in range(3):
        req = urllib.request.Request(
            'https://www.youtube.com/youtubei/v1/next?prettyPrint=false', data=body,
            headers={'Content-Type': 'application/json',
                     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                     'Origin': 'https://www.youtube.com', 'Referer': f'https://www.youtube.com/watch?v={vid}'})
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return parse_comment_page(json.loads(r.read().decode('utf-8', 'replace')))
        except Exception as e:
            last = e
            if getattr(e, 'code', None) in (429, 500, 503) and attempt < 2:
                time.sleep(1.2 * (attempt + 1))
                continue
            raise
    raise last

def pick_comments(new, oldc, fails, now):
    """Don't cache a near-empty scrape over a real board when some videos failed."""
    oldn = len((oldc or {}).get('list') or [])
    if new and not (fails and len(new) < 4 and oldn >= 8):
        return {'t': now, 'list': new}
    return oldc or {'t': 0, 'list': []}

# best comments: top comments on each channel's 4 most-viewed shorts; refreshed every 3h
try:
    oldc = json.load(open('youtube/shorts.json')).get('comments')
except Exception:
    oldc = None
# a 1-note board is the failed scrape, not a fresh result — don't sit on it for 3h
old_list = (oldc or {}).get('list') or []
if oldc and len(old_list) >= 4 and out['updated'] - oldc.get('t', 0) < 3*3600*1000:
    out['comments'] = oldc
else:
    cm, fails, tried = [], 0, 0
    for g in ('llc', 'ffc'):
        for cid in CH[g]:
            for v in sorted([v for v in out[g] if v['cid'] == cid], key=lambda v: -v['views'])[:4]:
                tried += 1
                try:
                    rows = video_comments(v['id'])
                except Exception as e:
                    fails += 1
                    print('comments fail', v['id'], e, flush=True)
                    continue
                for c in rows[:15]:
                    cm.append({**c, 'vid': v['id'], 'ch': v['ch'], 'g': g})
                time.sleep(0.15)
    cm.sort(key=lambda c: -c['likes'])
    picked = pick_comments(cm[:24], oldc, fails, out['updated'])
    out['comments'] = picked
    print('comments', len(picked.get('list') or []), 'fails', fails, '/', tried, 'kept' if picked is oldc or (oldc and picked.get('t') == oldc.get('t')) else 'refreshed', flush=True)
json.dump(out, open('youtube/shorts.json','w'), ensure_ascii=False)
print({g: len(out[g]) for g in CH})
