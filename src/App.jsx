import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDu6kGB97h9LcyzqkJCS6dX9jvesZXcg",
  authDomain: "aurachat-live.firebaseapp.com",
  databaseURL: "https://aurachat-live-default-rtdb.firebaseio.com",
  projectId: "aurachat-live",
  storageBucket: "aurachat-live.firebasestorage.app",
  messagingSenderId: "182909057129",
  appId: "1:182909057129:web:9b32aa060ec962b0dd4af8",
  measurementId: "G-RTY8J001T2"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const INITIAL_CONVERSATIONS = [
  {
    id: '773726619',
    visitorName: 'Mohsin (Player)',
    visitorEmail: 'mohsin@betting.io',
    location: 'Islamabad, Pakistan',
    lat: 33.6844,
    lng: 73.0479,
    browser: 'Safari 18 • iPhone',
    status: 'active',
    assignedTeam: 'General Support',
    assignedAgent: 'Sofia (AI)',
    ticketBadge: '🎫 DEP-481902 (Deposit)',
    unread: 1,
    messages: [
      { id: 'm1', sender: 'visitor', senderName: 'Mohsin', text: 'Hello, my deposit of 5000 PKR is not showing in my game wallet yet.', timestamp: '06:12 PM', type: 'text' },
      { id: 'm2', sender: 'ai', senderName: 'Sofia (AI Assistant)', text: 'Hello Mohsin! I have created a priority deposit ticket for you. Transferring you to our live support team now.', timestamp: '06:13 PM', type: 'system' }
    ]
  },
  {
    id: '12890545',
    visitorName: 'Ayesha Tariq',
    visitorEmail: 'ayesha.t@web.io',
    location: 'Hayatabad, Peshawar, Pakistan',
    lat: 33.9935,
    lng: 71.4274,
    browser: 'Chrome 130 • Windows',
    status: 'active',
    assignedTeam: 'VIP Support',
    assignedAgent: 'Haris Yousafzai',
    ticketBadge: null,
    unread: 0,
    messages: [
      { id: 'm10', sender: 'visitor', senderName: 'Ayesha Tariq', text: 'Assalam o Alaikum! Do you offer express withdrawal verification?', timestamp: '10:10 PM', type: 'text' },
      { id: 'm11', sender: 'agent', senderName: 'Haris Yousafzai', text: 'Walaikum Assalam! Yes, VIP accounts are processed within 5 minutes.', timestamp: '10:11 PM', type: 'text' }
    ]
  }
];

const INITIAL_TEAM = [
  { id: 't1', name: 'Haris Yousafzai', email: 'harrytech0000@gmail.com', role: 'Admin', status: 'Accepting chats', activeChats: 2, limit: 10 },
  { id: 't2', name: 'Mr. Mohsin', email: 'mohsin4567801@gmail.com', role: 'Agent', status: 'Accepting chats', activeChats: 1, limit: 8 },
  { id: 't3', name: 'Saad Khan', email: 'saad@aurachat.pro', role: 'Supervisor', status: 'Accepting chats', activeChats: 0, limit: 12 }
];

const WEEKLY_STATS = [
  { day: 'Mon', chats: 82, resolved: 79 },
  { day: 'Tue', chats: 95, resolved: 91 },
  { day: 'Wed', chats: 68, resolved: 66 },
  { day: 'Thu', chats: 114, resolved: 110 },
  { day: 'Fri', chats: 129, resolved: 125 },
  { day: 'Sat', chats: 142, resolved: 138 },
  { day: 'Sun', chats: 108, resolved: 105 }
];

