import React, {useEffect} from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import ReactMarkdown from 'react-markdown';

import { GET_NOTES, GET_POST, GET_CAT } from '../gql/query';

const CatPage = () => {

  let  { id } = useParams();

  const { loading, error, data, fetchMore } = useQuery(GET_CAT, {variables: {id},
  refetchQueries: [{query: GET_NOTES, GET_POST }]});
  if (loading) return <p>loading...</p>;
  if (error) return <p>error...</p>;

  let cname = data.getCat.catname;

  useEffect(() => {
    document.title = 'Cats - ICHOR.BY';
  });

  return (
  <div className="cats_block">
  <div className="all-post-block">
    <div className="all_post">
      {data.getCat.catname}
    </div>
  </div>
  <div className="cat-post-li">
    <ul>
      {data.getCat.posts.map(post => (
        <li key={post._id} className="mypost_li">
        <Link  to={`/cats/${cname}/post/${post._id}`}>
            <h1>{post.title}</h1>
        </Link>
              <div className="css-plank-cat">
                <span>{post.createdAt}</span>
                  <Link  to={`/users/${post.author._id}`}>
                    {`author ${post.author.name}`}
                  </Link>
                <span>{`views ${post.viewsCount}`}</span>
              </div>
          </li>
      ))}
    </ul>
    </div>
  </div>
);
};

export default CatPage;
