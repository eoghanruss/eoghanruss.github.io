"""Builds the project case-study pages.

Edit the PROJECTS list below, then run:  python3 _build/projects.py
Each project becomes <slug>/index.html. (GitHub Pages ignores this _build folder.)
"""
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

PROJECTS = [
    {
        'slug': 'campusnav', 'name': 'CampusNav', 'kind': 'Mobile app', 'status': 'live', 'color': '#2f6f73',
        'icon': 'campusnavlogo.png',
        'intro': 'A student-friendly navigation app designed to help first-year students find their way around campus.',
        'meta': [('Purpose', 'Final year project, BSc (Hons)'), ('Role', 'Product Designer & Full Stack Developer'),
                 ('Timeline', '6 months (2025)'), ('Status', 'Complete')],
        'actions': [('Watch the demo', '#demo', 'solid')],
        'media': {'type': 'video', 'src': '../assets/img/campusnav-web.mp4', 'poster': '../assets/img/campusnav-poster.jpg', 'id': 'demo',
                  'label': 'CampusNav demo video'},
        'challenge': [
            'Starting university is a major adjustment, especially for first-year students at the Technological University of the Shannon (TUS) who may be coming straight from secondary school or from smaller towns. Many struggle with the practical side of a new environment: navigating a large campus, keeping up with lecture schedules and staying informed about events.',
            'Without clear information, students miss opportunities and feel unnecessary stress during the critical first few weeks of college.',
        ],
        'stats': [('5', '%', 'of students feel completely confident finding their way around campus'),
                  ('75', '%+', 'do not regularly take part in social activities, often because they don’t know what’s on')],
        'stats_note': 'Figures from the research behind the project.',
        'solution': [
            'CampusNav is a responsive website and app built to make college life easier for new students. It acts as a central hub that brings the essential tools into one place, helping students settle in faster.',
            'It combines augmented reality for intuitive navigation with a real-time events calendar and quick access to student resources. The design focuses on simplicity and accessibility, so students can find what they need without feeling overwhelmed.',
        ],
        'features': [
            ('AR navigation', 'Uses the phone’s camera to overlay directional arrows on screen, guiding students to places like the library or canteen via QR code markers.'),
            ('Live events calendar', 'A real-time feed of Student Union and campus activities, so students can see event details and stay connected.'),
            ('Centralised resources', 'Quick access to lecture timetables, support services and useful contacts, with no need to search across multiple platforms.'),
            ('Real-time updates', 'Built with Firebase, so new event posts and updates appear instantly for every user without refreshing.'),
            ('Responsive design', 'A clean, modern interface that works across phones, tablets and desktop computers.'),
        ],
        'stack': ['HTML', 'JavaScript', 'CSS', 'Firebase', 'Figma', 'Canva', 'VS Code'],
        'gallery': [('apphelps.png', 'Overview', True), ('keyfeatures.png', 'Key features', False), ('scannow.png', 'Launch artwork', False), ('logodesign.png', 'Logo design', True)],
    },
    {
        'slug': 'leadtracker', 'name': 'LeadTrack', 'kind': 'Sales tool', 'status': 'live', 'color': '#2f5d8f',
        'icon': 'leadtrackericon.png',
        'intro': 'A leads-tracking tool that helps a sales team log qualified leads, share them out fairly and see performance at a glance.',
        'meta': [('Purpose', 'Full stack application'), ('Role', 'Product Designer & Full Stack Developer'),
                 ('Timeline', '3 months'), ('Built for', 'NuSolas Energy')],
        'actions': [('View live demo', '../demotracker/', 'solid')],
        'media': {'type': 'img', 'src': '../assets/img/shot-leadtrack.jpg', 'alt': 'The LeadTrack leads allocator dashboard'},
        'challenge': [
            'Managing potential clients can be chaotic for growing businesses. Many teams rely on messy spreadsheets or disconnected communication tools to track their leads, so data ends up scattered.',
            'Without one central system, follow-ups get missed, revenue is lost and nobody has a clear view of the sales pipeline. Sales teams end up spending time hunting for information instead of building relationships.',
        ],
        'solution': [
            'I built LeadTrack while working in sales and marketing at NuSolas Energy, as an easier way to track qualified leads. It replaces spreadsheets with a clean, central hub for every client interaction.',
            'A shared dashboard shows each person’s daily and monthly totals as they happen, so the team can see the workload, keep allocation fair and make sure no prospect slips through the cracks.',
        ],
        'features': [
            ('Qualifier terminals', 'Each team member logs qualified leads through the day from their own terminal, with initials for a clear record.'),
            ('Fair dispatch logic', 'Compares everyone’s monthly totals and suggests who should get the next lead, so work is shared evenly.'),
            ('Performance analytics', 'Daily and monthly totals with charts showing each person’s share of the work.'),
            ('Shift history and audit trail', 'Closed shifts are archived, and every action is logged so nothing goes missing.'),
            ('Team tools', 'Add or reorder team members by dragging, and export the data to CSV in one click.'),
        ],
        'stack': ['HTML', 'JavaScript', 'CSS', 'Node.js', 'MongoDB', 'Figma', 'VS Code'],
        'gallery': [('leadtracker.png', 'Project artwork', True)],
    },
    {
        'slug': 'embertales', 'name': 'EmberTales', 'kind': 'Interactive story', 'status': 'live', 'color': '#b5653d',
        'icon': 'campstoryicon.png',
        'intro': 'An interactive web app that turns any night into a campfire story, with custom characters, a choice of scare level and an atmospheric soundscape.',
        'meta': [('Purpose', 'Interactive web app'), ('Role', 'Front-End Developer & UI Designer'),
                 ('Timeline', '2 months'), ('Inspired by', 'Summers at camp in Maine')],
        'actions': [('Try the live demo', '../democampfire/', 'solid')],
        'media': {'type': 'img', 'src': '../assets/img/shot-embertales-setup.jpg', 'alt': 'The EmberTales story setup screen'},
        'challenge': [
            'Gathering around a campfire often leads to storytelling, but coming up with an engaging, original story on the spot is hard. People fall back on the same old ghost stories or run out of ideas quickly.',
            'There were few tools that sparked creativity and guided group storytelling in a fun way without the screen taking over the social experience.',
        ],
        'solution': [
            'Inspired by my time as a camp counselor in Maine, I built EmberTales to spark imagination without screen time dominating the hangout. It works as a story architect: you add names, choose how scary it gets, and the story unfolds with a dramatic typewriter reveal.',
            'The interface is distraction-free and themed to set the mood, guiding the group through a structured story that everyone in the circle can enjoy.',
        ],
        'features': [
            ('Dynamic stories', 'Unique story starters and plot twists, shaped by the scare level you choose.'),
            ('Your characters', 'Add friends’ names and they’re woven straight into the adventure.'),
            ('Ambient audio', 'Built-in soundscapes like crackling fire set the mood, with optional jump scares.'),
            ('Cinematic mode', 'A typewriter reveal with adjustable speed for dramatic reading aloud.'),
            ('Low-light design', 'A dark, mobile-first interface made for reading outdoors without blinding anyone.'),
        ],
        'stack': ['HTML', 'JavaScript', 'CSS', 'Web Audio API', 'REST APIs', 'Figma'],
        'gallery': [('img/shot-embertales-story.jpg', 'A story being told', True)],
    },
    {
        'slug': 'celestial', 'name': 'Celestial', 'kind': 'Wedding planner', 'status': 'build', 'color': '#7d74a3',
        'icon': 'celestiallogo.png',
        'intro': 'A wedding planner app that helps couples organise every detail of their big day, from guest lists to seating charts.',
        'building': 'Celestial is still in development, so the full case study isn’t ready yet. Want to hear when it launches, or see an early look?',
    },
    {
        'slug': 'fittrack', 'name': 'FitTrack', 'kind': 'Fitness app', 'status': 'build', 'color': '#6f8a4e',
        'icon': 'fitness.png',
        'intro': 'A workout app that helps you plan, track and level up your fitness routine.',
        'building': 'FitTrack is still in development, so the full case study isn’t ready yet. Want to hear when it launches, or see an early look?',
    },
]

