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
  return Snippet.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
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
