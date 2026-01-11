import { useState } from 'react';
import { loginWithKeychain, hasKeychain } from '../lib/hive';
import { User, LogOut, Key } from 'lucide-react';

export default function LoginButton({ username, onLogin, onLogout }) {
  const [isHovered, setIsHovered] = useState(false);
  const [inputUser, setInputUser] = useState('');
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  const triggerLogin = async () => {
    if (!hasKeychain()) return alert("Please install Hive Keychain Extension!");
    if (!inputUser) return alert("Please enter your username first!");

    try {
      await loginWithKeychain(inputUser);
      onLogin(inputUser);
      setIsPromptOpen(false);
    } catch (err) {
      alert("Login Failed: " + err.message);
    }
  };

  // State 1: Logged In
  if (username) {
    return (
      <div 
        className="relative"
        onMouseEnter={() => setIsHovered(true)} 
        onMouseLeave={() => setIsHovered(false)}
      >
        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200 text-sm font-bold text-gray-700">
          <img 
            src={`https://images.hive.blog/u/${username}/avatar/small`} 
            alt={username} 
            className="w-5 h-5 rounded-full bg-gray-300"
            onError={(e) => e.target.style.display = 'none'} // Hide if no avatar
          />
          {username}
        </button>

        {isHovered && (
          <button 
            onClick={onLogout}
            className="absolute top-full right-0 mt-1 w-full bg-white border border-red-100 text-red-500 text-xs py-2 rounded shadow-lg flex items-center justify-center gap-1 hover:bg-red-50 z-50 cursor-pointer"
          >
            <LogOut size={12} /> Logout
          </button>
        )}
      </div>
    );
  }

  // State 2: Asking for Username
  if (isPromptOpen) {
    return (
      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right duration-200">
        <input 
          type="text" 
          placeholder="Hive Username" 
          className="border border-gray-300 rounded px-2 py-1 text-sm w-32 focus:outline-none focus:border-hive"
          value={inputUser}
          onChange={(e) => setInputUser(e.target.value.toLowerCase())}
          onKeyDown={(e) => e.key === 'Enter' && triggerLogin()}
          autoFocus
        />
        <button onClick={triggerLogin} className="bg-hive text-white p-1.5 rounded hover:opacity-90">
          <Key size={16} />
        </button>
        <button onClick={() => setIsPromptOpen(false)} className="text-gray-400 text-xs hover:text-gray-600">Cancel</button>
      </div>
    );
  }

  // State 3: Logged Out (Default)
  return (
    <button 
      onClick={() => setIsPromptOpen(true)}
      className="flex items-center gap-2 px-4 py-1.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition text-sm font-medium"
    >
      <User size={16} /> Login
    </button>
  );
}