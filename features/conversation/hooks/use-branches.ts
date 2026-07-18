"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createBranch, deleteBranch, listBranches, renameBranch } from "@/features/conversation/actions/branch-actions";
import { queryKeys } from "../utils/query-keys";

export function useBranches(conversationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.branches.byConversation(conversationId ?? "none"),
    queryFn: () => listBranches(conversationId!),
    enabled: Boolean(conversationId),
  });
}

export function useCreateBranch(conversationId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ messageId, name }: { messageId: string; name?: string }) => createBranch(messageId, name),
    onSuccess: (branch) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.branches.byConversation(conversationId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
      toast.success("Branch created");
      router.push(`/c/${branch.id}`);
    },
    onError: (error: Error) => toast.error(error.message || "Could not create branch"),
  });
}

export function useRenameBranch(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => renameBranch(id, title),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.branches.byConversation(conversationId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
    },
    onError: (error: Error) => toast.error(error.message || "Could not rename branch"),
  });
}

export function useDeleteBranch(conversationId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => deleteBranch(id),
    onSuccess: ({ id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.branches.byConversation(conversationId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
      if (id === conversationId) router.push("/chat");
      toast.success("Branch deleted");
    },
    onError: (error: Error) => toast.error(error.message || "Could not delete branch"),
  });
}