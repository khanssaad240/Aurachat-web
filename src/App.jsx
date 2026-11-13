import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";

// Firebase Configuration connected to your project (aurachat-live)
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const INITIAL_CONVERSATIONS = [
  {
    id: '12890545',
    visitorName: 'Visitor #12890545',
    visitorEmail: 'visitor_1289@web.io',
    location: 'Hayatabad, Peshawar, Pakistan',
    lat: 33.9935,
    lng: 71.4274,
    browser: 'Chrome 130 • Windows',
    currentPage: '/checkout/cart',
    status: 'active',
    assignedTeam: 'General Support',
    unread: 1,
    visitorTypingText: '',
    agentTypingStatus: '',
    messages: [
      { id: 'm1', sender: 'visitor', text: '200 help me sar', timestamp: '05:58 PM', type: 'text' },
      { id: 'm2', sender: 'visitor', text: 'Halp', timestamp: '05:59 PM', type: 'text' }
    ]
  },
  {
    id: '773726619',
    visitorName: 'Visitor #773726619',
    visitorEmail: 'visitor_7737@web.io',
    location: 'Islamabad, Pakistan',
    lat: 33.6844,
    lng: 73.0479,
    browser: 'Safari 18 • iPhone',
    currentPage: '/',
    status: 'active',
    assignedTeam: 'Sales Team',
    unread: 7,
    visitorTypingText: '',
    agentTypingStatus: '',
    messages: [
      { id: 'm10', sender: 'visitor', text: 'Thik hai, price confirm karein.', timestamp: '05:50 PM', type: 'text' }
    ]
  }
];

const INITIAL_TEAM = [
  { id: 't1', name: 'Haris Yousafzai', email: 'harrytech0000@gmail.com', role: 'Admin', status: 'Accepting chats', limit: 10, group: 'General' },
  { id: 't2', name: 'Mr. Mohsin', email: 'mohsin4567801@gmail.com', role: 'Agent', status: 'Accepting chats', limit: 8, group: 'General' }
];

const INITIAL_CANNED = [
  { code: '#1', title: 'Check Details', text: 'Sir, hum aapki details check kar rahe hain. Please thoda wait kijiye, update milte hi bata denge.' },
  { code: '#2', title: 'Payment Screenshot', text: 'Kindly share the screenshot of your payment receipt so we can verify.' },
  { code: '#3', title: 'Express Delivery', text: 'Yes! We offer fast express delivery to your location with cash on delivery.' },
  { code: '#4', title: 'Greeting & Help', text: 'Assalam o Alaikum! Welcome to AuraSupport. How can we assist you today?' }
];

