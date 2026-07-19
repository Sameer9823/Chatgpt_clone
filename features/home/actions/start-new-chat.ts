"use server";

import { createConversation } from "@/features/conversation/actions/conversation-actions";

/**
 * Starts a chat from the home page — reuses an existing untouched
 * "New Chat" if one exists, otherwise creates a fresh one. Prevents a new
 * empty conversation being created every time this page loads/reloads.
 *
 * @returns The ID of the conversation to redirect into.
 */
export async function startNewChat() {
    const conversation = await createConversation();
    return conversation.id;
}