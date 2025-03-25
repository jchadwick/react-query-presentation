export interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: string;
}

export interface NewPost {
  title: string;
  content: string;
}
