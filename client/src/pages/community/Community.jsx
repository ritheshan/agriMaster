import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import communityService from '../../services/communityService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

// Main component that handles community feature routing
const Community = () => {
  return (
    <Routes>
      <Route index element={<CommunityFeed />} />
      <Route path="post/:id" element={<PostDetail />} />
      <Route path="create" element={<CreatePost />} />
    </Routes>
  );
};

// Component for the community feed (home page)
const CommunityFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all'); // all, questions, articles, media
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [page, filter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await communityService.getPosts(page, 10, filter);
      setPosts(response.data.posts);
      setTotalPages(Math.ceil(response.data.totalCount / 10));
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      toast.error('Failed to load community posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await communityService.likePost(postId);
      // Update post in the state
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Failed to like post:', error);
      toast.error('Failed to like post. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Community</h1>
        <Link
          to="/community/create"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Create Post
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded-md ${
            filter === 'all' 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setFilter('all')}
        >
          All Posts
        </button>
        <button
          className={`px-4 py-2 rounded-md ${
            filter === 'questions' 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setFilter('questions')}
        >
          Questions
        </button>
        <button
          className={`px-4 py-2 rounded-md ${
            filter === 'articles' 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setFilter('articles')}
        >
          Articles
        </button>
        <button
          className={`px-4 py-2 rounded-md ${
            filter === 'media' 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setFilter('media')}
        >
          Media
        </button>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="h-40 bg-gray-200 rounded mb-4"></div>
              <div className="flex space-x-4">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-gray-700">No posts found</h2>
          <p className="mt-2 text-gray-500">
            {filter !== 'all' 
              ? `There are no ${filter} posts yet.`
              : 'Be the first to share something with the community!'}
          </p>
          <Link
            to="/community/create"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Create the First Post
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={post.author.profilePicture || '/default-avatar.png'}
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                    <div>
                      <div className="font-medium text-gray-800">
                        {post.author.name}
                        {post.author.role === 'expert' && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">Expert</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{formatDate(post.createdAt)}</div>
                    </div>
                  </div>

                  <Link to={`/community/post/${post._id}`} className="block">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2 hover:text-primary-600">
                      {post.title}
                    </h2>
                  </Link>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>

                  {post.media && post.media.length > 0 && (
                    <div className="mb-4">
                      {post.media[0].type.startsWith('image/') ? (
                        <img
                          src={post.media[0].url}
                          alt="Post media"
                          className="w-full h-60 object-cover rounded-md"
                        />
                      ) : post.media[0].type.startsWith('video/') ? (
                        <video
                          src={post.media[0].url}
                          className="w-full h-60 object-contain rounded-md"
                          controls
                        />
                      ) : null}
                      
                      {post.media.length > 1 && (
                        <div className="mt-2 text-sm text-gray-500">
                          +{post.media.length - 1} more {post.media.length === 2 ? 'item' : 'items'}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-gray-600">
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center text-sm font-medium ${post.isLiked ? 'text-primary-600' : ''}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill={post.isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      {post.likes} {post.likes === 1 ? 'like' : 'likes'}
                    </button>
                    
                    <Link to={`/community/post/${post._id}`} className="flex items-center text-sm font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {post.comments} {post.comments === 1 ? 'comment' : 'comments'}
                    </Link>
                    
                    <button className="flex items-center text-sm font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </button>

                    {post.tags && post.tags.length > 0 && (
                      <div className="ml-auto flex flex-wrap gap-2">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-1">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setPage(index + 1)}
                    className={`px-3 py-1 rounded-md border ${
                      page === index + 1
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Component for viewing a single post and its comments
const PostDetail = () => {
  // This is a placeholder component.
  // The actual implementation will be added in future PRs
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Post Detail (Coming Soon)
      </h1>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              This feature is under development. Please check back later.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Link to="/community" className="text-primary-600 hover:text-primary-800 font-medium">
          &larr; Back to Community
        </Link>
      </div>
    </div>
  );
};

// Component for creating a new post
const CreatePost = () => {
  // This is a placeholder component.
  // The actual implementation will be added in future PRs
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Create Post (Coming Soon)
      </h1>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              This feature is under development. Please check back later.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Link to="/community" className="text-primary-600 hover:text-primary-800 font-medium">
          &larr; Back to Community
        </Link>
      </div>
    </div>
  );
};

export default Community;
