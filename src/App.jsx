import React, { useState, useEffect } from 'react';
import './App.css';

// --- Components ---

const NavSidebar = ({ activeView, onViewChange, sidebarOpen, setSidebarOpen }) => (
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
    <div className="nav-item logout">
      <div className="nav-icon">🚪</div>
    </div>
  </nav>
);

const FriendSidebar = ({ friends, onSelectFriend, selectedFriend, activeView, onUpdateNickname, isOpen, setIsOpen }) => (
  <aside className={`friend-sidebar ${isOpen ? 'open' : ''}`}>
    <header className="sidebar-header">
      <h2 className="display-font">{activeView === 'dms' ? 'Direct Messages' : activeView.toUpperCase()}</h2>
      <button className="add-dm">+</button>
    </header>
    <div className="friend-list">
      {friends.map(friend => (
        <div
          key={friend.id}
          className={`friend-item ${selectedFriend?.id === friend.id ? 'active' : ''}`}
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
      <div className="user-profile">
        <div className="avatar-container">
          <div className="avatar user">M</div>
          <div className="status-dot online"></div>
        </div>
        <div className="user-info truncate">
          <div className="user-name">Me</div>
          <div className="user-tag">#0001</div>
        </div>
        <div className="user-actions">
          <button title="Mute">🎙️</button>
          <button title="Settings">⚙️</button>
        </div>
      </div>
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

const LoginScreen = ({ onLogin }) => (
  <div className="login-screen glass flex-center">
    <div className="login-card">
      <div className="login-logo">💬</div>
      <h1 className="display-font">Welcome back!</h1>
      <p>We're so excited to see you again!</p>
      <div className="login-buttons">
        <button className="login-btn discord" onClick={() => onLogin('Discord')}>
          Login with Discord
        </button>
        <button className="login-btn google" onClick={() => onLogin('Google')}>
          Login with Google
        </button>
        <button className="login-btn facebook" onClick={() => onLogin('Facebook')}>
          Login with Facebook
        </button>
      </div>
    </div>
  </div>
);

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

// --- Main App ---

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState('dms');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [callState, setCallState] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Swipe Gesture State
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const [friends, setFriends] = useState([
    { id: 1, name: 'Alice', nickname: 'Ali', status: 'online', statusMessage: 'Vibing...', color: '#7289da' },
    { id: 2, name: 'Bob', status: 'idle', statusMessage: 'Away for a bit', color: '#43b581' },
    { id: 3, name: 'Charlie', status: 'dnd', statusMessage: 'Focusing', color: '#f04747' },
  ]);

  const [friendRequests, setFriendRequests] = useState([
    { id: 101, name: 'Dave', color: '#e91e63' },
    { id: 102, name: 'Eve', color: '#9c27b0' },
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, from: 'Alice', preview: 'Hey, are you free for a call?', time: '10m ago' },
  ]);

  const [userStatus, setUserStatus] = useState('online');

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

  const handleLogin = (provider) => {
    setIsLoggedIn(true);
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
      />

      <FriendSidebar
        friends={friends}
        onSelectFriend={(f) => { setSelectedFriend(f); setActiveView('dms'); }}
        selectedFriend={selectedFriend}
        activeView={activeView}
        onUpdateNickname={updateNickname}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
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
                <div className="message-welcome">
                  <div className="avatar large" style={{ backgroundColor: selectedFriend.color }}>
                    {(selectedFriend.nickname || selectedFriend.name)[0]}
                  </div>
                  <h2>{selectedFriend.nickname || selectedFriend.name}</h2>
                  <p>This is the beginning of your direct message history with @{selectedFriend.name}.</p>
                </div>
              </div>
              <div className="chat-input-container">
                <div className="chat-input-wrapper">
                  <button className="upload-btn">+</button>
                  <input type="text" placeholder={`Message @${selectedFriend.nickname || selectedFriend.name}`} />
                  <div className="input-actions">
                    <button>🎁</button>
                    <button>GIF</button>
                    <button>😀</button>
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

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
}

export default App;
