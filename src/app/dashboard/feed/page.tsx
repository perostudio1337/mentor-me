/**
 * src/app/dashboard/feed/page.tsx
 *
 * Server component for the community feed. Loads recent milestone posts,
 * the user's own profile (used to attribute new posts and detect "liked-by-me"),
 * and forwards everything to the client view.
 *
 * Hardened: we issue four independent queries instead of an embedded join.
 * The embedded join syntax (`profiles!milestone_posts_author_id_fkey`)
 * silently breaks if Supabase's schema cache hasn't picked up the new
 * foreign key, which makes the whole feed page 500. Querying separately
 * means the page still renders even right after running the migration.
 *
 * If `milestone_posts` doesn't exist yet (migration 013 not run), we
 * render an empty feed with a setup hint instead of crashing.
 */

import { createClient } from '@/lib/supabase/server'
import FeedView from './feed-view'
import type { MilestonePostFull, PostAuthor } from '@/types/feed'
import type { Challenge } from '@/types/challenges'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 30

export default async function FeedPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, name, avatar_url')
    .eq('user_id', user.id)
    .single()

  if (!profile) return null

  // 1. Posts — be defensive: missing table → empty feed, not a 500
  const postsRes = await supabase
    .from('milestone_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE)

  const setupNeeded =
    !!postsRes.error &&
    /milestone_posts|relation.*does not exist/i.test(postsRes.error.message)

  const rawPosts = postsRes.data ?? []

  // 2. Resolve authors / challenges / likes / comments in parallel
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
      : Promise.resolve({ data: [] as PostAuthor[], error: null }),
    challengeIds.length
      ? supabase.from('challenges').select('*').in('id', challengeIds)
      : Promise.resolve({ data: [] as Challenge[], error: null }),
    postIds.length
      ? supabase
          .from('post_likes')
          .select('post_id, profile_id')
          .in('post_id', postIds)
      : Promise.resolve({ data: [], error: null }),
    postIds.length
      ? supabase.from('post_comments').select('post_id').in('post_id', postIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  const authorById = new Map<string, PostAuthor>()
  for (const a of (authorsRes.data ?? []) as PostAuthor[]) {
    authorById.set(a.id, a)
  }

  const challengeById = new Map<string, Challenge>()
  for (const c of (challengesRes.data ?? []) as Challenge[]) {
    challengeById.set(c.id, c)
  }

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

  const posts: MilestonePostFull[] = rawPosts.map((r) => ({
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
    liked_by_me: (likesByPost.get(r.id) ?? []).includes(profile.id),
  }))

  return (
    <FeedView
      initialPosts={posts}
      profileId={profile.id}
      authUserId={user.id}
      setupNeeded={setupNeeded}
    />
  )
}