# Order used for the "next project" link (Globefolio has its own page).
ORDER = ['campusnav', 'leadtracker', 'embertales', 'celestial', 'fittrack', 'globefolio']
NEXT_INFO = {p['slug']: (p['name'], p['color'], p['icon']) for p in PROJECTS}
NEXT_INFO['globefolio'] = ('Globefolio', '#a98345', 'other.png')

FONTS = ('<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,100..900,0..100,0..1;'
         '1,9..144,100..900,0..100,0..1&family=Inter+Tight:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">')


def header(active=''):
    nav = [('/#orbit', 'Projects'), ('/#journey', 'Journey'), ('/#skills', 'Skills'), ('/lab/', 'Lab'), ('/#guestbook', 'Guestbook')]
    links = ''.join(
        f'<a href="{h}"{" class=\"is-active\" aria-current=\"page\"" if t == active else ""}>{t}</a>' for h, t in nav)
    mobile = ''.join(f'<a href="{h}"><small>0{i + 1}</small>{t}</a>' for i, (h, t) in enumerate(nav + [('/#contact', 'Contact')]))
    return f'''  <a class="skip" href="#main">Skip to content</a>
  <div class="nebula" aria-hidden="true"></div>
  <canvas id="sky" aria-hidden="true"></canvas>
  <div class="grain" aria-hidden="true"></div>
  <div class="fuel" aria-hidden="true"></div>
  <div class="cursor" aria-hidden="true"><span class="cursor__label"></span></div>
  <div class="cursor-dot" aria-hidden="true"></div>
  <header class="header">
    <div class="wrap header__in">
      <a href="/" class="brand" data-magnetic aria-label="Eoghan Russell, home">
        <span class="brand__mark">ER</span>
        <span class="brand__name">EOGHAN RUSSELL</span>
      </a>
      <nav class="nav" aria-label="Main">{links}</nav>
      <div class="header__tools">
        <button class="sound" type="button" aria-pressed="false" data-magnetic>
          <span class="sound__bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
          <span class="sound__txt">SOUND OFF</span>
        </button>
        <a href="/#contact" class="btn btn--solid btn--sm" data-magnetic>Get in touch <span class="arrow" aria-hidden="true">→</span></a>
        <button class="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu"><span></span><span></span></button>
      </div>
    </div>
  </header>
  <nav class="mobile-menu" id="mobile-menu" aria-label="Mobile">{mobile}</nav>
'''


