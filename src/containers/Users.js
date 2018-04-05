import React from 'react'
import { withRouteData, Link } from 'react-static'
//

export default withRouteData(({ users }) => (
  <div>
    <h1>All of the users!</h1>
    <ul>
      {users.map(user => (
        <li key={user.id}>
          <Link to={`/users/${user.username}/`}>{user.name}</Link>
        </li>
      ))}
    </ul>
  </div>
))
