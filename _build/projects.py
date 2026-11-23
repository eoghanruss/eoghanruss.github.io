"""Builds the project case-study pages.

Edit the PROJECTS list below, then run:  python3 _build/projects.py
Each project becomes <slug>/index.html. (GitHub Pages ignores this _build folder.)
"""
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

PROJECTS = [
    {
        'slug': 'campusnav', 'icons': ['fa-location-arrow', 'fa-calendar-days', 'fa-layer-group', 'fa-bolt', 'fa-mobile-screen'], 'name': 'CampusNav', 'kind': 'Mobile app', 'status': 'live', 'color': '#2f6f73',
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
        'slug': 'leadtracker', 'icons': ['fa-keyboard', 'fa-scale-balanced', 'fa-chart-pie', 'fa-clock-rotate-left', 'fa-users'], 'name': 'LeadTrack', 'kind': 'Sales tool', 'status': 'live', 'color': '#2f5d8f',
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
        'slug': 'embertales', 'icons': ['fa-wand-magic-sparkles', 'fa-user-group', 'fa-volume-high', 'fa-film', 'fa-moon'], 'name': 'EmberTales', 'kind': 'Interactive story', 'status': 'live', 'color': '#b5653d',
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
        'slug': 'celestial', 'icons': ['fa-hourglass-half', 'fa-user-group', 'fa-chair', 'fa-wallet', 'fa-list-check', 'fa-mobile-screen'],
        'name': 'Celestial', 'kind': 'Wedding planner', 'status': 'live', 'color': '#7d74a3', 'icon': 'celestiallogo.png',
        'intro': 'A wedding planner web app that helps couples organise every detail of their big day, from guest lists and RSVPs to seating charts, budget and checklist.',
        'meta': [('Purpose', 'Web app'), ('Role', 'Product Designer & Front-End Developer'), ('Platform', 'Web, mobile-first'), ('Data', 'Saved privately in the browser')],
        'actions': [('Try the live demo', '../democelestial/', 'solid')],
        'media': {'type': 'img', 'src': '../assets/img/celestial-overview.jpg', 'alt': 'The Celestial overview with a countdown to the wedding'},
        'challenge': [
            'Planning a wedding means juggling a guest list, RSVPs, meal choices, a seating plan, suppliers and a budget at the same time, usually across spreadsheets, notes apps and group chats.',
            'Details slip through the cracks, numbers stop matching, and the seating plan has to be redrawn every time someone’s RSVP changes.',
        ],
        'solution': [
            'Celestial brings everything into one calm place, and every part is connected. When a guest RSVPs, the attending count, meal totals and seating plan all update together, so there’s one version of the truth.',
            'The design matches the occasion: soft ivory, deep plum and gold, with elegant type. It works just as well on a phone at a venue visit as on a laptop at home.',
        ],
        'features': [
            ('Countdown and overview', 'A live countdown to the big day, with RSVPs, budget and checklist progress at a glance.'),
            ('Guest list and RSVPs', 'Track RSVPs, plus-ones, meal choices and notes. Search, filter by side and export the list to CSV.'),
            ('Drag-and-drop seating', 'Drag guests onto tables, or tap a guest and then a table on a phone. Tables know their capacity and warn when they’re full.'),
            ('Budget tracker', 'Estimated versus paid for every expense, a breakdown by category and a clear warning if you go over budget.'),
            ('Planning checklist', 'Tasks grouped from “12+ months” to “wedding week”, with progress for each stage.'),
            ('Built for every screen', 'A sidebar on desktop and a thumb-friendly tab bar on phones. Everything is saved in the browser, so there’s no sign-up.'),
        ],
        'stack': ['HTML', 'CSS', 'JavaScript', 'Drag and Drop API', 'SVG charts', 'localStorage'],
        'gallery': [('img/celestial-seating.jpg', 'Seating plan', True), ('img/celestial-guests.jpg', 'Guest list', False), ('img/celestial-budget.jpg', 'Budget', False), ('img/celestial-mobile.jpg', 'On a phone', True)],
    },
    {
        'slug': 'fittrack', 'icons': ['fa-stopwatch', 'fa-clipboard-list', 'fa-chart-line', 'fa-bolt', 'fa-fire', 'fa-clock-rotate-left'],
        'name': 'FitTrack', 'kind': 'Fitness app', 'status': 'live', 'color': '#6f8a4e', 'icon': 'fitness.png',
        'intro': 'A workout app that helps you plan, track and level up your fitness routine, one set at a time.',
        'meta': [('Purpose', 'Web app'), ('Role', 'Product Designer & Front-End Developer'), ('Platform', 'Web, mobile-first'), ('Data', 'Saved privately in the browser')],
        'actions': [('Try the live demo', '../demofittrack/', 'solid')],
        'media': {'type': 'img', 'src': '../assets/img/fittrack-dashboard.jpg', 'alt': 'The FitTrack dashboard with level, weekly goal and volume chart'},
        'challenge': [
            'Sticking with training is hard when progress is invisible. Notes on a phone don’t tell you what you lifted last time, whether you’re actually getting stronger, or if you hit your goal this week.',
            'Without that feedback, workouts start to feel random and motivation fades.',
        ],
        'solution': [
            'FitTrack makes every session count. Plans turn into a ready-to-go workout in one tap, last session’s numbers sit next to every set, and a rest timer keeps you moving.',
            'Progress is always visible: strength trends, personal bests and weekly volume. An XP and levels system rewards consistency, so showing up feels like levelling up.',
        ],
        'features': [
            ('Live workout logging', 'Log weight and reps for every set, see what you did last time, and get an automatic rest timer that beeps when you’re ready.'),
            ('Reusable plans', 'Push, pull, legs or your own. Edit exercises, sets and reps, then start any plan in a tap.'),
            ('Progress charts', 'Estimated one-rep max for each exercise over time, personal bests and a bodyweight log.'),
            ('XP and levels', 'Earn XP for every set, workout and personal best, and level up from Rookie to Legend.'),
            ('Weekly goals and streaks', 'Set a weekly target and keep a streak going, with a ring that fills as the week goes on.'),
            ('Full history', 'Every workout saved with its duration, volume and sets, grouped by month.'),
        ],
        'stack': ['HTML', 'CSS', 'JavaScript', 'SVG charts', 'Web Audio API', 'localStorage'],
        'gallery': [('img/fittrack-workout.jpg', 'Logging a workout', True), ('img/fittrack-progress.jpg', 'Progress', False), ('img/fittrack-history.jpg', 'History', False), ('img/fittrack-mobile.jpg', 'On a phone', True)],
    },
]

