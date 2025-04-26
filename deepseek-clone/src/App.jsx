// App.jsx or App.tsx
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FiSend, FiCopy, FiTrash2, FiSun, FiMoon } from 'react-icons/fi';
import { IoSparkles } from 'react-icons/io5';
import { BsRobot } from 'react-icons/bs';

function App() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const responseRef = useRef(null);

  const cleanResponse = (text) => {
    return text.replace(/<think>|<\/think>/gi, '').trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const newMessages = [...messages, { type: 'user', text: prompt }];
    setMessages(newMessages);
    setPrompt('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:3001/api/chat', { prompt });
      const cleaned = cleanResponse(res.data.response);
      setMessages((prev) => [...prev, { type: 'bot', text: cleaned }]);
    } catch (err) {
      setMessages((prev) => [...prev, { type: 'bot', text: '❌ Error: ' + err.message }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  const handleNewChat = () => {
    if (messages.length > 0 && window.confirm('Start a new chat?')) {
      setMessages([]);
      setPrompt('');
    }
  };

  const renderBotMessage = (text) => (
    <ReactMarkdown
      children={text}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              {...props}
              className="rounded-md my-2 text-sm overflow-x-auto"
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code
              className={`px-1 py-0.5 rounded text-sm ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'}`}
              {...props}
            >
              {children}
            </code>
          );
        },
        p: ({ children }) => <p className="mb-2 text-sm leading-relaxed">{children}</p>,
      }}
    />
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
      {/* Floating Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full opacity-5 ${darkMode ? 'bg-purple-300' : 'bg-indigo-200'}`}
            style={{
              width: `${Math.random() * 80 + 30}px`,
              height: `${Math.random() * 80 + 30}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 15 + 5}s linear infinite`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <BsRobot className={`text-3xl ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              DeepSeek Chat
            </h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'}`}
            >
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>
            <button
              onClick={handleNewChat}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm ${darkMode ? 'bg-gray-700 text-red-300 hover:bg-gray-600' : 'bg-white text-red-500 hover:bg-gray-100 shadow-sm'}`}
            >
              <FiTrash2 className="text-sm" />
              <span>Clear</span>
            </button>
          </div>
        </header>

        {/* Chat container */}
        <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          {/* Messages area */}
          <div className="h-[65vh] overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className={`p-3 rounded-full mb-4 ${darkMode ? 'bg-gray-700 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                  <IoSparkles className="text-3xl" />
                </div>
                <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  How can I assist you today?
                </h2>
                <p className={`max-w-md text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Ask me anything - coding help, creative ideas, or general knowledge.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    ref={idx === messages.length - 1 ? responseRef : null}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl p-3 ${msg.type === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : darkMode
                          ? 'bg-gray-700 text-white rounded-bl-none'
                          : 'bg-gray-50 text-gray-800 rounded-bl-none'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          {msg.type === 'user' ? (
                            <div className="w-5 h-5 rounded-full flex items-center justify-center bg-indigo-500">
                              <span className="text-xs font-medium text-white">U</span>
                            </div>
                          ) : (
                            <BsRobot className={`text-sm ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                          )}
                          <span className="text-xs font-medium">
                            {msg.type === 'user' ? 'You' : 'AI'}
                          </span>
                        </div>
                        {msg.type === 'bot' && (
                          <button
                            onClick={() => handleCopy(msg.text, idx)}
                            className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                            title="Copy"
                          >
                            <FiCopy className={`text-sm ${copiedIndex === idx ? (darkMode ? 'text-green-400' : 'text-green-600') : ''}`} />
                          </button>
                        )}
                      </div>
                      <div className="text-sm whitespace-pre-wrap">
                        {msg.type === 'bot' ? renderBotMessage(msg.text) : msg.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input area */}
          <div className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'}`}>
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <div className="flex-1 relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className={`w-full p-3 pr-10 rounded-lg focus:outline-none focus:ring-2 resize-none transition-all ${darkMode ? 'bg-gray-700 text-white border-gray-600 focus:ring-indigo-500' : 'bg-gray-50 border-gray-300 focus:ring-indigo-500'}`}
                  placeholder="Type your message..."
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className={`absolute right-2 bottom-2 p-1.5 rounded-md ${loading || !prompt.trim()
                    ? darkMode ? 'text-gray-500' : 'text-gray-400'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                >
                  <FiSend className="text-sm" />
                </button>
              </div>
            </form>
            <p className={`text-xs mt-2 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              AI responses may not always be accurate. Please verify important information.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0) rotate(0deg); }
          50% { transform: translateY(-15px) translateX(5px) rotate(2deg); }
          100% { transform: translateY(0) translateX(0) rotate(0deg); }
        }
        body {
          overscroll-behavior-y: none;
        }
      `}</style>
    </div>
  );
}

export default App;
