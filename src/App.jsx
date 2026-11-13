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
    visitorName: 'Mohsin',
    visitorEmail: 'mohsin4567801@gmail.com',
    location: 'Islamabad, Pakistan',
    lat: 33.6844,
    lng: 73.0479,
    browser: 'Safari 18 • iPhone',
    status: 'active',
    assignedTeam: 'General Support',
    assignedAgent: 'Sofia (AI)',
    ticketBadge: null,
    unread: 0,
    messages: [
      {
        id: 'welcome_ai',
        sender: 'ai',
        senderName: 'Sofia (AI Assistant)',
        text: 'Welcome to AuraChat 24/7 Support! I am Sofia. How can I help you with your deposit, withdrawal, or account today?',
        timestamp: 'Just now',
        type: 'text'
      }
    ]
  }
];

const INITIAL_TEAM = [
  { id: 't1', name: 'Haris Yousafzai', email: 'harrytech0000@gmail.com', role: 'Admin', status: 'Accepting chats', activeChats: 1, limit: 10 },
  { id: 't2', name: 'Mr. Mohsin', email: 'mohsin4567801@gmail.com', role: 'Agent', status: 'Accepting chats', activeChats: 0, limit: 8 }
];

export default function App() {
  const isCustomerLink = new URLSearchParams(window.location.search).get('chat') === 'true';

  const [authMode, setAuthMode] = useState('signin');
  const [isLoggedIn, setIsLoggedIn] = useState(isCustomerLink);
  const [emailInput, setEmailInput] = useState('harrytech0000@gmail.com');
  const [passwordInput, setPasswordInput] = useState('••••••••');
  const [nameInput, setNameInput] = useState('Haris Yousafzai');
  const [currentAgent, setCurrentAgent] = useState({ name: 'Haris Yousafzai', role: 'Admin', email: 'harrytech0000@gmail.com' });

  const [registeredUsers, setRegisteredUsers] = useState(INITIAL_TEAM);
  const [activeNavTab, setActiveNavTab] = useState('chats');
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [ticketsList, setTicketsList] = useState([]);

  const [selectedConvId, setSelectedConvId] = useState('773726619');
  const [agentInput, setAgentInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAcceptingChats, setIsAcceptingChats] = useState(true);

  // Floating Widget State
  const [isOpenChatWidget, setIsOpenChatWidget] = useState(isCustomerLink);
  const [customerInput, setCustomerInput] = useState('');
  const [aiStep, setAiStep] = useState('menu');
  const [assignedHumanAgent, setAssignedHumanAgent] = useState(null);

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
  const currentConv = safeConversations.find(c => c.id === '773726619') || INITIAL_CONVERSATIONS[0];
  const selectedConversation = safeConversations.find((c) => c.id === selectedConvId) || currentConv;

  const triggerLiveAgentTransfer = (convId, customUserText = null) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const availableAgents = registeredUsers.filter(u => u.status === 'Accepting chats');
    const chosenAgent = availableAgents.length > 0
      ? [...availableAgents].sort((a, b) => (a.activeChats || 0) - (b.activeChats || 0))[0]
      : registeredUsers[0] || { name: 'Haris Yousafzai', role: 'Admin' };

    const targetConv = safeConversations.find(c => c.id === convId) || currentConv;
    const existingMsgs = targetConv.messages || [];

    const newMessages = [...existingMsgs];
    if (customUserText) {
      newMessages.push({ id: `cust_${Date.now()}`, sender: 'visitor', senderName: 'Mohsin', text: customUserText, timestamp: timeNow, type: 'text' });
    }

    newMessages.push({
      id: `ai_transfer_${Date.now() + 1}`,
      sender: 'ai',
      senderName: 'Sofia (AI Assistant)',
      text: `Connected with live support agent: ${chosenAgent.name} (${chosenAgent.role}). They will reply shortly!`,
      timestamp: timeNow,
      type: 'system'
    });

    const updated = safeConversations.map(conv => {
      if (conv.id === convId) {
        return {
          ...conv,
          assignedAgent: chosenAgent.name,
          unread: (conv.unread || 0) + 1,
          messages: newMessages
        };
      }
      return conv;
    });

    setConversations(updated);
    set(ref(db, 'conversations'), updated);
    setAssignedHumanAgent(chosenAgent.name);
    setAiStep('agent_connected');
  };

  const handleAiOptionClick = (option) => {
    const convId = '773726619';
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetConv = safeConversations.find(c => c.id === convId) || currentConv;
    const existingMsgs = targetConv.messages || [];

    if (option === 'deposit') {
      const userMsg = { id: `c_${Date.now()}`, sender: 'visitor', senderName: 'Mohsin', text: 'I have a Deposit issue', timestamp: timeNow, type: 'text' };
      const aiReply = {
        id: `ai_${Date.now() + 1}`,
        sender: 'ai',
        senderName: 'Sofia (AI Assistant)',
        text: 'Please reply with your User ID, Deposit Amount, and Transaction Reference ID to create a priority ticket.',
        timestamp: timeNow,
        type: 'text'
      };
      const updated = safeConversations.map(c => c.id === convId ? { ...c, messages: [...existingMsgs, userMsg, aiReply] } : c);
      setConversations(updated);
      set(ref(db, 'conversations'), updated);
      setAiStep('deposit_details');
    } else if (option === 'withdrawal') {
      const userMsg = { id: `c_${Date.now()}`, sender: 'visitor', senderName: 'Mohsin', text: 'I have a Withdrawal query', timestamp: timeNow, type: 'text' };
      const aiReply = {
        id: `ai_${Date.now() + 1}`,
        sender: 'ai',
        senderName: 'Sofia (AI Assistant)',
        text: 'Please provide your User ID and Withdrawal Amount. I will forward this to our support agent.',
        timestamp: timeNow,
        type: 'text'
      };
      const updated = safeConversations.map(c => c.id === convId ? { ...c, messages: [...existingMsgs, userMsg, aiReply] } : c);
      setConversations(updated);
      set(ref(db, 'conversations'), updated);
      setAiStep('withdrawal_details');
    } else if (option === 'agent') {
      triggerLiveAgentTransfer(convId, 'I want to talk to live customer support.');
    }
  };

  const handleSendCustomerMessage = (e) => {
    e.preventDefault();
    if (!customerInput.trim()) return;

    const convId = '773726619';
    const text = customerInput.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCustomerInput('');

    const targetConv = safeConversations.find(c => c.id === convId) || currentConv;
    const existingMsgs = targetConv.messages || [];

    const wantsAgent = /agent|human|support|representative|person|talk to/i.test(text);
    if (wantsAgent && aiStep !== 'agent_connected') {
      triggerLiveAgentTransfer(convId, text);
      return;
    }

    const userMsg = { id: `cust_${Date.now()}`, sender: 'visitor', senderName: 'Mohsin', text, timestamp: timeNow, type: 'text' };

    if (aiStep === 'deposit_details') {
      const ticketId = `DEP-${Math.floor(100000 + Math.random() * 900000)}`;
      const newTicket = { id: ticketId, type: 'Deposit', customer: 'Mohsin', details: text, status: 'Open', createdAt: timeNow };
      const updatedTickets = [newTicket, ...ticketsList];
      setTicketsList(updatedTickets);
      set(ref(db, 'tickets'), updatedTickets);

      const aiConfirm = {
        id: `ai_${Date.now() + 1}`,
        sender: 'ai',
        senderName: 'Sofia (AI Assistant)',
        text: `✅ Deposit Ticket #${ticketId} created! Connecting you to an agent...`,
        timestamp: timeNow,
        type: 'text'
      };

      const updated = safeConversations.map(c => c.id === convId ? { ...c, ticketBadge: `🎫 ${ticketId} (Deposit)`, messages: [...existingMsgs, userMsg, aiConfirm] } : c);
      setConversations(updated);
      set(ref(db, 'conversations'), updated);
      triggerLiveAgentTransfer(convId);
    } else if (aiStep === 'withdrawal_details') {
      triggerLiveAgentTransfer(convId, text);
    } else {
      const updated = safeConversations.map(c => c.id === convId ? { ...c, messages: [...existingMsgs, userMsg] } : c);
      setConversations(updated);
      set(ref(db, 'conversations'), updated);
    }
  };

  const handleSendAgentMessage = (targetId, customText = null, msgType = 'text') => {
    const textToSend = customText || agentInput;
    if (!textToSend.trim()) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = { id: `agent_${Date.now()}`, sender: 'agent', senderName: currentAgent.name, text: textToSend, timestamp: timeNow, type: msgType };

    const targetConv = safeConversations.find(c => c.id === targetId) || currentConv;
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

  const resetCustomerAiChat = () => {
    const convId = '773726619';
    const resetMsg = [{
      id: `welcome_${Date.now()}`,
      sender: 'ai',
      senderName: 'Sofia (AI Assistant)',
      text: 'Welcome to AuraChat 24/7 Support! I am Sofia. How can I help you with your deposit, withdrawal, or account today?',
      timestamp: 'Just now',
      type: 'text'
    }];
    const updated = safeConversations.map(c => c.id === convId ? { ...c, assignedAgent: 'Sofia (AI)', ticketBadge: null, messages: resetMsg } : c);
    setConversations(updated);
    set(ref(db, 'conversations'), updated);
    setAiStep('menu');
    setAssignedHumanAgent(null);
  };

  // Direct Customer Link view (?chat=true)
  if (isCustomerLink) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh] max-w-md w-full">
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center font-bold text-white text-xs">
                {assignedHumanAgent ? assignedHumanAgent[0] : 'AI'}
              </div>
              <div>
                <div className="text-sm font-bold text-white">{assignedHumanAgent ? `${assignedHumanAgent} (Live Agent)` : 'Sofia (AI Support)'}</div>
                <div className="text-[10px] text-emerald-400">● 24/7 Live Support Active</div>
              </div>
            </div>
            <button type="button" onClick={resetCustomerAiChat} className="text-[11px] bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-xl text-amber-300 cursor-pointer">↻ Reset</button>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-950/50 p-4 space-y-3">
            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-xs space-y-1">
              <div className="font-bold text-amber-400">Notice for all Users :</div>
              <p className="text-slate-300">For deposit, withdrawal or account issues, choose an option below or talk directly to our live support team.</p>
            </div>

            {currentConv.messages?.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'visitor' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[82%] p-3 rounded-2xl text-xs ${m.sender === 'visitor' ? 'bg-purple-600 text-white' : m.type === 'system' ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-200' : 'bg-slate-800 text-slate-200'}`}>
                  <div className="font-bold text-[9px] opacity-75 mb-0.5">{m.sender === 'visitor' ? 'You' : (m.senderName || 'Sofia (AI)')}</div>
                  <div>{m.text}</div>
                  <div className="text-[9px] opacity-60 text-right mt-1">{m.timestamp}</div>
                </div>
              </div>
            ))}

            {aiStep !== 'agent_connected' && (
              <div className="pt-2 flex flex-wrap gap-2">
                <button type="button" onClick={() => handleAiOptionClick('deposit')} className="bg-slate-800 hover:bg-purple-600 border border-slate-700 text-white text-xs px-3 py-1.5 rounded-full transition cursor-pointer">💳 Deposit Issue (Ticket)</button>
                <button type="button" onClick={() => handleAiOptionClick('withdrawal')} className="bg-slate-800 hover:bg-purple-600 border border-slate-700 text-white text-xs px-3 py-1.5 rounded-full transition cursor-pointer">💸 Withdrawal Issue</button>
                <button type="button" onClick={() => handleAiOptionClick('agent')} className="bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 text-xs px-3 py-1.5 rounded-full font-semibold cursor-pointer">👨‍💻 Talk to Live Agent</button>
              </div>
            )}
          </div>

          <form onSubmit={handleSendCustomerMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
            <input type="text" value={customerInput} onChange={(e) => setCustomerInput(e.target.value)} placeholder="Type your message..." className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
            <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">Send</button>
          </form>
        </div>
      </div>
    );
  }

  // Login Screen with Floating 24/7 Chat Widget
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
          <div className="text-center mb-6">
            <div className="bg-purple-600 w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-2xl font-bold mb-3 shadow-lg shadow-purple-600/30">📍</div>
            <h1 className="text-2xl font-bold tracking-tight text-white">AuraChat Enterprise Pro</h1>
            <p className="text-xs text-slate-400 mt-1">Agent Login & Support Console</p>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6 text-xs font-semibold">
            <button type="button" onClick={() => setAuthMode('signin')} className={`flex-1 py-2 rounded-lg transition ${authMode === 'signin' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>Sign In</button>
            <button type="button" onClick={() => setAuthMode('signup')} className={`flex-1 py-2 rounded-lg transition ${authMode === 'signup' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>Sign Up</button>
          </div>

          <form onSubmit={authMode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white" />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
              <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white" />
            </div>
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl shadow-lg transition text-sm cursor-pointer">
              {authMode === 'signin' ? 'Sign In to Console' : 'Create Account & Join'}
            </button>
          </form>
        </div>

        {/* BOTTOM-RIGHT FLOATING 24/7 CHAT BUTTON */}
        <div className="fixed bottom-6 right-6 z-50">
          {!isOpenChatWidget ? (
            <button 
              type="button"
              onClick={() => setIsOpenChatWidget(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-3.5 rounded-full shadow-2xl flex items-center space-x-2 font-bold text-sm transition transform hover:scale-105 border border-purple-400/30 animate-bounce cursor-pointer"
            >
              <span>💬</span>
              <span>24/7 Live Support</span>
            </button>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[520px] w-[360px]">
              <div className="bg-slate-950 p-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white text-xs">AI</div>
                  <span className="text-xs font-bold text-white">Sofia (24/7 Support)</span>
                </div>
                <button type="button" onClick={() => setIsOpenChatWidget(false)} className="text-slate-400 hover:text-white font-bold text-sm px-2 cursor-pointer">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-950/40 text-xs">
                {currentConv.messages?.map((m, idx) => (
                  <div key={idx} className={`flex ${m.sender === 'visitor' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-2.5 rounded-xl ${m.sender === 'visitor' ? 'bg-purple-600 text-white' : m.type === 'system' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-slate-800 text-slate-200'}`}>
                      <div>{m.text}</div>
                    </div>
                  </div>
                ))}

                {aiStep !== 'agent_connected' && (
                  <div className="pt-2 flex flex-wrap gap-1">
                    <button type="button" onClick={() => handleAiOptionClick('deposit')} className="bg-slate-800 hover:bg-purple-600 text-white text-[10px] px-2.5 py-1 rounded-full cursor-pointer">💳 Deposit Issue</button>
                    <button type="button" onClick={() => handleAiOptionClick('withdrawal')} className="bg-slate-800 hover:bg-purple-600 text-white text-[10px] px-2.5 py-1 rounded-full cursor-pointer">💸 Withdrawal</button>
                    <button type="button" onClick={() => handleAiOptionClick('agent')} className="bg-emerald-600/30 text-emerald-300 text-[10px] px-2.5 py-1 rounded-full font-semibold cursor-pointer">👨‍💻 Live Agent</button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendCustomerMessage} className="p-2 border-t border-slate-800 bg-slate-950 flex space-x-1">
                <input type="text" value={customerInput} onChange={(e) => setCustomerInput(e.target.value)} placeholder="Type message..." className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white" />
                <button type="submit" className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer">Send</button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  // AGENT CONSOLE
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      <nav className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 px-6 py-2.5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-600 p-2 rounded-xl text-white font-bold text-lg">📍</div>
          <div>
            <span className="text-xl font-bold text-white">AuraChat</span>
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full ml-2 border border-purple-500/30 font-semibold">Enterprise Pro</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <button type="button" onClick={() => setIsAcceptingChats(!isAcceptingChats)} className={`px-3 py-1 rounded-lg font-semibold flex items-center space-x-2 transition ${isAcceptingChats ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
            <span className={`w-2 h-2 rounded-full ${isAcceptingChats ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            <span>{isAcceptingChats ? 'Accepting Chats' : 'Not Accepting'}</span>
          </button>
          <span className="text-slate-400 border-l border-slate-800 pl-3">👑 {currentAgent.name}</span>
          <button type="button" onClick={() => setIsLoggedIn(false)} className="text-rose-400 hover:underline pl-2 cursor-pointer">Logout</button>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button type="button" onClick={() => setActiveNavTab('chats')} className={`px-3 py-1.5 rounded-lg font-medium transition ${activeNavTab === 'chats' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white cursor-pointer'}`}>💬 Agent Chats</button>
          <button type="button" onClick={() => setActiveNavTab('tickets')} className={`px-3 py-1.5 rounded-lg font-medium transition ${activeNavTab === 'tickets' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white cursor-pointer'}`}>🎫 AI Tickets ({ticketsList.length})</button>
          <button type="button" onClick={() => setActiveNavTab('team')} className={`px-3 py-1.5 rounded-lg font-medium transition ${activeNavTab === 'team' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white cursor-pointer'}`}>👥 Team</button>
        </div>
      </nav>

      {activeNavTab === 'chats' && (
        <div className="max-w-[1700px] mx-auto p-4 grid grid-cols-1 md:grid-cols-12 gap-4 h-[88vh] flex-1 w-full">
          <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-sm text-slate-200">Inbox ({safeConversations.length})</span>
            </div>
            <input type="text" placeholder="🔍 Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white mb-3" />
            <div className="space-y-2 overflow-y-auto flex-1">
              {safeConversations.map(c => (
                <div key={c.id} onClick={() => setSelectedConvId(c.id)} className={`p-3 rounded-xl cursor-pointer border transition ${selectedConvId === c.id ? 'bg-purple-600/20 border-purple-500/50' : 'bg-slate-950 border-slate-800'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs text-white">{c.visitorName}</span>
                    <span className="text-[10px] text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded">{c.assignedAgent || 'AI'}</span>
                  </div>
                  {c.ticketBadge && <div className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded mb-1 inline-block font-semibold">{c.ticketBadge}</div>}
                  <p className="text-xs text-slate-400 truncate">{c.messages?.[c.messages.length - 1]?.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-white">{selectedConversation.visitorName}</span>
                  <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-0.5 rounded">Assigned: {selectedConversation.assignedAgent || 'Sofia (AI)'}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/30">
              {selectedConversation.messages?.map((m, idx) => (
                <div key={idx} className={`flex ${m.sender === 'visitor' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                    m.sender === 'visitor'
                      ? 'bg-slate-800 text-slate-200'
                      : m.sender === 'ai'
                      ? 'bg-cyan-900/50 text-cyan-100'
                      : 'bg-purple-600 text-white'
                  }`}>
                    <div className="text-[10px] opacity-80 mb-0.5 font-semibold">{m.senderName || (m.sender === 'visitor' ? selectedConversation.visitorName : currentAgent.name)}</div>
                    
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

            <form onSubmit={(e) => { e.preventDefault(); handleSendAgentMessage(selectedConvId); }} className="p-3 border-t border-slate-800 bg-slate-950 flex items-center space-x-2">
              <input type="file" ref={fileInputRef} onChange={handleFileUploadFromPC} className="hidden" accept="image/*,video/*" />
              <button type="button" onClick={() => fileInputRef.current.click()} className="text-slate-400 hover:text-white p-2.5 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer">📁</button>
              <input type="text" value={agentInput} onChange={(e) => setAgentInput(e.target.value)} placeholder="Reply as Live Agent..." className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none" />
              <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer">Send ➔</button>
            </form>
          </div>

          <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Visitor Live GPS Pin</h3>
            <div className="w-full h-52 rounded-xl overflow-hidden border border-slate-800">
              <iframe title="GPS Pin" width="100%" height="100%" style={{ border: 0 }} loading="lazy" src={`https://maps.google.com/maps?q=${selectedConversation.lat},${selectedConversation.lng}&z=14&output=embed`} />
            </div>
          </div>
        </div>
      )}

      {activeNavTab === 'tickets' && (
        <div className="max-w-5xl mx-auto p-8 flex-1 w-full">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-1">🎫 AI Generated Deposit Tickets</h2>
            {ticketsList.length === 0 ? <p className="text-xs text-slate-500">No tickets yet.</p> : (
              <div className="space-y-3">
                {ticketsList.map((t, i) => (
                  <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between">
                    <div>
                      <div className="font-bold text-sm text-amber-400">{t.id} • {t.customer}</div>
                      <p className="text-xs text-slate-300">{t.details}</p>
                    </div>
                    <span className="text-xs text-emerald-300">{t.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeNavTab === 'team' && (
        <div className="max-w-5xl mx-auto p-8 flex-1 w-full">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">Team Members</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {registeredUsers.map(u => (
                <div key={u.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between">
                  <div>
                    <div className="font-bold text-sm text-white">{u.name} ({u.role})</div>
                    <div className="text-xs text-slate-400">{u.email}</div>
                  </div>
                  <span className="text-xs text-emerald-400">{u.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}