import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import api from './api';
import { io } from 'socket.io-client';

// --- Components ---

const NavSidebar = ({ activeView, onViewChange, sidebarOpen, setSidebarOpen, onLogout }) => (
  <nav className={`nav-sidebar ${sidebarOpen ? 'open' : ''}`}>
    <div
      className={`nav-item ${activeView === 'dms' ? 'active' : ''}`}
      onClick={() => { onViewChange('dms'); if (window.innerWidth <= 768) setSidebarOpen(false); }}
      title="Direct Messages"
    >
      <div className="nav-indicator"></div>
      <div className="nav-icon">💬</div>
    </div>
    <div
      className={`nav-item ${activeView === 'inbox' ? 'active' : ''}`}
      onClick={() => { onViewChange('inbox'); if (window.innerWidth <= 768) setSidebarOpen(false); }}
      title="Inbox"
    >
      <div className="nav-indicator"></div>
      <div className="nav-icon">📫</div>
    </div>
    <div
      className={`nav-item ${activeView === 'friends' ? 'active' : ''}`}
      onClick={() => { onViewChange('friends'); if (window.innerWidth <= 768) setSidebarOpen(false); }}
      title="Friend Requests"
    >
      <div className="nav-indicator"></div>
      <div className="nav-icon">👥</div>
    </div>
    <div className="nav-spacer"></div>
    <div className="nav-item logout" onClick={onLogout} title="Logout">
      <div className="nav-icon">🚪</div>
    </div>
  </nav>
);

const FriendSidebar = ({ friends, onSelectFriend, selectedFriend, activeView, onUpdateNickname, isOpen, setIsOpen, userStatus, showStatusPicker, onToggleStatusPicker, onChangeStatus, currentUser }) => (
  <aside className={`friend-sidebar ${isOpen ? 'open' : ''}`}>
    <header className="sidebar-header">
      <h2 className="display-font">{activeView === 'dms' ? 'Direct Messages' : activeView.toUpperCase()}</h2>
      <button className="add-dm">+</button>
    </header>
    <div className="friend-list">
      {friends.map(friend => (
        <div
          key={friend._id || friend.id}
          className={`friend-item ${(selectedFriend?._id === friend._id || selectedFriend?.id === friend.id) ? 'active' : ''}`}
          onClick={() => { onSelectFriend(friend); if (window.innerWidth <= 768) setIsOpen(false); }}
        >
          <div className="avatar-container">
            <div className="avatar" style={{ backgroundColor: friend.color }}>
              {(friend.nickname || friend.name)[0]}
            </div>
            <div className={`status-dot ${friend.status}`}></div>
          </div>
          <div className="friend-info">
            <div className="friend-name truncate">
              {friend.nickname || friend.name}
            </div>
            <div className="friend-status-text truncate">{friend.statusMessage}</div>
          </div>
          <button
            className="edit-nickname-btn"
            onClick={(e) => {
              e.stopPropagation();
              const newNick = prompt("Enter new nickname for " + friend.name, friend.nickname || "");
              if (newNick !== null) onUpdateNickname(friend.id, newNick);
            }}
          >
            ✏️
          </button>
        </div>
      ))}
    </div>
    <footer className="sidebar-footer">
      <div className="user-profile" onClick={() => onToggleStatusPicker()}>
        <div className="avatar-container">
          <div className="avatar user">{currentUser?.username[0] || 'M'}</div>
          <div className={`status-dot ${userStatus}`}></div>
        </div>
        <div className="user-info truncate">
          <div className="user-name">{currentUser?.username || 'Me'}</div>
          <div className="user-tag">#{currentUser?._id?.slice(-4) || '0001'}</div>
        </div>
        <div className="user-actions">
          <button title="Settings">⚙️</button>
        </div>
      </div>

      {showStatusPicker && (
        <div className="status-picker-modal">
          <button onClick={() => onChangeStatus('online')} className="status-option">
            <div className="status-dot online"></div> Online
          </button>
          <button onClick={() => onChangeStatus('idle')} className="status-option">
            <div className="status-dot idle"></div> Idle
          </button>
          <button onClick={() => onChangeStatus('dnd')} className="status-option">
            <div className="status-dot dnd"></div> Do Not Disturb
          </button>
        </div>
      )}
    </footer>
  </aside>
);

