import { getStore } from "@netlify/blobs";

const DEFAULT_DATA = {
  hero: {
    name: 'Yash Patil',
    title: 'Frontend Developer & UI/UX Designer',
    typed: 'Frontend Developer, UI/UX Designer, AI Enthusiast',
    available: true,
    meta: 'Building responsive web apps, AI-powered tools, and immersive digital experiences.'
  },
  about: {
    bio: "Currently pursuing my Bachelor of Computer Engineering (2025–Present), I'm continuously improving my skills in modern web technologies while building real-world projects.",
    location: 'Pune, India',
    status: 'Frontend Developer · Pune, India',
    eduDegree: 'Bachelor of Computer Engineering',
    eduYears: '2025 – Present',
    eduInstitute: ''
  },
  skills: {
    tech: ['HTML5','CSS3','JavaScript','C','C++','Java','Python','React','Three.js','UI/UX Design','Generative AI'],
    soft: ['Communication','Problem Solving','Teamwork','Creativity','Time Management']
  },
  projects: [
    { emoji:'⏱', title:'Focus Flow', category:'01 / Productivity', problem:'Modern work is full of distractions. Productivity tools are often bland and offer no real motivation system.', solution:'Focus Flow is a gamified productivity dashboard combining a Pomodoro timer, drag-and-drop task management, and Spotify integration. Real-time analytics track your streaks, and a goal system rewards your focus sessions — turning work into a game.', tags:['Spotify Embed','Goal Tracking','Task Management','Data Visualization','Responsive'], live:'https://yashpatil3495.github.io/timer/', github:'https://github.com/yashpatil3495/timer.git' },
    { emoji:'🗣', title:'LinguaVox', category:'02 / Language', problem:'Language barriers on the web are frustrating. Existing tools feel clunky or require switching between multiple apps.', solution:"LinguaVox is a sleek, mobile-first web app with real-time translation, voice input via the Web Speech API, and text-to-speech synthesis. It supports multiple languages with voice matching and adjustable speed control — all in the browser.", tags:['Web Speech API','Fetch API','TTS Synthesis','Speed Control','Voice Match'], live:'https://yashpatil3495.github.io/LinguaVox2/', github:'https://github.com/yashpatil3495/my-portfolio2.git' },
    { emoji:'🔐', title:'Fortress Pro', category:'03 / Security', problem:'Most password generators are boring, insecure, or lack any real feedback on password strength.', solution:'Fortress Pro uses the Crypto API to generate cryptographically secure passwords with a real-time entropy estimation engine. A session history system lets you track generated passwords, and the theme-adaptive UI supports custom character filtering.', tags:['Crypto API','Entropy Engine','Session History','Theme Adaptive UI'], live:'https://yashpatil3495.github.io/Fortress-Pro/', github:'https://github.com/yashpatil3495/Fortress-Pro.git' },
    { emoji:'🖼', title:'CipherPixel', category:'04 / Creative', problem:'Sharing secret messages online is either insecure or requires complex encryption apps. What if you could hide a message in plain sight?', solution:'CipherPixel uses pixel-level steganography via the Canvas API to encode hidden text inside image files. Drag-and-drop an image, type your message, encode it — then decode it later. The message is invisible to the naked eye but perfectly extractable.', tags:['Canvas API','Steganography','Drag & Drop','File API'], live:'https://yashpatil3495.github.io/CipherPixel/', github:'https://github.com/yashpatil3495/CipherPixel.git' }
  ],
  testimonials: [
    { quote: "Yash has an incredible eye for detail. The UI work he delivered was polished, fast, and well beyond what I expected for the timeline.", name: "Arjun Kulkarni", title: "Project Collaborator · Full-Stack Developer", initials: "AK", color: "amber", linkedin: "#" },
    { quote: "One of the most self-driven developers I've worked alongside. Yash picks up new tools fast and ships things that actually work — cleanly.", name: "Sneha Rao", title: "Peer · Computer Engineering, PICT", initials: "SR", color: "teal", linkedin: "#" },
    { quote: "The attention he gives to typography and motion makes his work stand out immediately. It's rare to see someone this young think so carefully about user experience.", name: "Prof. Meghna Joshi", title: "Faculty Mentor · Dept. of Computer Engineering", initials: "PM", color: "purple", linkedin: "#" }
  ],
  contact: {
    email: 'yashpatil3495@gmail.com',
    wa: '917741010554',
    sub: "Have a project idea, internship opportunity, or just want to say hi? I'd love to hear from you.",
    github: 'https://github.com/yashpatil3495',
    linkedin: 'https://www.linkedin.com/in/yash-patil-b30b18363',
    twitter: '',
    instagram: '',
    metaUrl: 'https://yashpatil3495.github.io/',
    metaTwitter: '@yashpatil3495',
    metaKeywords: 'Yash Patil, Frontend Developer, UI UX Designer, Pune'
  }
};

export default async (req, context) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    const store = getStore("portfolio-data");
    const data = await store.get("site-content", { type: "json" });

    if (data) {
      return new Response(JSON.stringify(data), { status: 200, headers });
    } else {
      // No data saved yet — return defaults
      return new Response(JSON.stringify(DEFAULT_DATA), { status: 200, headers });
    }
  } catch (err) {
    console.error("Error reading from Netlify Blobs:", err);
    // Fallback to defaults on error
    return new Response(JSON.stringify(DEFAULT_DATA), { status: 200, headers });
  }
};
