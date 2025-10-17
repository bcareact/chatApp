import { atom } from 'jotai';

export type SessionUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

export const sessionUserAtom = atom<SessionUser | null>(null);

export type SelectedChat = {
  otherUserId: string | null;
};

export const selectedChatAtom = atom<SelectedChat>({ otherUserId: null });

// Presence map keyed by userId
export const presenceAtom = atom<Record<string, { online: boolean; lastSeen?: number }>>({});

// Typing indicators per conversation (key: otherUserId)
export const typingAtom = atom<Record<string, boolean>>({});

// Read states per conversation (key: otherUserId)
export const readStateAtom = atom<Record<string, string | number>>({});


