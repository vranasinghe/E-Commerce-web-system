import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ChatMessage({ content }: { content: string }) {
  return (
    <div className="min-w-0 space-y-2 [overflow-wrap:anywhere]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        allowedElements={[
          "p", "strong", "em", "del", "a", "ul", "ol", "li", "br",
          "code", "pre", "blockquote", "h1", "h2", "h3", "h4",
          "table", "thead", "tbody", "tr", "th", "td", "hr",
        ]}
        components={{
          p: ({ children }) => <p className="whitespace-pre-wrap leading-relaxed">{children}</p>,
          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
          a: ({ href, children }) => {
            if (!href || !/^(https?:\/\/|\/(?!\/)|#)/i.test(href)) return <>{children}</>;
            const external = /^https?:\/\//i.test(href);
            return (
              <a
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="font-medium underline decoration-current underline-offset-2 hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {children}
              </a>
            );
          },
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children, start }) => <ol start={start} className="list-decimal space-y-1 pl-5">{children}</ol>,
          li: ({ children }) => <li className="pl-0.5 [&>p]:inline">{children}</li>,
          h1: ({ children }) => <h3 className="font-semibold">{children}</h3>,
          h2: ({ children }) => <h3 className="font-semibold">{children}</h3>,
          h3: ({ children }) => <h3 className="font-semibold">{children}</h3>,
          h4: ({ children }) => <h4 className="font-semibold">{children}</h4>,
          pre: ({ children }) => <pre className="max-w-full overflow-x-auto rounded-lg bg-black/5 p-2 text-sm">{children}</pre>,
          code: ({ children }) => <code className="rounded bg-black/5 px-1 text-[0.9em]">{children}</code>,
          blockquote: ({ children }) => <blockquote className="space-y-2 pl-3 italic">{children}</blockquote>,
          table: ({ children }) => <div className="max-w-full overflow-x-auto"><table className="w-full border-collapse text-left text-sm">{children}</table></div>,
          th: ({ children }) => <th className="border-b border-neutral-300 px-2 py-1 font-semibold">{children}</th>,
          td: ({ children }) => <td className="border-b border-neutral-200 px-2 py-1 align-top">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
