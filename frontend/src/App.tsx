import { BookOpen, Clapperboard, Clock, Edit3, LogOut, PenLine, Plus, RefreshCcw, Save, Search, Sparkles, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "./api";
import type { AdminSettings, Post } from "./domain";
import { coverForSlug, fallbackPosts } from "./domain";

const emptyPost = {
  title: "",
  slug: "",
  excerpt: "",
  tags: "",
  seoTitle: "",
  seoDescription: "",
  contentHtml: ""
};

const postToDraft = (post: Post) => ({
  title: post.title,
  slug: post.slug,
  excerpt: post.excerpt,
  tags: post.tags.join(", "),
  seoTitle: post.seoTitle,
  seoDescription: post.seoDescription,
  contentHtml: post.contentHtml
});

const draftToPayload = (draft: typeof emptyPost) => ({
  ...draft,
  tags: draft.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
});

function navigate(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function SocialIcon({ name }: { name: "x" | "threads" | "telegram" | "linkedin" }) {
  if (name === "x") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2H21.5l-7.11 8.126L22.75 22h-6.54l-5.12-6.693L5.23 22H1.97l7.605-8.692L1.55 2h6.705l4.627 6.118L18.244 2Zm-1.143 17.91h1.804L7.27 3.98H5.334L17.1 19.91Z" />
      </svg>
    );
  }
  if (name === "threads") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12.08 2C7.02 2 4 5.36 4 10.93v2.14C4 18.64 7.02 22 12.08 22c4.38 0 7.13-2.28 7.13-5.86 0-2.58-1.48-4.2-4.2-4.82-.16-2.32-1.53-3.77-3.88-3.77-1.5 0-2.76.52-3.73 1.55l1.22 1.42c.67-.7 1.46-1.05 2.37-1.05 1.1 0 1.78.62 1.94 1.74h-1.44c-2.72 0-4.41 1.3-4.41 3.38 0 2 1.55 3.3 3.94 3.3 2.35 0 3.82-1.2 4.14-3.45 1.26.45 1.9 1.24 1.9 2.37 0 2.02-1.88 3.29-4.88 3.29-3.82 0-5.99-2.48-5.99-6.9v-2.24c0-4.42 2.17-6.9 5.99-6.9 2.98 0 4.84 1.38 5.28 3.9h2.1C19.03 4.43 16.32 2 12.08 2Zm-1 13.96c-1.13 0-1.82-.52-1.82-1.36 0-.92.83-1.46 2.27-1.46h1.48c-.17 1.84-.83 2.82-1.93 2.82Z" />
      </svg>
    );
  }
  if (name === "telegram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21.74 4.67 18.5 19.95c-.24 1.08-.88 1.34-1.78.84l-4.92-3.63-2.37 2.28c-.26.26-.48.48-.98.48l.35-5.02 9.13-8.25c.4-.35-.09-.55-.62-.2L6.03 13.56 1.17 12.04c-1.05-.33-1.07-1.05.22-1.55L20.4 3.16c.88-.33 1.65.2 1.34 1.51Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.33 8h4.33v14H.33V8Zm7 0h4.15v1.92h.06c.58-1.1 2-2.25 4.1-2.25 4.38 0 5.19 2.88 5.19 6.63V22H16.5v-6.82c0-1.63-.03-3.72-2.27-3.72-2.27 0-2.62 1.77-2.62 3.6V22H7.33V8Z" />
    </svg>
  );
}