export default function App() {
  const [authMode, setAuthMode] = useState('signin');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [emailInput, setEmailInput] = useState('harrytech0000@gmail.com');
  const [passwordInput, setPasswordInput] = useState('••••••••');
  const [nameInput, setNameInput] = useState('Haris Yousafzai');
  const [currentAgent, setCurrentAgent] = useState({ name: 'Haris Yousafzai', role: 'Admin', email: 'harrytech0000@gmail.com' });

  const [registeredUsers, setRegisteredUsers] = useState(INITIAL_TEAM);
  const [activeNavTab, setActiveNavTab] = useState('home'); // 'home' | 'chats' | 'tickets' | 'team'
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [ticketsList, setTicketsList] = useState([]);

  const [selectedConvId, setSelectedConvId] = useState('773726619');
  const [agentInput, setAgentInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAcceptingChats, setIsAcceptingChats] = useState(true);
  const [statsScope, setStatsScope] = useState('all'); // 'my' | 'all'

  const fileInputRef = useRef(null);

  useEffect(() => {
    const chatsRef = ref(db, 'conversations');
    const unsubscribeChats = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Array.isArray(data) ? data : Object.values(data);
        setConversations(arr);
      } else {
        set(chatsRef, INITIAL_CONVERSATIONS);
      }
    });

    const teamRef = ref(db, 'teamUsers');
    const unsubscribeTeam = onValue(teamRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Array.isArray(data) ? data : Object.values(data);
        setRegisteredUsers(arr);
      } else {
        set(teamRef, INITIAL_TEAM);
      }
    });

    const ticketsRef = ref(db, 'tickets');
    const unsubscribeTickets = onValue(ticketsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Array.isArray(data) ? data : Object.values(data);
        setTicketsList(arr);
      }
    });

    return () => {
      unsubscribeChats();
      unsubscribeTeam();
      unsubscribeTickets();
    };
  }, []);

  const handleSignIn = (e) => {
    e.preventDefault();
    const foundUser = registeredUsers.find(u => u.email.toLowerCase() === emailInput.toLowerCase());
    if (foundUser) {
      setCurrentAgent({ name: foundUser.name, role: foundUser.role, email: foundUser.email });
    } else {
      setCurrentAgent({ name: emailInput.split('@')[0], role: 'Agent', email: emailInput });
    }
    setIsLoggedIn(true);
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    if (!emailInput || !passwordInput || !nameInput) return;
    const newUser = {
      id: `u_${Date.now()}`,
      name: nameInput,
      email: emailInput,
      role: 'Agent',
      status: 'Accepting chats',
      activeChats: 0,
      limit: 8
    };
    const updatedTeam = [...registeredUsers, newUser];
    setRegisteredUsers(updatedTeam);
    set(ref(db, 'teamUsers'), updatedTeam);
    setCurrentAgent({ name: nameInput, role: 'Agent', email: emailInput });
    setIsLoggedIn(true);
  };

  const safeConversations = Array.isArray(conversations) && conversations.length > 0 ? conversations : INITIAL_CONVERSATIONS;
  const selectedConversation = safeConversations.find((c) => c.id === selectedConvId) || safeConversations[0];
  const filteredConversations = safeConversations.filter(c =>
    c.visitorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = safeConversations.reduce((acc, c) => acc + (c.unread || 0), 0);
  const onlineAgentsCount = registeredUsers.filter(u => u.status === 'Accepting chats').length;

  const handleSendAgentMessage = (targetId, customText = null, msgType = 'text') => {
    const textToSend = customText || agentInput;
    if (!textToSend.trim()) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = { id: `agent_${Date.now()}`, sender: 'agent', senderName: currentAgent.name, text: textToSend, timestamp: timeNow, type: msgType };

    const targetConv = safeConversations.find(c => c.id === targetId) || safeConversations[0];
    const existingMsgs = targetConv.messages || [];

    const updatedConversations = safeConversations.map(conv =>
      conv.id === targetId ? { ...conv, assignedAgent: currentAgent.name, messages: [...existingMsgs, newMsg], unread: 0 } : conv
    );

    setConversations(updatedConversations);
    set(ref(db, 'conversations'), updatedConversations);
    setAgentInput('');
  };

  const handleFileUploadFromPC = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileUrl = URL.createObjectURL(file);
    const isVideo = file.type.includes('video');
    handleSendAgentMessage(selectedConvId, fileUrl, isVideo ? 'video' : 'image');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 flex items-center justify-center p-4">
        <div className="bg-[#141417] border border-zinc-800/80 p-8 rounded-3xl w-full max-w-md shadow-2xl">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-tr from-purple-600 to-indigo-500 w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-2xl font-bold mb-4 shadow-lg shadow-purple-600/30">⚡</div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">AuraChat Enterprise</h1>
            <p className="text-xs text-zinc-400 mt-1">Next-Gen Live Support & AI Command Center</p>
          </div>

          <div className="flex bg-[#0a0a0c] p-1 rounded-xl border border-zinc-800 mb-6 text-xs font-semibold">
            <button type="button" onClick={() => setAuthMode('signin')} className={`flex-1 py-2.5 rounded-lg transition cursor-pointer ${authMode === 'signin' ? 'bg-purple-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}>Sign In</button>
            <button type="button" onClick={() => setAuthMode('signup')} className={`flex-1 py-2.5 rounded-lg transition cursor-pointer ${authMode === 'signup' ? 'bg-purple-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}>Sign Up</button>
          </div>

          <form onSubmit={authMode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Full Name</label>
                <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} required className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500" />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Work Email</label>
              <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} required className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Password</label>
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} required className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500" />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-600/25 transition text-sm cursor-pointer">
              {authMode === 'signin' ? 'Enter Command Center ➔' : 'Create Agent Account'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-zinc-100 font-sans flex overflow-hidden">
      {/* ENTERPRISE LEFT VERTICAL ICON SIDEBAR */}
      <aside className="w-16 bg-[#111115] border-r border-zinc-800/80 flex flex-col items-center py-4 justify-between shrink-0 z-50">
        <div className="flex flex-col items-center space-y-4 w-full">
          {/* Brand Logo */}
          <div onClick={() => setActiveNavTab('home')} className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-purple-600/30 cursor-pointer mb-2" title="AuraChat Enterprise">
            ⚡
          </div>

          {/* Nav Item: Home Overview */}
          <button
            type="button"
            onClick={() => setActiveNavTab('home')}
            title="Home Overview"
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition relative cursor-pointer ${
              activeNavTab === 'home' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/40 shadow-inner' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
            }`}
          >
            <span className="text-lg">🏠</span>
          </button>

          {/* Nav Item: Live Chats */}
          <button
            type="button"
            onClick={() => setActiveNavTab('chats')}
            title="Live Agent Chats"
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition relative cursor-pointer ${
              activeNavTab === 'chats' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/40 shadow-inner' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
            }`}
          >
            <span className="text-lg">💬</span>
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                {totalUnread}
              </span>
            )}
          </button>

          {/* Nav Item: AI Tickets */}
          <button
            type="button"
            onClick={() => setActiveNavTab('tickets')}
            title="AI Support Tickets"
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition relative cursor-pointer ${
              activeNavTab === 'tickets' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/40 shadow-inner' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
            }`}
          >
            <span className="text-lg">🎫</span>
            {ticketsList.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                {ticketsList.length}
              </span>
            )}
          </button>

          {/* Nav Item: Team */}
          <button
            type="button"
            onClick={() => setActiveNavTab('team')}
            title="Agents & Team"
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition relative cursor-pointer ${
              activeNavTab === 'team' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/40 shadow-inner' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
            }`}
          >
            <span className="text-lg">👥</span>
          </button>
        </div>

        {/* Bottom Profile & Logout */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative" title={`${currentAgent.name} (${isAcceptingChats ? 'Online' : 'Away'})`}>
            <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-purple-300">
              {currentAgent.name[0]}
            </div>
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#111115] ${isAcceptingChats ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          </div>
          <button type="button" onClick={() => setIsLoggedIn(false)} title="Logout" className="text-zinc-500 hover:text-rose-400 text-sm cursor-pointer">
            ⏻
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT SHELL */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* TOP COMMAND HEADER */}
        <header className="h-14 bg-[#111115]/90 border-b border-zinc-800/80 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-base tracking-tight text-white">AuraChat</span>
            <span className="text-[11px] bg-purple-500/15 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-500/30 font-semibold">Enterprise Pro</span>
          </div>

          {/* Global Search Bar */}
          <div className="hidden md:flex items-center bg-[#0b0b0e] border border-zinc-800 rounded-xl px-3.5 py-1.5 w-80 text-xs text-zinc-400">
            <span className="mr-2">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats, players, tickets..."
              className="bg-transparent text-white w-full focus:outline-none"
            />
            <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">Ctrl K</span>
          </div>

          {/* Right Agent Controls */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setIsAcceptingChats(!isAcceptingChats)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition cursor-pointer ${
                isAcceptingChats
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isAcceptingChats ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              <span>{isAcceptingChats ? 'Accepting Chats' : 'Away'}</span>
            </button>

            <div className="flex -space-x-2">
              {registeredUsers.slice(0, 3).map((u, idx) => (
                <div key={idx} title={u.name} className="w-7 h-7 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 border-2 border-[#111115] flex items-center justify-center text-[10px] font-bold text-white">
                  {u.name[0]}
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* --- TAB 1: ENTERPRISE HOME OVERVIEW (LIVECHAT.COM STYLE + BETTER) --- */}
        {activeNavTab === 'home' && (
          <main className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Greeting Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-2xl font-extrabold text-white shadow-xl shadow-purple-600/20">
                    {currentAgent.name[0]}
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                      Good Evening, {currentAgent.name}!
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1">
                      Real-time performance metrics, active game support queues, and Sofia AI resolution stats.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveNavTab('chats')}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg shadow-purple-600/25 transition cursor-pointer self-start md:self-auto"
                >
                  Open Live Inbox ({safeConversations.length}) ➔
                </button>
              </div>

              {/* Real-Time Overview Cards */}
              <div>
                <h2 className="text-sm font-bold text-zinc-300 mb-4">Real-time overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Card 1 */}
                  <div className="bg-[#141419] border border-zinc-800/90 hover:border-purple-500/40 transition rounded-2xl p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-semibold text-zinc-400">Customers online</span>
                      <span className="text-[11px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">● Live</span>
                    </div>
                    <div className="text-4xl font-extrabold text-white tracking-tight">412</div>
                    <div className="text-[11px] text-zinc-500 mt-2">Active across integrated web apps</div>
                  </div>

                  {/* Card 2 */}
                  <div onClick={() => setActiveNavTab('chats')} className="bg-[#141419] border border-zinc-800/90 hover:border-purple-500/40 transition rounded-2xl p-6 shadow-lg cursor-pointer">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-semibold text-zinc-400">Ongoing chats</span>
                      <span className="text-[11px] bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded-full font-semibold">Active Queue</span>
                    </div>
                    <div className="text-4xl font-extrabold text-white tracking-tight">{safeConversations.length}</div>
                    <div className="text-[11px] text-purple-400 mt-2 font-medium">Click to jump into live conversations ➔</div>
                  </div>

                  {/* Card 3 */}
                  <div onClick={() => setActiveNavTab('team')} className="bg-[#141419] border border-zinc-800/90 hover:border-purple-500/40 transition rounded-2xl p-6 shadow-lg cursor-pointer">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-semibold text-zinc-400">Logged in agents</span>
                      <span className="text-[11px] bg-cyan-500/15 text-cyan-300 px-2 py-0.5 rounded-full font-semibold">Support Team</span>
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-4xl font-extrabold text-white tracking-tight">{onlineAgentsCount}</span>
                      <span className="text-sm text-zinc-500 font-semibold">of {registeredUsers.length}</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-2">Sofia AI auto-routing enabled</div>
                  </div>
                </div>
              </div>

              {/* Last 7 Days Chart Card */}
              <div>
                <h2 className="text-sm font-bold text-zinc-300 mb-4">Last 7 days performance</h2>
                <div className="bg-[#141419] border border-zinc-800/90 rounded-2xl p-6 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="text-xs font-semibold text-zinc-400">Total chats handled</div>
                      <div className="flex items-baseline space-x-3 mt-1">
                        <span className="text-3xl font-extrabold text-white">{statsScope === 'all' ? '738' : '312'}</span>
                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          +14.2% from previous 7 days
                        </span>
                      </div>
                    </div>

                    <div className="flex bg-[#0b0b0e] p-1 rounded-xl border border-zinc-800 text-xs font-semibold self-start">
                      <button
                        type="button"
                        onClick={() => setStatsScope('my')}
                        className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${statsScope === 'my' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
                      >
                        My stats
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatsScope('all')}
                        className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${statsScope === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
                      >
                        All agents
                      </button>
                    </div>
                  </div>

                  {/* Interactive Bar Chart */}
                  <div className="h-52 flex items-end justify-between gap-3 pt-6 px-2 border-b border-zinc-800/80">
                    {WEEKLY_STATS.map((item, idx) => {
                      const val = statsScope === 'all' ? item.chats : Math.round(item.chats * 0.45);
                      const heightPercent = Math.min(100, Math.round((val / 150) * 100));
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center group">
                          <span className="text-[11px] font-bold text-zinc-400 opacity-0 group-hover:opacity-100 transition mb-1.5">
                            {val}
                          </span>
                          <div className="w-full max-w-[46px] bg-zinc-800/50 rounded-t-xl h-40 flex items-end overflow-hidden">
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className="w-full bg-gradient-to-t from-purple-600 to-indigo-400 group-hover:from-purple-500 group-hover:to-cyan-400 transition-all duration-500 rounded-t-xl"
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between px-2 pt-3 text-[11px] font-semibold text-zinc-500">
                    {WEEKLY_STATS.map((item, idx) => (
                      <div key={idx} className="flex-1 text-center">{item.day}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* --- TAB 2: LIVE AGENT CHATS WORKSPACE --- */}
        {activeNavTab === 'chats' && (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 p-4 overflow-hidden">
            {/* Left Inbox List */}
            <div className="md:col-span-3 bg-[#141419] border border-zinc-800/90 rounded-2xl p-4 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-sm text-white">Active Inbox ({filteredConversations.length})</span>
              </div>
              <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                {filteredConversations.map(c => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedConvId(c.id)}
                    className={`p-3.5 rounded-xl cursor-pointer border transition ${
                      selectedConvId === c.id ? 'bg-purple-600/15 border-purple-500/50' : 'bg-[#0b0b0e] border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-white">{c.visitorName}</span>
                      <span className="text-[10px] text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-md font-medium">{c.assignedAgent || 'AI'}</span>
                    </div>
                    {c.ticketBadge && (
                      <div className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded mb-1.5 inline-block font-semibold">
                        {c.ticketBadge}
                      </div>
                    )}
                    <p className="text-xs text-zinc-400 truncate">{c.messages?.[c.messages.length - 1]?.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Center Conversation Window */}
            <div className="md:col-span-6 bg-[#141419] border border-zinc-800/90 rounded-2xl flex flex-col overflow-hidden shadow-xl">
              <div className="p-4 border-b border-zinc-800 bg-[#111115] flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center font-bold text-xs text-purple-300">
                    {selectedConversation.visitorName[0]}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">{selectedConversation.visitorName}</div>
                    <div className="text-[11px] text-zinc-400">{selectedConversation.browser} • {selectedConversation.location}</div>
                  </div>
                </div>
                <span className="text-xs bg-purple-600/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-lg font-semibold">
                  {selectedConversation.assignedAgent || 'Sofia (AI)'}
                </span>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0b0b0e]/60">
                {selectedConversation.messages?.map((m, idx) => (
                  <div key={idx} className={`flex ${m.sender === 'visitor' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[75%] p-3.5 rounded-2xl text-sm ${
                      m.sender === 'visitor'
                        ? 'bg-zinc-800/90 text-zinc-100'
                        : m.sender === 'ai' || m.type === 'system'
                        ? 'bg-cyan-950/70 text-cyan-100 border border-cyan-500/30'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    }`}>
                      <div className="text-[10px] opacity-75 mb-1 font-semibold">{m.senderName || (m.sender === 'visitor' ? selectedConversation.visitorName : currentAgent.name)}</div>

                      {m.type === 'image' ? (
                        <img src={m.text} alt="Media" className="max-h-48 rounded-lg mt-1" />
                      ) : m.type === 'video' ? (
                        <video src={m.text} controls className="max-h-48 rounded-lg mt-1" />
                      ) : (
                        <span>{m.text}</span>
                      )}

                      <div className="text-[10px] text-right mt-1 opacity-70">{m.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSendAgentMessage(selectedConvId); }} className="p-3 border-t border-zinc-800 bg-[#111115] flex items-center space-x-2">
                <input type="file" ref={fileInputRef} onChange={handleFileUploadFromPC} className="hidden" accept="image/*,video/*" />
                <button type="button" onClick={() => fileInputRef.current.click()} className="text-zinc-400 hover:text-white p-2.5 bg-[#0b0b0e] rounded-xl border border-zinc-800 cursor-pointer" title="Attach Image or Video">📁</button>
                <input type="text" value={agentInput} onChange={(e) => setAgentInput(e.target.value)} placeholder="Type your reply as Live Agent..." className="flex-1 bg-[#0b0b0e] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500" />
                <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer">Send ➔</button>
              </form>
            </div>

            {/* Right Visitor Intelligence & GPS Pin */}
            <div className="md:col-span-3 bg-[#141419] border border-zinc-800/90 rounded-2xl p-4 flex flex-col gap-4 overflow-y-auto">
              <div>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Visitor Live GPS Pin</h3>
                <div className="w-full h-48 rounded-xl overflow-hidden border border-zinc-800">
                  <iframe title="GPS Pin" width="100%" height="100%" style={{ border: 0 }} loading="lazy" src={`https://maps.google.com/maps?q=${selectedConversation.lat},${selectedConversation.lng}&z=14&output=embed`} />
                </div>
              </div>

              <div className="bg-[#0b0b0e] border border-zinc-800/80 rounded-xl p-3.5 space-y-2.5 text-xs">
                <div className="font-bold text-zinc-300">Player & Session Details</div>
                <div className="flex justify-between"><span className="text-zinc-500">Email:</span><span className="text-zinc-200">{selectedConversation.visitorEmail}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Location:</span><span className="text-zinc-200">{selectedConversation.location}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Device:</span><span className="text-zinc-200">{selectedConversation.browser}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: AI TICKETS --- */}
        {activeNavTab === 'tickets' && (
          <main className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="max-w-5xl mx-auto bg-[#141419] border border-zinc-800/90 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-extrabold text-white mb-1">🎫 Sofia AI Generated Tickets</h2>
              <p className="text-xs text-zinc-400 mb-6">Deposit & withdrawal tickets automatically escalated from game chat widgets.</p>
              {ticketsList.length === 0 ? (
                <div className="bg-[#0b0b0e] border border-zinc-800 rounded-xl p-8 text-center text-xs text-zinc-500">
                  No new tickets in queue right now.
                </div>
              ) : (
                <div className="space-y-3">
                  {ticketsList.map((t, i) => (
                    <div key={i} className="bg-[#0b0b0e] p-4 rounded-xl border border-zinc-800 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-sm text-amber-400">{t.id} • {t.customer}</div>
                        <p className="text-xs text-zinc-300 mt-1">{t.details}</p>
                      </div>
                      <span className="text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-semibold">{t.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        )}

        {/* --- TAB 4: TEAM --- */}
        {activeNavTab === 'team' && (
          <main className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="max-w-5xl mx-auto bg-[#141419] border border-zinc-800/90 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-extrabold text-white mb-1">👥 Support Agents & Permissions</h2>
              <p className="text-xs text-zinc-400 mb-6">Manage online agent routing capacity and active chat limits.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {registeredUsers.map(u => (
                  <div key={u.id} className="bg-[#0b0b0e] p-4 rounded-xl border border-zinc-800 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-300">
                        {u.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{u.name} <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded ml-1">{u.role}</span></div>
                        <div className="text-xs text-zinc-400">{u.email}</div>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-400 font-semibold">● {u.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}