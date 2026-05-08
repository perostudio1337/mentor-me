'use client'

/**
 * src/components/feed/post-card.tsx
 *
 * One post in the community feed. Shows author, content, optional image,
 * the attached challenge chip, and like / comment controls.
 */

import { useState } from 'react'
import Card from '@/components/ui/card'
import Badge from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import type { MilestonePostFull, PostComment } from '@/types/feed'
import { POST_KIND_LABELS } from '@/types/feed'

interface PostCardProps {
  post: MilestonePostFull
  currentProfileId: string
  onLikeToggle: () => void
  onAddComment: (content: string) => Promise<boolean>
}

export default function PostCard({
  post,
  currentProfileId,
  onLikeToggle,
  onAddComment,
}: PostCardProps) {
  const supabase = createClient()
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<
    (PostComment & { author?: { name: string; avatar_url: string | null } })[]
  >([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)

  async function loadComments() {
    setLoadingComments(true)
    const { data } = await supabase
      .from('post_comments')
      .select(`
        *,
        author:profiles!post_comments_author_id_fkey (name, avatar_url)
      `)
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    setComments((data ?? []) as any)
    setLoadingComments(false)
  }

  async function handleToggleComments() {
    const next = !showComments
    setShowComments(next)
    if (next && comments.length === 0) await loadComments()
  }

  async function handleSendComment() {
    if (!draft.trim() || posting) return
    setPosting(true)
    const ok = await onAddComment(draft.trim())
    if (ok) {
      setDraft('')
      await loadComments()
    }
    setPosting(false)
  }

  const initials = post.author.name
    ? post.author.name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const created = new Date(post.created_at)
  const created_text = relativeTime(created)

  return (
    <Card className="p-5 space-y-3">
      {/* Header: avatar + name + kind */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-light text-white text-sm font-semibold flex items-center justify-center shrink-0">
          {post.author.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.author.avatar_url}
              alt={post.author.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm truncate">{post.author.name}</p>
            <Badge variant={post.author.role === 'mentor' ? 'default' : 'success'}>
              {post.author.role === 'mentor' ? '🎓 Mentor' : '🚀 Student'}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {POST_KIND_LABELS[post.kind]} · {created_text}
          </p>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>

      {/* Image */}
      {post.image_url && (
        <div className="rounded-xl overflow-hidden border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image_url}
            alt="post"
            className="w-full max-h-[480px] object-cover"
          />
        </div>
      )}

      {/* Attached challenge */}
      {post.challenge && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
          style={{
            background: 'rgba(16,185,129,0.10)',
            border: '1px solid rgba(16,185,129,0.25)',
            color: 'var(--success)',
          }}
        >
          <span className="text-lg">{post.challenge.icon}</span>
          <span className="font-semibold flex-1 truncate">{post.challenge.title}</span>
          <span>Completed ✓</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-1 border-t border-border/40">
        <button
          onClick={onLikeToggle}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <span className="text-base">{post.liked_by_me ? '❤️' : '🤍'}</span>
          <span>{post.like_count}</span>
        </button>
        <button
          onClick={handleToggleComments}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <span className="text-base">💬</span>
          <span>{post.comment_count}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="pt-3 border-t border-border/40 space-y-3">
          {loadingComments ? (
            <p className="text-xs text-muted-foreground">Loading…</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-muted-foreground">No comments yet.</p>
          ) : (
            <ul className="space-y-2">
              {comments.map((c) => (
                <li key={c.id} className="text-xs flex gap-2">
                  <span className="font-semibold">{c.author?.name ?? 'User'}</span>
                  <span className="text-muted-foreground flex-1">{c.content}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Write a comment…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendComment()
              }}
              maxLength={1000}
              className="flex-1 rounded-full border border-border bg-card px-4 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              onClick={handleSendComment}
              disabled={posting || !draft.trim()}
              className="text-xs font-semibold text-primary cursor-pointer disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}

// ── Helpers ────────────────────────────────────────────────
function relativeTime(d: Date): string {
  const diff = Date.now() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  })
}
