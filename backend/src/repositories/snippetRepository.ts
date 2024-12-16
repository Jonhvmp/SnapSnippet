import { Snippet } from '../models/Snippet';

export const createSnippet = (snippetData: any) => {
  const snippet = new Snippet(snippetData); 
  return snippet.save();
};

export const findSnippetsByUser = (userId: string) => {
  return Snippet.find({ user: userId });
};

export const findSnippetById = (id: string) => {
  return Snippet.findById(id);
};

export const updateSnippetById = (id: string, updateData: any) => {
  // Validate updateData to ensure it only contains allowed fields
  const allowedFields = ['title', 'description', 'language', 'tags', 'code', 'favorite'];
  const sanitizedData: any = {};
  for (const key in updateData) {
    if (allowedFields.includes(key)) {
      sanitizedData[key] = updateData[key];
    }
  }
  return Snippet.findByIdAndUpdate(id, { $set: sanitizedData }, { new: true, runValidators: true });
};

export const deleteSnippetById = (id: string) => {
  return Snippet.findByIdAndDelete(id);
};

export const findFavoriteSnippetsByUser = (userId: string) => {
  return Snippet.find({ user: userId, favorite: true });
};

export const findSnippetBySharedLink = (link: string) => {
  return Snippet.findOne({ sharedLink: link });
};
