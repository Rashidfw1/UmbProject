
import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { streamChatResponse } from '../services/geminiService';
import { useLocalization } from '../hooks/useLocalization';
// Fix: Use relative paths for local module imports.
import { ChatIcon, SendIcon, XIcon, UmbrellaIcon } from './Icons';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLocalization();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'model', text: t('chatbotWelcome') }]);
    }
  }, [isOpen, messages.length, t]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const stream = await streamChatResponse(input);
      let modelResponse = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      for await (const chunk of stream) {
        // Fix: Direct access to text property from the response chunk
        const chunkText = chunk.text;
        modelResponse += chunkText;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'model', text: modelResponse };
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I am having trouble connecting. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 bg-brand-gold text-white p-4 rounded-full shadow-lg hover:bg-brand-dark transition-colors duration-300 z-50"
        aria-label="Toggle Chatbot"
      >
        {isOpen ? <XIcon className="w-7 h-7" /> : <ChatIcon className="w-7 h-7" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 rtl:right-auto rtl:left-6 w-full max-w-sm h-[60vh] bg-white rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200">
          <header className="bg-brand-dark text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UmbrellaIcon className="w-6 h-6 text-brand-gold" />
              <h3 className="font-serif text-xl font-semibold">{t('chatbotTitle')}</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
              <XIcon className="w-5 h-5" />
            </button>
          </header>

          <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto bg-brand-light/50 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg rounded-2xl px-4 py-2 ${
                    msg.role === 'user' ? 'bg-brand-gold text-white rounded-br-none' : 'bg-gray-200 text-brand-dark rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex justify-start">
                   <div className="bg-gray-200 text-brand-dark rounded-2xl rounded-bl-none px-4 py-2">
                       <div className="flex items-center space-x-1 rtl:space-x-reverse">
                           <span className="w-2 h-2 bg-brand-gray rounded-full animate-pulse delay-75"></span>
                           <span className="w-2 h-2 bg-brand-gray rounded-full animate-pulse delay-150"></span>
                           <span className="w-2 h-2 bg-brand-gray rounded-full animate-pulse delay-300"></span>
                       </div>
                   </div>
               </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('chatbotPlaceholder')}
                className="w-full py-2 pl-4 pr-12 rtl:pl-12 rtl:pr-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-brand-gold focus:outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="absolute top-1/2 -translate-y-1/2 right-2 rtl:right-auto rtl:left-2 bg-brand-gold text-white p-2 rounded-full hover:bg-brand-dark disabled:bg-gray-300 transition-colors"
                disabled={isLoading || !input.trim()}
              >
                <SendIcon className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;