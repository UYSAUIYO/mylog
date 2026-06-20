import { Metadata } from "next";
import { getFriendLinksByCategory } from "@/lib/db/friendLinks";
import GlassCard from "@/components/glass/GlassCard";

export const metadata: Metadata = {
  title: "友情链接",
  description: "友情链接与推荐网站",
};

export default async function LinksPage() {
  const grouped = await getFriendLinksByCategory();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          友情链接
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          以下是一些优秀的朋友博客和推荐网站，欢迎交流互访。
        </p>
      </div>

      {grouped.length === 0 && (
        <div className="text-center py-24 text-zinc-400 dark:text-zinc-500">
          暂无友情链接
        </div>
      )}

      <div className="space-y-10">
        {grouped.map((group) => (
          <section key={group.category}>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
              {group.category}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <GlassCard
                    variant="sm"
                    hover
                    className="h-full flex items-start gap-4"
                  >
                    {link.icon ? (
                      <img
                        src={link.icon}
                        alt={link.name}
                        className="w-10 h-10 rounded-lg shrink-0 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-200/30 dark:border-blue-800/30 flex items-center justify-center shrink-0 text-lg font-bold text-blue-600 dark:text-blue-400">
                        {link.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm truncate flex items-center gap-1.5">
                        {link.name}
                        <svg
                          className="w-3.5 h-3.5 shrink-0 text-zinc-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </h3>
                      {link.description && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {link.description}
                        </p>
                      )}
                    </div>
                  </GlassCard>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