def footer():
    return '''  <footer class="footer dark" style="padding-top:60px">
    <div class="wrap">
      <div class="footer__bottom">
        <span>© <span id="year">2026</span> Eoghan Russell · <a href="/">Back to the homepage</a> · <a href="mailto:eoghanrussell@outlook.com">eoghanrussell@outlook.com</a></span>
        <button type="button" class="to-top" id="toTop" data-magnetic>BACK TO TOP ↑</button>
      </div>
    </div>
  </footer>
'''


def head(title, desc, slug):
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{escape(title)}</title>
  <meta name="description" content="{escape(desc)}">
  <meta name="theme-color" content="#f3ede1">
  <meta property="og:title" content="{escape(title)}">
  <meta property="og:description" content="{escape(desc)}">
  <link rel="canonical" href="https://eoghanrussell.com/{slug}/">
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  {FONTS}
  <link rel="stylesheet" href="/css/site.css">
  <script>
    document.documentElement.classList.add('js');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('reduced');
  </script>
</head>
'''


def next_block(slug):
    i = ORDER.index(slug)
    nxt = ORDER[(i + 1) % len(ORDER)]
    name, color, icon = NEXT_INFO[nxt]
    return f'''      <a class="next" href="/{nxt}/" data-cursor="Next" style="--c:{color}">
        <span class="next__label">Next project</span>
        <span class="next__name">{name}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg></span>
        <span class="next__planet" aria-hidden="true"><img src="/assets/{icon}" alt=""></span>
      </a>
'''


def paras(ps):
    return ''.join(f'<p>{escape(p)}</p>' for p in ps)


def build(p):
    slug = p['slug']
    live = p['status'] == 'live'
    title = f"{p['name']} — {'Case study' if live else 'In development'} | Eoghan Russell"
    out = [head(title, p['intro'], slug), '<body>\n', header('Projects'), '  <main id="main">\n']
    status_chip = '<span class="chip chip--live">Live</span>' if live else '<span class="chip chip--build">In development</span>'
    actions = ''
    for label, href, style in p.get('actions', []):
        cls = 'btn--solid' if style == 'solid' else 'btn--ghost'
        cursor = 'Open' if href.startswith('..') else 'Play'
        actions += f'<a class="btn {cls}" href="{href}" data-magnetic data-cursor="{cursor}">{label} <span class="arrow" aria-hidden="true">→</span></a>'
    actions += '<a class="btn btn--ghost" href="/#missions" data-magnetic>All projects</a>'
    out.append(f'''    <section class="cs-hero">
      <div class="wrap">
        <div class="cs-crumb"><a href="/#missions">Projects</a><span aria-hidden="true">/</span><span>{escape(p['kind'])}</span>{status_chip}</div>
        <h1 class="cs-title" data-vf>{escape(p['name'])}</h1>
        <div class="cs-intro rv">
          <p>{escape(p['intro'])}</p>
          <div class="cs-actions">{actions}</div>
        </div>