export default function App() {
  const [authMode, setAuthMode] = useState('signin');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [emailInput, setEmailInput] = useState('harrytech0000@gmail.com');
  const [passwordInput, setPasswordInput] = useState('••••••••');
  const [nameInput, setNameInput] = useState('Haris Yousafzai');
  const [currentAgent, setCurrentAgent] = useState({ name: 'Haris Yousafzai', role: 'Admin', email: 'harrytech0000@gmail.com' });

  const [registeredUsers, setRegisteredUsers] = useState(INITIAL_TEAM);
  const [activeNavTab, setActiveNavTab] = useState('chats');
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [cannedList, setCannedList] = useState(INITIAL_CANNED);
  
  const [selectedConvId, setSelectedConvId] = useState('12890545');
  const [agentInput, setAgentInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAcceptingChats, setIsAcceptingChats] = useState(true);
  const [showCannedMenu, setShowCannedMenu] = useState(false);
  const [showChatOptionsMenu, setShowChatOptionsMenu] = useState(false);

  // HelpDesk Ticket Modal State
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketPriority, setTicketPriority] = useState('Medium');

  const [showNewCannedModal, setShowNewCannedModal] = useState(false);
  const [newCannedCode, setNewCannedCode] = useState('#5');
  const [newCannedTitle, setNewCannedTitle] = useState('');
  const [newCannedText, setNewCannedText] = useState('');

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('Agent');

  const [reportView, setReportView] = useState('all-agents');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    const chatsRef = ref(db, 'conversations');
    const unsubscribeChats = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setConversations(data);
      else set(chatsRef, INITIAL_CONVERSATIONS);
    });

    const teamRef = ref(db, 'teamUsers');
    const unsubscribeTeam = onValue(teamRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setRegisteredUsers(data);
      else set(teamRef, INITIAL_TEAM);
    });

    return () => {
      unsubscribeChats();
      unsubscribeTeam();
    };
  }, [isLoggedIn]);

  const handleSignIn = (e) => {
    e.preventDefault();
    const foundUser = registeredUsers.find(u => u.email.toLowerCase() === emailInput.toLowerCase());
    if (foundUser) {
      setCurrentAgent({ name: foundUser.name, role: foundUser.role, email: foundUser.email });
      setIsLoggedIn(true);
    } else {
      setCurrentAgent({ name: emailInput.split('@')[0], role: 'Agent', email: emailInput });
      setIsLoggedIn(true);
    }
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
      limit: 8,
      group: 'General'
    };

    const updatedTeam = [...registeredUsers, newUser];
    setRegisteredUsers(updatedTeam);
    set(ref(db, 'teamUsers'), updatedTeam);

    setCurrentAgent({ name: nameInput, role: 'Agent', email: emailInput });
    setIsLoggedIn(true);
    alert('Account created successfully! Welcome to AuraChat.');
  };

  const selectedConversation = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const handleInputChange = (e) => {
    const val = e.target.value;
    setAgentInput(val);

    const updatedConversations = conversations.map(conv => 
      conv.id === selectedConvId 
        ? { ...conv, agentTypingStatus: val.trim() ? `${currentAgent.name} is typing...` : '' }
        : conv
    );
    set(ref(db, 'conversations'), updatedConversations);

    const trimmed = val.trim();
    const matchedCanned = cannedList.find(c => c.code.toLowerCase() === trimmed.toLowerCase());
    if (matchedCanned) {
      setAgentInput(matchedCanned.text);
    }
  };

  const handleSendAgentMessage = (targetId, customText = null, msgType = 'text') => {
    const textToSend = customText || agentInput;
    if (!textToSend.trim()) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = { id: `agent_${Date.now()}`, sender: 'agent', text: textToSend, timestamp: timeNow, type: msgType };

    const updatedConversations = conversations.map(conv => 
      conv.id === targetId 
        ? { ...conv, messages: [...conv.messages, newMsg], unread: 0, agentTypingStatus: '' }
        : conv
    );

    set(ref(db, 'conversations'), updatedConversations);
    setAgentInput('');
    setShowCannedMenu(false);
  };

  const handleFileUploadFromPC = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileUrl = URL.createObjectURL(file);
    const isVideo = file.type.includes('video');
    handleSendAgentMessage(selectedConvId, fileUrl, isVideo ? 'video' : 'image');
  };

  const handleArchiveChat = (targetId) => {
    const updated = conversations.map(c => c.id === targetId ? { ...c, status: 'archived' } : c);
    set(ref(db, 'conversations'), updated);
    setShowChatOptionsMenu(false);
  };

  const handleReopenChat = (targetId) => {
    const updated = conversations.map(c => c.id === targetId ? { ...c, status: 'active' } : c);
    set(ref(db, 'conversations'), updated);
  };

  const handleBanCustomer = (targetId) => {
    const updated = conversations.filter(c => c.id !== targetId);
    set(ref(db, 'conversations'), updated);
    setShowChatOptionsMenu(false);
  };

  const handleSendTranscript = () => {
    setShowChatOptionsMenu(false);
    alert('Chat transcript successfully sent to visitor email.');
  };

  const handleCreateHelpdeskTicket = () => {
    setShowChatOptionsMenu(false);
    setShowTicketModal(true);
  };

  const handleSaveTicket = (e) => {
    e.preventDefault();
    if (!ticketTitle || !ticketDescription) return;
    alert(`HelpDesk Ticket successfully created for ${selectedConversation.visitorName}!`);
    setTicketTitle('');
    setTicketDescription('');
    setShowTicketModal(false);
  };

  const handleAddCannedResponse = (e) => {
    e.preventDefault();
    if (!newCannedTitle || !newCannedText) return;
    setCannedList([...cannedList, { code: newCannedCode, title: newCannedTitle, text: newCannedText }]);
    setNewCannedTitle('');
    setNewCannedText('');
    setShowNewCannedModal(false);
  };

  const handleInviteAgent = (e) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;
    const newMember = {
      id: `t_${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      status: 'Accepting chats',
      limit: 8,
      group: 'General'
    };
    const updatedTeam = [...registeredUsers, newMember];
    setRegisteredUsers(updatedTeam);
    set(ref(db, 'teamUsers'), updatedTeam);
    setInviteEmail('');
    setInviteName('');
    setShowInviteModal(false);
    alert(`Verification code sent to ${inviteEmail}! Agent successfully invited.`);
  };

  const filteredConversations = conversations.filter(c => {
    const matchesSearch = c.id.includes(searchQuery) || c.visitorName.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeNavTab === 'archive') return matchesSearch && c.status === 'archived';
    if (filterStatus === 'active') return matchesSearch && c.status === 'active';
    if (filterStatus === 'archived') return matchesSearch && c.status === 'archived';
    return matchesSearch;
  });

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
          <div className="text-center mb-6">
            <div className="bg-purple-600 w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-2xl font-bold mb-3 shadow-lg shadow-purple-600/30">
              📍
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">AuraChat Enterprise Pro</h1>
            <p className="text-xs text-slate-400 mt-1">Real-time Live Chat & GPS Tracking Platform</p>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6 text-xs font-semibold">
            <button 
              type="button" 
              onClick={() => setAuthMode('signin')}
              className={`flex-1 py-2 rounded-lg transition ${authMode === 'signin' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
            >
              Sign In
            </button>
            <button 
              type="button" 
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2 rounded-lg transition ${authMode === 'signup' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
            >
              Sign Up
            </button>
          </div>

          {authMode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
                <input 
                  type="password" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-purple-600/30 transition text-sm"
              >
                Sign In to Console
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Saad Yousaf"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
                <input 
                  type="password" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Create password"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-purple-600/30 transition text-sm"
              >
                Create Account & Join
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-purple-500 selection:text-white">
      
      {/* TOP NAVBAR */}
      <nav className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 px-6 py-2.5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-600 p-2 rounded-xl text-white shadow-lg font-bold text-lg">
            📍
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">AuraChat</span>
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full ml-2 border border-purple-500/30 font-semibold">
              Enterprise Pro
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <button 
            onClick={() => setIsAcceptingChats(!isAcceptingChats)}
            className={`px-3 py-1 rounded-lg font-semibold flex items-center space-x-2 transition ${isAcceptingChats ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}
          >
            <span className={`w-2 h-2 rounded-full ${isAcceptingChats ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            <span>{isAcceptingChats ? 'Accepting Chats' : 'Not Accepting'}</span>
          </button>
          <span className="text-slate-400 border-l border-slate-800 pl-3">👑 {currentAgent.name} ({currentAgent.role})</span>
          <button onClick={() => setIsLoggedIn(false)} className="text-rose-400 hover:underline pl-2 font-medium">Logout</button>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button 
            onClick={() => setActiveNavTab('chats')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${activeNavTab === 'chats' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            💬 Chats
          </button>
          <button 
            onClick={() => setActiveNavTab('team')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${activeNavTab === 'team' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            👥 Team
          </button>
          <button 
            onClick={() => setActiveNavTab('reports')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${activeNavTab === 'reports' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            📊 Reports
          </button>
          <button 
            onClick={() => setActiveNavTab('archive')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${activeNavTab === 'archive' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            📂 Archive
          </button>
          <button 
            onClick={() => setActiveNavTab('engage')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${activeNavTab === 'engage' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            ⚡ Engage
          </button>
        </div>
      </nav>

      {/* VIEW 1: CHATS INBOX */}
      {activeNavTab === 'chats' && (
        <div className="max-w-[1700px] mx-auto p-4 grid grid-cols-1 md:grid-cols-12 gap-4 h-[88vh] flex-1 w-full">
          
          <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-sm text-slate-200">My chats ({conversations.filter(c => c.status === 'active').length})</span>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 px-2 py-1 focus:outline-none"
              >
                <option value="all">All Chats</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="mb-3">
              <input 
                type="text" 
                placeholder="🔍 Search chats..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              {filteredConversations.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => setSelectedConvId(c.id)}
                  className={`p-3 rounded-xl cursor-pointer border transition relative ${selectedConvId === c.id ? 'bg-purple-600/20 border-purple-500/50 shadow-md' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs text-slate-200">{c.visitorName}</span>
                    <span className="text-[10px] text-slate-400">📍 {c.location.split(',')[0]}</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">
                    {c.messages[c.messages.length - 1]?.text || 'Media attachment'}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="bg-slate-900 px-1.5 py-0.5 rounded text-slate-300">{c.assignedTeam}</span>
                    <span className={c.status === 'active' ? 'text-emerald-400' : 'text-slate-500'}>
                      {c.status === 'active' ? '● Active' : 'Archived'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl relative">
            <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-white">{selectedConversation.visitorName}</span>
                  <span className="text-xs bg-purple-600/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded">ID: {selectedConversation.id}</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">📍 {selectedConversation.location} • {selectedConversation.browser}</div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Online</span>
                
                <div className="relative">
                  <button 
                    onClick={() => setShowChatOptionsMenu(!showChatOptionsMenu)}
                    className="text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-800 text-sm font-bold"
                  >
                    ⋯
                  </button>

                  {showChatOptionsMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs">
                      <button 
                        onClick={() => handleArchiveChat(selectedConversation.id)}
                        className="w-full text-left px-4 py-2 hover:bg-slate-900 text-slate-200 flex items-center space-x-2"
                      >
                        <span>📂 Close / Archive chat</span>
                      </button>
                      <button 
                        onClick={handleSendTranscript}
                        className="w-full text-left px-4 py-2 hover:bg-slate-900 text-slate-200 flex items-center space-x-2"
                      >
                        <span>✉️ Send transcript</span>
                      </button>
                      <button 
                        onClick={handleCreateHelpdeskTicket}
                        className="w-full text-left px-4 py-2 hover:bg-slate-900 text-slate-200 flex items-center space-x-2"
                      >
                        <span>🎫 Create HelpDesk ticket</span>
                      </button>
                      <div className="border-t border-slate-800 my-1"></div>
                      <button 
                        onClick={() => handleBanCustomer(selectedConversation.id)}
                        className="w-full text-left px-4 py-2 hover:bg-rose-500/10 text-rose-400 flex items-center space-x-2 font-semibold"
                      >
                        <span>🚫 Ban this customer</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/30">
              {selectedConversation.messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.sender === 'visitor' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${m.sender === 'visitor' ? 'bg-slate-800 text-slate-200' : 'bg-purple-600 text-white'}`}>
                    <div className="text-[10px] opacity-80 mb-0.5 font-semibold">
                      {m.sender === 'visitor' ? selectedConversation.visitorName : `${currentAgent.name} (${currentAgent.role})`}
                    </div>

                    {m.type === 'image' ? (
                      <div className="mt-1 rounded-xl overflow-hidden border border-white/20">
                        <img src={m.text} alt="Upload" className="max-h-48 w-full object-cover" />
                      </div>
                    ) : m.type === 'video' ? (
                      <div className="mt-1 rounded-xl overflow-hidden border border-white/20">
                        <video src={m.text} controls className="max-h-48 w-full object-cover" />
                      </div>
                    ) : (
                      <span>{m.text}</span>
                    )}

                    <div className="text-[10px] text-right mt-1 opacity-70">{m.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>

            {selectedConversation.visitorTypingText && (
              <div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/20 text-amber-300 text-xs flex items-center space-x-2 animate-pulse">
                <span>✍️ <b>{selectedConversation.visitorName} is typing live:</b> "{selectedConversation.visitorTypingText}"</span>
              </div>
            )}

            <div className="px-4 py-2 border-t border-slate-800 bg-slate-900 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setShowCannedMenu(!showCannedMenu)}
                  className="bg-purple-600/20 text-purple-300 px-2.5 py-1 rounded-lg border border-purple-500/30 font-semibold"
                >
                  ⚡ Canned Responses (#)
                </button>
                <button 
                  onClick={() => setShowNewCannedModal(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg border border-slate-700 text-[11px]"
                >
                  ➕ Add New Canned
                </button>
              </div>
              <span className="text-[10px] text-slate-500">Type #1, #2... or select from menu</span>
            </div>

            {showCannedMenu && (
              <div className="bg-slate-950 border border-slate-800 p-2 mx-4 mb-2 rounded-xl grid grid-cols-2 gap-2 shadow-xl">
                {cannedList.map((macro, i) => (
                  <div 
                    key={i}
                    onClick={() => handleSendAgentMessage(selectedConvId, macro.text)}
                    className="bg-slate-900 hover:bg-slate-800 p-2 rounded-lg cursor-pointer border border-slate-800"
                  >
                    <div className="text-xs font-bold text-purple-400">{macro.code} - {macro.title}</div>
                    <p className="text-[10px] text-slate-300 truncate">{macro.text}</p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleSendAgentMessage(selectedConvId); }} className="p-3 border-t border-slate-800 bg-slate-950 flex items-center space-x-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUploadFromPC} 
                className="hidden" 
                accept="image/*,video/*" 
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current.click()}
                title="Upload Picture or Video from PC"
                className="text-slate-400 hover:text-white p-2.5 bg-slate-900 rounded-xl border border-slate-800"
              >
                📁
              </button>
              <input 
                type="text" 
                value={agentInput}
                onChange={handleInputChange}
                placeholder="Write a message or type #1, #2 for canned macros..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none text-white"
              />
              <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg">
                Send ➔
              </button>
            </form>
          </div>

          <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Visitor Live GPS Pin</h3>
            
            <div className="w-full h-52 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
              <iframe
                title="Visitor GPS Pin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://maps.google.com/maps?q=${selectedConversation.lat},${selectedConversation.lng}&z=14&output=embed`}
              />
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between"><span className="text-slate-500">ID</span><span className="font-mono text-purple-300">{selectedConversation.id}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Location</span><span className="text-slate-200">{selectedConversation.location}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Coordinates</span><span className="font-mono text-cyan-400">{selectedConversation.lat}, {selectedConversation.lng}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Team</span><span className="text-amber-400">{selectedConversation.assignedTeam}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: TEAM MANAGEMENT TAB */}
      {activeNavTab === 'team' && (
        <div className="max-w-6xl mx-auto p-8 flex-1 w-full">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Team Management</h2>
                <p className="text-xs text-slate-400">Manage registered agents and members synchronized via Firebase.</p>
              </div>
              <button 
                onClick={() => setShowInviteModal(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg"
              >
                + Invite Agents
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Chat Limit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {registeredUsers.map(agent => (
                    <tr key={agent.id} className="hover:bg-slate-950/40">
                      <td className="py-3 font-semibold text-white">{agent.name}</td>
                      <td className="py-3 text-slate-400">{agent.email}</td>
                      <td className="py-3 text-purple-300">{agent.role}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400">
                          {agent.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-300">{agent.limit} chats</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: REPORTS TAB */}
      {activeNavTab === 'reports' && (
        <div className="max-w-6xl mx-auto p-8 flex-1 w-full space-y-6">
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h2 className="text-lg font-bold text-white">Performance Summary</h2>
              <p className="text-xs text-slate-400">Detailed chats, visitor traffic, and CSAT ratings.</p>
            </div>
            <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button 
                onClick={() => setReportView('my-stats')}
                className={`px-3 py-1.5 rounded-lg transition ${reportView === 'my-stats' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                My stats
              </button>
              <button 
                onClick={() => setReportView('all-agents')}
                className={`px-3 py-1.5 rounded-lg transition ${reportView === 'all-agents' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                All agents
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="text-slate-400 text-xs font-semibold">Total Chats Handled</div>
              <div className="text-3xl font-extrabold text-purple-400 mt-2">
                {reportView === 'my-stats' ? '142' : '522'}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="text-slate-400 text-xs font-semibold">Chat Satisfaction (SR)</div>
              <div className="text-3xl font-extrabold text-emerald-400 mt-2">
                {reportView === 'my-stats' ? '96%' : '47%'}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="text-slate-400 text-xs font-semibold">Queued Visitors</div>
              <div className="text-3xl font-extrabold text-cyan-400 mt-2">
                {reportView === 'my-stats' ? '0' : 'n/a'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: ARCHIVE TAB */}
      {activeNavTab === 'archive' && (
        <div className="max-w-6xl mx-auto p-8 flex-1 w-full">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-2 text-white">Archived Conversations</h2>
            <p className="text-xs text-slate-400 mb-6">List of all closed chats. You can reopen any chat instantly.</p>
            
            <div className="space-y-3">
              {conversations.filter(c => c.status === 'archived').length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">No archived chats found.</div>
              ) : (
                conversations.filter(c => c.status === 'archived').map(c => (
                  <div key={c.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-600/20 text-purple-300 px-2.5 py-1 rounded-lg border border-purple-500/30 font-mono">
                        #{c.id}
                      </div>
                      <div>
                        <span className="font-bold text-white text-sm">{c.visitorName}</span>
                        <p className="text-slate-400 mt-0.5">📍 {c.location} • {c.browser}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-slate-900 text-slate-400 px-3 py-1 rounded-lg border border-slate-800">
                        Archived
                      </span>
                      <button 
                        onClick={() => handleReopenChat(c.id)}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-1.5 rounded-xl font-semibold shadow-md transition"
                      >
                        Reopen chat
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: ENGAGE TAB */}
      {activeNavTab === 'engage' && (
        <div className="max-w-6xl mx-auto p-8 flex-1 w-full">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-2 text-white">Proactive Engage Rules</h2>
            <p className="text-xs text-slate-400 mb-6">Set automated greeting messages when visitors arrive on specific pages.</p>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 flex justify-between items-center">
              <div>
                <span className="font-bold text-purple-400">Cart Page Greeting</span>
                <p className="text-slate-500 mt-0.5">Send "Do you need help with your checkout?" after 10 seconds.</p>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px]">Active</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE HELPDESK TICKET WITH DESCRIPTION */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Create HelpDesk Ticket</h3>
            <p className="text-xs text-slate-400 mb-4">Generate a support ticket for {selectedConversation.visitorName}.</p>
            
            <form onSubmit={handleSaveTicket} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Ticket Title</label>
                <input 
                  type="text" 
                  value={ticketTitle} 
                  onChange={(e) => setTicketTitle(e.target.value)} 
                  placeholder="e.g. Payment issue resolution"
                  required 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                <textarea 
                  value={ticketDescription} 
                  onChange={(e) => setTicketDescription(e.target.value)} 
                  placeholder="Detailed description of the customer issue..."
                  rows={3}
                  required 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Priority</label>
                <select 
                  value={ticketPriority} 
                  onChange={(e) => setTicketPriority(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowTicketModal(false)}
                  className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW CANNED RESPONSE */}
      {showNewCannedModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Create New Canned Response</h3>
            <p className="text-xs text-slate-400 mb-4">Add a shortcut macro for fast customer support replies.</p>
            
            <form onSubmit={handleAddCannedResponse} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Shortcut Code</label>
                <input 
                  type="text" 
                  value={newCannedCode} 
                  onChange={(e) => setNewCannedCode(e.target.value)}
                  required 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Title</label>
                <input 
                  type="text" 
                  value={newCannedTitle} 
                  onChange={(e) => setNewCannedTitle(e.target.value)} 
                  placeholder="e.g. Refund Policy"
                  required 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Message Text</label>
                <textarea 
                  value={newCannedText} 
                  onChange={(e) => setNewCannedText(e.target.value)} 
                  placeholder="Full canned reply text..."
                  rows={3}
                  required 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white" 
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowNewCannedModal(false)}
                  className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Save Macro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INVITE AGENT VIA EMAIL */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Invite New Agent</h3>
            <p className="text-xs text-slate-400 mb-4">An email verification link will be sent to the team member.</p>
            
            <form onSubmit={handleInviteAgent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Agent Name</label>
                <input 
                  type="text" 
                  value={inviteName} 
                  onChange={(e) => setInviteName(e.target.value)} 
                  placeholder="e.g. Ali Khan"
                  required 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={inviteEmail} 
                  onChange={(e) => setInviteEmail(e.target.value)} 
                  placeholder="agent@example.com"
                  required 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Role</label>
                <select 
                  value={inviteRole} 
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Agent">Agent</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowInviteModal(false)}
                  className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Send Invite Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}