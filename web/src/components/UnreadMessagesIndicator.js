import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_UNREAD_MESSAGES_COUNT } from '../gql/query';
import UnreadBadge from './UnreadBadge';

const UnreadMessagesIndicator = () => {
  const { data, loading, error } = useQuery(GET_UNREAD_MESSAGES_COUNT, {
    fetchPolicy: 'network-only'
  });
  if (loading || error) return null;
  const count = data?.getUnreadMessagesCount || 0;
  return <UnreadBadge count={count} />;
};

export default UnreadMessagesIndicator;
