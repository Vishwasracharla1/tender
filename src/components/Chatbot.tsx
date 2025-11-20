import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Paperclip, Loader2, FileText, Image as ImageIcon, Bot } from 'lucide-react';
import { interactWithChatbotAgent, uploadFileToCDN } from '../services/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
}

interface ChatbotProps {
  department?: string;
  document?: string;
}

export function Chatbot({ department, document }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Generate welcome message with context
  const welcomeText = (() => {
    let text = 'Hello! How can I help you with the tender evaluation today?';
    if (department) {
      text += `\n\nI see you're working on: ${department}`;
    }
    // Document name removed as per user request
    return text;
  })();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: welcomeText,
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate or retrieve session ID
  useEffect(() => {
    if (!sessionId) {
      const storedSessionId = sessionStorage.getItem('chatbot_session_id');
      if (storedSessionId) {
        setSessionId(storedSessionId);
      } else {
        const newSessionId = crypto.randomUUID();
        setSessionId(newSessionId);
        sessionStorage.setItem('chatbot_session_id', newSessionId);
      }
    }
  }, [sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() && selectedFiles.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    // Add file messages if any
    const fileMessages: Message[] = selectedFiles.map((file, index) => {
      const isImage = file.type.startsWith('image/');
      return {
        id: `file-${Date.now()}-${index}`,
        text: file.name,
        sender: 'user',
        timestamp: new Date(),
        imageUrl: isImage ? URL.createObjectURL(file) : undefined,
        fileUrl: !isImage ? URL.createObjectURL(file) : undefined,
        fileName: file.name,
        fileType: file.type,
      };
    });

    setMessages((prev) => [...prev, userMessage, ...fileMessages]);
    const currentQuery = inputText;
    const currentFiles = [...selectedFiles];
    setInputText('');
    setSelectedFiles([]);
    setIsLoading(true);

    try {
      // Upload files to CDN if any
      const fileUrls: string[] = [];
      if (currentFiles.length > 0) {
        for (const file of currentFiles) {
          try {
            const uploadResponse = await uploadFileToCDN(file, 'CMS');
            fileUrls.push(uploadResponse.cdn_url);
            console.log(`✅ File ${file.name} uploaded: ${uploadResponse.cdn_url}`);
          } catch (uploadError) {
            console.error(`❌ Error uploading file ${file.name}:`, uploadError);
            // Continue with other files even if one fails
          }
        }
      }

      // Call agent API
      const response = await interactWithChatbotAgent(
        currentQuery || 'Please analyze the attached files.',
        fileUrls,
        sessionId
      );

      // Extract response text - check response.data.text first (this is where the API returns it)
      let responseText = 'I received your message.';
      
      console.log('📦 Full response:', response);
      
      if (response.data) {
        // Check for text field in response.data (primary location)
        if (response.data.text && typeof response.data.text === 'string') {
          responseText = response.data.text;
          console.log('✅ Found text in response.data.text:', responseText);
        } else if (typeof response.data === 'string') {
          responseText = response.data;
          console.log('✅ Found text as string in response.data:', responseText);
        } else if (response.data.response && typeof response.data.response === 'string') {
          responseText = response.data.response;
          console.log('✅ Found text in response.data.response:', responseText);
        } else if (response.data.answer && typeof response.data.answer === 'string') {
          responseText = response.data.answer;
          console.log('✅ Found text in response.data.answer:', responseText);
        } else if (response.data.data && typeof response.data.data === 'string') {
          responseText = response.data.data;
          console.log('✅ Found text in response.data.data:', responseText);
        } else if (response.msg) {
          responseText = response.msg;
          console.log('✅ Found text in response.msg:', responseText);
        } else {
          // Last resort: stringify the data
          responseText = JSON.stringify(response.data, null, 2);
          console.log('⚠️ Using stringified response.data:', responseText);
        }
      } else if (response.text && typeof response.text === 'string') {
        responseText = response.text;
        console.log('✅ Found text in response.text:', responseText);
      } else if (response.msg) {
        responseText = response.msg;
        console.log('✅ Found text in response.msg:', responseText);
      } else {
        console.warn('⚠️ No text found in response, using default message');
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('❌ Error calling chatbot agent:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: error instanceof Error 
          ? `Sorry, I encountered an error: ${error.message}` 
          : 'Sorry, I encountered an error processing your request. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const isImageFile = (file: File) => file.type.startsWith('image/');
  
  const getFileIcon = (file: File) => {
    if (isImageFile(file)) {
      return <ImageIcon className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format text response with nice CSS styling
  // Helper function to remove reference numbers like "10.07", "10.08", "10.09" etc.
  // But keep percentages (like "99.5%") and other important numbers
  const removeReferenceNumbers = (text: string): string => {
    let cleaned = text;
    
    // Remove reference numbers in parentheses like "(10.07)", "(10.08)", "(10.09)"
    cleaned = cleaned.replace(/\s*\(\d+\.\d+\)/g, '');
    
    // Remove reference numbers at the beginning with dash like "10.07 - " or "10.08 – "
    cleaned = cleaned.replace(/^\d+\.\d+\s*[-–—]\s*/g, '');
    
    // Remove standalone reference numbers at the start (like "10.07 " or "10.08 ")
    // But only if they're not followed by % (to preserve percentages)
    cleaned = cleaned.replace(/^(\d+\.\d+)\s+(?!%)/g, '');
    
    return cleaned.trim();
  };

  // Helper function to parse **text** into bold elements
  const parseBoldText = (text: string): (string | JSX.Element)[] => {
    const parts: (string | JSX.Element)[] = [];
    const regex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      // Add bold text
      parts.push(
        <strong key={`bold-${key++}`} className="font-bold">
          {match[1]}
        </strong>
      );
      lastIndex = regex.lastIndex;
    }

    // Add remaining text after the last match
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    // If no matches found, return the original text
    return parts.length > 0 ? parts : [text];
  };

  const formatTextResponse = (text: string, isUserMessage: boolean): JSX.Element => {
    if (!text) return <></>;

    // Split by newlines to process line by line
    const lines = text.split('\n').filter(l => l.trim() || l === '');
    
    return (
      <div className="space-y-2">
        {lines.map((line, index) => {
          const trimmed = line.trim();
          
          // Skip empty lines (but keep spacing)
          if (!trimmed) {
            return <div key={index} className="h-1" />;
          }
          
          // Check if it's a main heading (starts with number and period, followed by uppercase)
          const isMainHeading = /^\d+\.\s+[A-Z]/.test(trimmed);
          
          // Check if it's a subheading (all caps or ends with colon, not a list item)
          const isSubHeading = (/^[A-Z][A-Z\s]+:?$/.test(trimmed) || trimmed.endsWith(':')) && 
                               !trimmed.startsWith('-') && 
                               !trimmed.startsWith('•');
          
          // Check if it's a list item
          const isListItem = /^[-•*]\s/.test(trimmed);
          
          if (isMainHeading) {
            return (
              <h3 key={index} className={`font-bold text-base mt-4 first:mt-0 ${
                isUserMessage ? 'text-white' : 'text-gray-900'
              }`}>
                {parseBoldText(trimmed)}
              </h3>
            );
          } else if (isSubHeading) {
            return (
              <h4 key={index} className={`font-semibold text-sm mt-3 ${
                isUserMessage ? 'text-white' : 'text-gray-800'
              }`}>
                {parseBoldText(trimmed.replace(/:$/, ''))}
              </h4>
            );
          } else if (isListItem) {
            // List item - remove reference numbers and list markers
            let listContent = trimmed.replace(/^[-•*]\s+/, '');
            listContent = removeReferenceNumbers(listContent);
            return (
              <div key={index} className={`flex items-start gap-2 ${
                isUserMessage ? 'text-white/90' : 'text-gray-700'
              }`}>
                <span className={`mt-1.5 font-bold ${isUserMessage ? 'text-white' : 'text-blue-600'}`}>•</span>
                <span className="flex-1 text-sm">{parseBoldText(listContent)}</span>
              </div>
            );
          } else {
            // Regular text line - remove reference numbers
            const cleanedText = removeReferenceNumbers(trimmed);
            return (
              <p key={index} className={`text-sm leading-relaxed ${
                isUserMessage ? 'text-white/90' : 'text-gray-700'
              }`}>
                {parseBoldText(cleanedText)}
              </p>
            );
          }
        })}
      </div>
    );
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center hover:scale-110 hover:rotate-12 ${
          isOpen ? 'rotate-90 scale-95' : ''
        }`}
        aria-label="Open chatbot"
      >
        {isOpen ? (
          <X className="w-7 h-7 text-white" />
        ) : (
          <Bot className="w-8 h-8 text-white" />
        )}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-28 right-6 z-50 w-[420px] h-[650px] bg-white rounded-3xl shadow-2xl border border-gray-200/50 flex flex-col overflow-hidden backdrop-blur-sm animate-slideUp">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-5 py-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Tender Assistant</h3>
                <p className="text-white/90 text-xs font-medium">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-xl transition-all hover:rotate-90"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 bg-gradient-to-b from-gray-50 to-white space-y-4 custom-scrollbar">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mb-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-md ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-md'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                  }`}
                >
                  {message.imageUrl && (
                    <img
                      src={message.imageUrl}
                      alt="Uploaded"
                      className="max-w-full h-auto rounded-lg mb-2"
                    />
                  )}
                  {message.fileUrl && !message.imageUrl && (
                    <div className="flex items-center gap-2 p-2 bg-white/20 rounded-lg mb-2">
                      {message.fileType?.startsWith('image/') ? (
                        <ImageIcon className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                      <span className="text-sm truncate">{message.fileName}</span>
                    </div>
                  )}
                  {message.text && (
                    <div className="text-sm leading-relaxed">
                      {formatTextResponse(message.text, message.sender === 'user')}
                    </div>
                  )}
                  <p
                    className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-white/80' : 'text-gray-400'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {message.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center flex-shrink-0 mb-1">
                    <span className="text-white text-xs font-semibold">U</span>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mb-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="px-4 py-2 border-t border-sky-100 bg-sky-50/50">
              <div className="flex gap-2 overflow-x-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative flex-shrink-0">
                    {isImageFile(file) ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-lg border border-sky-200"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-sky-100 to-blue-100 rounded-lg border border-sky-200 flex flex-col items-center justify-center p-2">
                        {getFileIcon(file)}
                        <span className="text-xs text-gray-600 truncate w-full text-center mt-1">
                          {file.name.length > 8 ? file.name.substring(0, 8) + '...' : file.name}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-gradient-to-b from-white to-gray-50 p-4">
            <div className="flex items-end gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-all text-gray-600 hover:text-blue-600 hover:scale-110"
                title="Attach file"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white shadow-sm transition-all"
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={(!inputText.trim() && selectedFiles.length === 0) || isLoading}
                className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:scale-110 disabled:hover:scale-100"
                title="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

