import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_POSTS } from '../gql/query';
import CatPosts from '../components/CatPosts';

const normalizeTag = (tag) => `${tag || ''}`.trim().replace(/^#/, '').toLowerCase();

const formatTagLabel = (tag) => {
  const cleaned = `${tag || ''}`.trim();
  return cleaned.startsWith('#') ? cleaned : `#${cleaned}`;
};

const TagPage = () => {
  const { tag } = useParams();
  const { loading, error, data } = useQuery(GET_POSTS);

  if (loading) return <p>loading...</p>;
  if (error) return <p>error...</p>;

  const requestedTag = decodeURIComponent(tag || '').trim();
  const normalizedRequestedTag = normalizeTag(requestedTag);

  const filteredPosts = (data?.getPosts || []).filter(post => {
    return (post.tags || []).filter(Boolean).some(candidate => normalizeTag(candidate) === normalizedRequestedTag);
  });

  return (
    <CatPosts
      posts={{
        catname: `Тег ${formatTagLabel(requestedTag)}`,
        posts: filteredPosts,
      }}
    />
  );
};

export default TagPage;
