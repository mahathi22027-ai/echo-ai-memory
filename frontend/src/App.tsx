import { FormEvent, useEffect, useRef, useState } from 'react'

type IconName =
  | 'archive'
  | 'arrowUp'
  | 'attachment'
  | 'bookmark'
  | 'brain'
  | 'chevron'
  | 'clock'
  | 'close'
  | 'edit'
  | 'journal'
  | 'lock'
  | 'logout'
  | 'menu'
  | 'moon'
  | 'more'
  | 'panel'
  | 'search'
  | 'settings'
  | 'shield'
  | 'sparkles'
  | 'sun'
  | 'trash'
  | 'refresh'

const iconPaths: Record<IconName, React.ReactNode> = {
  archive: <><rect x="3" y="4" width="18" height="5" rx="1" /><path d="M5 9v10h14V9M10 13h4" /></>,
  arrowUp: <><path d="m12 19 0-14M6.5 10.5 12 5l5.5 5.5" /></>,
  attachment: <path d="m20.5 11.5-8.9 8.9a5 5 0 0 1-7.1-7.1l9.6-9.6a3.5 3.5 0 1 1 5 5l-9.6 9.6a2 2 0 1 1-2.8-2.8l8.9-8.9" />,
  bookmark: <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.5L6 21z" />,
  brain: <><path d="M9.5 4.5A3.5 3.5 0 0 0 6 8v.2a3.5 3.5 0 0 0-.8 6.6A3.5 3.5 0 0 0 9.5 19" /><path d="M14.5 4.5A3.5 3.5 0 0 1 18 8v.2a3.5 3.5 0 0 1 .8 6.6 3.5 3.5 0 0 1-4.3 4.2M12 3v18M8 9.5c1.5 0 2.5.8 4 2.2m4-3.7c-1.4 0-2.5.8-4 2.2m0 5.1c1.4-1.4 2.5-2.2 4-2.2" /></>,
  chevron: <path d="m8.5 10 3.5 3.5 3.5-3.5" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></>,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  edit: <><path d="M13.5 6.5 17.5 10.5M4 20l4.2-1 10.4-10.4a2.8 2.8 0 0 0-4-4L4.2 15z" /></>,
  journal: <><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v17H6.5A1.5 1.5 0 0 1 5 18.5z" /><path d="M5 18.5A1.5 1.5 0 0 1 6.5 17H19M9 7h6M9 11h4" /></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  logout: <><path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  moon: <path d="M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5 9 9 0 1 0 20.5 15.2Z" />,
  more: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>,
  panel: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M15 4v16" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
  shield: <path d="M12 3 5 6v5c0 4.6 2.8 8.2 7 10 4.2-1.8 7-5.4 7-10V6zM9 12l2 2 4-4" />,
  sparkles: <><path d="m12 3 .7 2.3A6 6 0 0 0 16.7 9l2.3.7-2.3.7a6 6 0 0 0-4 3.7L12 17l-.7-2.9a6 6 0 0 0-4-3.7L5 9.7 7.3 9a6 6 0 0 0 4-3.7z" /><path d="m19 16 .3 1a3 3 0 0 0 1.7 1.7l1 .3-1 .3a3 3 0 0 0-1.7 1.7l-.3 1-.3-1a3 3 0 0 0-1.7-1.7L16 19l1-.3a3 3 0 0 0 1.7-1.7z" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6" /></>,
  refresh: <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8m0 0V3m0 5h5M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16m0 0v5m0-5h-5" />,
}

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {iconPaths[name]}
    </svg>
  )
}

export interface Memory {
  _id: string
  user_id?: string
  entry_id?: string
  type: string
  content: string
  source_quote?: string
  status: 'active' | 'superseded' | 'private' | 'expired'
  is_private: boolean
  expires_at?: string | null
  supersedes_id?: string | null
  created_at?: string
  confidence?: string
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'echo'
  content: string
  mode?: 'journal' | 'query'
  timestamp: string
  referencedMemories?: string[]
}

