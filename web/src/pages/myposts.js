import React, {useEffect} from 'react';
import MyProf from './myprofile.js';

const MyPosts = () => {

  useEffect(() => {
    document.title = 'My Posts - ICHOR.BY';
  });

  return (
    <div>
      <MyProf />
    </div>
  );
};

export default MyPosts;