function ShareBar({ title, url }: { title: string; url: string }) {
  const absoluteUrl = typeof window !== "undefined" ? new URL(url, window.location.origin).href : url;
  const shareText = `${title} ${absoluteUrl}`;
  const encodedUrl = encodeURIComponent(absoluteUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedShareText = encodeURIComponent(shareText);
  const targets = [
    { label: "X", icon: "x" as const, href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { label: "Threads", icon: "threads" as const, href: `https://www.threads.net/intent/post?text=${encodedShareText}` },
    { label: "Telegram", icon: "telegram" as const, href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}` },
    { label: "LinkedIn", icon: "linkedin" as const, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
  ];

  return (
    <aside className="share-bar" aria-label="Share this post">
      <span className="share-label">Share this post</span>
      <div className="share-actions">
        {targets.map((target) => (
          <a key={target.label} className="share-link" href={target.href} target="_blank" rel="noreferrer" aria-label={`Share on ${target.label}`}>
            <SocialIcon name={target.icon} />
            <span>{target.label}</span>
          </a>
        ))}
      </div>
    </aside>
  );
}


function usePath() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const update = () => setPath(window.location.pathname);
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);
  return path;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="site-header">
        <button className="brand" onClick={() => navigate("/")}>
          <span className="brand-mark">SW</span>
          <span>Soren Winslow Review</span>
        </button>
        <nav>
          <button onClick={() => navigate("/articles")}>Articles</button>
          <button onClick={() => navigate("/about")}>About</button>
        </nav>
      </header>
      {children}
      <footer className="footer">
        <p>Culture reviewed as if attention were money and bad writing were a public health concern.</p>
      </footer>
    </>
  );
}

function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <article className={featured ? "post-card post-card-featured" : "post-card"} onClick={() => navigate(`/articles/${post.slug}`)}>
      <img src={coverForSlug(post.slug)} alt="" />
      <div>
        <div className="tag-row">{post.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
      </div>
    </article>
  );
}

function Home({ posts }: { posts: Post[] }) {
  const featured = posts[0];
  return (
    <Shell>
      <main className="home">
        <section className="hero">
          <div className="hero-copy">
            <p className="kicker">The Michelin Guide for books and TV series</p>
            <h1>Elegant reviews for people who suspect their watchlist is lying.</h1>
            <p>
              Fiction, business books, classics, streaming shows, and the occasional cultural disaster served with a clean verdict.
            </p>
            <div className="hero-actions">
              <button className="primary" onClick={() => navigate("/articles")}>
                <Search size={18} /> Browse reviews
              </button>
              <button className="secondary" onClick={() => navigate("/about")}>
                <BookOpen size={18} /> Meet the critic
              </button>
            </div>
          </div>
          {featured && <PostCard post={featured} featured />}
        </section>
        <section className="section-head">
          <h2>Latest Tastings</h2>
          <p>Verdicts with teeth, warmth, and a useful receipt.</p>
        </section>
        <div className="post-grid">{posts.slice(0, 6).map((post) => <PostCard key={post.id} post={post} />)}</div>
      </main>
    </Shell>
  );
}

function Articles({ posts }: { posts: Post[] }) {
  return (
    <Shell>
      <main className="page">
        <section className="page-title">
          <Clapperboard />
          <div>
            <h1>All Reviews</h1>
            <p>Books, series, adaptations, and business advice inspected under civilized lighting.</p>
          </div>
        </section>
        <div className="post-grid roomy">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>
      </main>
    </Shell>
  );
}

function Article({ post }: { post?: Post }) {
  if (!post) return <Shell><main className="page"><h1>Review not found</h1></main></Shell>;
  return (
    <Shell>
      <main className="article">
        <img className="article-cover" src={coverForSlug(post.slug)} alt="" />
        <div className="tag-row">{post.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <h1>{post.title}</h1>
        <p className="excerpt">{post.excerpt}</p>
        <ShareBar title={post.title} url={`/articles/${post.slug}`} />
        <div className="article-body" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
      </main>
    </Shell>
  );
}

function About() {
  return (
    <Shell>
      <main className="about">
        <section>
          <p className="kicker">About the author</p>
          <h1>A critic with a linen napkin in one hand and a red pencil in the other.</h1>
          <p>
            Soren Winslow reviews books and TV series as if culture were a restaurant, attention were money, and bad writing
            were a public health concern.
          </p>
        </section>
        <aside>
          <h2>Rating Menu</h2>
          <p>3 Golden Pages: masterpiece.</p>
          <p>2 Sharp Pencils: useful, original, valuable.</p>
          <p>Literary Crime Scene: fascinating disaster.</p>
        </aside>
      </main>
    </Shell>
  );
}

function AdminPostForm({ tokenReady, onSaved }: { tokenReady: boolean; onSaved: () => void }) {
  const [draft, setDraft] = useState(emptyPost);
  const update = (key: keyof typeof emptyPost, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  async function submit(event: FormEvent) {
    event.preventDefault();
    await api.createPost(draftToPayload(draft));
    setDraft(emptyPost);
    onSaved();
  }
  return (
    <form className="admin-form" onSubmit={submit}>
      <h2><Plus size={18} /> New review</h2>
      {(["title", "slug", "excerpt", "tags", "seoTitle", "seoDescription"] as const).map((key) => (
        <input key={key} value={draft[key]} onChange={(event) => update(key, event.target.value)} placeholder={key} required />
      ))}
      <textarea value={draft.contentHtml} onChange={(event) => update("contentHtml", event.target.value)} placeholder="contentHtml" required />
      <button className="primary" disabled={!tokenReady}><Save size={18} /> Publish</button>
    </form>
  );
}

function AdminEditPostForm({
  post,
  onCancel,
  onSaved
}: {
  post: Post;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState(() => postToDraft(post));
  useEffect(() => {
    setDraft(postToDraft(post));
  }, [post]);

  const update = (key: keyof typeof emptyPost, value: string) => setDraft((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    await api.updatePost(post.id, draftToPayload(draft));
    onSaved();
  }

  return (
    <form className="admin-form edit-form" onSubmit={submit}>
      <div className="form-head">
        <h2><Edit3 size={18} /> Edit review</h2>
        <button className="icon-button" type="button" title="Close editor" onClick={onCancel}><X size={18} /></button>
      </div>
      {(["title", "slug", "excerpt", "tags", "seoTitle", "seoDescription"] as const).map((key) => (
        <label key={key}>
          <span className="field-label">{key}</span>
          <input value={draft[key]} onChange={(event) => update(key, event.target.value)} required />
        </label>
      ))}
      <label>
        <span className="field-label">contentHtml</span>
        <textarea value={draft.contentHtml} onChange={(event) => update("contentHtml", event.target.value)} required />
      </label>
      <button className="primary"><Save size={18} /> Save article changes</button>
    </form>
  );
}

function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [posts, setPosts] = useState<Post[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  async function loadAdmin() {
    const [adminPosts, adminSettings] = await Promise.all([api.adminPosts(), api.getSettings()]);
    setPosts(adminPosts);
    setSettings(adminSettings);
    if (editingPost) {
      setEditingPost(adminPosts.find((post) => post.id === editingPost.id) ?? null);
    }
  }

  async function submitLogin(event: FormEvent) {
    event.preventDefault();
    await api.login(login.email, login.password);
    setLoggedIn(true);
    await loadAdmin();
  }

  async function generateNow() {
    setIsGenerating(true);
    setMessage("Generating a new review...");
    try {
      const post = await api.generateNow();
      await loadAdmin();
      setMessage(`Generated: ${post.title}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  }

  async function saveSettings() {
    if (!settings) return;
    const nextSettings = await api.updateSettings(settings);
    setSettings(nextSettings);
    setMessage("Generation settings saved");
  }

  function syncGenerationTimes(count: number, currentTimes: string[]) {
    const safeCount = Math.max(1, Math.floor(count || 1));
    const times = [...currentTimes];
    while (times.length < safeCount) times.push(times[times.length - 1] ?? "09:00");
    return times.slice(0, safeCount);
  }

  const generationSummary = settings
    ? `Create ${settings.generationFrequencyCount} article${settings.generationFrequencyCount === 1 ? "" : "s"} per ${settings.generationFrequencyPeriod} at ${settings.generationTimes.join(", ")}.`
    : "";

  if (!loggedIn) {
    return (
      <main className="admin-login">
        <form onSubmit={submitLogin}>
          <span className="brand-mark">SW</span>
          <h1>Editor Desk</h1>
          <input value={login.email} onChange={(event) => setLogin({ ...login, email: event.target.value })} placeholder="email" />
          <input type="password" value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} placeholder="password" />
          <button className="primary">Login</button>
        </form>
      </main>
    );
  }

  return (
    <main className="admin">
      <header>
        <h1>Editor Desk</h1>
        <button className="secondary" onClick={() => api.logout().then(() => setLoggedIn(false))}><LogOut size={18} /> Logout</button>
      </header>
      <div className="admin-layout">
        {editingPost ? (
          <AdminEditPostForm
            post={editingPost}
            onCancel={() => setEditingPost(null)}
            onSaved={async () => {
              await loadAdmin();
              setEditingPost(null);
              setMessage("Article changes saved");
            }}
          />
        ) : (
          <AdminPostForm tokenReady={loggedIn} onSaved={loadAdmin} />
        )}
        <section className="admin-panel">
          <h2><PenLine size={18} /> Published reviews</h2>
          {posts.map((post) => (
            <div className="admin-row" key={post.id}>
              <span>{post.title}</span>
              <div className="row-actions">
                <button title="Edit" onClick={() => setEditingPost(post)}><Edit3 size={17} /></button>
                <button
                  title="Delete"
                  onClick={() =>
                    api.deletePost(post.id).then(async () => {
                      if (editingPost?.id === post.id) setEditingPost(null);
                      await loadAdmin();
                    })
                  }
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ))}
        </section>
        {settings && (
          <section className="admin-panel wide generation-panel">
            <div className="generation-hero">
              <div>
                <p className="admin-kicker">OpenRouter writer</p>
                <h2><Sparkles size={20} /> AI article generation</h2>
                <p>Generate one full review immediately, or schedule recurring articles by period and time.</p>
              </div>
              <button className="generate-button" onClick={generateNow} disabled={isGenerating}>
                <Sparkles size={20} />
                {isGenerating ? "Generating..." : "Generate article now"}
              </button>
            </div>

            <div className="generation-grid">
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={settings.generationEnabled}
                  onChange={(event) => setSettings({ ...settings, generationEnabled: event.target.checked })}
                />
                <span>
                  <strong>Automatic generation</strong>
                  <small>{settings.generationEnabled ? generationSummary : "Disabled: only manual generation runs."}</small>
                </span>
              </label>

              <label>
                <span className="field-label"><RefreshCcw size={16} /> How many times</span>
                <input
                  min="1"
                  type="number"
                  value={settings.generationFrequencyCount}
                  onChange={(event) => {
                    const generationFrequencyCount = Math.max(1, Number(event.target.value));
                    setSettings({
                      ...settings,
                      generationFrequencyCount,
                      generationTimes: syncGenerationTimes(generationFrequencyCount, settings.generationTimes)
                    });
                  }}
                />
              </label>

              <label>
                <span className="field-label"><RefreshCcw size={16} /> Period</span>
                <select
                  value={settings.generationFrequencyPeriod}
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      generationFrequencyPeriod: event.target.value as AdminSettings["generationFrequencyPeriod"]
                    })
                  }
                >
                  <option value="day">per day</option>
                  <option value="week">per week</option>
                  <option value="month">per month</option>
                </select>
              </label>

            </div>

            <div className="generation-times">
              <div>
                <span className="field-label"><Clock size={16} /> Time for each generation</span>
                <p>Each scheduled generation gets its own time.</p>
              </div>
              <div className="time-grid">
                {settings.generationTimes.map((time, index) => (
                  <label key={`${index}-${settings.generationFrequencyCount}`}>
                    <span className="field-label">Generation {index + 1}</span>
                    <input
                      type="time"
                      value={time}
                      onChange={(event) => {
                        const generationTimes = [...settings.generationTimes];
                        generationTimes[index] = event.target.value;
                        setSettings({ ...settings, generationTimes });
                      }}
                    />
                  </label>
                ))}
              </div>
            </div>

            <p className="schedule-preview">{generationSummary}</p>

            <label className="prompt-editor">
              <span className="field-label"><PenLine size={16} /> Master prompt</span>
              <textarea
                value={settings.masterPrompt}
                onChange={(event) => setSettings({ ...settings, masterPrompt: event.target.value })}
              />
            </label>

            <div className="admin-actions">
              <button className="primary" onClick={saveSettings}><Save size={18} /> Save generation settings</button>
            </div>
            {message && <p className="message">{message}</p>}
          </section>
        )}
      </div>
    </main>
  );
}

export function App() {
  const path = usePath();
  const [posts, setPosts] = useState<Post[]>([]);
  useEffect(() => {
    api.getPosts().then(setPosts).catch(() => setPosts(fallbackPosts));
  }, []);
  const articleSlug = useMemo(() => path.match(/^\/articles\/(.+)/)?.[1], [path]);
  if (path === "/admin") return <Admin />;
  if (articleSlug) return <Article post={posts.find((post) => post.slug === articleSlug)} />;
  if (path === "/articles") return <Articles posts={posts} />;
  if (path === "/about") return <About />;
  return <Home posts={posts} />;
}
