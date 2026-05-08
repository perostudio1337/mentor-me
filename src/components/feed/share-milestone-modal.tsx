'use client'

/**
 * src/components/feed/share-milestone-modal.tsx
 *
 * Modal that pops up after a user ticks a challenge as completed.
 * It lets them:
 *   • Write a short post about the milestone
 *   • Optionally attach an image (uploaded to the "post-images" bucket)
 *   • Have the completed challenge attached automatically — that link is
 *     what makes the post show up in the user's profile journal.
 *
 * Also reusable as a generic "share an update" modal: when no challenge is
 * passed in, the kind defaults to 'milestone'.
 */

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import type { Challenge, ChallengeEnrollment } from '@/types/challenges'
import type { MilestonePostKind } from '@/types/feed'

interface ShareMilestoneModalProps {
  open: boolean
  profileId: string
  authUserId: string
  challenge?: Challenge | null
  enrollment?: ChallengeEnrollment | null
  defaultKind?: MilestonePostKind
  onClose: () => void
  onPosted?: () => void
}

export default function ShareMilestoneModal({
  open,
  profileId,
  authUserId,
  challenge,
  enrollment,
  defaultKind,
  onClose,
  onPosted,
}: ShareMilestoneModalProps) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [content, setContent] = useState(
    challenge ? `Just finished "${challenge.title}" 🎉` : ''
  )
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const kind: MilestonePostKind =
    defaultKind ?? (challenge ? 'challenge_complete' : 'milestone')

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    if (!f) {
      setFile(null)
      setPreviewUrl(null)
      return
    }
    if (!f.type.startsWith('image/')) {
      setError('Please pick an image file.')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('Image is too large (max 5 MB).')
      return
    }
    setError(null)
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
  }

  async function handleSubmit() {
    if (!content.trim()) {
      setError('Please write something about your milestone.')
      return
    }
    setSubmitting(true)
    setError(null)

    let imageUrl: string | null = null

    // 1. Upload image (if any)
    if (file) {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${authUserId}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${ext}`
      const { error: upErr } = await supabase
        .storage
        .from('post-images')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (upErr) {
        setSubmitting(false)
        setError(`Image upload failed: ${upErr.message}`)
        return
      }
      const { data: pub } = supabase.storage
        .from('post-images')
        .getPublicUrl(path)
      imageUrl = pub.publicUrl
    }

    // 2. Insert the post
    const { error: insErr } = await supabase
      .from('milestone_posts')
      .insert({
        author_id: profileId,
        content: content.trim(),
        image_url: imageUrl,
        challenge_enrollment_id: enrollment?.id ?? null,
        challenge_id: challenge?.id ?? null,
        kind,
      })

    setSubmitting(false)

    if (insErr) {
      setError(insErr.message)
      return
    }

    onPosted?.()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card
        className="max-w-lg w-full p-6 space-y-4"
        // Stop click propagation
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">
              {challenge ? '🎉 Share Your Milestone' : 'Share an update'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {challenge
                ? 'Celebrate your win — your post lands in the community feed and on your journal.'
                : 'Your post will appear in the community feed.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xl leading-none cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Attached challenge chip */}
        {challenge && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
            style={{
              background: 'rgba(16,185,129,0.10)',
              border: '1px solid rgba(16,185,129,0.25)',
              color: 'var(--success)',
            }}
          >
            <span className="text-xl">{challenge.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs leading-tight truncate">
                {challenge.title}
              </p>
              <p className="text-[11px] opacity-80">
                Completed · added to your journal
              </p>
            </div>
            <span className="text-base">✓</span>
          </div>
        )}

        {/* Text */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="What did you achieve? What did you learn?"
          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
        />
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>Tip: keep it specific — mention the next step you&apos;ll take.</span>
          <span>{content.length}/2000</span>
        </div>

        {/* Image picker */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
          {previewUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="preview"
                className="w-full max-h-72 object-cover"
              />
              <button
                onClick={() => {
                  setFile(null)
                  setPreviewUrl(null)
                }}
                className="absolute top-2 right-2 rounded-full bg-black/60 text-white text-xs px-2 py-1 cursor-pointer"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-xl border-2 border-dashed border-border py-6 text-sm text-muted-foreground hover:bg-white/40 transition cursor-pointer"
            >
              📸 Add a photo (optional)
            </button>
          )}
        </div>

        {error && (
          <p className="text-xs text-error bg-error/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-2 justify-end pt-1">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            Skip
          </Button>
          <Button
            variant="gradient"
            size="sm"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Posting…' : 'Post to Feed'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
