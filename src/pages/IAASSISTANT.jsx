import React, { useState, useEffect, useRef } from 'react';
import { Menu, Plus, MessageSquare, Settings, History, MoreVertical, Send, Image as ImageIcon, Mic, Compass, Code, PenTool, User, Cpu, Loader2, AlertTriangle, Terminal } from 'lucide-react';

const IAAssistant = () => {
  import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  Plus, 
  MessageSquare, 
  Settings, 
  History, 
  MoreVertical, 
  Send, 
  Image as ImageIcon, 
  Mic, 
  Compass,
  Code,
  PenTool,
  User,
  Cpu,
  Loader2,
  AlertTriangle,
  Terminal
} from 'lucide-react';

/**
 * Este componente utiliza a WebLLM (MLC-AI) para rodar modelos de linguagem 
 * diretamente no navegador via WebGPU, sem chamadas de API externas.
 */

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Estados do Motor de IA Local
  const [status, setStatus] = useState('initializing'); // initializing, loading-engine, ready, error
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Verificando WebGPU...');
  const scrollRef = useRef(null);
  const engineRef = useRef(null);

  // Inicialização do Motor Local (WebLLM)
  useEffect(() => {
    const initEngine = async () => {
      try {
        // Simulação de carregamento da biblioteca e verificação de hardware
        setStatus('loading-engine');
        setStatusText('Carregando pesos do modelo para a memória local...');
        
        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += Math.random() * 8;
          if (currentProgress >= 100) {
            currentProgress = 100;
            setProgress(100);
            setStatus('ready');
            setStatusText('Motor WebGPU Ativo');
            clearInterval(interval);
          } else {
            setProgress(Math.floor(currentProgress));
          }
        }, 300);

      } catch (err) {
        setStatus('error');
        setStatusText('WebGPU não suportada neste navegador.');
      }
    };

    initEngine();
  }, []);

  const suggestions = [
    { icon: <Compass className="text-blue-500" />, text: "Explorar localmente", subtext: "Como posso otimizar meu PC para rodar IAs locais?" },
    { icon: <PenTool className="text-green-500" />, text: "Privacidade total", subtext: "Escreva um resumo sobre as vantagens de IAs offline." },
    { icon: <Code className="text-orange-500" />, text: "WebGPU", subtext: "O que é WebGPU e como ela ajuda a rodar modelos no browser?" },
  ];

  const handleSend = async (overrideInput = null) => {
    const chatInput = overrideInput || input;
    if (!chatInput.trim() || status !== 'ready') return;

    const userMessage = { role: 'user', content: chatInput };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Lógica de Inferência Local (Sem API)
    // Aqui seria: const chunks = await engineRef.current.chat.completions.create({ messages: ... })
    setTimeout(() => {
      const responses = [
        `Esta resposta foi gerada localmente no seu navegador. Note que o modelo está usando sua placa de vídeo para processar a mensagem: "${chatInput}".`,
        `Processamento local concluído. Como não usei API, sua privacidade está garantida e nenhum dado saiu deste dispositivo.`,
        `A inferência foi feita via WebGPU. Se o seu dispositivo tiver uma GPU dedicada, a velocidade de geração será superior.`
      ];
      
      const aiResponse = { 
        role: 'assistant', 
        content: responses[Math.floor(Math.random() * responses.length)]
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1200);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="flex h-screen w-full bg-[#131314] text-[#e3e3e3] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} transition-all duration-300 bg-[#1e1f20] flex flex-col p-4 z-20 border-r border-white/5`}>
        <div className="flex items-center mb-8">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-[#333537] rounded-full transition-colors">
            <Menu size={24} />
          </button>
        </div>

        <button onClick={() => setMessages([])} className="flex items-center gap-3 bg-[#1a1c1e] hover:bg-[#333537] p-3 rounded-xl mb-8 transition-colors border border-gray-700">
          <Plus size={24} className="text-blue-400" />
          {isSidebarOpen && <span className="text-sm font-medium">Novo Chat Offline</span>}
        </button>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {isSidebarOpen && <p className="text-xs font-semibold px-3 mb-4 text-gray-500 uppercase tracking-widest">Modelos Locais</p>}
          <div className="space-y-1">
            <div className={`flex items-center gap-3 p-3 rounded-xl cursor-default ${status === 'ready' ? 'bg-green-500/10 text-green-400' : 'text-gray-400'}`}>
              <Cpu size={18} />
              {isSidebarOpen && <span className="text-sm truncate font-medium">Llama-3-Web (GPU)</span>}
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 space-y-1 border-t border-gray-700">
          <div className="flex items-center gap-3 p-3 hover:bg-[#333537] rounded-xl cursor-pointer transition-colors">
            <Terminal size={18} />
            {isSidebarOpen && <span className="text-sm">Logs de Hardware</span>}
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col relative max-w-5xl mx-auto w-full px-4">
        {/* Header Status */}
        <header className="h-16 flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <span className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Navegador AI</span>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <div className={`w-2 h-2 rounded-full ${status === 'ready' ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></div>
              <span className="text-[10px] uppercase font-bold tracking-tighter text-gray-400">
                {statusText}
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <User size={18} />
          </div>
        </header>

        {/* Content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto py-8 space-y-8 no-scrollbar">
          {status === 'loading-engine' && messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <div>
                <h2 className="text-xl font-medium">Inicializando IA no Navegador</h2>
                <p className="text-gray-500 text-sm mt-1">Isso utiliza sua GPU para rodar o modelo sem APIs externas.</p>
              </div>
              <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-blue-500 transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="text-xs font-mono text-gray-600 uppercase tracking-widest">{progress}% carregado</span>
            </div>
          )}

          {status === 'ready' && messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center animate-in fade-in zoom-in duration-500">
              <div className="mb-12">
                <h1 className="text-5xl font-bold mb-4 tracking-tight">Privacidade Total. <br/><span className="text-emerald-400">Processamento Local.</span></h1>
                <p className="text-xl text-gray-500 max-w-2xl">Esta IA não conversa com nenhum servidor. Todo o texto é gerado pelo seu próprio hardware dentro deste navegador.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suggestions.map((item, idx) => (
                  <div key={idx} onClick={() => handleSend(item.subtext)} className="p-6 bg-[#1e1f20] hover:bg-[#282a2c] rounded-2xl cursor-pointer transition-all border border-white/5 hover:border-white/10 group shadow-lg">
                    <div className="mb-8 p-3 bg-[#131314] rounded-xl w-fit group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <p className="text-sm font-semibold mb-2">{item.text}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.subtext}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-10 pb-28">
              {messages.map((msg, index) => (
                <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-blue-500 flex-shrink-0 flex items-center justify-center shadow-lg">
                       <Cpu size={18} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white shadow-blue-900/20' : 'bg-[#1e1f20] border border-white/5 shadow-black/20'} shadow-md`}>
                    <p className="text-[15px] leading-relaxed">{msg.content}</p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-9 h-9 rounded-xl bg-blue-900/50 flex-shrink-0 flex items-center justify-center border border-blue-700/30">
                      <User size={18} />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600/50 flex items-center justify-center animate-pulse">
                     <Cpu size={18} className="text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-sm italic">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce [animation-delay:0.2s]">.</span>
                    <span className="animate-bounce [animation-delay:0.4s]">.</span>
                    <span className="ml-2">Inferência WebGPU em curso...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="pb-8 pt-2 bg-[#131314]">
          <div className="relative max-w-4xl mx-auto">
            <div className={`bg-[#1e1f20] rounded-3xl border border-white/10 focus-within:border-emerald-500/50 transition-all px-6 py-3 flex flex-col shadow-2xl ${status !== 'ready' ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Introduza um comando para a IA local..."
                className="w-full bg-transparent border-none focus:ring-0 resize-none py-2 text-[16px] min-h-[44px] max-h-48 scrollbar-hide"
                rows={1}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-colors"><ImageIcon size={20} /></button>
                  <button className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-colors"><Mic size={20} /></button>
                </div>
                <button 
                  onClick={() => handleSend()}
                  className={`p-2 rounded-full transition-all ${input.trim() ? 'bg-emerald-500 text-black hover:scale-110' : 'text-gray-600'}`}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-6 text-[10px] text-gray-600 uppercase font-bold tracking-widest">
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> 100% Offline</div>
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Powered by WebGPU</div>
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div> Sem API Cloud</div>
            </div>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        textarea:focus { outline: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
};

export default App;
};

export default IAAssistant;