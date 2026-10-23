'use client';

import React from 'react';
import { motion } from 'framer-motion';

const techStack = [
  { label: 'Next.js', color: 'bg-gray-900 text-white' },
  { label: 'NestJS', color: 'bg-red-600 text-white' },
  { label: 'TypeScript', color: 'bg-blue-600 text-white' },
  { label: 'PostgreSQL', color: 'bg-blue-800 text-white' },
  { label: 'Redis', color: 'bg-red-500 text-white' },
  { label: 'Socket.IO', color: 'bg-gray-800 text-white' },
  { label: 'JWT Auth', color: 'bg-purple-600 text-white' },
  { label: 'Docker', color: 'bg-sky-600 text-white' },
  { label: 'REST API', color: 'bg-emerald-600 text-white' },
  { label: 'Tailwind CSS', color: 'bg-cyan-600 text-white' },
];

const codeSnippet = `// Join a workspace — TaskFlow REST API
const response = await fetch('/api/workspaces', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`,
  },
  body: JSON.stringify({ name: 'My Team' }),
});

const { workspace } = await response.json();
// workspace.id, workspace.members, workspace.role`;

export function LandingShowcase() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto" id="docs">
      <div className="flex flex-col lg:flex-row items-center gap-16">
        {/* Left copy */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 max-w-md"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[#4F46E5] mb-3">Developer Friendly</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
            Built on a modern, open stack.
          </h2>
          <p className="mt-4 text-gray-500 leading-relaxed">
            TaskFlow is built with technologies your team already knows. The REST API is fully documented.
            Everything is typed end-to-end with TypeScript.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {techStack.map((t) => (
              <span key={t.label} className={`text-xs font-semibold px-2.5 py-1 rounded-md ${t.color}`}>
                {t.label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Right — code snippet */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 w-full max-w-lg"
        >
          <div className="rounded-2xl bg-gray-950 overflow-hidden border border-gray-800 shadow-xl">
            {/* Window bar */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-800/80">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              <span className="ml-3 text-xs text-gray-500 font-mono">workspace-api.ts</span>
            </div>
            {/* Code */}
            <pre className="px-5 py-5 text-xs leading-[1.8] text-gray-300 font-mono overflow-x-auto">
              <code>{codeSnippet.split('\n').map((line, i) => {
                const colored = line
                  .replace(/(\/\/.*)/g, '<span class="text-gray-500">$1</span>')
                  .replace(/(\bconst\b|\bawait\b|\bfetch\b|\bnew\b|\breturn\b)/g, '<span class="text-purple-400">$1</span>')
                  .replace(/('([^']*)'|`([^`]*)`)/g, '<span class="text-emerald-400">$&</span>');
                return (
                  <span key={i} dangerouslySetInnerHTML={{ __html: colored + '\n' }} />
                );
              })}</code>
            </pre>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
