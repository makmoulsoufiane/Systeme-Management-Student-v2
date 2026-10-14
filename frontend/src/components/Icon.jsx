const paths = {
  students: <><path d="m3 9 9-5 9 5-9 5-9-5Z"/><path d="M7 12v5c3 2 7 2 10 0v-5M21 9v7"/></>,
  teachers: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M15 4h6v12h-3M17 8h1M17 11h1"/></>,
  groups: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 4v2"/></>,
  exams: <><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v4H9zM9 12h6M9 16h4"/></>,
  scores: <path d="M4 4v16h17M8 16v-4M13 16V8M18 16v-7"/>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  'arrow-left': <path d="m10 5-7 7 7 7M3 12h18"/>,
  edit: <path d="m14 5 5 5M4 20l5-1L20 8a2 2 0 0 0-5-5L4 14l-1 7Z"/>,
  trash: <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>,
  close: <path d="m6 6 12 12M6 18 18 6"/>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
  logout: <path d="M10 4H4v16h6M8 12h13m-5-5 5 5-5 5"/>,
  check: <path d="m5 12 4 4L19 6"/>,
  alert: <path d="m12 3 10 18H2L12 3ZM12 9v5M12 17h.01"/>,
  chevron: <path d="m9 5 7 7-7 7"/>,
  book: <path d="M12 5v16M3 3c4 0 7 1 9 3 2-2 5-3 9-3v15c-4 0-7 1-9 3-2-2-5-3-9-3V3Z"/>,
  shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/></>,
}

export default function Icon({ name, size = 20, className = '' }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.book}</svg>
}
