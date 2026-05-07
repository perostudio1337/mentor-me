// 'use client'

// import { useEffect, useRef, useState } from 'react'
// import { createClient } from '@/lib/supabase/client'
// import { useParams } from 'next/navigation'
// import { markMessagesAsRead } from '@/lib/chat/markAsRead'
// import { moderateMessage } from '@/lib/chat/moderateMessage'

// type Message = {
//   id: string
//   sender_id: string
//   receiver_id: string
//   content: string
//   read_at: string | null
//   created_at: string
// }

// export default function ChatPage() {
//   const { matchId } = useParams()
//   const supabase = createClient()
//   const [messages, setMessages] = useState<Message[]>([])
//   const [newMessage, setNewMessage] = useState('')
//   const [userId, setUserId] = useState<string | null>(null)
//   const [loading, setLoading] = useState(true)
//   const bottomRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     supabase.auth.getUser().then(({ data }) => {
//       setUserId(data.user?.id ?? null)
//     })
//   }, [])

//   useEffect(() => {
//     if (!matchId) return

//     const fetchMessages = async () => {
//       const { data, error } = await supabase
//         .from('messages')
//         .select('*')
//         .eq('match_id', matchId)
//         .order('created_at', { ascending: true })

//       if (!error && data) setMessages(data)
//         if (userId) await markMessagesAsRead(matchId as string, userId)
//       setLoading(false)
//     }

//     fetchMessages()

//     const channel = supabase
//       .channel(`chat-${matchId}`)
//       .on(
//         'postgres_changes',
//         {
//           event: 'INSERT',
//           schema: 'public',
//           table: 'messages',
//           filter: `match_id=eq.${matchId}`,
//         },
//         (payload) => {
//           setMessages((prev) => [...prev, payload.new as Message])
//         }
//       )
//       .subscribe()

//     return () => {
//       supabase.removeChannel(channel)
//     }
//   }, [matchId])

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }, [messages])

//   const sendMessage = async () => {
//     if (!newMessage.trim() || !userId || !matchId) return

//     const isAllowed = await moderateMessage(newMessage.trim())
// if (!isAllowed) {
//   alert('Diese Nachricht verstößt gegen unsere Community-Richtlinien.')
//   return
// }
//     const { data: match } = await supabase
//       .from('matches')
//       .select('mentor_id, student_id')
//       .eq('id', matchId)
//       .single()

//     if (!match) return

//     const receiverId =
//       match.mentor_id === userId ? match.student_id : match.mentor_id

//     await supabase.from('messages').insert({
//       match_id: matchId,
//       sender_id: userId,
//       receiver_id: receiverId,
//       content: newMessage.trim(),
//     })

//     setNewMessage('')
//   }

//   if (loading) return <div className="p-8 text-center">Laden...</div>

//   return (
//     <div className="flex flex-col h-screen bg-gray-50">
//       <div className="flex-1 overflow-y-auto p-4 space-y-3">
//         {messages.map((msg) => {
//           const isOwn = msg.sender_id === userId
//           return (
//             <div
//               key={msg.id}
//               className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
//             >
//               <div
//                 className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
//                   isOwn
//                     ? 'bg-blue-500 text-white rounded-br-sm'
//                     : 'bg-white text-gray-800 shadow rounded-bl-sm'
//                 }`}
//               >
//                 <p>{msg.content}</p>
//                 <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
//                   {new Date(msg.created_at).toLocaleTimeString('de-DE', {
//                     hour: '2-digit',
//                     minute: '2-digit',
//                   })}
//                   {isOwn && msg.read_at && ' ✓✓'}
//                   {isOwn && !msg.read_at && ' ✓'}
//                 </p>
//               </div>
//             </div>
//           )
//         })}
//         <div ref={bottomRef} />
//       </div>

//       <div className="p-4 bg-white border-t flex gap-2"> 