export interface Video {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  promptText: string;
  createdAt: any; // Firestore timestamp
}