''')
    if live:
        meta = ''.join(f'<div><dt>{escape(k)}</dt><dd>{escape(v)}</dd></div>' for k, v in p['meta'])
        out.append(f'        <dl class="cs-meta rv">{meta}</dl>\n')
        m = p['media']
        if m['type'] == 'video':
            out.append(f'''        <figure class="cs-media rv" id="{m['id']}" style="margin-left:0;margin-right:0">
          <video data-autoplay muted loop playsinline preload="none" poster="{m['poster']}" aria-label="{escape(m['label'])}" controls>
            <source src="{m['src']}" type="video/mp4">
          </video>
        </figure>
''')
        else:
            out.append(f'        <figure class="cs-media rv" style="margin-left:0;margin-right:0"><img src="{m["src"]}" alt="{escape(m["alt"])}"></figure>\n')
    out.append('      </div>\n    </section>\n')

    if live:
        stats = ''
        if p.get('stats'):
            cards = ''.join(f'<div class="cs-stat"><b data-count="{n}" data-suffix="{s}">{n}{s}</b><span>{escape(t)}</span></div>' for n, s, t in p['stats'])
            stats = f'<div class="cs-stats">{cards}</div><p style="font-size:13px;color:var(--dim);margin-top:12px">{escape(p["stats_note"])}</p>'
        out.append(f'''    <section class="cs-section">
      <div class="wrap cs-row">
        <div class="rv"><span class="label">01 — The challenge</span><h2>What needed <span class="acc">solving</span></h2></div>
        <div class="cs-body rv">{paras(p['challenge'])}{stats}</div>
      </div>
    </section>
    <section class="cs-section">
      <div class="wrap cs-row">
        <div class="rv"><span class="label">02 — The solution</span><h2>How I <span class="acc">approached it</span></h2></div>
        <div class="cs-body rv">{paras(p['solution'])}</div>
      </div>
    </section>
''')
        feats = ''.join(f'<li class="rv"><small>{i + 1:02d}</small><h3>{escape(t)}</h3><p>{escape(d)}</p></li>' for i, (t, d) in enumerate(p['features']))
        stack = ''.join(f'<span>{escape(s)}</span>' for s in p['stack'])
        out.append(f'''    <section class="cs-section">
      <div class="wrap">
        <div class="section__head rv" style="margin-bottom:40px"><div><span class="label">03 — Key features</span><h2 class="title" style="font-size:clamp(2.2rem,4.6vw,4rem)">What it <span class="acc">does</span></h2></div></div>
        <ul class="cs-features">{feats}</ul>
      </div>
    </section>
    <section class="cs-section">
      <div class="wrap cs-row">
        <div class="rv"><span class="label">04 — Built with</span><h2>The <span class="acc">toolkit</span></h2></div>
        <div class="cs-stack rv" style="align-content:start">{stack}</div>
      </div>
    </section>
''')
        if p.get('gallery'):
            figs = ''
            for src, cap, wide in p['gallery']:
                figs += f'<figure class="rv{" wide" if wide else ""}"><img src="../assets/{src}" alt="{escape(p["name"])}: {escape(cap.lower())}" loading="lazy"><figcaption>{escape(cap)}</figcaption></figure>'
            out.append(f'''    <section class="cs-section">
      <div class="wrap">
        <div class="section__head rv" style="margin-bottom:40px"><div><span class="label">05 — Visual process</span><h2 class="title" style="font-size:clamp(2.2rem,4.6vw,4rem)">A closer <span class="acc">look</span></h2></div></div>
        <div class="cs-gallery">{figs}</div>
      </div>
    </section>
''')
    else:
        out.append(f'''    <section class="cs-section" style="padding-top:20px">
      <div class="wrap">
        <div class="cs-building rv">
          <img src="../assets/{p['icon']}" alt="{escape(p['name'])} logo">
          <div>
            <span class="label">Work in progress</span>
            <h2>Coming <span class="acc">soon</span></h2>
            <div class="cs-progress" aria-hidden="true"><i></i></div>
            <p>{escape(p['building'])}</p>
            <a class="btn btn--solid" href="/#contact" data-magnetic>Get in touch <span class="arrow" aria-hidden="true">→</span></a>
          </div>
        </div>
      </div>
    </section>
''')
    out.append(f'    <div class="wrap">\n{next_block(slug)}    </div>\n  </main>\n')
    out.append(footer())
    out.append('  <script type="module" src="/js/project.js"></script>\n</body>\n</html>\n')
    (ROOT / slug).mkdir(exist_ok=True)
    (ROOT / slug / 'index.html').write_text(''.join(out), encoding='utf-8')
    print('built', slug)


if __name__ == '__main__':
    for proj in PROJECTS:
        build(proj)
