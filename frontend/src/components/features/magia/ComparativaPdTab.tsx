"use client";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Card } from "@/components/ui/Card";

const markdownComponents = {
  h1: ({ node, ...props }: any) => <h1 className="text-heading font-extrabold text-foreground mb-6 pb-2 border-b border-white/10" {...props} />,
  h2: ({ node, ...props }: any) => <h2 className="text-subheading font-bold text-accent mt-8 mb-4 flex items-center gap-2" {...props} />,
  h3: ({ node, ...props }: any) => <h3 className="text-subheading font-bold text-foreground mt-6 mb-3" {...props} />,
  p: ({ node, ...props }: any) => <p className="text-muted leading-relaxed mb-4" {...props} />,
  ul: ({ node, className, ...props }: any) => <ul className={`list-none space-y-3 mb-6 ml-4 ${className || ''}`} {...props} />,
  ol: ({ node, className, ...props }: any) => <ol className={`list-decimal space-y-3 mb-6 ml-6 ${className || ''}`} {...props} />,
  li: ({ node, ...props }: any) => <li className="text-body text-muted leading-relaxed" {...props} />,
  strong: ({ node, ...props }: any) => <strong className="font-bold text-foreground" {...props} />,
  a: ({ node, ...props }: any) => <a className="text-accent hover:underline font-semibold" target="_blank" rel="noopener noreferrer" {...props} />,
  code: ({ node, ...props }: any) => <code className="bg-foreground/10 text-foreground px-1.5 py-0.5 rounded text-body font-mono" {...props} />,
  pre: ({ node, ...props }: any) => <pre className="block bg-foreground/5 p-4 rounded-xl text-body font-mono overflow-x-auto mb-4 border border-white/5 text-muted" {...props} />,
  hr: ({ node, ...props }: any) => <hr className="border-white/10 my-8" {...props} />,
  table: ({ node, ...props }: any) => <div className="overflow-x-auto mb-6"><table className="w-full text-left border-collapse" {...props} /></div>,
  th: ({ node, ...props }: any) => <th className="p-2 border border-[var(--glass-border)] bg-foreground/5 text-body font-bold text-foreground" {...props} />,
  td: ({ node, ...props }: any) => <td className="p-2 border border-[var(--glass-border)] text-body text-muted" {...props} />,
};

export function ComparativaPdTab() {
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    if (content !== null) return;
    fetch("/Comparativa_PD.md")
      .then(res => res.text())
      .then(text => setContent(text))
      .catch(err => {
        console.error(err);
        setContent("Error cargando el contenido.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card glow className="p-8">
      <style>{`
        .pd-comparativa table { table-layout: fixed; width: 100%; }
        .pd-comparativa th:nth-child(1), .pd-comparativa td:nth-child(1) { width: 3.5rem; }
        .pd-comparativa th:nth-child(2), .pd-comparativa td:nth-child(2) { width: 30%; }
        .pd-comparativa th:nth-child(3), .pd-comparativa td:nth-child(3),
        .pd-comparativa th:nth-child(4), .pd-comparativa td:nth-child(4),
        .pd-comparativa th:nth-child(5), .pd-comparativa td:nth-child(5) { width: 23%; }
        .pd-comparativa th, .pd-comparativa td { vertical-align: top; word-break: break-word; }
        .pd-comparativa th {
          text-align: left;
          font-size: 1rem;
          font-weight: 800;
          color: #ffffff;
          background: rgba(245, 158, 11, 0.15);
          border-bottom: 2px solid rgba(245, 158, 11, 0.5);
        }
      `}</style>
      {content === null ? (
        <div className="flex justify-center p-8 text-muted">Cargando...</div>
      ) : (
        <div className="markdown-body pd-comparativa prose prose-invert max-w-none prose-h2:text-info prose-h3:text-success prose-td:border-foreground/10 prose-th:border-foreground/20 prose-table:border-collapse prose-table:w-full">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>
            {content}
          </ReactMarkdown>
        </div>
      )}
    </Card>
  );
}
