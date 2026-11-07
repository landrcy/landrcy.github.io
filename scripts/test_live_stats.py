#!/usr/bin/env python3
"""Regression tests for the LIVE STATS comment board and channel identity. No network."""
import ast, pathlib, unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
JUDE = 'UCRegZeMyJ1B5B9n64rfgKAw'
DONUT = 'UCfDhWTThokF3gKW03iEGijg'

def load_funcs():
    src = (ROOT / 'scripts' / 'shorts.py').read_text()
    tree = ast.parse(src)
    keep = [n for n in tree.body if isinstance(n, (ast.Import, ast.ImportFrom, ast.FunctionDef))]
    ns = {}
    exec(compile(ast.Module(body=keep, type_ignores=[]), 'shorts.py', 'exec'), ns)
    return ns

class ChannelIdentity(unittest.TestCase):
    def setUp(self):
        self.ident = load_funcs()['channel_identity']
        self.html = (ROOT / 'youtube' / 'index.html').read_text()
        self.scraper = (ROOT / 'scripts' / 'shorts.py').read_text()

    def test_page_uses_verified_names_and_handles(self):
        self.assertIn("{id:'%s',name:'JudeLow Daily',url:'https://www.youtube.com/@judelowdaily'}" % JUDE, self.html)
        self.assertIn("{id:'%s',name:'Donut Vault',url:'https://www.youtube.com/@donutvaultshorts'}" % DONUT, self.html)
        self.assertNotIn("name:'RedditStoryADay'", self.html)
        self.assertNotIn("name:'SAT in a Minute'", self.html)

    def test_scraper_keeps_the_same_channel_ids(self):
        self.assertIn(JUDE, self.scraper)
        self.assertIn(DONUT, self.scraper)
        self.assertIn('channel_identity', self.scraper)

    def test_matching_playlist_keeps_name_and_handle(self):
        got = self.ident(JUDE, {
            'channel_id': JUDE, 'channel': 'JudeLow Daily',
            'uploader_url': 'https://www.youtube.com/@judelowdaily'})
        self.assertEqual(got, {'name': 'JudeLow Daily', 'url': 'https://www.youtube.com/@judelowdaily'})

    def test_other_channel_is_rejected(self):
        self.assertIsNone(self.ident(JUDE, {
            'channel_id': DONUT, 'channel': 'Donut Vault',
            'uploader_url': 'https://www.youtube.com/@donutvaultshorts'}))

    def test_bad_handle_is_not_stored(self):
        self.assertEqual(self.ident(JUDE, {
            'channel_id': JUDE, 'channel': 'JudeLow Daily',
            'uploader_url': 'https://evil.example/@judelowdaily'}), {})
        self.assertEqual(self.ident(JUDE, {
            'channel_id': JUDE, 'channel': 'JudeLow Daily',
            'uploader_url': 'https://www.youtube.com/@bad handle'}), {})

class CommentBoard(unittest.TestCase):
    def setUp(self):
        ns = load_funcs()
        self.likes = ns['comment_likes']
        self.pick = ns['pick_comments']
        self.parse = ns['parse_comment_page']
        self.html = (ROOT / 'youtube' / 'index.html').read_text()

    def test_like_counts(self):
        self.assertEqual(self.likes({'likeCountNotliked': '7'}), 7)
        self.assertEqual(self.likes({'likeCountNotliked': ''}), 0)
        self.assertEqual(self.likes({'likeCountNotliked': '1.2K'}), 1200)
        self.assertEqual(self.likes({'likeCountA11y': '12 likes'}), 12)
        self.assertEqual(self.likes(None), 0)

    def test_parse_skips_creator_and_replies(self):
        page = {'frameworkUpdates': {'entityBatchUpdate': {'mutations': [
            {'payload': {'commentEntityPayload': {
                'properties': {'replyLevel': 0, 'content': {'content': 'hello\n\n\n\nthere'}},
                'author': {'displayName': '@fan', 'isCreator': False},
                'toolbar': {'likeCountNotliked': '3'}}}},
            {'payload': {'commentEntityPayload': {
                'properties': {'replyLevel': 0, 'content': {'content': 'from the channel'}},
                'author': {'displayName': '@owner', 'isCreator': True},
                'toolbar': {'likeCountNotliked': '9'}}}},
            {'payload': {'commentEntityPayload': {
                'properties': {'replyLevel': 1, 'content': {'content': 'a reply'}},
                'author': {'displayName': '@fan', 'isCreator': False},
                'toolbar': {'likeCountNotliked': '1'}}}},
        ]}}}
        rows = self.parse(page)
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]['author'], '@fan')
        self.assertEqual(rows[0]['likes'], 3)
        self.assertNotIn('\n\n\n', rows[0]['text'])

    def test_partial_refresh_does_not_wipe_a_full_board(self):
        old = {'t': 1, 'list': [{'text': 'x'}] * 10}
        self.assertIs(self.pick([{'text': 'only'}], old, fails=3, now=50), old)
        fresh = self.pick([{'text': 'a'}] * 8, old, fails=1, now=50)
        self.assertEqual(fresh['t'], 50)
        self.assertEqual(len(fresh['list']), 8)
        self.assertEqual(self.pick([], None, fails=1, now=50), {'t': 0, 'list': []})

    def test_page_still_renders_and_reports_comment_errors(self):
        self.assertIn('function cboard(', self.html)
        self.assertIn('function cboardFail(', self.html)
        self.assertIn('couldn’t load comments — retrying', self.html)
        self.assertIn('function applyChNames(', self.html)

if __name__ == '__main__':
    unittest.main()
