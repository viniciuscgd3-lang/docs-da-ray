import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, ShieldCheck, Send, Bot, Sparkles, Loader2, Search, MapPin, 
  Building2, Plus, ExternalLink, User, Lock, FolderPlus, Trash2, Folder, 
  Shield, Briefcase, Landmark, ClipboardList, Stethoscope, FileSignature,
  Paperclip, Mic, Image as ImageIcon, X, Edit2, RotateCcw
} from 'lucide-react';

const App = () => {
  // --- Estados de Navegação ---
  const [activeTab, setActiveTab] = useState("docs");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Estados do Chat e Histórico ---
  const [activeChatId, setActiveChatId] = useState(null);
  const [chats, setChats] = useState([]); 
  const [folders, setFolders] = useState(['Geral', 'Jurídico']); // "Projetos" removido
  const [userInput, setUserInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [attachedImage, setAttachedImage] = useState(null);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const apiKey = "AIzaSyDkniugmqLQFwL-twhEZ1ZDbnCUh-SLcyQ"; 

  const states = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
  
  const commonCities = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Salvador", "Curitiba", "Fortaleza", "Manaus", "Recife", "Porto Alegre", "Brasília", "Belém", "Goiânia", "Guarulhos", "Campinas", "São Luís", "São Gonçalo", "Maceió", "Duque de Caxias", "Natal", "Teresina", "São Bernardo do Campo", "Nova Iguaçu", "João Pessoa", "Santo André", "Osasco", "Jundiaí", "Ribeirão Preto", "Sorocaba", "Joinville", "Cuiabá", "Aracaju", "Londrina", "Caxias do Sul", "Niterói", "Macapá", "Florianópolis"];

  // --- Persistência de Dados ---
  useEffect(() => {
    const savedChats = localStorage.getItem('docs_ray_chats_v4');
    if (savedChats) {
      const parsed = JSON.parse(savedChats);
      setChats(parsed);
      if (parsed.length > 0) setActiveChatId(parsed[0].id);
    } else {
      createNewChat();
    }
  }, []);

  useEffect(() => {
    if (chats.length > 0) localStorage.setItem('docs_ray_chats_v4', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChatId, chats, activeTab]);

  // --- Funções da IA (Geração de Conteúdo, Imagem e Áudio) ---
  const createNewChat = () => {
    const newId = Date.now();
    const newChat = {
      id: newId,
      title: `Conversa ${chats.length + 1}`,
      folder: 'Geral',
      messages: [{ role: 'assistant', text: "Olá! Sou seu assistente de IA. Agora posso processar arquivos, gerar imagens e transcrever seus áudios. Como posso ajudar?" }]
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newId);
  };

  const renameChat = (id) => {
    const newName = prompt("Digite o novo nome para o bate-papo:");
    if (newName) {
      setChats(prev => prev.map(c => c.id === id ? { ...c, title: newName } : c));
    }
  };

  const deleteChat = (id) => {
    const filtered = chats.filter(c => c.id !== id);
    setChats(filtered);
    if (activeChatId === id && filtered.length > 0) setActiveChatId(filtered[0].id);
    else if (filtered.length === 0) createNewChat();
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() && !attachedImage) return;

    const messageText = userInput;
    const currentImage = attachedImage;

    // Adiciona mensagem do usuário
    setChats(prev => prev.map(c => c.id === activeChatId ? { 
      ...c, 
      messages: [...c.messages, { role: 'user', text: messageText, image: currentImage }] 
    } : c));
    
    setUserInput("");
    setAttachedImage(null);
    setIsTyping(true);

    try {
      // Lógica para Geração de Imagem se o usuário pedir
      if (messageText.toLowerCase().includes("gere uma imagem") || messageText.toLowerCase().includes("crie uma imagem")) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`, {
          method: 'POST',
          body: JSON.stringify({ instances: { prompt: messageText }, parameters: { sampleCount: 1 } })
        });
        const result = await response.json();
        const imageUrl = `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
        
        setChats(prev => prev.map(c => c.id === activeChatId ? { 
          ...c, 
          messages: [...c.messages, { role: 'assistant', text: "Aqui está a imagem que você solicitou:", generatedImage: imageUrl }] 
        } : c));
      } else {
        // Geração de Texto / Multimodal
        const payload = {
          contents: [{
            parts: [
              { text: messageText },
              ...(currentImage ? [{ inlineData: { mimeType: "image/png", data: currentImage.split(',')[1] } }] : [])
            ]
          }]
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Desculpe, tive um problema ao processar sua solicitação.";
        
        setChats(prev => prev.map(c => c.id === activeChatId ? { 
          ...c, 
          messages: [...c.messages, { role: 'assistant', text }] 
        } : c));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (rev) => setAttachedImage(rev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulação de início de gravação
      setTimeout(() => {
        setIsRecording(false);
        setUserInput("Transcrição simulada: Preciso de ajuda para organizar meus documentos médicos.");
      }, 3000);
    }
  };

  // --- Lógica de Documentos ---
  const docData = [
    {
      category: "1. Documentos da Empresa (CNPJ)",
      icon: <Building2 />,
      items: [
        { name: "Cartão CNPJ (Ativo)", level: "federal", url: "https://solucoes.receita.fazenda.gov.br/servicos/cnpjreva/cnpjreva_solicitacao.asp" },
        { name: "Contrato Social / Estatuto", level: "federal", url: "https://www.gov.br/empresas-e-negocios/pt-br/redesim" },
        { name: "Certidão Simplificada Junta Comercial", level: "estadual", url: "https://www.google.com/search?q=Certidão+Simplificada+Junta+Comercial+" }
      ]
    },
    {
      category: "2. Certidões Fiscais e Tributárias",
      icon: <Shield />,
      items: [
        { name: "CND Federal (Receita/PGFN)", level: "federal", url: "https://servicos.receitafederal.gov.br/servico/certidoes/#/home/cnpj" },
        { name: "Certidão Negativa Estadual (ICMS)", level: "estadual", url: "https://www.google.com/search?q=Certidão+Negativa+Estadual+Sefaz+" },
        { name: "Certidão Negativa Municipal (ISS)", level: "municipal", url: "https://www.google.com/search?q=Certidão+Negativa+Municipal+Tributos+" }
      ]
    },
    {
      category: "3. Trabalhista e Previdenciária",
      icon: <Briefcase />,
      items: [
        { name: "Regularidade FGTS (CRF)", level: "federal", url: "https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf" },
        { name: "Certidão Negativa Trabalhista (CNDT)", level: "federal", url: "https://www.tst.jus.br/certidao" }
      ]
    },
    {
      category: "4. Registros em Saúde",
      icon: <Stethoscope />,
      items: [
        { name: "Certidão de Regularidade PJ (CRM)", level: "estadual", url: "https://portal.cfm.org.br/servicos-para-medicos/certidao" },
        { name: "Alvará Sanitário", level: "municipal", url: "https://www.google.com/search?q=Alvará+Sanitário+Vigilância+Sanitária+" },
        { name: "Cadastro no CNES", level: "federal", url: "https://cnes.datasus.gov.br/" }
      ]
    },
    {
      category: "5. Licenças Municipais",
      icon: <Landmark />,
      items: [
        { name: "Alvará de Funcionamento", level: "municipal", url: "https://www.google.com/search?q=Alvará+de+Funcionamento+Prefeitura+" },
        { name: "Licença Bombeiros (AVCB/CLCB)", level: "estadual", url: "https://www.google.com/search?q=Licença+Corpo+de+Bombeiros+AVCB+" }
      ]
    },
    {
      category: "8. Seguros e Compliance",
      icon: <Lock />,
      items: [
        { name: "Seguro Resp. Civil Médica", level: "federal", url: "https://www.google.com/search?q=Seguro+Responsabilidade+Civil+Médica+Cotação" },
        { name: "Contrato Coleta Resíduos (RSS)", level: "municipal", url: "https://www.google.com/search?q=Empresa+Coleta+Resíduos+Saúde+" }
      ]
    }
  ];

  const resetFilters = () => {
    setSelectedState("");
    setSelectedCity("");
    setCityInput("");
    setSearchTerm("");
  };

  const handleCitySearch = () => {
    if (cityInput.trim()) {
      setSelectedCity(cityInput.trim());
      setShowCitySuggestions(false);
    }
  };

  const filteredDocs = docData.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      searchTerm === "" || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  const currentChat = chats.find(c => c.id === activeChatId) || chats[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col h-screen overflow-hidden text-slate-900 font-sans">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shrink-0 z-50 shadow-sm">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><ShieldCheck size={20} /></div>
            <span className="font-black text-lg tracking-tight uppercase">DOCS DA <span className="text-blue-600">RAY</span></span>
          </div>
          <nav className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button onClick={() => setActiveTab("docs")} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${activeTab === "docs" ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
              <FileText size={16}/> Gestão Documental
            </button>
            <button onClick={() => setActiveTab("ai")} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${activeTab === "ai" ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
              <Bot size={16}/> IA Assistant
            </button>
          </nav>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* DOCUMENTAÇÃO */}
        {activeTab === "docs" && (
          <main className="flex-1 overflow-y-auto p-10 bg-slate-50/50">
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="relative w-full">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                <input type="text" placeholder="Pesquisar nome do documento..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-200 rounded-[24px] py-5 pl-16 pr-6 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
              </div>

              <section className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">1. Estado</label>
                    <button onClick={resetFilters} className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline"><RotateCcw size={12}/> Limpar</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {states.map(uf => (
                      <button key={uf} onClick={() => setSelectedState(uf)} className={`w-11 h-9 rounded-xl text-[11px] font-bold border transition-all ${selectedState === uf ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400'}`}>{uf}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2. Município (Busca)</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-4 top-4 text-slate-300" size={18}/>
                      <input type="text" value={cityInput} onChange={(e) => { setCityInput(e.target.value); setShowCitySuggestions(true); }} placeholder="Pesquise sua cidade..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:border-blue-500 transition-all"/>
                      {showCitySuggestions && cityInput.length > 1 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto">
                          {commonCities.filter(c => c.toLowerCase().includes(cityInput.toLowerCase())).map(city => (
                            <button key={city} onClick={() => { setCityInput(city); setSelectedCity(city); setShowCitySuggestions(false); }} className="w-full text-left px-5 py-3 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">{city}</button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={handleCitySearch} className="bg-blue-600 text-white px-6 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center"><Search size={20}/></button>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocs.map((cat, i) => (
                  <div key={i} className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                      <div className="p-2 bg-white rounded-xl text-blue-600 shadow-sm">{cat.icon}</div>
                      <h3 className="text-[11px] font-black uppercase text-slate-700 leading-tight">{cat.category}</h3>
                    </div>
                    <div className="p-5 space-y-2.5 flex-1">
                      {cat.items.map((item, idx) => {
                        const isVisible = item.level === 'federal' || (item.level === 'estadual' && selectedState) || (item.level === 'municipal' && selectedCity);
                        const finalUrl = item.level === 'municipal' ? `${item.url}${selectedCity}+${selectedState}` : (item.level === 'estadual' ? `${item.url}${selectedState}` : item.url);
                        return (
                          <a key={idx} href={isVisible ? finalUrl : "#"} target={isVisible ? "_blank" : "_self"} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isVisible ? 'bg-slate-50 border-transparent hover:border-blue-200 hover:bg-blue-50/50 group' : 'opacity-30 cursor-not-allowed bg-slate-100 border-transparent'}`}>
                            <div className="flex flex-col">
                              <span className={`text-[11px] font-bold ${isVisible ? 'text-slate-700 group-hover:text-blue-600' : 'text-slate-400'}`}>{item.name}</span>
                              <span className="text-[8px] font-black uppercase mt-1 text-slate-400">{item.level}</span>
                            </div>
                            {isVisible && <ExternalLink size={14} className="text-slate-300 group-hover:text-blue-600"/>}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        )}

        {/* IA ASSISTANT */}
        {activeTab === "ai" && (
          <div className="flex-1 flex animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
            <aside className="w-72 border-r border-slate-200 bg-white flex flex-col shrink-0">
               <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Chats</span>
                  <div className="flex gap-1">
                    <button onClick={() => { const n = prompt("Nova Pasta:"); if(n) setFolders([...folders, n])}} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><FolderPlus size={16}/></button>
                    <button onClick={createNewChat} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 transition-all"><Plus size={16}/></button>
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {folders.map(folder => (
                    <div key={folder} className="space-y-1">
                      <p className="px-2 text-[9px] font-black text-slate-400 uppercase flex items-center gap-2 mb-2"><Folder size={12}/> {folder}</p>
                      {chats.filter(c => c.folder === folder).map(c => (
                        <div key={c.id} className={`group relative flex items-center rounded-xl transition-all ${activeChatId === c.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}>
                          <button onClick={() => setActiveChatId(c.id)} className="flex-1 text-left p-3 text-xs font-bold truncate">{c.title}</button>
                          <div className="opacity-0 group-hover:opacity-100 flex items-center pr-2">
                            <button onClick={() => renameChat(c.id)} className="p-1 hover:text-blue-600"><Edit2 size={12}/></button>
                            <button onClick={() => deleteChat(c.id)} className="p-1 hover:text-red-500"><Trash2 size={12}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
               </div>
            </aside>

            <div className="flex-1 flex flex-col bg-white">
              <div className="flex-1 overflow-y-auto p-10 space-y-8">
                <div className="max-w-4xl mx-auto space-y-10">
                  {currentChat?.messages.map((m, i) => (
                    <div key={i} className={`flex gap-6 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center shadow-md ${m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white'}`}>
                        {m.role === 'user' ? <User size={20}/> : <Bot size={20}/>}
                      </div>
                      <div className={`max-w-[80%] leading-relaxed ${m.role === 'user' ? 'bg-slate-100 p-6 rounded-[32px] rounded-tr-none' : 'pt-2'}`}>
                        {m.image && <img src={m.image} alt="Anexo" className="mb-4 rounded-2xl max-h-60 border border-slate-200"/>}
                        {m.generatedImage && <img src={m.generatedImage} alt="IA Gerada" className="mb-4 rounded-2xl shadow-xl border-4 border-white"/>}
                        <p className="whitespace-pre-wrap text-sm text-slate-800">{m.text}</p>
                      </div>
                    </div>
                  ))}
                  {isTyping && <div className="flex items-center gap-3 text-blue-500 font-black text-[10px] uppercase animate-pulse"><Loader2 size={16} className="animate-spin"/> Processando...</div>}
                  <div ref={chatEndRef} />
                </div>
              </div>

              <div className="p-10 bg-white border-t border-slate-100">
                <div className="max-w-3xl mx-auto space-y-4">
                  {attachedImage && (
                    <div className="relative inline-block">
                      <img src={attachedImage} className="w-20 h-20 rounded-xl object-cover border-2 border-blue-500"/>
                      <button onClick={() => setAttachedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12}/></button>
                    </div>
                  )}
                  <div className="bg-slate-100 border-2 border-transparent focus-within:border-blue-500 focus-within:bg-white rounded-[32px] p-2 flex items-end shadow-sm transition-all">
                    <button onClick={() => fileInputRef.current.click()} className="p-4 text-slate-400 hover:text-blue-600"><Paperclip size={20}/></button>
                    <input type="file" ref={fileInputRef} hidden onChange={handleFileUpload} accept="image/*" />
                    <button onClick={toggleRecording} className={`p-4 transition-all ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-blue-600'}`}><Mic size={20}/></button>
                    <textarea rows="1" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()} placeholder="Pergunte qualquer coisa ou gere uma imagem..." className="flex-1 bg-transparent border-none outline-none text-sm font-medium py-4 px-2 resize-none"/>
                    <button onClick={handleSendMessage} className="bg-blue-600 text-white p-4 rounded-full hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all"><Send size={20} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
