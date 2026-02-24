import React, { useState, useEffect } from 'react';
import './App.css';

// Components
const NavSidebar = ({ activeView, onViewChange }) => (
  <nav className="nav-sidebar">
    <div className={`nav-item ${activeView === 'dms' ? 'active' : ''}`} onClick={() => onViewChange('dms')}>
      <div className="nav-indicator"></div>
      <div className="nav-icon">💬</div>
    </div>
    <div className={`nav-item ${activeView === 'inbox' ? 'active' : ''}`} onClick={() => onViewChange('inbox')}>
      <div className="nav-indicator"></div>
      <div className="nav-icon">📫</div>
    </div>
    <div className={`nav-item ${activeView === 'friends' ? 'active' : ''}`} onClick={() => onViewChange('friends')}>
      <div className="nav-indicator"></div>
      <div className="nav-icon">👥</div>
    </div>
    <div className="nav-spacer"></div>
    <div className="nav-item logout">
      <div className="nav-icon">🚪</div>
    </div>
  </nav>
);

const FriendSidebar = ({ friends, onSelectFriend, selectedFriend, activeView, onUpdateNickname }) => (
  <aside className="friend-sidebar">
    <header className="sidebar-header">
      <h2 className="display-font">{activeView === 'dms' ? 'Direct Messages' : activeView.toUpperCase()}</h2>
      <button className="add-dm">+</button>
    </header>
    <div className="friend-list">
      {friends.map(friend => (
        <div
          key={friend.id}
          className={`friend-item ${selectedFriend?.id === friend.id ? 'active' : ''}`}
          onClick={() => onSelectFriend(friend)}
        >
          <div className="avatar-container">
            <div className="avatar" style={{ backgroundColor: friend.color }}>
              {(friend.nickname || friend.name)[0]}
            </div>
            <div className={`status-dot ${friend.status}`}></div>
          </div>
          <div className="friend-info">
            <div className="friend-name">
              {friend.nickname || friend.name}
            </div>
            <div className="friend-status-text">{friend.statusMessage}</div>
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
        <div className="user-info">
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

const FriendsView = ({ requests, onAccept, onDecline }) => (
  <main className="chat-area friends-view">
    <header className="chat-header">
      <div className="friend-header-info">
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

const InboxView = ({ notifications }) => (
  <main className="chat-area inbox-view">
    <header className="chat-header">
      <div className="friend-header-info">
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
    <div className="call-container">
      <div className="call-user-info">
        <div className="avatar large" style={{ backgroundColor: friend.color }}>{friend.name[0]}</div>
        <h2>{friend.nickname || friend.name}</h2>
        <p>{type === 'video' ? 'Video Calling...' : 'Voice Calling...'}</p>
      </div>
      <div className="call-actions">
        <button className="call-action toggle">🎙️</button>
        {type === 'video' && <button className="call-action toggle">📹</button>}
        {type === 'video' && <button className="call-action screen-share">📺 Share Screen</button>}
        <button className="call-action end-call" onClick={onEnd}>🔚</button>
      </div>
    </div>
  </div>
);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState('dms');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [callState, setCallState] = useState(null); // { friend, type }
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
  const [status, setStatus] = useState('online');

  const handleLogin = (provider) => {
    console.log(`Logging in with ${provider}`);
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
    if (json) {
      alert("Chat imported successfully!");
    }
  };

  useEffect(() => {
    let timeout;
    const resetTimer = () => {
      if (status === 'idle') setStatus('online');
      clearTimeout(timeout);
      timeout = setTimeout(() => setStatus('idle'), 600000);
    };
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      clearTimeout(timeout);
    };
  }, [status]);

  if (!isLoggedIn) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="app-container">
      <NavSidebar activeView={activeView} onViewChange={setActiveView} />
      <FriendSidebar
        friends={friends}
        onSelectFriend={(f) => { setSelectedFriend(f); setActiveView('dms'); }}
        selectedFriend={selectedFriend}
        activeView={activeView}
        onUpdateNickname={updateNickname}
      />
      {activeView === 'dms' && (
        <main className="chat-area">
          <header className="chat-header">
            <div className="friend-header-info">
              {selectedFriend ? (
                <>
                  <span className="at-symbol">@</span>
                  <h3>{selectedFriend.nickname || selectedFriend.name}</h3>
                  <div className={`status-dot ${selectedFriend.status} inline`}></div>
                </>
              ) : (
                <h3>Direct Messages</h3>
              )}
            </div>
            <div className="chat-header-actions">
              {selectedFriend && (
                <>
                  <button title="Call" onClick={() => setCallState({ friend: selectedFriend, type: 'voice' })}>📞</button>
                  <button title="Video Call" onClick={() => setCallState({ friend: selectedFriend, type: 'video' })}>📹</button>
                </>
              )}
              <button title="Import Chat" onClick={importChat}>📥</button>
              <button title="Search">🔍</button>
            </div>
          </header>
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
            <div className="welcome-screen flex-center flex-col" style={{ height: '100%' }}>
              <div className="welcome-icon" style={{ fontSize: '48px' }}>👋</div>
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
        />
      )}
      {activeView === 'inbox' && <InboxView notifications={notifications} />}

      {callState && (
        <CallOverlay
          friend={callState.friend}
          type={callState.type}
          onEnd={() => setCallState(null)}
        />
      )}
    </div>
  );
}

export default App;
