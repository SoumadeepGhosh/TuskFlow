'use client';

import React from 'react';
import Link from 'next/link';
import { Board } from '@/types/board';
import { Card } from '@/components/ui/card';
import { Kanban, ArrowRight, Calendar } from 'lucide-react';

interface BoardCardProps {
  board: Board;
}

export function BoardCard({ board }: BoardCardProps) {
  return (
    <Link href={`/boards/${board.id}`} className="block group">
      <Card className="p-5 h-full flex flex-col justify-between hover:shadow-md hover:border-primary/40 transition-all">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Kanban className="w-5 h-5" />
            </div>
            {board._count?.columns !== undefined && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {board._count.columns} columns
              </span>
            )}
          </div>

          <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors mb-1.5 truncate">
            {board.name}
          </h3>

          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {board.description || 'No description provided.'}
          </p>
        </div>

        <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(board.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span className="flex items-center gap-1 text-primary font-semibold text-xs group-hover:translate-x-0.5 transition-transform">
            Open Board <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Card>
    </Link>
  );
}