# Order used for the "next project" link (Globefolio has its own page).
ORDER = ['campusnav', 'leadtracker', 'embertales', 'celestial', 'fittrack', 'globefolio']
NAMES = {p['slug']: p['name'] for p in PROJECTS}
NAMES['globefolio'] = 'Globefolio'

HEAD_LINKS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
              '  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">\n'
              '  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">\n'
              '  <link rel="stylesheet" href="/css/classic.css">')


def head(title, desc, slug):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{escape(title)}</title>
  <meta name="description" content="{escape(desc)}">
  <meta name="theme-color" content="#f4efe5">
  <meta property="og:title" content="{escape(title)}">
  <meta property="og:description" content="{escape(desc)}">
  <meta property="og:image" content="https://eoghanrussell.com/assets/img/og.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="https://eoghanrussell.com/{slug}/">
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  {HEAD_LINKS}
  <script>(function(){{var r=document.documentElement;try{{var t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');r.dataset.theme=t;if(sessionStorage.getItem('curtain')==='1'&&!matchMedia('(prefers-reduced-motion: reduce)').matches){{r.classList.add('arriving')}}sessionStorage.removeItem('curtain')}}catch(e){{r.dataset.theme='light'}}}})();</script>
</head>
"""


def header():
    return """  <a class="skip" href="#main">Skip to content</a>
  <div class="cursor-dot" aria-hidden="true"></div>
  <div class="cursor-ring" aria-hidden="true"></div>
  <div class="scroll-progress" aria-hidden="true"></div>
  <nav class="navbar" aria-label="Main">
    <div class="container nav-container">
      <a href="/" class="logo" aria-label="Eoghan Russell, home">EOGHAN<span>.</span></a>
      <ul class="nav-links">
        <li><a href="/#projects" class="nav-link active">Work</a></li>
        <li><a href="/#skills" class="nav-link">Skills</a></li>
        <li><a href="/#about" class="nav-link">Journey</a></li>
        <li><a href="/#contact" class="nav-link">Contact</a></li>
      </ul>
      <div class="nav-actions">
        <a href="/#contact" class="btn-cv" data-magnetic><i class="fas fa-paper-plane" aria-hidden="true"></i><span>Let's talk</span></a>
        <button class="menu-btn" type="button" aria-label="Menu" aria-expanded="false" aria-controls="mobileNav"><i class="fas fa-bars"></i></button>
      </div>
    </div>
  </nav>
  <div class="mobile-nav" id="mobileNav"><a href="/#projects">Work</a><a href="/#skills">Skills</a><a href="/#about">Journey</a><a href="/#contact">Contact</a></div>
"""


def footer():
    return """  <footer>
    <canvas id="matrix-canvas" aria-hidden="true"></canvas>
    <div class="container footer-content">
      <a href="/" class="footer-logo">EOGHAN<span>.</span></a>
      <nav class="footer-nav" aria-label="Footer"><a href="/#projects">Work</a><a href="/#skills">Skills</a><a href="/#about">Journey</a><a href="/#contact">Contact</a></nav>
      <div class="socials">
        <a class="social" data-magnetic href="https://www.linkedin.com/in/eoghan-russell/" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
        <a class="social" data-magnetic href="https://www.instagram.com/eoghanruss" target="_blank" rel="noopener" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
        <a class="social" data-magnetic href="mailto:eoghanrussell@outlook.com" aria-label="Email"><i class="fas fa-envelope"></i></a>
      </div>
      <p class="footer-copy">&copy; <span id="year">2026</span> Eoghan Russell</p>
    </div>
  </footer>
"""


def paras(ps):
    return ''.join(f'<p>{escape(t)}</p>' for t in ps)


def next_link(slug):
    nxt = ORDER[(ORDER.index(slug) + 1) % len(ORDER)]
    return f"""      <a class="next-project reveal" href="/{nxt}/">
        <div><small>Next project</small><b>{NAMES[nxt]}</b></div>
        <span class="arrow" aria-hidden="true"><i class="fas fa-arrow-right"></i></span>
      </a>
"""


def build(p):
    slug, live = p['slug'], p['status'] == 'live'
    title = f"{p['name']} | Eoghan Russell"
    chip = '<span class="chip chip--live">Live</span>' if live else '<span class="chip chip--build">In progress</span>'
    acts = ''.join(f'<a class="btn {"btn-primary" if st == "solid" else "btn-outline"}" href="{h}" data-magnetic>{escape(l)} <i class="fas fa-arrow-right" aria-hidden="true"></i></a>'
                   for l, h, st in p.get('actions', []))
    acts += '<a class="btn btn-outline" href="/#projects" data-section="projects" data-magnetic>All projects</a>'
    out = [head(title, p['intro'], slug), '<body>\n', header(), '  <main id="main">\n']
    out.append(f"""    <section class="page-hero">
      <div class="container">
        <a class="back-link reveal" href="/#projects" data-section="projects"><i class="fas fa-arrow-left" aria-hidden="true"></i> Back to projects</a>
        <h1 class="reveal" style="--d:.05s">{escape(p['name'])}</h1>
        <div class="chips reveal" style="--d:.1s"><span class="chip">{escape(p['kind'])}</span>{chip}</div>
        <p class="lead reveal" style="--d:.15s;margin-top:18px">{escape(p['intro'])}</p>
        <div class="page-actions reveal" style="--d:.2s">{acts}</div>
""")
    if live:
        m = p['media']
        if m['type'] == 'video':
            out.append(f'        <figure class="media reveal" id="{m["id"]}" style="--d:.25s"><video data-autoplay muted loop playsinline controls preload="none" poster="{m["poster"]}" aria-label="{escape(m["label"])}"><source src="{m["src"]}" type="video/mp4"></video></figure>\n')
        else:
            out.append(f'        <figure class="media reveal" style="--d:.25s"><img src="{m["src"]}" alt="{escape(m["alt"])}"></figure>\n')
    out.append('      </div>\n    </section>\n')

    if live:
        stats = ''
        if p.get('stats'):
            cards = ''.join(f'<div class="stat"><b data-count="{n}" data-suffix="{s}">{n}{s}</b><span>{escape(t)}</span></div>' for n, s, t in p['stats'])
            stats = f'<div class="stats">{cards}</div><p class="stats-note">{escape(p["stats_note"])}</p>'
        icons = p.get('icons', ['fa-check'] * 5)
        feats = ''.join(f'<div class="feature reveal"><i class="fas {icons[i % len(icons)]}" aria-hidden="true"></i><div><h3>{escape(t)}</h3><p>{escape(d)}</p></div></div>'
                        for i, (t, d) in enumerate(p['features']))
        gallery = ''
        if p.get('gallery'):
            figs = ''.join(f'<figure class="reveal{" wide" if w else ""}"><img src="/assets/{src}" alt="{escape(p["name"])}: {escape(cap.lower())}" loading="lazy"></figure>' for src, cap, w in p['gallery'])
            gallery = f'<section class="reveal"><span class="eyebrow">Visual process</span><h2>A closer look</h2><div class="gallery">{figs}</div></section>'
        meta = ''.join(f'<div><dt>{escape(k)}</dt><dd>{escape(v)}</dd></div>' for k, v in p['meta'])
        stack = ''.join(f'<span>{escape(x)}</span>' for x in p['stack'])
        out.append(f"""    <div class="container page-grid">
      <div class="page-body">
        <section class="reveal"><span class="eyebrow">The challenge</span><h2>What needed solving</h2>{paras(p['challenge'])}{stats}</section>
        <section class="reveal"><span class="eyebrow">The solution</span><h2>How I approached it</h2>{paras(p['solution'])}</section>
        <section><span class="eyebrow reveal">Key features</span><h2 class="reveal">What it does</h2><div class="features-list">{feats}</div></section>
        {gallery}
      </div>
      <aside class="sidebar reveal" aria-label="Project details"><dl>{meta}<div><dt>Tech stack</dt><dd class="stack">{stack}</dd></div></dl></aside>
    </div>
""")
    else:
        out.append(f"""    <div class="container">
      <div class="building reveal">
        <img src="/assets/{p['icon']}" alt="{escape(p['name'])} logo">
        <div>
          <span class="eyebrow">Under construction</span>
          <h2 style="margin-top:12px">Coming soon</h2>
          <div class="progress" aria-hidden="true"><i></i></div>
          <p>{escape(p['building'])}</p>
          <a class="btn btn-primary" href="/#contact" data-section="contact">Get in touch <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
        </div>
      </div>
    </div>
""")
    out.append(f'    <div class="container">\n{next_link(slug)}    </div>\n  </main>\n')
    out.append(footer())
    out.append('  <dialog class="lightbox" id="lightbox"><img src="" alt=""><button class="btn btn-light btn-sm" type="button">Close</button></dialog>\n')
    out.append('  <script src="https://unpkg.com/lenis@1.1.20/dist/lenis.min.js" defer></script>\n  <script src="/js/classic.js" defer></script>\n  <script src="/js/enhance.js" defer></script>\n</body>\n</html>\n')
    (ROOT / slug).mkdir(exist_ok=True)
    (ROOT / slug / 'index.html').write_text(''.join(out), encoding='utf-8')
    print('built', slug)


if __name__ == '__main__':
    for proj in PROJECTS:
        build(proj)