const ChatHeader = ({ title, status, actions, onMenuClick, isMobile }) => (
  <header className="chat-header">
    <div className="friend-header-info">
      {isMobile && <button className="menu-toggle" onClick={onMenuClick}>☰</button>}
      <span className="at-symbol">@</span>
      <h3 className="truncate">{title}</h3>
      {status && <div className={`status-dot ${status} inline`}></div>}
    </div>
    <div className="chat-header-actions">
      {actions}
      <button title="Search">🔍</button>
    </div>
  </header>
);

const FriendsView = ({ requests, onAccept, onDecline, onMenuClick, isMobile }) => (
  <main className="chat-area friends-view">
    <header className="chat-header">
      <div className="friend-header-info">
        {isMobile && <button className="menu-toggle" onClick={onMenuClick}>☰</button>}
        <h3>Friends</h3>
      </div>
    </header>
    <div className="friends-content">
      <div className="tabs">
        <button className="tab active">Online</button>
        <button className="tab">All</button>
        <button className="tab">Pending ({requests.length})</button>
        <button className="tab add">Add Friend</button>
      </div>
      <div className="request-list">
        {requests.length === 0 ? (
          <div className="empty-state">No pending friend requests.</div>
        ) : (
          requests.map(req => (
            <div key={req.id} className="request-item">
              <div className="avatar" style={{ backgroundColor: req.color }}>{req.name[0]}</div>
              <div className="request-info">
                <div className="name">{req.name}</div>
                <div className="type">Incoming Friend Request</div>
              </div>
              <div className="request-actions">
                <button className="accept" onClick={() => onAccept(req.id)}>✅</button>
                <button className="decline" onClick={() => onDecline(req.id)}>❌</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </main>
);

const InboxView = ({ notifications, onMenuClick, isMobile }) => (
  <main className="chat-area inbox-view">
    <header className="chat-header">
      <div className="friend-header-info">
        {isMobile && <button className="menu-toggle" onClick={onMenuClick}>☰</button>}
        <h3>Inbox</h3>
      </div>
    </header>
    <div className="inbox-content">
      {notifications.length === 0 ? (
        <div className="empty-state">You're all caught up!</div>
      ) : (
        notifications.map(note => (
          <div key={note.id} className="notification-item">
            <div className="note-icon">💬</div>
            <div className="note-text">
              <strong>{note.from}</strong> sent you a message: "{note.preview}"
            </div>
            <div className="note-time">{note.time}</div>
          </div>
        ))
      )}
    </div>
  </main>
);

const LoginScreen = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(isRegister ? 'register' : 'login', formData);
  };

  return (
    <div className="login-screen glass flex-center">
      <div className="login-card">
        <div className="login-logo">💬</div>
        <h1 className="display-font">{isRegister ? 'Create an account' : 'Welcome back!'}</h1>
        <p>{isRegister ? "We're excited to have you!" : "We're so excited to see you again!"}</p>

        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button type="submit" className="login-btn primary">
            {isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <p className="login-switch">
          {isRegister ? 'Already have an account?' : "Need an account?"}{' '}
          <span onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Login' : 'Register'}
          </span>
        </p>

        <div className="divider"><span>OR</span></div>

        <div className="login-buttons">
          <button className="login-btn discord" onClick={() => onLogin('Discord')}>
            Login with Discord
          </button>
        </div>
      </div>
    </div>
  );
};

const CallOverlay = ({ friend, type, onEnd }) => (
  <div className="call-overlay glass flex-center">
    <div className="call-container glass">
      <div className="call-user-info">
        <div className="avatar large" style={{ backgroundColor: friend.color }}>{friend.name[0]}</div>
        <h2>{friend.nickname || friend.name}</h2>
        <p className="animate-pulse">{type === 'video' ? 'Video Calling...' : 'Voice Calling...'}</p>
      </div>
      <div className="call-actions">
        <button className="call-action toggle">🎙️</button>
        {type === 'video' && <button className="call-action toggle">📹</button>}
        {type === 'video' && <button className="call-action screen-share">📺</button>}
        <button className="call-action end-call" onClick={onEnd}>🔚</button>
      </div>
    </div>
  </div>
);

const MessageBubble = ({ message, onReact, onForward }) => {
  const [showReactions, setShowReactions] = useState(false);

  return (
    <div
      className={`message-item ${message.fromMe ? 'mine' : ''}`}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      {!message.fromMe && <div className="avatar sm" style={{ backgroundColor: message.color }}>{message.sender[0]}</div>}
      <div className="message-content-wrapper">
        <div className="message-header">
          <span className="sender-name">{message.sender}</span>
          <span className="timestamp">{message.time}</span>
        </div>
        <div className="message-bubble-body">
          {message.text}
          {message.fromMe && (
            <span className={`ticks ${message.status}`}>
              {message.status === 'sent' && '✓'}
              {message.status === 'delivered' && '✓✓'}
              {message.status === 'read' && <span className="read">✓✓</span>}
            </span>
          )}
        </div>
        {message.reactions && message.reactions.length > 0 && (
          <div className="reactions-list">
            {message.reactions.map((r, i) => (
              <span key={i} className="reaction-tag">{typeof r === 'object' ? r.emoji : r}</span>
            ))}
          </div>
        )}
      </div>

      {showReactions && (
        <div className="message-actions-overlay">
          <button onClick={() => onReact(message.id, '❤️')}>❤️</button>
          <button onClick={() => onReact(message.id, '😂')}>😂</button>
          <button onClick={() => onReact(message.id, '👍')}>👍</button>
          <button onClick={() => onForward(message)}>↪️</button>
        </div>
      )}
    </div>
  );
};

// --- Main App ---

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState('dms');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [callState, setCallState] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [forwardData, setForwardData] = useState(null);
  const [userStatus, setUserStatus] = useState('online');
  const [typingStatus, setTypingStatus] = useState({});

  const socket = useRef(null);

  // Initialize Socket and User
  useEffect(() => {
    if (isLoggedIn) {
      // Connect Socket
      socket.current = io('http://localhost:5000');

      // Fetch User Info
      api.get('/auth/user').then(res => {
        setCurrentUser(res.data);
        setUserStatus(res.data.status);
        socket.current.emit('join', res.data._id);
      }).catch(() => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      });

      // Socket Listeners
      socket.current.on('message', (msg) => {
        const friendId = msg.sender === currentUser?._id ? msg.receiver : msg.sender;
        setMessages(prev => ({
          ...prev,
          [friendId]: [...(prev[friendId] || []), {
            ...msg,
            id: msg._id,
            fromMe: msg.sender === currentUser?._id,
            time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]
        }));
      });

      socket.current.on('presence', ({ userId, status }) => {
        setFriends(prev => prev.map(f => f._id === userId ? { ...f, status } : f));
      });

      socket.current.on('typing', ({ senderId, isTyping }) => {
        setTypingStatus(prev => ({ ...prev, [senderId]: isTyping }));
      });
    }

    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, [isLoggedIn]);

  // Handle Window Resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Swipe Handlers
  const handleTouchStart = (e) => {
    if (!isMobile || !selectedFriend) return;
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
  };

  const handleTouchMove = (e) => {
    if (!isMobile || !selectedFriend) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isMobile || !selectedFriend || !touchStart || !touchEnd) return;
    const distance = touchEnd - touchStart;
    const isRightSwipe = distance > 70;
    // Only trigger if starting from the left edge of the screen
    if (isRightSwipe && touchStart < 50) {
      setSelectedFriend(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setCurrentUser(null);
    if (socket.current) socket.current.disconnect();
  };

  const handleLogin = async (type, data) => {
    if (type === 'login' || type === 'register') {
      try {
        const res = await api.post(`/auth/${type}`, data);
        localStorage.setItem('token', res.token || res.data.token);
        setIsLoggedIn(true);
      } catch (err) {
        alert(err.response?.data?.msg || 'Authentication failed');
      }
    } else {
      // Mock for others
      setIsLoggedIn(true);
    }
  };

  const updateNickname = (id, newNick) => {
    setFriends(friends.map(f => f.id === id ? { ...f, nickname: newNick } : f));
  };

  const acceptRequest = (id) => {
    const req = friendRequests.find(r => r.id === id);
    setFriends([...friends, { ...req, status: 'offline', statusMessage: 'Just joined!', color: req.color }]);
    setFriendRequests(friendRequests.filter(r => r.id !== id));
  };

  const declineRequest = (id) => {
    setFriendRequests(friendRequests.filter(r => r.id !== id));
  };

  const importChat = () => {
    const json = prompt("Paste your Discord Chat JSON here (Mock):");
    if (json) alert("Chat imported successfully!");
  };

  // Fetch Friends List (all users for demo)
  useEffect(() => {
    if (isLoggedIn) {
      api.get('/users').then(res => setFriends(res.data));
    }
  }, [isLoggedIn]);

  // Fetch Message History
  useEffect(() => {
    if (isLoggedIn && selectedFriend) {
      api.get(`/messages/${selectedFriend._id || selectedFriend.id}`).then(res => {
        setMessages(prev => ({
          ...prev,
          [selectedFriend._id || selectedFriend.id]: res.data.map(msg => ({
            ...msg,
            id: msg._id,
            fromMe: msg.sender === currentUser?._id,
            time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }))
        }));
      });
    }
  }, [selectedFriend, isLoggedIn, currentUser]);

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedFriend) return;

    socket.current.emit('sendMessage', {
      senderId: currentUser._id,
      receiverId: selectedFriend._id || selectedFriend.id,
      content: newMessage
    });

    setNewMessage('');
  };

  const addReaction = async (msgId, emoji) => {
    if (!selectedFriend) return;
    try {
      const res = await api.post(`/messages/react/${msgId}`, { emoji });
      setMessages(prev => ({
        ...prev,
        [selectedFriend._id || selectedFriend.id]: prev[selectedFriend._id || selectedFriend.id].map(m =>
          m.id === msgId ? { ...m, reactions: res.data.map(r => r.emoji) } : m
        )
      }));
    } catch (err) {
      console.error('Failed to react');
    }
  };

  const handleForward = (friendId) => {
    if (!forwardData) return;
    const msg = {
      ...forwardData,
      id: Date.now(),
      sender: 'Me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fromMe: true,
      status: 'sent',
      reactions: []
    };
    setMessages(prev => ({
      ...prev,
      [friendId]: [...(prev[friendId] || []), msg]
    }));
    setForwardData(null);
    alert(`Forwarded to ${friends.find(f => f.id === friendId).name}`);
  };

  // Idle Logic
  useEffect(() => {
    let timeout;
    const resetTimer = () => {
      if (userStatus === 'idle') setUserStatus('online');
      clearTimeout(timeout);
      timeout = setTimeout(() => setUserStatus('idle'), 600000); // 10 mins
    };
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      clearTimeout(timeout);
    };
  }, [userStatus]);

  if (!isLoggedIn) return <LoginScreen onLogin={handleLogin} />;

  const isChatActiveOnMobile = isMobile && selectedFriend && activeView === 'dms';

  return (
    <div className={`app-container ${isChatActiveOnMobile ? 'mobile-chat-active' : ''}`}>
      <NavSidebar
        activeView={activeView}
        onViewChange={setActiveView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <FriendSidebar
        friends={friends}
        onSelectFriend={(f) => { setSelectedFriend(f); setActiveView('dms'); }}
        selectedFriend={selectedFriend}
        activeView={activeView}
        onUpdateNickname={updateNickname}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        userStatus={userStatus}
        showStatusPicker={showStatusPicker}
        onToggleStatusPicker={() => setShowStatusPicker(!showStatusPicker)}
        onChangeStatus={(s) => {
          setUserStatus(s);
          setShowStatusPicker(false);
          api.put('/users/status', { status: s });
        }}
        currentUser={currentUser}
      />

      {activeView === 'dms' && (
        <main
          className={`chat-area ${sidebarOpen ? 'blur' : ''}`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <ChatHeader
            title={selectedFriend ? (selectedFriend.nickname || selectedFriend.name) : "Direct Messages"}
            status={selectedFriend?.status}
            isMobile={isMobile}
            onMenuClick={() => setSidebarOpen(true)}
            actions={selectedFriend && (
              <>
                <button title="Call" onClick={() => setCallState({ friend: selectedFriend, type: 'voice' })}>📞</button>
                <button title="Video Call" onClick={() => setCallState({ friend: selectedFriend, type: 'video' })}>📹</button>
                <button title="Import Chat" onClick={importChat}>📥</button>
              </>
            )}
          />

          {selectedFriend ? (
            <>
              <div className="message-list">
                {(!messages[selectedFriend._id || selectedFriend.id] || messages[selectedFriend._id || selectedFriend.id].length === 0) ? (
                  <div className="message-welcome">
                    <div className="avatar large" style={{ backgroundColor: selectedFriend.color }}>
                      {(selectedFriend.nickname || selectedFriend.name)[0]}
                    </div>
                    <h2>{selectedFriend.nickname || selectedFriend.name}</h2>
                    <p>This is the beginning of your direct message history with @{selectedFriend.name}.</p>
                  </div>
                ) : (
                  messages[selectedFriend._id || selectedFriend.id].map(msg => (
                    <MessageBubble
                      key={msg._id || msg.id}
                      message={msg}
                      onReact={addReaction}
                      onForward={(m) => setForwardData(m)}
                    />
                  ))
                )}
              </div>
              <div className="chat-input-container">
                <div className="chat-input-wrapper">
                  <button className="upload-btn">+</button>
                  <input
                    type="text"
                    placeholder={`Message @${selectedFriend.nickname || selectedFriend.name}`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <div className="input-actions">
                    <button>🎁</button>
                    <button>GIF</button>
                    <button onClick={sendMessage}>➡️</button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="welcome-screen flex-center flex-col">
              <div className="welcome-icon">👋</div>
              <h1>Select a conversation</h1>
              <p>Pick a friend from the sidebar to start chatting.</p>
            </div>
          )}
        </main>
      )}

      {activeView === 'friends' && (
        <FriendsView
          requests={friendRequests}
          onAccept={acceptRequest}
          onDecline={declineRequest}
          isMobile={isMobile}
          onMenuClick={() => setSidebarOpen(true)}
        />
      )}

      {activeView === 'inbox' && (
        <InboxView
          notifications={notifications}
          isMobile={isMobile}
          onMenuClick={() => setSidebarOpen(true)}
        />
      )}

      {callState && (
        <CallOverlay
          friend={callState.friend}
          type={callState.type}
          onEnd={() => setCallState(null)}
        />
      )}

      {forwardData && (
        <div className="forward-modal glass flex-center">
          <div className="modal-content">
            <h3>Forward Message</h3>
            <p className="preview">"{forwardData.text}"</p>
            <div className="forward-list">
              {friends.map(f => (
                <button key={f.id} onClick={() => handleForward(f.id)}>
                  {f.name}
                </button>
              ))}
            </div>
            <button className="close-btn" onClick={() => setForwardData(null)}>Cancel</button>
          </div>
        </div>
      )}

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
}

export default App;
