export interface PromptBlock {
  id: string;
  imageUrl?: string;
  text?: string;
}

export interface Video {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  promptText?: string;
  prompts?: PromptBlock[];
  createdAt: any; // Firestore timestamp
}
