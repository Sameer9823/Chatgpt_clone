"use client";

import Link from "next/link";
import { GitBranchIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useBranches, useDeleteBranch, useRenameBranch } from "@/features/conversation/hooks/use-branches";

/** Dropdown listing every branch in the current chat's tree, with rename/delete + switch. */
export function BranchNav({ conversationId }: { conversationId: string }) {
  const { data: branches, isLoading } = useBranches(conversationId);
  const renameBranch = useRenameBranch(conversationId);
  const deleteBranch = useDeleteBranch(conversationId);

  if (isLoading || !branches || branches.length <= 1) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-full border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
          >
            <GitBranchIcon className="size-3.5" />
            {branches.length} branches
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Branches</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-accent"
          >
            <Link
              href={`/c/${branch.id}`}
              className={cn(
                "flex-1 truncate text-sm hover:underline",
                branch.id === conversationId && "font-semibold text-primary"
              )}
            >
              {branch.title}
              {!branch.parentConversationId ? (
                <Badge className="ml-1.5 border-primary/30 bg-primary/10 text-[10px] text-primary">
                  root
                </Badge>
              ) : null}
            </Link>
            <div className="flex items-center gap-1">
              <Button
                type="button" variant="ghost" size="icon-sm"
                onClick={() => {
                  const next = window.prompt("Rename branch", branch.title);
                  if (!next || next.trim() === branch.title) return;
                  renameBranch.mutate({ id: branch.id, title: next });
                }}
              >
                <PencilIcon className="size-3.5" />
              </Button>
              {branch.parentConversationId ? (
                <Button
                  type="button" variant="ghost" size="icon-sm"
                  className="hover:text-destructive"
                  onClick={() => deleteBranch.mutate(branch.id)}
                >
                  <Trash2Icon className="size-3.5" />
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}