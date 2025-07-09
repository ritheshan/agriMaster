import api from './api';

export const communityService = {
  getAllPosts: async (page = 1, limit = 10) => {
    return await api.get('/community/posts', { params: { page, limit } });
  },
  
  getPostById: async (id) => {
    return await api.get(`/community/posts/${id}`);
  },
  
  createPost: async (postData) => {
    // Using FormData for file uploads
    const formData = new FormData();
    
    // Append text fields
    formData.append('content', postData.content);
    
    // Append media files if any
    if (postData.media && postData.media.length) {
      postData.media.forEach((file, index) => {
        formData.append('media', file);
      });
    }
    
    return await api.post('/community/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  likePost: async (postId) => {
    return await api.post(`/community/posts/${postId}/like`);
  },
  
  unlikePost: async (postId) => {
    return await api.delete(`/community/posts/${postId}/like`);
  },
  
  addComment: async (postId, content) => {
    return await api.post(`/community/posts/${postId}/comments`, { content });
  },
  
  deleteComment: async (postId, commentId) => {
    return await api.delete(`/community/posts/${postId}/comments/${commentId}`);
  }
};

export default communityService;
