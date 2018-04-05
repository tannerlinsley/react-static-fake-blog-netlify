import React from 'react'
import { withRouteData, Link } from 'react-static'
//

export default withRouteData(({ post, user }) => (
  <div>
    <Link to="/blog/">{'<'} All Posts</Link>
    <br />
    <h3>{post.title}</h3>
    <h5>
      By <Link to={`/users/${user.username}`}>{user.name}</Link>
    </h5>
    <p>{post.body}</p>
  </div>
))
