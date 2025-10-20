/**
 * AI Page Component (AI Assistant)
 * 
 * Main AI page accessible via toubkal://ai
 * Provides AI conversation interface with model selection and streaming responses.
 */

import React, { useState, useRef, useEffect } from 'react'
// import { INTERNAL_PAGES } from '@/constants/url-schemes'

interface AIModel {
  id: string
  name: string
  provider: 'ollama' | 'transformers' | 'webllm'
  local: boolean
  status: 'available' | 'loading' | 'error'
  description: string
  capabilities: string[]
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  model?: string
  tokens?: number
  latency?: number
}

interface ResourceUsage {
  ram: number // MB
  vram: number // MB
  tokensPerSecond: number
  cpuUsage: number // percentage
}

interface AIPageProps {
  initialModel?: string
}

export const AIPage: React.FC<AIPageProps> = ({ 
  initialModel = 'llama3.2' 
}) => {
  const [selectedModel, setSelectedModel] = useState(initialModel)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resourceUsage, setResourceUsage] = useState<ResourceUsage>({
    ram: 0,
    vram: 0,
    tokensPerSecond: 0,
    cpuUsage: 0
  })
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Available AI models
  const availableModels: AIModel[] = [
    {
      id: 'llama3.2',
      name: 'Llama 3.2 8B',
      provider: 'ollama',
      local: true,
      status: 'available',
      description: 'Latest Llama model with improved reasoning capabilities',
      capabilities: ['text-generation', 'code-assistance', 'reasoning']
    },
    {
      id: 'llama3.1',
      name: 'Llama 3.1 8B',
      provider: 'ollama',
      local: true,
      status: 'available',
      description: 'Previous generation Llama model',
      capabilities: ['text-generation', 'code-assistance']
    },
    {
      id: 'mistral7b',
      name: 'Mistral 7B',
      provider: 'ollama',
      local: true,
      status: 'available',
      description: 'Efficient 7B parameter model',
      capabilities: ['text-generation', 'summarization']
    },
    {
      id: 'phi3',
      name: 'Phi-3 Mini',
      provider: 'transformers',
      local: true,
      status: 'loading',
      description: 'Microsoft Phi-3 model running in browser',
      capabilities: ['text-generation', 'reasoning']
    },
    {
      id: 'gemma2b',
      name: 'Gemma 2B',
      provider: 'webllm',
      local: true,
      status: 'available',
      description: 'Google Gemma model optimized for browser',
      capabilities: ['text-generation', 'fast-inference']
    }
  ]

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Simulate resource usage updates
  useEffect(() => {
    const interval = setInterval(() => {
      setResourceUsage(prev => ({
        ram: Math.max(0, prev.ram + (Math.random() - 0.5) * 10),
        vram: Math.max(0, prev.vram + (Math.random() - 0.5) * 5),
        tokensPerSecond: Math.max(0, prev.tokensPerSecond + (Math.random() - 0.5) * 2),
        cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + (Math.random() - 0.5) * 5))
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleSendMessage = async () => {
    if (inputMessage.trim().length === 0 || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setError(null)

    try {
      // Simulate AI response with streaming
      await simulateAIResponse(userMessage.content)
    } catch (err) {
      console.error('[AIPage.handleSendMessage] Failed:', err)
      setError('Failed to get AI response')
    } finally {
      setIsLoading(false)
    }
  }

  const simulateAIResponse = async (userInput: string) => {
    const model = availableModels.find(m => m.id === selectedModel)
    if (model === undefined) {
      throw new Error('Selected model not found')
    }

    const startTime = Date.now()

    // Simulate streaming response
    const responses = [
      "I understand you're asking about ",
      userInput.toLowerCase().includes('privacy') ? "privacy and security. " : "that topic. ",
      "Let me provide you with a comprehensive answer. ",
      "Based on the context, I can help you with this. ",
      "Here's what I think about this: ",
      "This is an interesting question that touches on several important aspects. ",
      "I'd be happy to help you understand this better. ",
      "Let me break this down for you step by step. ",
      "This is a complex topic that requires careful consideration. ",
      "I hope this helps clarify things for you"
    ]

    let fullResponse = ''
    let tokenCount = 0

    for (let i = 0; i < responses.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))
      
      fullResponse += responses[i]
      tokenCount += responses[i].split(' ').length

      // Update the streaming message
      const assistantMessage: ChatMessage = {
        id: `streaming-${Date.now()}`,
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
        model: model.name,
        tokens: tokenCount,
        latency: Date.now() - startTime
      }

      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== `streaming-${Date.now()}`)
        return [...filtered, assistantMessage]
      })
    }

    // Finalize the message
    setMessages(prev => {
      const filtered = prev.filter(msg => msg.id !== `streaming-${Date.now()}`)
      const finalMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
        model: model.name,
        tokens: tokenCount,
        latency: Date.now() - startTime
      }
      return [...filtered, finalMessage]
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault()
      void handleSendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    setError(null)
  }

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(timestamp)
  }

  const getModelStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'loading': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'ollama': return '🦙'
      case 'transformers': return '🤗'
      case 'webllm': return '🌐'
      default: return '🤖'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Assistant
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Chat with local AI models for privacy-first assistance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Model Selection and Resources */}
          <div className="lg:col-span-1 space-y-6">
            {/* Model Selection */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Select Model
              </h3>
              <div className="space-y-3">
                {availableModels.map((model) => (
                  <div
                    key={model.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedModel === model.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedModel(model.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getProviderIcon(model.provider)}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {model.name}
                        </span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getModelStatusColor(model.status)}`}>
                        {model.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {model.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {model.capabilities.map((capability) => (
                        <span
                          key={capability}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          {capability}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resource Usage */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Resource Usage
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>RAM</span>
                    <span>{resourceUsage.ram.toFixed(1)} MB</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (resourceUsage.ram / 8192) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>VRAM</span>
                    <span>{resourceUsage.vram.toFixed(1)} MB</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (resourceUsage.vram / 4096) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>CPU</span>
                    <span>{resourceUsage.cpuUsage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${resourceUsage.cpuUsage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Tokens/sec:</span>
                      <span>{resourceUsage.tokensPerSecond.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Chat with {availableModels.find(m => m.id === selectedModel)?.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {availableModels.find(m => m.id === selectedModel)?.description}
                  </p>
                </div>
                <button
                  onClick={clearChat}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Clear Chat
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                    <div className="text-6xl mb-4">🤖</div>
                    <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                    <p>Ask me anything! I'm here to help with privacy-first AI assistance.</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                      >
                        <div className="text-sm">{message.content}</div>
                        <div className={`text-xs mt-1 ${
                          message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {formatTimestamp(message.timestamp)}
                          {message.tokens !== null && message.tokens !== undefined && message.tokens > 0 && (
                            <span className="ml-2">
                              {message.tokens} tokens
                              {message.latency !== null && message.latency !== undefined && message.latency > 0 && ` (${message.latency}ms)`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                {error !== null && error !== undefined && error.length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                  </div>
                )}
                
                <div className="flex space-x-4">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message here..."
                    className="flex-1 resize-none rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => void handleSendMessage()}
                    disabled={inputMessage.trim().length === 0 || isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isLoading ? 'Sending...' : 'Send'}
                  </button>
                </div>
                
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIPage
