"use server";

import { requireUser } from "@/features/auth/action/require-user";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { revalidatePath } from "next/cache";

export type BranchListItem = {
  id: string;
  title: string;
  parentConversationId: string | null;
  branchPointMessageId: string | null;
  rootConversationId: string | null;
  isPinned: boolean;
  isArchived: boolean;
  lastMessageAt: Date;
  createdAt: Date;
};

async function assertOwnsConversation(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
  });
  if (!conversation) throw new Error("Conversation not found");
  return conversation;
}

/**
 * Creates a new branch starting from `fromMessageId`: copies every message
 * up to and including the branch point into a fresh conversation. The
 * shared prefix is preserved by value, so each branch can diverge freely.
 */
export async function createBranch(fromMessageId: string, name?: string) {
  const user = await requireUser();

  const message = await prisma.message.findUnique({
    where: { id: fromMessageId },
    include: { conversation: true },
  });

  if (!message || message.conversation.userId !== user.id) {
    throw new Error("Message not found");
  }

  const source = message.conversation;

  const priorMessages = await prisma.message.findMany({
    where: { conversationId: source.id, createdAt: { lte: message.createdAt } },
    orderBy: { createdAt: "asc" },
  });

  const rootConversationId = source.rootConversationId ?? source.id;

  const branch = await prisma.$transaction(async (tx) => {
    const created = await tx.conversation.create({
      data: {
        userId: user.id,
        title: name?.trim() || `${source.title} (branch)`,
        model: source.model,
        systemPrompt: source.systemPrompt,
        parentConversationId: source.id,
        branchPointMessageId: fromMessageId,
        rootConversationId,
        lastMessageAt: message.createdAt,
      },
    });

    if (priorMessages.length > 0) {
      await tx.message.createMany({
        data: priorMessages.map((m) => ({
          conversationId: created.id,
          role: m.role,
          status: m.status,
          content: m.content,
          parts: (m.parts ?? undefined) as Prisma.InputJsonValue | undefined,
          metadata: (m.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
          createdAt: m.createdAt,
        })),
      });
    }

    return created;
  });

  revalidatePath("/chat");
  return branch;
}

/** Every conversation in the same branch tree as `conversationId` (root + all branches). */
export async function listBranches(conversationId: string): Promise<BranchListItem[]> {
  const user = await requireUser();
  const conversation = await assertOwnsConversation(conversationId, user.id);
  const rootId = conversation.rootConversationId ?? conversation.id;

  return prisma.conversation.findMany({
    where: { userId: user.id, OR: [{ id: rootId }, { rootConversationId: rootId }] },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, title: true, parentConversationId: true, branchPointMessageId: true,
      rootConversationId: true, isPinned: true, isArchived: true, lastMessageAt: true, createdAt: true,
    },
  });
}

export async function renameBranch(conversationId: string, title: string) {
  const user = await requireUser();
  await assertOwnsConversation(conversationId, user.id);

  const trimmed = title.trim();
  if (!trimmed) throw new Error("Name cannot be empty");

  const updated = await prisma.conversation.update({
    where: { id: conversationId },
    data: { title: trimmed },
  });

  revalidatePath("/chat");
  revalidatePath(`/c/${conversationId}`);
  return updated;
}

/** Deletes a branch. Any children get re-parented to null by the FK (still findable via rootConversationId). */
export async function deleteBranch(conversationId: string) {
  const user = await requireUser();
  const conversation = await assertOwnsConversation(conversationId, user.id);

  if (!conversation.parentConversationId) {
    throw new Error("The root conversation can't be deleted as a branch — delete the chat instead.");
  }

  await prisma.conversation.delete({ where: { id: conversationId } });
  revalidatePath("/chat");
  return { id: conversationId };
}