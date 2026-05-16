import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react'

const mockQA = [
  {
    keywords: ['how many workers', 'total workers', 'workforce size', 'how many employees', 'headcount'],
    answer: 'We currently have **30 workers** on the platform. 24 are active, 4 are on leave, and 2 are pending onboarding.',
  },
  {
    keywords: ['flagged', 'flagged workers', 'who is flagged', 'issues', 'problem'],
    answer: 'There are **3 flagged workers** that need your attention:\n\n1. **Chidi Nwosu** — Sales, Score: 54 (Attendance issues, late clock-ins)\n2. **John Williams** — Engineering, Score: 78 (Held salary disbursement)\n3. **Fatima Bello** — Support, Score: 72 (Currently on leave)\n\nVisit the Workers page to review their details.',
  },
  {
    keywords: ['attendance', 'attendance rate', 'today present', 'who is here', 'present today'],
    answer: `Today's attendance: **24 out of 30** workers are present (**80%**).\n\n- 4 workers are absent\n- 2 workers are on leave\n- The average attendance rate this month is **87%**, which is 2% higher than last month.`,
  },
  {
    keywords: ['top performer', 'best', 'elite', 'top worker', 'highest score', 'top'],
    answer: 'Our **top performers** this month:\n\n1. **Ada Okonkwo** — Elite (Score: 91) — Operations\n2. **Aisha Mohammed** — Elite (Score: 95) — Marketing\n3. **Emeka Okafor** — Solid (Score: 81) — Engineering\n\nElite tier workers receive a **2% bonus** on their salary.',
  },
  {
    keywords: ['elite', 'solid', 'standard', 'tier distribution', 'tiers', 'distribution'],
    answer: '**Tier Distribution:**\n\n- **Elite**: 6 workers (20%)\n- **Solid**: 14 workers (47%)\n- **Standard**: 7 workers (23%)\n- **Flagged**: 3 workers (10%)\n\nThe team health score averages **82/100**.',
  },
  {
    keywords: ['payroll', 'salary', 'pay', 'payment', 'disbursement', 'payout'],
    answer: 'This month\'s payroll summary:\n\n- **Total Payroll**: ₦2,148,000\n- **Employees**: 6\n- **Paid**: 3 (Ada, Emeka, Aisha)\n- **Pending**: 3 (John, Chidi, Fatima)\n\nVisit the Payroll page to process pending salaries.',
  },
  {
    keywords: ['leave', 'leave request', 'pending leave', 'who is on leave'],
    answer: '**Pending Leave Requests:**\n\n1. **John Williams** — Family event (May 20-22)\n2. **Fatima Bello** — Personal (May 18-19)\n\n**Currently on leave:**\n- Fatima Bello (since May 18)\n\nVisit the Leave Requests page to approve or reject.',
  },
  {
    keywords: ['reports', 'monthly report', 'generate report', 'report'],
    answer: 'The latest monthly report is for **May 2026**:\n\n- **Average Score**: 82%\n- **Total Reports Submitted**: 112\n- **Leaves Approved**: 8\n- **Salary Disbursed**: ₦2,148,000\n\nYou can generate a new report from the Reports page.',
  },
  {
    keywords: ['department', 'engineering', 'operations', 'sales', 'support', 'marketing'],
    answer: '**Department Breakdown:**\n\n- **Engineering**: John Williams, Emeka Okafor\n- **Operations**: Ada Okonkwo\n- **Sales**: Chidi Nwosu\n- **Support**: Fatima Bello\n- **Marketing**: Aisha Mohammed',
  },
  {
    keywords: ['help', 'what can you do', 'capabilities', 'features', 'commands'],
    answer: 'I can help you with HR-related questions! Try asking me:\n\n- "How many workers do we have?"\n- "Who are the flagged workers?"\n- "What\'s the attendance rate?"\n- "Show me top performers"\n- "Tier distribution"\n- "Payroll summary"\n- "Pending leave requests"\n- "Monthly reports"',
  },
]

function findAnswer(input) {
  const text = input.toLowerCase().trim()
  for (const qa of mockQA) {
    if (qa.keywords.some(keyword => text.includes(keyword))) {
      return qa.answer
    }
  }
  return null
}

const fallbackResponses = [
  "I'm not sure about that. Try asking about workers, attendance, payroll, or leave requests.",
  "I don't have information on that topic. You can ask me about team stats, flagged workers, or reports.",
  "That's outside my knowledge base. I specialise in HR data — workers, attendance, payroll, and reports.",
]

function getFallback() {
  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
}

export default function AIChatbot({ workersData }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I\'m your HR assistant. Ask me anything about your workforce, payroll, attendance, or reports.' },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text }])
    setIsTyping(true)

    setTimeout(() => {
      const answer = findAnswer(text)
      const reply = answer || getFallback()
      setMessages(prev => [...prev, { role: 'bot', text: reply }])
      setIsTyping(false)
    }, 600 + Math.random() * 400)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#0B3B91] text-white shadow-lg hover:bg-[#082d70] transition"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-40 w-80 sm:w-96 rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between bg-gradient-to-r from-[#0B3B91] to-[#1a56db] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">HR Assistant</p>
                <p className="text-[10px] text-white/70">AI-powered • Mock mode</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
              <X size={18} />
            </button>
          </div>

          <div className="flex h-80 flex-col overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-1 ${
                    msg.role === 'user' ? 'bg-[#0B3B91]' : 'bg-gray-100'
                  }`}>
                    {msg.role === 'user' ? (
                      <User size={13} className="text-white" />
                    ) : (
                      <Bot size={13} className="text-gray-600" />
                    )}
                  </div>
                  <div className={`rounded-xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-[#0B3B91] text-white rounded-tr-none'
                      : 'bg-gray-50 text-gray-800 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[85%]">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 mt-1">
                    <Bot size={13} className="text-gray-600" />
                  </div>
                  <div className="rounded-xl rounded-tl-none bg-gray-50 px-3.5 py-2.5">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-gray-100 p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#0B3B91] focus:ring-1 focus:ring-[#0B3B91]/20"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B3B91] text-white disabled:bg-gray-200 disabled:text-gray-400 hover:bg-[#082d70] transition"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
