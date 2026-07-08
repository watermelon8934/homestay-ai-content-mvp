export type Property = {
  name: string;
  city: string;
  roomCount?: string;
  highlights?: string; // 卖点标签，逗号分隔
  surroundings?: string; // 周边关键词
  petPolicy?: string;
  notes?: string;
};

export type UploadedImage = {
  id: string;
  name: string;
  dataUrl: string;
};

export type NoteDraft = {
  id: string;
  createdAt: number;
  property: Property;
  reviewInput: string;
  reviewImages?: UploadedImage[];
  titles: string[];
  body: string;
  tags: string[];
  imageIdeas: string[];
  rationale: string;
  risks: string[];
};
