import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const published = searchParams.get("published");
    const featured = searchParams.get("featured");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const all = searchParams.get("all");

    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as any)?.role === "admin";

    const skip = (page - 1) * limit;

    let query = supabaseAdmin
      .from('Post')
      .select(`
        *,
        author:User(id, name, email, image),
        category:Category(*),
        tags:PostTag(tag:Tag(*)),
        comments:Comment(count)
      `, { count: 'exact' });

    // If ?all=true is passed and user is admin, show all posts (including drafts)
    if (!(all === "true" && isAdmin)) {
      query = query.eq('published', true);
    }

    // Explicit published filter (only respected for admin)
    if (published !== null && isAdmin) {
      query = query.eq('published', published === "true");
    }

    if (featured !== null) {
      query = query.eq('featured', featured === "true");
    }

    if (categoryId) {
      query = query.eq('categoryId', categoryId);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data: posts, count: total, error } = await query
      .order('createdAt', { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) throw error;

    // Format the posts to match existing structure (tags nesting)
    const formattedPosts = posts?.map(post => ({
      ...post,
      _count: { comments: post.comments?.[0]?.count || 0 },
      tags: post.tags?.map((t: any) => ({ tag: t.tag })) || []
    }));

    return NextResponse.json({
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total: total || 0,
        totalPages: Math.ceil((total || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error("Posts GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userRole = (session.user as any).role;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, slug, content, excerpt, coverImage, gallery, videoUrl, readingTime, published, featured, categoryId, tagIds } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Title, slug, and content are required" },
        { status: 400 }
      );
    }

    const { data: post, error } = await supabaseAdmin
      .from('Post')
      .insert({
        title,
        slug,
        content,
        excerpt,
        coverImage,
        gallery,
        videoUrl,
        readingTime: readingTime ? parseInt(readingTime) : null,
        published: published ?? false,
        featured: featured ?? false,
        authorId: (session.user as any).id,
        categoryId,
      })
      .select(`
        *,
        author:User(id, name, email, image),
        category:Category(*),
        tags:PostTag(tag:Tag(*))
      `)
      .single();

    if (error) throw error;

    // Handle tags separately as Supabase doesn't support nested inserts for junction tables easily in one go
    if (tagIds && tagIds.length > 0) {
      const tagInserts = tagIds.map((tagId: string) => ({
        postId: post.id,
        tagId: tagId
      }));
      await supabaseAdmin.from('PostTag').insert(tagInserts);
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (error: any) {
    console.error("Posts POST error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A post with this slug already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create post", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userRole = (session.user as any).role;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, title, slug, content, excerpt, coverImage, gallery, videoUrl, readingTime, published, featured, categoryId, tagIds } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (gallery !== undefined) updateData.gallery = gallery;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (readingTime !== undefined) updateData.readingTime = readingTime ? parseInt(readingTime) : null;
    if (published !== undefined) updateData.published = published;
    if (featured !== undefined) updateData.featured = featured;
    if (categoryId !== undefined) updateData.categoryId = categoryId;

    const { data: post, error } = await supabaseAdmin
      .from('Post')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        author:User(id, name, email, image),
        category:Category(*),
        tags:PostTag(tag:Tag(*))
      `)
      .single();

    if (error) throw error;

    if (tagIds) {
      // Replace tags
      await supabaseAdmin.from('PostTag').delete().eq('postId', id);
      if (tagIds.length > 0) {
        const tagInserts = tagIds.map((tagId: string) => ({
          postId: id,
          tagId: tagId
        }));
        await supabaseAdmin.from('PostTag').insert(tagInserts);
      }
    }

    return NextResponse.json({ post });
  } catch (error: any) {
    console.error("Posts PUT error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A post with this slug already exists" },
        { status: 409 }
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update post", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userRole = (session.user as any).role;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('Post')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error: any) {
    console.error("Posts DELETE error:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete post", details: error.message },
      { status: 500 }
    );
  }
}
