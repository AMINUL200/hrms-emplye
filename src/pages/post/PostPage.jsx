import React, { useContext, useEffect, useState } from 'react'
import Post from '../../component/posts/Post'
import { EmployeeContext } from '../../context/EmployeeContext';
import { AuthContext } from '../../context/AuthContex';
import PageLoader from '../../component/loader/PageLoader';

const PostPage = () => {
  const { postsData, getPostData } = useContext(EmployeeContext);
  const { token } = useContext(AuthContext);
  const [Loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      getPostData(token).finally(() => {
        setLoading(false);
      });
    }
  }, [token]);

  if (Loading) {
    return <PageLoader />
  }


  return (
    <div className="container post-container" style={{ maxWidth: '740px', margin: '0 auto' }}>
      <Post posts={postsData} />
    </div>
  )
}

export default PostPage
