export type Participant = {
  id: string;
  name: string;
  position: number;
  swish_number: string | null;
};

export type Share = {
  participant_id: string;
  weight: number;
  amount_cents: number | null;
};

export type EntryKind = "expense" | "transfer";

export type Entry = {
  id: string;
  kind: EntryKind;
  description: string | null;
  amount_cents: number;
  paid_by: string;
  transfer_to: string | null;
  entry_date: string;
  created_at: string;
  shares: Share[];
};

export type Kitty = {
  key: string;
  title: string;
  currency: string;
  created_at: string;
  has_owner: boolean;
  auto_purge: boolean;
};

export type KittyData = {
  kitty: Kitty;
  participants: Participant[];
  entries: Entry[];
};

export type KittySummary = {
  key: string;
  title: string;
  currency: string;
  created_at: string;
  participant_count: number;
  entry_count: number;
};
