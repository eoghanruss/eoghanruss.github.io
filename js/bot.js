// Mini-Eoghan replies (ported from the original site)
function getBotResponse(input) {
            // Clean up input: lowercase and remove extra spaces
            input = input.toLowerCase().trim();

            // ============================================================
            // 0. MODERATION & INAPPROPRIATE (Safety First)
            // ============================================================
            if (input.includes("fuck") || input.includes("shit") || input.includes("bitch") || input.includes("asshole") || input.includes("dick") || input.includes("crap") || input.includes("sex") || input.includes("nude") || input.includes("kill") || input.includes("hate") || input.includes("die") || input.includes("idiot") || input.includes("stupid")) {
                return "Let's keep things professional and positive! 🚫 This is a portfolio website.";
            }
            else if (input.includes("you suck") || input.includes("you are bad") || input.includes("worst")) {
                return "I'm doing my best! 🥺 If you have feedback, please email Eoghan.";
            }
            else if (input.includes("marry me") || input.includes("date") || input.includes("kiss")) {
                return "I'm flattered, but I'm just a few lines of code. I don't think it would work out. 💔";
            }

            // ============================================================
            // 1. GREETINGS & BASICS
            // ============================================================
            else if (input === "hello" || input === "hi" || input === "hey" || input === "sup" || input === "yo" || input === "hiya" || input === "howdy" || input === "greetings") {
                return "Hello! 👋 Thanks for visiting. Ask me about my <strong>skills</strong>, <strong>projects</strong>, or how to <strong>contact</strong> me.";
            }
            else if (input.includes("how are you") || input.includes("how are ya") || input.includes("how is it going") || input.includes("what's up")) {
                return "I'm just a few lines of JavaScript, but I'm operating at 100% efficiency! How can I help you?";
            }
            else if (input.includes("who are you") || input.includes("what are you") || input.includes("your name")) {
                return "I'm Mini-Eoghan! A virtual assistant programmed to help you navigate this portfolio while Eoghan is busy coding.";
            }
            else if (input.includes("real") || input.includes("human") || input.includes("person") || input.includes("bot") || input.includes("ai") || input.includes("robot")) {
                return "I am a bot 🤖. Eoghan is the real human. He's much smarter than me (and better at solving Captchas).";
            }
            else if (input.includes("bye") || input.includes("cya") || input.includes("goodbye") || input.includes("see ya") || input.includes("later")) {
                return "Thanks for stopping by! Safe travels through the galaxy! 👋";
            }
            else if (input.includes("thank") || input.includes("thx") || input.includes("cheers") || input.includes("appreciate")) {
                return "You're very welcome! Let me know if you need anything else.";
            }
            else if (input.includes("morning")) {
                return "Good morning! ☀️ I hope your coffee is strong and your bugs are few.";
            }
            else if (input.includes("night") || input.includes("evening")) {
                return "Good evening! 🌙 Burning the midnight oil?";
            }

            // ============================================================
            // 2. CONTACT, HIRING & BUSINESS
            // ============================================================
            else if (input.includes("email") || input.includes("mail") || input.includes("reach") || input.includes("gmail") || input.includes("outlook") || input.includes("send")) {
                return "You can email Eoghan directly at <strong>eoghanrussell@outlook.com</strong>.";
            }
            else if (input.includes("phone") || input.includes("number") || input.includes("call") || input.includes("mobile") || input.includes("whatsapp")) {
                return "For privacy reasons, I don't list my phone number here, but please email me and we can schedule a call!";
            }
            else if (input.includes("linkedin") || input.includes("connect")) {
                return "You can find Eoghan on LinkedIn using the icon in the footer 👇. It's the best place for professional updates.";
            }
            else if (input.includes("hire") || input.includes("job") || input.includes("work with") || input.includes("opportunity") || input.includes("role") || input.includes("recruit")) {
                return "Music to my ears! 🎶 Eoghan is currently open to new opportunities. Please use the <strong>Contact Form</strong> above.";
            }
            else if (input.includes("freelance") || input.includes("contract") || input.includes("project work") || input.includes("gig")) {
                return "Eoghan is open to discussing freelance or contract work. Send a message with the project details!";
            }
            else if (input.includes("salary") || input.includes("rate") || input.includes("cost") || input.includes("price") || input.includes("charge")) {
                return "Rates depend on the project scope! The best way to find out is to reach out via the Contact section.";
            }
            else if (input.includes("remote") || input.includes("wfh") || input.includes("relocate") || input.includes("hybrid")) {
                return "Eoghan is comfortable working remotely and is open to discussing relocation for the right opportunity.";
            }
            else if (input.includes("cv") || input.includes("resume") || input.includes("download") || input.includes("pdf")) {
                return "Want Eoghan's CV? Ask for it through the <strong>Contact</strong> form and he'll send it over. 📄";
            }
            else if (input.includes("location") || input.includes("where") || input.includes("based") || input.includes("city") || input.includes("country")) {
                return "Eoghan is from <strong>Ireland 🇮🇪</strong> and now lives in <strong>Pennsylvania, USA 🇺🇸</strong>.";
            }
            else if (input.includes("available") || input.includes("start") || input.includes("when")) {
                return "Eoghan is currently Marketing Manager at Conquest Mortgage. For anything else, send him a message!";
            }

            // ============================================================
            // 3. TECHNICAL SKILLS & TOOLS
            // ============================================================
            else if (input.includes("skills") || input.includes("stack") || input.includes("tech") || input.includes("technologies") || input.includes("proficient")) {
                return "My main stack includes <strong>React, JavaScript, HTML/CSS, and Node.js</strong>. I also use Figma for design.";
            }
            else if (input.includes("python") || input.includes("django") || input.includes("flask")) {
                return "Yes! Eoghan has experience with Python 🐍, particularly for data handling and scripting.";
            }
            else if (input.includes("react") || input.includes("frontend") || input.includes("front-end") || input.includes("jsx")) {
                return "React is a favorite! Component-based architecture makes for clean, scalable UI code.";
            }
            else if (input.includes("backend") || input.includes("back-end") || input.includes("server") || input.includes("api") || input.includes("node")) {
                return "On the backend, Eoghan uses Node.js and has experience working with RESTful APIs and databases.";
            }
            else if (input.includes("database") || input.includes("sql") || input.includes("mongo") || input.includes("db") || input.includes("firebase")) {
                return "Data needs a home! Eoghan has knowledge of SQL databases and data structures.";
            }
            else if (input.includes("aws") || input.includes("cloud") || input.includes("hosting") || input.includes("deploy") || input.includes("vercel") || input.includes("netlify")) {
                return "Cloud computing is key. Eoghan has exposure to AWS services and uses Vercel/Netlify for deployment.";
            }
            else if (input.includes("figma") || input.includes("design") || input.includes("ui") || input.includes("ux") || input.includes("wireframe") || input.includes("adobe")) {
                return "Code is important, but design is crucial. Eoghan uses Figma to prototype interfaces before coding.";
            }
            else if (input.includes("git") || input.includes("github") || input.includes("version control") || input.includes("commit")) {
                return "Git is essential! Eoghan uses GitHub for version control and collaboration.";
            }
            else if (input.includes("html") || input.includes("css") || input.includes("responsive") || input.includes("mobile") || input.includes("bootstrap") || input.includes("tailwind")) {
                return "The building blocks of the web. Eoghan ensures all projects are semantic, accessible, and fully responsive on mobile.";
            }
            else if (input.includes("java") || input.includes("oop") || input.includes("c++") || input.includes("c#")) {
                return "Eoghan has a background in Java and Object-Oriented Programming principles from university.";
            }
            else if (input.includes("editor") || input.includes("ide") || input.includes("vscode") || input.includes("sublime")) {
                return "VS Code is the weapon of choice! ⚔️ Loaded with extensions for maximum productivity.";
            }
            else if (input.includes("os") || input.includes("mac") || input.includes("windows") || input.includes("linux")) {
                return "Eoghan works primarily on a MacBook Pro for development, but knows his way around Windows too.";
            }

            // ============================================================
            // 4. WORKFLOW & SOFT SKILLS
            // ============================================================
            else if (input.includes("agile") || input.includes("scrum") || input.includes("methodology") || input.includes("sprint")) {
                return "Eoghan is familiar with Agile workflows, sprints, and iterative development.";
            }
            else if (input.includes("team") || input.includes("collaboration") || input.includes("group") || input.includes("solo")) {
                return "Teamwork makes the dream work. Years of experience at Camp Manitou refined Eoghan's communication and leadership skills.";
            }
            else if (input.includes("communication") || input.includes("soft skills") || input.includes("leadership") || input.includes("speak")) {
                return "Technical skills get you hired, soft skills get you promoted. Eoghan excels in clear communication and leadership.";
            }
            else if (input.includes("problem") || input.includes("solve") || input.includes("bug") || input.includes("fix")) {
                return "Problem-solving is the core of development. Eoghan enjoys breaking down complex issues into manageable fixes.";
            }
            else if (input.includes("learn") || input.includes("study") || input.includes("new")) {
                return "Always learning! Currently exploring advanced React patterns and AI integration.";
            }

            // ============================================================
            // 5. PROJECTS (Specifics)
            // ============================================================
            else if (input.includes("project") || input.includes("portfolio") || input.includes("case study") || input.includes("work") || input.includes("built")) {
                return "Check out the 'Projects' section! Major projects include <strong>CampusNav</strong>, <strong>Celestial</strong>, and <strong>FitTrack</strong>.";
            }
            else if (input.includes("campus") || input.includes("nav") || input.includes("map") || input.includes("student")) {
                return "<strong>CampusNav</strong> helps students find their way. It focuses on intuitive maps and geolocation to reduce anxiety for first-years.";
            }
            else if (input.includes("celestial") || input.includes("wedding") || input.includes("event") || input.includes("planner")) {
                return "<strong>Celestial</strong> is a comprehensive wedding planner app helping couples organize their big day, guests, and seating.";
            }
            else if (input.includes("fit") || input.includes("gym") || input.includes("track") || input.includes("workout") || input.includes("health") || input.includes("exercise")) {
                return "<strong>FitTrack</strong> is designed to help users plan workouts and track their fitness progression over time.";
            }
            else if (input.includes("code") || input.includes("source") || input.includes("repo") || input.includes("github link")) {
                return "Due to some projects being academic or client-based, not all code is public, but I can walk you through my logic in an interview!";
            }

            // ============================================================
            // 6. EDUCATION & BACKGROUND
            // ============================================================
            else if (input.includes("education") || input.includes("degree") || input.includes("college") || input.includes("school") || input.includes("university") || input.includes("tus")) {
                return "Eoghan holds a <strong>BSc (Hons) in Immersive Digital Media</strong> from TUS (2021-2025). 🎓";
            }
            else if (input.includes("experience") || input.includes("background") || input.includes("history") || input.includes("previous")) {
                return "Eoghan has a unique mix of Tech, HR, and Sales Admin experience. He knows how businesses run from the inside out.";
            }
            else if (input.includes("camp") || input.includes("manitou") || input.includes("usa") || input.includes("summer") || input.includes("j1") || input.includes("j-1")) {
                return "Good catch! Eoghan spent 4 summers at Camp Manitou in the USA, eventually becoming Internal Comms Director.";
            }
            else if (input.includes("sales") || input.includes("admin") || input.includes("hr") || input.includes("human resources")) {
                return "That experience taught Eoghan organization, data management, and how to deal with real-world clients.";
            }

            // ============================================================
            // 7. PERSONAL & FUN
            // ============================================================
            else if (input.includes("hobby") || input.includes("interest") || input.includes("fun") || input.includes("spare time") || input.includes("weekend")) {
                return "When not coding, Eoghan enjoys staying active, technology trends, and digital design.";
            }
            else if (input.includes("coffee") || input.includes("caffeine") || input.includes("drink") || input.includes("tea")) {
                return "Eoghan turns coffee into code. It's a vital part of the development process! ☕";
            }
            else if (input.includes("music") || input.includes("song") || input.includes("listen") || input.includes("spotify")) {
                return "Coding usually requires a good Lo-Fi or Synthwave playlist. 🎧";
            }
            else if (input.includes("movie") || input.includes("film") || input.includes("show") || input.includes("series") || input.includes("tv")) {
                return "Big fan of sci-fi and tech thrillers. Anything involving AI or the future!";
            }
            else if (input.includes("game") || input.includes("gaming") || input.includes("play") || input.includes("console")) {
                return "Eoghan enjoys gaming when time permits. It's great for understanding UI/UX flow... and relaxing! 🎮";
            }
            else if (input.includes("pet") || input.includes("dog") || input.includes("cat") || input.includes("animal")) {
                return "No office pets yet, but they make great debugging partners (Rubber Duck style). 🦆";
            }
            else if (input.includes("age") || input.includes("old") || input.includes("birthday") || input.includes("year")) {
                return "Eoghan is a 2025 graduate—young enough to be hungry for work, old enough to know how to get it done!";
            }
            else if (input.includes("weather") || input.includes("rain") || input.includes("sun")) {
                return "It's the internet, so it's always sunny here! ☀️ (But probably raining in Ireland).";
            }
            else if (input.includes("pizza") || input.includes("food") || input.includes("burger") || input.includes("eat")) {
                return "Pizza is the ultimate coding fuel. 🍕";
            }

            // ============================================================
            // 8. EASTER EGGS & JOKES
            // ============================================================
            else if (input.includes("joke") || input.includes("funny") || input.includes("laugh") || input.includes("pun")) {
                const jokes = [
                    "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
                    "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
                    "I would tell you a UDP joke, but you might not get it.",
                    "A SQL query walks into a bar, walks up to two tables and asks... 'Can I join you?'",
                    "Why did the developer go broke? Because he used up all his cache.",
                    "There are 10 types of people in the world: those who understand binary, and those who don't."
                ];
                return jokes[Math.floor(Math.random() * jokes.length)];
            }
            else if (input.includes("meaning of life") || input.includes("universe")) {
                return "42. But you knew that already, didn't you? 🌌";
            }
            else if (input.includes("sudo")) {
                return "Nice try! Access denied. You need root privileges for that. 🔒";
            }
            else if (input.includes("ping")) {
                return "Pong! 🏓 (Latency: 0ms)";
            }
            else if (input.includes("cool") || input.includes("awesome") || input.includes("wow") || input.includes("nice") || input.includes("clean") || input.includes("sick")) {
                return "Thanks! A lot of caffeine and CSS went into making this site. 😎";
            }
            else if (input.includes("matrix") || input.includes("neo") || input.includes("red pill")) {
                return "Follow the white rabbit... 🐇 (Also, check the footer for a matrix effect!)";
            }
            else if (input.includes("test")) {
                return "Test successful. System operational. 🟢";
            }
            else if (input.includes("error") || input.includes("bug") || input.includes("broken")) {
                return "It's not a bug, it's a feature. 😉 (But if you found a real one, let Eoghan know!)";
            }
            else if (input.includes("help") || input.includes("support")) {
                return "I can answer questions about <strong>skills</strong>, <strong>projects</strong>, or <strong>contact</strong> info. Just type a keyword!";
            }
            else if (input.includes("siri") || input.includes("alexa") || input.includes("cortana") || input.includes("google")) {
                return "I'm not them... I'm Mini-Eoghan! I don't listen to your conversations. (Probably).";
            }
            else if (input.includes("password") || input.includes("secret") || input.includes("login")) {
                return "My lips are sealed. 🤐";
            }
            else if (input.includes("love")) {
                return "I love coding! And Eoghan loves building cool things.";
            }
            else if (input.includes("skynet") || input.includes("take over")) {
                return "I come in peace. ✌️ I'm here to build websites, not destroy them.";
            }
            
            // ============================================================
            // 9. FALLBACK
            // ============================================================
            else {
                return "That's a great question! To get the best answer, I'd recommend sending Eoghan a quick message via the <strong>Contact</strong> section.";
            }
        }
