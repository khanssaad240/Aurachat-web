import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";

// Firebase Configuration
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
    id: '12890545',
    visitorName: 'Visitor #12890545',
    visitorEmail: 'visitor_1289@web.io',
    location: 'Hayatabad, Peshawar, Pakistan',
    lat: 33.9935,
    lng: 71.4274,
    browser: 'Chrome 130 • Windows',
    status: 'active',
    assignedTeam: 'General Support',
    assignedAgent: 'Haris Yousafzai',
    ticketBadge: null,
    unread: 1,
    messages: [
      { id: 'm1', sender: 'visitor', senderName: 'Visitor #12890545', text: 'Hello sir, I need help with my deposit.', timestamp: '05:58 PM', type: 'text' },
      { id: 'm2', sender: 'agent', senderName: 'Haris Yousafzai', text: 'Hello! How can we assist you today?', timestamp: '05:59 PM', type: 'text' }
    ]
  },
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
        text: 'Welcome to AuraChat Support! I am Sofia, your AI assistant. How can I help you today? Please choose an option below or type your query:',
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

const INITIAL_CANNED = [
  { code: '#1', title: 'Check Details', text: 'Sir, we are checking your details. Please wait a moment while we update you.' },
  { code: '#2', title: 'Payment Screenshot', text: 'Kindly share the screenshot of your payment receipt so we can verify.' },
  { code: '#3', title: 'Deposit Verified', text: 'Your deposit ticket has been verified and credited to your account!' },
  { code: '#4', title: 'Greeting & Help', text: 'Hello! Welcome to AuraSupport. How can we assist you today?' }
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
  const [cannedList, setCannedList] = useState(INITIAL_CANNED);
  const [ticketsList, setTicketsList] = useState([]);

  const [selectedConvId, setSelectedConvId] = useState('773726619');
  const [agentInput, setAgentInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAcceptingChats, setIsAcceptingChats] = useState(true);
  const [showCannedMenu, setShowCannedMenu] = useState(false);

  // Floating 24/7 Customer Widget Toggle State
  const [isOpenChatWidget, setIsOpenChatWidget] = useState(isCustomerLink);
  const [customerActiveTab, setCustomerActiveTab] = useState('messages');
  const [customerInput, setCustomerInput] = useState('');
  const [aiStep, setAiStep] = useState('menu');
  const [assignedHumanAgent, setAssignedHumanAgent] = useState(null);

  useEffect(() => {
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

    const ticketsRef = ref(db, 'tickets');
    const unsubscribeTickets = onValue(ticketsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setTicketsList(data);
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

  const selectedConversation = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const transferToLeastBusyAgent = (convId, customerText = null) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const availableAgents = registeredUsers.filter(u => u.status === 'Accepting chats');
    const chosenAgent = availableAgents.length > 0
      ? [...availableAgents].sort((a, b) => (a.activeChats || 0) - (b.activeChats || 0))[0]
      : registeredUsers[0];

    const newMessages = [];
    if (customerText) {
      newMessages.push({ id: `cust_${Date.now()}`, sender: 'visitor', senderName: 'Mohsin', text: customerText, timestamp: timeNow, type: 'text' });
    }

    newMessages.push({
      id: `ai_transfer_${Date.now() + 1}`,
      sender: 'ai',
      senderName: 'Sofia (AI Assistant)',
      text: `Transferring you to an available agent who is free or has fewer active chats... Connected with ${chosenAgent.name} (${chosenAgent.role}).`,
      timestamp: timeNow,
      type: 'system'
    });

    const updated = conversations.map(conv => {
      if (conv.id === convId) {
        return {
          ...conv,
          assignedAgent: chosenAgent.name,
          unread: (conv.unread || 0) + 1,
          messages: [...(conv.messages || []), ...newMessages]
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

    if (option === 'deposit') {
      const userMsg = { id: `c_${Date.now()}`, sender: 'visitor', senderName: 'Mohsin', text: 'I have a Deposit issue', timestamp: timeNow, type: 'text' };
      const aiReply = {
        id: `ai_${Date.now() + 1}`,
        sender: 'ai',
        senderName: 'Sofia (AI Assistant)',
        text: 'I can help you create a priority Deposit Ticket. Please reply with your User ID, Deposit Amount, and Transaction Reference ID.',
        timestamp: timeNow,
        type: 'text'
      };
      const updated = conversations.map(c => c.id === convId ? { ...c, messages: [...(c.messages || []), userMsg, aiReply] } : c);
      setConversations(updated);
      set(ref(db, 'conversations'), updated);
      setAiStep('deposit_details');
    } else if (option === 'withdrawal') {
      const userMsg = { id: `c_${Date.now()}`, sender: 'visitor', senderName: 'Mohsin', text: 'I have a Withdrawal query', timestamp: timeNow, type: 'text' };
      const aiReply = {
        id: `ai_${Date.now() + 1}`,
        sender: 'ai',
        senderName: 'Sofia (AI Assistant)',
        text: 'Please provide your User ID and Withdrawal Amount. I will immediately forward your request to our support agent.',
        timestamp: timeNow,
        type: 'text'
      };
      const updated = conversations.map(c => c.id === convId ? { ...c, messages: [...(c.messages || []), userMsg, aiReply] } : c);
      setConversations(updated);
      set(ref(db, 'conversations'), updated);
      setAiStep('withdrawal_details');
    } else if (option === 'agent') {
      transferToLeastBusyAgent(convId, 'I want to talk to live customer support.');
    }
  };

  const handleSendCustomerMessage = (e) => {
    e.preventDefault();
    if (!customerInput.trim()) return;

    const convId = '773726619';
    const text = customerInput.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCustomerInput('');

    const wantsAgent = /agent|human|support|representative|person|talk to/i.test(text);
    if (wantsAgent && aiStep !== 'agent_connected') {
      transferToLeastBusyAgent(convId, text);
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
        text: `✅ Deposit Ticket #${ticketId} created successfully! Details: "${text}". Would you like me to connect you to a live agent?`,
        timestamp: timeNow,
        type: 'text'
      };

      const updated = conversations.map(c => c.id === convId ? { ...c, ticketBadge: `🎫 ${ticketId} (Deposit)`, messages: [...(c.messages || []), userMsg, aiConfirm] } : c);
      setConversations(updated);
      set(ref(db, 'conversations'), updated);
      setAiStep('menu');
    } else if (aiStep === 'withdrawal_details') {
      transferToLeastBusyAgent(convId, text);
    } else {
      const updated = conversations.map(c => c.id === convId ? { ...c, messages: [...(c.messages || []), userMsg] } : c);
      setConversations(updated);
      set(ref(db, 'conversations'), updated);
    }
  };

  const handleSendAgentMessage = (targetId, customText = null, msgType = 'text') => {
    const textToSend = customText || agentInput;
    if (!textToSend.trim()) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = { id: `agent_${Date.now()}`, sender: 'agent', senderName: currentAgent.name, text: textToSend, timestamp: timeNow, type: msgType };

    const updatedConversations = conversations.map(conv =>
      conv.id === targetId ? { ...conv, assignedAgent: currentAgent.name, messages: [...conv.messages, newMsg], unread: 0 } : conv
    );

    setConversations(updatedConversations);
    set(ref(db, 'conversations'), updatedConversations);
    setAgentInput('');
    setShowCannedMenu(false);
  };

  const resetCustomerAiChat = () => {
    const convId = '773726619';
    const resetMsg = [{
      id: `welcome_${Date.now()}`,
      sender: 'ai',
      senderName: 'Sofia (AI Assistant)',
      text: 'Welcome to AuraChat Support! I am Sofia, your AI assistant. How can I help you today? Please choose an option below:',
      timestamp: 'Just now',
      type: 'text'
    }];
    const updated = conversations.map(c => c.id === convId ? { ...c, assignedAgent: 'Sofia (AI)', ticketBadge: null, messages: resetMsg } : c);
    setConversations(updated);
    set(ref(db, 'conversations'), updated);
    setAiStep('menu');
    setAssignedHumanAgent(null);
  };

  // If opened via ?chat=true, show ONLY clean Customer Chat Widget
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
            <button onClick={resetCustomerAiChat} className="text-[11px] bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-xl text-amber-300">↻ Reset</button>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-950/50 p-4 space-y-3">
            {customerActiveTab === 'home' ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-900/40 to-slate-900 p-5 rounded-2xl border border-purple-500/20">
                  <h2 className="text-lg font-bold text-white">Hi Dear,</h2>
                  <h3 className="text-xl font-bold text-purple-400 mb-3">How can we help?</h3>
                  <div className="space-y-2 text-xs">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between"><span>Alternate Site 1</span><span>↗</span></div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between"><span>Alternate Site 2</span><span>↗</span></div>
                  </div>
                </div>
                <div onClick={() => setCustomerActiveTab('messages')} className="bg-purple-600 text-white p-4 rounded-2xl font-bold text-sm flex justify-between items-center cursor-pointer shadow-lg">
                  <span>Send us a message</span><span>💬</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-amber-400">Notice for all Users :</div>
                  <p className="text-slate-300">If your deposit is rejected, wait 10 minutes or use Sofia AI to create a priority ticket / connect with an agent.</p>
                </div>

                {conversations.find(c => c.id === '773726619')?.messages?.map((m, idx) => (
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
                    <button onClick={() => handleAiOptionClick('deposit')} className="bg-slate-800 hover:bg-purple-600 border border-slate-700 text-white text-xs px-3 py-1.5 rounded-full transition">💳 Deposit Issue (Ticket)</button>
                    <button onClick={() => handleAiOptionClick('withdrawal')} className="bg-slate-800 hover:bg-purple-600 border border-slate-700 text-white text-xs px-3 py-1.5 rounded-full transition">💸 Withdrawal Issue</button>
                    <button onClick={() => handleAiOptionClick('agent')} className="bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 text-xs px-3 py-1.5 rounded-full font-semibold">👨‍💻 Talk to Live Agent</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {customerActiveTab === 'messages' && (
            <form onSubmit={handleSendCustomerMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
              <input type="text" value={customerInput} onChange={(e) => setCustomerInput(e.target.value)} placeholder="Type your message in English..." className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
              <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-semibold">Send</button>
            </form>
          )}

          <div className="grid grid-cols-2 border-t border-slate-800 bg-slate-950 p-2 text-center text-xs">
            <button onClick={() => setCustomerActiveTab('home')} className={`py-2 rounded-xl font-medium ${customerActiveTab === 'home' ? 'bg-purple-600/20 text-purple-300' : 'text-slate-400'}`}>🏠 Home</button>
            <button onClick={() => setCustomerActiveTab('messages')} className={`py-2 rounded-xl font-medium ${customerActiveTab === 'messages' ? 'bg-purple-600/20 text-purple-300' : 'text-slate-400'}`}>💬 Messages</button>
          </div>
        </div>
      </div>
    );
  }

  // If Agent is not logged in, show Login Screen with 24/7 Floating Chat Widget button
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
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl shadow-lg transition text-sm">
              {authMode === 'signin' ? 'Sign In to Console' : 'Create Account & Join'}
            </button>
          </form>
        </div>

        {/* BOTTOM-RIGHT FLOATING 24/7 CHAT BUTTON FOR VISITORS */}
        <div className="fixed bottom-6 right-6 z-50">
          {!isOpenChatWidget ? (
            <button 
              onClick={() => setIsOpenChatWidget(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-3.5 rounded-full shadow-2xl flex items-center space-x-2 font-bold text-sm transition transform hover:scale-105 border border-purple-400/30 animate-bounce"
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
                <button onClick={() => setIsOpenChatWidget(false)} className="text-slate-400 hover:text-white font-bold text-sm px-2">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-950/40 text-xs">
                {conversations.find(c => c.id === '773726619')?.messages?.map((m, idx) => (
                  <div key={idx} className={`flex ${m.sender === 'visitor' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-2.5 rounded-xl ${m.sender === 'visitor' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                      <div>{m.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2 border-t border-slate-800 bg-slate-950 flex space-x-1">
                <input type="text" value={customerInput} onChange={(e) => setCustomerInput(e.target.value)} placeholder="Type message..." className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white" />
                <button onClick={handleSendCustomerMessage} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">Send</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // AGENT CONSOLE (When Agent is Logged In)
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
          <button onClick={() => setIsAcceptingChats(!isAcceptingChats)} className={`px-3 py-1 rounded-lg font-semibold flex items-center space-x-2 transition ${isAcceptingChats ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
            <span className={`w-2 h-2 rounded-full ${isAcceptingChats ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            <span>{isAcceptingChats ? 'Accepting Chats' : 'Not Accepting'}</span>
          </button>
          <span className="text-slate-400 border-l border-slate-800 pl-3">👑 {currentAgent.name}</span>
          <button onClick={() => setIsLoggedIn(false)} className="text-rose-400 hover:underline pl-2">Logout</button>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button onClick={() => setActiveNavTab('chats')} className={`px-3 py-1.5 rounded-lg font-medium transition ${activeNavTab === 'chats' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>💬 Agent Chats</button>
          <button onClick={() => setActiveNavTab('tickets')} className={`px-3 py-1.5 rounded-lg font-medium transition ${activeNavTab === 'tickets' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>🎫 AI Tickets ({ticketsList.length})</button>
          <button onClick={() => setActiveNavTab('team')} className={`px-3 py-1.5 rounded-lg font-medium transition ${activeNavTab === 'team' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>👥 Team</button>
        </div>
      </nav>

      {activeNavTab === 'chats' && (
        <div className="max-w-[1700px] mx-auto p-4 grid grid-cols-1 md:grid-cols-12 gap-4 h-[88vh] flex-1 w-full">
          <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-sm text-slate-200">Inbox ({conversations.length})</span>
            </div>
            <input type="text" placeholder="🔍 Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white mb-3" />
            <div className="space-y-2 overflow-y-auto flex-1">
              {conversations.map(c => (
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
                  <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${m.sender === 'visitor' ? 'bg-slate-800 text-slate-200' : m.sender === 'ai' ? 'bg-cyan-900/50 text-cyan-100' : 'bg-purple-600 text-white'}`}>
                    <div className="text-[10px] opacity-80 mb-0.5 font-semibold">{m.senderName || (m.sender === 'visitor' ? selectedConversation.visitorName : currentAgent.name)}</div>
                    <span>{m.text}</span>
                    <div className="text-[10px] text-right mt-1 opacity-70">{m.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSendAgentMessage(selectedConvId); }} className="p-3 border-t border-slate-800 bg-slate-950 flex items-center space-x-2">
              <input type="text" value={agentInput} onChange={(e) => setAgentInput(e.target.value)} placeholder="Reply as Live Agent..." className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none" />
              <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">Send ➔</button>
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