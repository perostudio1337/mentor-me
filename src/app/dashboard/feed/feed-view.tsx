'use client'

/**
 * src/app/dashboard/feed/feed-view.tsx
 *
 * Community feed client component. Renders milestone posts, supports likes,
 * comments and a "share an update" composer at the top of the feed.
 */

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import ScrollReveal from '@/components/ui/scroll-reveal'
import PostCard from '@/components/feed/post-card'
import ShareMilestoneModal from '@/components/feed/share-milestone-modal'
import type { MilestonePostFull, PostAuthor } from '@/types/feed'
import type { Challenge } from '@/types/challenges'

interface FeedViewProps {
  initialPosts: MilestonePostFull[]
  profileId: string
  authUserId: string
  setupNeeded?: boolean
}

export default function FeedView({
  initialPosts,
  profileId,
  authUserId,
  setupNeeded = false,
}: FeedViewProps) {
  const supabase = createClient()
  const [posts, setPosts] = useState<MilestonePostFull[]>(initialPosts)
  const [composerOpen, setComposerOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  async function reloadPosts() {
    setRefreshing(true)

    // Same defensive 4-query strategy as the server page — embedded joins
    // can fail when Supabase's schema cache is stale.
    const { data: rows } = await supabase
      .from('milestone_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30)

    const rawPosts = rows ?? []
    const authorIds = [...new Set(rawPosts.map((p) => p.author_id))]
    const challengeIds = [...new Set(
      rawPosts.map((p) => p.challenge_id).filter(Boolean) as string[],
    )]
    const postIds = rawPosts.map((p) => p.id)

    const [authorsRes, challengesRes, likesRes, commentsRes] = await Promise.all([
      authorIds.length
        ? supabase
            .from('profiles')
            .select('id, name, avatar_url, role')
            .in('id', authorIds)
        : Promise.resolve({ data: [] as PostAuthor[] }),
      challengeIds.length
        ? supabase.from('challenges').select('*').in('id', challengeIds)
        : Promise.resolve({ data: [] as Challenge[] }),
      postIds.length
        ? supabase
            .from('post_likes')
            .select('post_id, profile_id')
            .in('post_id', postIds)
        : Promise.resolve({ data: [] as { post_id: string; profile_id: string }[] }),
      postIds.length
        ? supabase.from('post_comments').select('post_id').in('post_id', postIds)
        : Promise.resolve({ data: [] as { post_id: string }[] }),
    ])

    const authorById = new Map<string, PostAuthor>()
    for (const a of (authorsRes.data ?? []) as PostAuthor[]) authorById.set(a.id, a)

    const challengeById = new Map<string, Challenge>()
    for (const c of (challengesRes.data ?? []) as Challenge[]) challengeById.set(c.id, c)

    const likesByPost = new Map<string, string[]>()
    for (const l of likesRes.data ?? []) {
      const arr = likesByPost.get(l.post_id) ?? []
      arr.push(l.profile_id)
      likesByPost.set(l.post_id, arr)
    }

    const commentsByPost = new Map<string, number>()
    for (const c of commentsRes.data ?? []) {
      commentsByPost.set(c.post_id, (commentsByPost.get(c.post_id) ?? 0) + 1)
    }

    const next: MilestonePostFull[] = rawPosts.map((r) => ({
      id: r.id,
      author_id: r.author_id,
      content: r.content,
      image_url: r.image_url,
      challenge_enrollment_id: r.challenge_enrollment_id,
      challenge_id: r.challenge_id,
      kind: r.kind,
      created_at: r.created_at,
      updated_at: r.updated_at,
      author:
        authorById.get(r.author_id) ?? {
          id: r.author_id,
          name: 'Unknown',
          avatar_url: null,
          role: 'student',
        },
      challenge: r.challenge_id ? challengeById.get(r.challenge_id) ?? null : null,
      like_count: (likesByPost.get(r.id) ?? []).length,
      comment_count: commentsByPost.get(r.id) ?? 0,
      liked_by_me: (likesByPost.get(r.id) ?? []).includes(profileId),
    }))

    setPosts(next)
    setRefreshing(false)
  }

  async function handleLikeToggle(post: MilestonePostFull) {
    // Optimistic update
    const wasLiked = post.liked_by_me
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              liked_by_me: !wasLiked,
              like_count: p.like_count + (wasLiked ? -1 : 1),
            }
          : p,
      ),
    )

    if (wasLiked) {
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', post.id)
        .eq('profile_id', profileId)
      if (error) await reloadPosts()
    } else {
      const { error } = await supabase
        .from('post_likes')
        .insert({ post_id: post.id, profile_id: profileId })
      if (error) await reloadPosts()
    }
  }

  async function handleAddComment(postId: string, content: string) {
    const { error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, author_id: profileId, content })
    if (!error) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p,
        ),
      )
    }
    return !error
  }

  return (
    <div
      className="max-w-2xl mx-auto space-y-6"
      style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold mb-1">Community Feed</h1>
          <p className="text-muted-foreground text-sm">
            Wins, milestones, and updates from across Mentor.me.
          </p>
        </div>
        <Button
          variant="gradient"
          size="sm"
          onClick={() => setComposerOpen(true)}
        >
          + Share update
        </Button>
      </div>

      {/* Composer modal */}
      {composerOpen && (
        <ShareMilestoneModal
          open={composerOpen}
          profileId={profileId}
          authUserId={authUserId}
          onClose={() => setComposerOpen(false)}
          onPosted={reloadPosts}
        />
      )}

      {/* Setup warning if migration hasn't been run */}
      {setupNeeded && (
        <Card className="p-5 border-2 border-amber-300 bg-amber-50/60">
          <p className="text-sm font-semibold mb-1">⚠️ Feed needs database setup</p>
          <p className="text-xs text-muted-foreground">
            Run <code className="text-xs bg-white/60 px-1.5 py-0.5 rounded">
              supabase/migrations/013_milestone_posts.sql
            </code> in your Supabase SQL Editor, then reload this page.
          </p>
        </Card>
      )}

      {/* Empty state */}
      {posts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-5xl mb-3">🌱</div>
          <h2 className="text-lg font-semibold mb-1">No posts yet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Be the first to share a milestone with the community.
          </p>
          <Button
            variant="gradient"
            size="sm"
            onClick={() => setComposerOpen(true)}
          >
            Post your first update
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post, i) => (
            <ScrollReveal key={post.id} delay={Math.min(i * 40, 200)}>
              <PostCard
                post={post}
                currentProfileId={profileId}
                onLikeToggle={() => handleLikeToggle(post)}
                onAddComment={(content) => handleAddComment(post.id, content)}
              />
            </ScrollReveal>
          ))}

          {refreshing && (
            <p className="text-center text-xs text-muted-foreground">
              Refreshing…
            </p>
          )}
        </div>
      )}
    </div>
  )
}