export interface MemoryEvent {
  _id: string
  user_id?: string
  memory_id?: string
  event_type: string
  timestamp: string
  metadata?: Record<string, any>
}

type AuthUser = {
  userId?: string
  name: string
  email: string
}

const sessionKey = 'echo-demo-session'
const tokenKey = 'echo-jwt-token'
const profileKey = 'echo-demo-profile'
const API_URL_KEY = 'echo_backend_api_url'

function readStoredUser(key: string) {
  try {
    const value = localStorage.getItem(key)
    return value ? (JSON.parse(value) as AuthUser) : null
  } catch {
    return null
  }
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function App() {
  const [dark, setDark] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser(sessionKey))
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [authError, setAuthError] = useState('')
  const [navOpen, setNavOpen] = useState(false)
  const [inspectorOpen, setInspectorOpen] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [backendUrl, setBackendUrl] = useState(() => localStorage.getItem(API_URL_KEY) || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api')
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null)
  const [filterType, setFilterType] = useState<string>('all')

  // Edit / Supersede modal state
  const [supersedeModalOpen, setSupersedeModalOpen] = useState(false)
  const [supersedeTarget, setSupersedeTarget] = useState<Memory | null>(null)
  const [supersedeContent, setSupersedeContent] = useState('')
  const [supersedeQuote, setSupersedeQuote] = useState('')

  const [mode, setMode] = useState<'Journal Entry' | 'Ask Echo'>('Journal Entry')
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)

  // Real backend-driven state
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('echo_chat_history_' + (readStoredUser(sessionKey)?.email || 'guest'))
      return saved ? JSON.parse(saved) : [
        {
          id: 'msg_welcome_echo',
          sender: 'echo',
          content: 'Welcome to your private Echo space. Write a journal reflection to extract structured memories, or switch to "Ask Echo" to query your memory vault.',
          timestamp: 'Just now',
          mode: 'journal'
        }
      ]
    } catch {
      return []
    }
  })

  const [memories, setMemories] = useState<Memory[]>([])
  const [events, setEvents] = useState<MemoryEvent[]>([])

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  const activeUserId = user?.userId || (user ? `user_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}` : 'demo_user')
  const authToken = localStorage.getItem(tokenKey) || ''

  // Sync theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])
  // Close profile popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileOpen])


  // Check backend health & fetch initial memories
  useEffect(() => {
    checkHealth()
    fetchMemories()
    fetchEvents()
  }, [backendUrl, user])

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function checkHealth() {
    try {
      const res = await fetch(`${backendUrl}/health`, { method: 'GET' })
      if (res.ok) {
        setBackendConnected(true)
      } else {
        setBackendConnected(false)
      }
    } catch {
      setBackendConnected(false)
    }
  }

  async function fetchMemories() {
    try {
      const res = await fetch(`${backendUrl}/memories`, {
        headers: { 'x-user-id': activeUserId, ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) }
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.memories)) {
          setMemories(data.memories)
          if (data.memories.length > 0 && !selectedMemoryId) {
            setSelectedMemoryId(data.memories[0]._id)
          }
        }
      }
    } catch (e) {
      console.warn('Could not fetch memories:', e)
    }
  }

  async function fetchEvents() {
    try {
      const res = await fetch(`${backendUrl}/memory-events`, {
        headers: { 'x-user-id': activeUserId, ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) }
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.events)) {
          setEvents(data.events)
        }
      }
    } catch (e) {
      console.warn('Could not fetch events:', e)
    }
  }

  async function submitMessage(event: FormEvent) {
    event.preventDefault()
    if (!draft.trim() || loading) return

    const userText = draft.trim()
    const requestMode = mode === 'Journal Entry' ? 'journal' : 'query'
    const newMsgId = `user_${Date.now()}`
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const userMsg: ChatMessage = {
      id: newMsgId,
      sender: 'user',
      content: userText,
      mode: requestMode,
      timestamp: timeStr
    }

    setMessages((prev) => [...prev, userMsg])
    setDraft('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setLoading(true)

    try {
      const res = await fetch(`${backendUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': activeUserId,
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          message: userText,
          mode: requestMode,
          user_id: activeUserId
        })
      })

      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`)
      }

      const data = await res.json()
      const echoMsg: ChatMessage = {
        id: `echo_${Date.now()}`,
        sender: 'echo',
        content: data.reply || (requestMode === 'journal' ? 'Journal reflection ingested into memory vault.' : 'No recall found.'),
        mode: requestMode,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        referencedMemories: data.referencedMemories || []
      }

      setMessages((prev) => [...prev, echoMsg])

      // If memories were extracted, refresh memories & events
      if (data.extractedMemories && data.extractedMemories.length > 0) {
        await fetchMemories()
        await fetchEvents()
        if (data.extractedMemories[0]?._id) {
          setSelectedMemoryId(data.extractedMemories[0]._id)
          setInspectorOpen(true)
        }
      } else {
        await fetchMemories()
        await fetchEvents()
      }
    } catch (err: any) {
      console.error('Chat request error:', err)
      const errorMsg: ChatMessage = {
        id: `echo_err_${Date.now()}`,
        sender: 'echo',
        content: `Error connecting to ECHO backend at ${backendUrl}: ${err.message}. Please verify the backend server is running.`,
        mode: requestMode,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  async function toggleMemoryPrivacy(memory: Memory) {
    try {
      const res = await fetch(`${backendUrl}/memories/${memory._id}/privacy`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': activeUserId,
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({ is_private: !memory.is_private })
      })
      if (res.ok) {
        await fetchMemories()
        await fetchEvents()
      }
    } catch (e) {
      console.error('Failed to toggle privacy:', e)
    }
  }

  async function deleteMemory(memoryId: string) {
    if (!confirm('Are you sure you want to permanently delete this memory?')) return
    try {
      const res = await fetch(`${backendUrl}/memories/${memoryId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': activeUserId, ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) }
      })
      if (res.ok) {
        await fetchMemories()
        await fetchEvents()
        if (selectedMemoryId === memoryId) {
          setSelectedMemoryId(null)
        }
      }
    } catch (e) {
      console.error('Failed to delete memory:', e)
    }
  }

  function openSupersedeModal(memory: Memory) {
    setSupersedeTarget(memory)
    setSupersedeContent(memory.content)
    setSupersedeQuote(memory.source_quote || '')
    setSupersedeModalOpen(true)
  }

  async function submitSupersede(e: FormEvent) {
    e.preventDefault()
    if (!supersedeTarget) return
    try {
      const res = await fetch(`${backendUrl}/memories/${supersedeTarget._id}/supersede`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': activeUserId,
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          supersedeWith: {
            content: supersedeContent,
            type: supersedeTarget.type,
            source_quote: supersedeQuote
          }
        })
      })
      if (res.ok) {
        setSupersedeModalOpen(false)
        await fetchMemories()
        await fetchEvents()
      }
    } catch (err) {
      console.error('Supersede error:', err)
    }
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthError('')

    const data = new FormData(event.currentTarget)
    const email = String(data.get('email') ?? '').trim().toLowerCase()
    const password = String(data.get('password') ?? '')
    const name = String(data.get('name') ?? '').trim()

    if (!email.includes('@')) {
      setAuthError('Enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters.')
      return
    }
    if (authMode === 'signup' && name.length < 2) {
      setAuthError('Enter your name to create your space.')
      return
    }

    try {
      const endpoint = authMode === 'signup' ? '/auth/signup' : '/auth/signin'
      const payload = authMode === 'signup' ? { name, email, password } : { email, password }

      const res = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await res.json()
      if (!res.ok || !result.success) {
        setAuthError(result.error || 'Authentication failed. Please check your credentials.')
        return
      }

      if (result.token) {
        localStorage.setItem(tokenKey, result.token)
      }

      const verifiedUser: AuthUser = {
        userId: result.user?.userId,
        name: result.user?.name || name || 'Echo User',
        email: result.user?.email || email
      }

      localStorage.setItem(sessionKey, JSON.stringify(verifiedUser))
      localStorage.setItem(profileKey, JSON.stringify(verifiedUser))
      setUser(verifiedUser)
    } catch (err: any) {
      setAuthError('Could not reach backend authentication server: ' + err.message)
    }
  }

  function logout() {
    localStorage.removeItem(sessionKey)
    localStorage.removeItem(tokenKey)
    setProfileOpen(false)
    setNavOpen(false)
    setUser(null)
    setAuthMode('signin')
  }

  // Filter memories
  const displayedMemories = memories.filter((m) => {
    if (filterType === 'all') return true
    if (filterType === 'private') return m.is_private
    if (filterType === 'superseded') return m.status === 'superseded'
    return m.type?.toLowerCase() === filterType.toLowerCase()
  })

  const history = [
    { label: 'A quieter kind of progress', time: 'Today' },
    { label: 'Sunday reset', time: 'Yesterday' },
    { label: 'Friendship & reciprocity', time: 'Oct 28' },
    { label: 'Career reflections', time: 'Oct 24' },
  ]

  if (!user) {
    return (
      <main className="auth-page">
        <header className="auth-header">
          <div className="brand">
            <div className="brand-mark"><span /><span /><span /></div>
            <span>Echo</span>
          </div>
          <button className="icon-button" onClick={() => setDark(!dark)} aria-label={dark ? 'Use light theme' : 'Use dark theme'}>
            <Icon name={dark ? 'sun' : 'moon'} />
          </button>
        </header>

        <section className="auth-layout">
          <div className="auth-intro">
            <span className="auth-eyebrow"><Icon name="lock" size={13} />Your private space to think</span>
            <h1>Make sense of what stays with you.</h1>
            <p>Journal freely, notice patterns over time, and decide exactly what Echo is allowed to remember.</p>
            <div className="auth-principles">
              <div><span><Icon name="journal" size={17} /></span><p><strong>Write without pressure</strong>Your entries begin as a private conversation with yourself.</p></div>
              <div><span><Icon name="brain" size={17} /></span><p><strong>Build meaningful memory</strong>Echo connects the details you choose to keep.</p></div>
              <div><span><Icon name="shield" size={17} /></span><p><strong>Stay in control</strong>Review, edit, or remove any remembered detail.</p></div>
            </div>
          </div>

          <div className="auth-card">
            <div className="auth-card-heading">
              <span className="auth-card-icon"><Icon name="sparkles" size={19} /></span>
              <h2>{authMode === 'signin' ? 'Welcome back' : 'Create your private space'}</h2>
              <p>{authMode === 'signin' ? 'Continue your journal where you left off.' : 'Start a journal that remembers on your terms.'}</p>
            </div>

            <div className="auth-tabs" role="tablist" aria-label="Authentication">
              <button type="button" role="tab" aria-selected={authMode === 'signin'} className={authMode === 'signin' ? 'active' : ''} onClick={() => setAuthMode('signin')}>Sign in</button>
              <button type="button" role="tab" aria-selected={authMode === 'signup'} className={authMode === 'signup' ? 'active' : ''} onClick={() => setAuthMode('signup')}>Create account</button>
            </div>

            <form className="auth-form" onSubmit={submitAuth} key={authMode}>
              {authMode === 'signup' && (
                <label>
                  <span>Name</span>
                  <input name="name" type="text" autoComplete="name" placeholder="Alex Morgan" autoFocus />
                </label>
              )}
              <label>
                <span>Email</span>
                <input name="email" type="email" autoComplete="email" placeholder="you@example.com" autoFocus={authMode === 'signin'} />
              </label>
              <label>
                <span>Password</span>
                <input name="password" type="password" autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'} placeholder="At least 6 characters" />
              </label>
              {authError && <p className="auth-error" role="alert">{authError}</p>}
              <button className="auth-submit" type="submit">{authMode === 'signin' ? 'Continue to Echo' : 'Create my space'}<Icon name="arrowUp" size={17} /></button>
            </form>

            <p className="demo-notice"><Icon name="shield" size={13} /><span><strong>Secure Cloud Authentication</strong> Stored and verified in MongoDB Atlas with bcrypt password hashing and JWT sessions.</span></p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <div className="app-shell">
      {navOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setNavOpen(false)} />}
      
      {/* Sidebar */}
      <aside className={`sidebar ${navOpen ? 'is-open' : ''}`}>
        <div className="brand-row">
          <div className="brand">
            <div className="brand-mark"><span /><span /><span /></div>
            <span>Echo</span>
          </div>
          <button className="icon-button mobile-only" onClick={() => setNavOpen(false)} aria-label="Close navigation"><Icon name="close" /></button>
        </div>

        <nav className="primary-nav" aria-label="Primary navigation">
          <button className="nav-action is-primary" onClick={() => {
            setMode('Journal Entry');
            setDraft('');
            setMessages([
              {
                id: 'msg_' + Date.now(),
                sender: 'echo',
                content: 'Started a fresh reflection. What is on your mind today?',
                timestamp: 'Just now',
                mode: 'journal'
              }
            ]);
          }}><Icon name="edit" /><span>New journal</span><kbd>⌘ K</kbd></button>
          <button className="nav-action" onClick={() => { setMode('Ask Echo'); setDraft(''); }}><Icon name="search" /><span>Search memories</span><kbd>⌘ /</kbd></button>
        </nav>

        {/* Backend Status Pill */}
        <div style={{ padding: '8px 12px', margin: '4px 12px', borderRadius: '6px', background: 'var(--panel)', border: '1px solid var(--border-soft)', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: backendConnected ? '#10b981' : '#f59e0b' }} />
            <span style={{ fontWeight: 500, color: 'var(--text)' }}>{backendConnected ? 'Backend Live' : 'Connecting...'}</span>
          </div>
          <button onClick={() => setSettingsOpen(true)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--subtle)' }}>
            <Icon name="settings" size={14} />
          </button>
        </div>

        <div className="history">
          <div className="section-label"><span>Journal history</span><button aria-label="More history options"><Icon name="more" size={17} /></button></div>
          <div className="history-list">
            {history.map((item, index) => (
              <button key={item.label} className={`history-item ${index === 0 ? 'active' : ''}`}>
                <span>{item.label}</span>
                <small>{item.time}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="profile-wrap" ref={profileMenuRef}>
            <button className="profile-button" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen}>
              <span className="avatar">{initials(user.name)}</span>
              <span className="profile-copy"><strong>{user.name}</strong><small>{activeUserId}</small></span>
              <Icon name="more" size={17} />
            </button>
            {profileOpen && (
              <div className="profile-menu">
                <div className="profile-menu-account">
                  <span className="avatar large">{initials(user.name)}</span>
                  <div><strong>{user.name}</strong><span>{user.email}</span></div>
                </div>
                <div className="profile-menu-divider" />
                <button onClick={() => setSettingsOpen(true)}><Icon name="settings" size={17} /><span>Backend Settings</span></button>
                <button onClick={() => setDark(!dark)}><Icon name={dark ? 'sun' : 'moon'} size={17} /><span>{dark ? 'Light appearance' : 'Dark appearance'}</span></button>
                <button className="logout-button" onClick={logout}><Icon name="logout" size={17} /><span>Log out</span></button>
              </div>
            )}
          </div>
          <button className="nav-action" onClick={() => setSettingsOpen(true)}><Icon name="settings" /><span>Settings</span></button>
        </div>
      </aside>

      {/* Main Chat Conversation Area */}
      <main className="conversation">
        <header className="topbar">
          <button className="icon-button nav-trigger" onClick={() => setNavOpen(true)} aria-label="Open navigation"><Icon name="menu" /></button>
          <button className="conversation-title">
            <span>A quieter kind of progress</span>
            <Icon name="chevron" size={16} />
          </button>
          <div className="topbar-actions">
            <span className="private-label"><Icon name="lock" size={14} /> Private Vault</span>
            <button className="icon-button theme-toggle" onClick={() => setDark(!dark)} aria-label={dark ? 'Use light theme' : 'Use dark theme'}><Icon name={dark ? 'sun' : 'moon'} /></button>
            <button className="icon-button inspector-trigger" onClick={() => setInspectorOpen(true)} aria-label="Open memory inspector"><Icon name="panel" /></button>
            <button className="icon-button" onClick={() => { fetchMemories(); fetchEvents(); }} aria-label="Refresh Data"><Icon name="refresh" size={16} /></button>
          </div>
        </header>

        <div className="conversation-scroll">
          <div className="message-stream">
            <div className="date-divider"><span>Today's Dialogue</span></div>

            {messages.map((message) => {
              if (message.sender === 'user') {
                return (
                  <article className="message user-message" key={message.id}>
                    <div className="message-content">
                      <p>{message.content}</p>
                      <div style={{ marginTop: '4px', fontSize: '10px', color: 'var(--subtle)', display: 'flex', gap: '8px' }}>
                        <span>{message.timestamp}</span>
                        <span style={{ textTransform: 'capitalize' }}>[{message.mode || 'journal'}]</span>
                      </div>
                    </div>
                  </article>
                )
              }

              return (
                <article className="message echo-message" key={message.id}>
                  <div className="echo-avatar"><div className="brand-mark small"><span /><span /><span /></div></div>
                  <div className="message-body">
                    <div className="sender-name">Echo AI Memory</div>
                    <div className="message-content">
                      <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
                    </div>

                    {message.referencedMemories && message.referencedMemories.length > 0 && (() => {
                      // Filter out any referenced memories that are currently marked private or no longer active
                      const visibleRefs = message.referencedMemories.filter((memId) => {
                        const matched = memories.find((m) => m._id === memId)
                        return matched && !matched.is_private && matched.status !== 'private'
                      })
                      if (visibleRefs.length === 0) return null

                      return (
                        <div className="memory-references">
                          {visibleRefs.map((memId) => {
                            const matched = memories.find((m) => m._id === memId)
                            return (
                              <button
                                key={memId}
                                onClick={() => {
                                  setSelectedMemoryId(memId)
                                  setInspectorOpen(true)
                                }}
                                className={selectedMemoryId === memId ? 'selected' : ''}
                              >
                                <Icon name="brain" size={15} />
                                {matched ? matched.content.slice(0, 32) + '...' : `Memory ${memId.slice(0, 6)}`}
                              </button>
                            )
                          })}
                        </div>
                      )
                    })()}

                    <div className="message-tools">
                      <span style={{ fontSize: '11px', color: 'var(--subtle)' }}>{message.timestamp}</span>
                    </div>
                  </div>
                </article>
              )
            })}

            {loading && (
              <article className="message echo-message">
                <div className="echo-avatar"><div className="brand-mark small"><span /><span /><span /></div></div>
                <div className="message-body">
                  <div className="sender-name">Echo</div>
                  <div className="message-content" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="status-dot" style={{ animation: 'pulse 1s infinite' }} />
                    <span style={{ fontStyle: 'italic', color: 'var(--muted)' }}>
                      {mode === 'Journal Entry' ? 'Analyzing reflection & ingesting agentic memories into MongoDB Atlas...' : 'Running semantic recall with vector similarity search...'}
                    </span>
                  </div>
                </div>
              </article>
            )}

            <div ref={messagesEndRef} />

            {/* Audit & Memory Activity Feed */}
            <div className="activity-wrap">
              <button className="activity-toggle" onClick={() => setLogOpen(!logOpen)} aria-expanded={logOpen}>
                <span><span className="status-dot" /><Icon name="sparkles" size={15} /> Real-time Memory Audit Events</span>
                <span>{events.length} system events <Icon name="chevron" size={15} /></span>
              </button>
              {logOpen && (
                <div className="activity-log">
                  {events.length === 0 ? (
                    <div><Icon name="clock" size={15} /><span>No events yet. Submit a journal entry to see live memory extraction logs.</span></div>
                  ) : (
                    events.slice(0, 6).map((evt) => (
                      <div key={evt._id || evt.timestamp}>
                        <Icon name={evt.event_type.includes('created') ? 'brain' : evt.event_type.includes('privacy') ? 'shield' : 'clock'} size={15} />
                        <span>
                          <strong>{new Date(evt.timestamp).toLocaleTimeString()}</strong> {evt.event_type}
                          {evt.metadata?.type ? ` [${evt.metadata.type}]` : ''}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Composer */}
        <div className="composer-zone">
          <form className="composer" onSubmit={submitMessage}>
            <textarea
              ref={textareaRef}
              rows={1}
              value={draft}
              disabled={loading}
              onChange={(event) => {
                setDraft(event.target.value)
                event.currentTarget.style.height = 'auto'
                event.currentTarget.style.height = `${Math.min(event.currentTarget.scrollHeight, 150)}px`
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  submitMessage(event)
                }
              }}
              placeholder={mode === 'Journal Entry' ? 'Write a reflection (ECHO will extract structured memories into MongoDB)...' : 'Ask Echo about your past memories, recurring feelings, and patterns...'}
            />
            <div className="composer-controls">
              <div className="composer-left">
                <button type="button" className="attachment-button" aria-label="Attach file"><Icon name="attachment" size={18} /></button>
                <div className="mode-switch" aria-label="Writing mode">
                  <button type="button" className={mode === 'Journal Entry' ? 'active' : ''} onClick={() => setMode('Journal Entry')}>
                    <Icon name="journal" size={15} />Journal entry
                  </button>
                  <button type="button" className={mode === 'Ask Echo' ? 'active' : ''} onClick={() => setMode('Ask Echo')}>
                    <Icon name="sparkles" size={15} />Ask Echo
                  </button>
                </div>
              </div>
              <button type="submit" className="send-button" disabled={!draft.trim() || loading} aria-label="Send">
                <Icon name="arrowUp" size={19} />
              </button>
            </div>
          </form>
          <p className="privacy-note"><Icon name="shield" size={13} />Agentic Memory · MongoDB Atlas · Groq Llama 3.3 · OpenAI Embeddings</p>
        </div>
      </main>

      {/* Memory Inspector Drawer */}
      {inspectorOpen && <button className="inspector-scrim" aria-label="Close memory inspector" onClick={() => setInspectorOpen(false)} />}
      <aside className={`inspector ${inspectorOpen ? 'is-open' : ''}`}>
        <header className="inspector-header">
          <div>
            <h2>Memory Inspector</h2>
            <p>Active MongoDB Memory Vault</p>
          </div>
          <button className="icon-button" onClick={() => setInspectorOpen(false)} aria-label="Close memory inspector"><Icon name="close" /></button>
        </header>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', padding: '0 16px 12px', overflowX: 'auto', borderBottom: '1px solid var(--border-soft)' }}>
          {['all', 'feeling', 'belief', 'event', 'decision', 'private', 'superseded'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                background: filterType === f ? 'var(--accent)' : 'transparent',
                color: filterType === f ? '#fff' : 'var(--muted)',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="inspector-summary">
          <span><span className="status-dot" />{displayedMemories.length} vault memories</span>
          <button onClick={fetchMemories} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icon name="refresh" size={13} />Refresh
          </button>
        </div>

        <div className="memory-list">
          {displayedMemories.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
              <p>No memories found in vault.</p>
              <p style={{ marginTop: '6px', fontSize: '11px', color: 'var(--subtle)' }}>Write a journal entry to automatically extract memories!</p>
            </div>
          ) : (
            displayedMemories.map((memory) => {
              const isSelected = selectedMemoryId === memory._id
              return (
                <article
                  key={memory._id}
                  className={`memory-card ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setSelectedMemoryId(memory._id)}
                  style={{ opacity: memory.status === 'superseded' ? 0.6 : 1 }}
                >
                  <div className="memory-card-top">
                    <span className="memory-icon">
                      <Icon name={memory.type === 'feeling' ? 'sun' : memory.type === 'belief' ? 'brain' : 'sparkles'} size={17} />
                    </span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="memory-meta" style={{ textTransform: 'capitalize' }}>{memory.type}</span>
                        {memory.is_private && <span style={{ fontSize: '10px', background: '#e11d48', color: '#fff', padding: '1px 5px', borderRadius: '4px' }}>Private</span>}
                        {memory.status === 'superseded' && <span style={{ fontSize: '10px', background: '#64748b', color: '#fff', padding: '1px 5px', borderRadius: '4px' }}>Superseded</span>}
                      </div>
                      <h3>{memory.content}</h3>
                    </div>
                  </div>

                  {memory.source_quote && (
                    <div className="source-quote">
                      <span>Original source quote</span>
                      <p>“{memory.source_quote}”</p>
                    </div>
                  )}

                  <div className="memory-footer">
                    <span style={{ fontSize: '11px', color: 'var(--subtle)' }}>
                      {memory.created_at ? new Date(memory.created_at).toLocaleDateString() : 'Active'}
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        title="Supersede (Correct/Update memory)"
                        onClick={(e) => {
                          e.stopPropagation()
                          openSupersedeModal(memory)
                        }}
                      >
                        <Icon name="edit" size={15} />
                      </button>
                      <button
                        title={memory.is_private ? 'Make Public' : 'Make Private'}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleMemoryPrivacy(memory)
                        }}
                      >
                        <Icon name="lock" size={15} />
                      </button>
                      <button
                        title="Delete Memory"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteMemory(memory._id)
                        }}
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </div>

        <div className="privacy-card">
          <Icon name="shield" size={18} />
          <div><strong>Differential Privacy Shield</strong><p>Memories marked private are masked from query responses during vector recall.</p></div>
        </div>
      </aside>

      {/* Supersede / Correct Memory Modal */}
      {supersedeModalOpen && supersedeTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '480px', color: 'var(--text)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Supersede Memory</h3>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>
              Create a corrected version of this memory. The existing memory will be archived as <code>superseded</code> for full audit trail provenance.
            </p>
            <form onSubmit={submitSupersede}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 500 }}>Updated Memory Content</label>
              <textarea
                value={supersedeContent}
                onChange={(e) => setSupersedeContent(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', marginBottom: '12px' }}
                required
              />

              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 500 }}>Source Quote / Justification</label>
              <input
                type="text"
                value={supersedeQuote}
                onChange={(e) => setSupersedeQuote(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', marginBottom: '16px' }}
                placeholder="Why is this memory being updated?"
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setSupersedeModalOpen(false)}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontWeight: 500 }}
                >
                  Apply Correction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Backend Settings Modal */}
      {settingsOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '440px', color: 'var(--text)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Backend API Connection</h3>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>
              Connect your new frontend to the Node.js / Express backend server.
            </p>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 500 }}>Backend Base API URL</label>
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', marginBottom: '16px' }}
              placeholder="http://localhost:5000/api"
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem(API_URL_KEY, backendUrl)
                  setSettingsOpen(false)
                  checkHealth()
                  fetchMemories()
                }}
                style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontWeight: 500 }}
              >
                Save & Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
