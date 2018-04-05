import axios from 'axios'
import React, { Component } from 'react'
import { ServerStyleSheet } from 'styled-components'

export default {
  getSiteData: () => ({
    title: 'React Static',
  }),
  getRoutes: async () => {
    const { data: posts } = await axios.get('https://jsonplaceholder.typicode.com/posts')
    const { data: users } = await axios.get('https://jsonplaceholder.typicode.com/users')

    const postsByUserID = {}

    posts.forEach(post => {
      postsByUserID[post.userId] = postsByUserID[post.userId] || []
      postsByUserID[post.userId].push(post)
    })

    return [
      {
        path: '/',
        component: 'src/containers/Home',
      },
      {
        path: '/about',
        component: 'src/containers/About',
      },
      // Make an index route for every 5 blog posts
      ...makePageRoutes({
        items: posts,
        pageSize: 5,
        pageToken: 'page',
        route: {
          path: 'blog',
          component: 'src/containers/Blog',
        },
        decorate: (posts, i, totalPages) => ({
          getData: () => ({
            posts,
            currentPage: i,
            totalPages,
          }),
        }),
      }),
      // Make the routes for each blog post
      ...posts.map(post => ({
        path: `/blog/post/${post.id}`,
        component: 'src/containers/Post',
        getData: () => ({
          post,
          user: users.find(user => user.id === post.userId),
        }),
      })),
      {
        path: '/users',
        component: 'src/containers/Users',
        getData: () => ({
          users,
        }),
        children: users.map(user => ({
          path: `/${user.username}`,
          component: 'src/containers/User',
          getData: () => ({
            user,
            posts: postsByUserID[user.id],
          }),
        })),
      },
      {
        is404: true,
        component: 'src/containers/404',
      },
    ]
  },
  renderToHtml: (render, Comp, meta) => {
    const sheet = new ServerStyleSheet()
    const html = render(sheet.collectStyles(<Comp />))
    meta.styleTags = sheet.getStyleElement()
    return html
  },
  Document: class CustomHtml extends Component {
    render () {
      const {
        Html, Head, Body, children, renderMeta,
      } = this.props

      return (
        <Html>
          <Head>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            {renderMeta.styleTags}
          </Head>
          <Body>{children}</Body>
        </Html>
      )
    }
  },
}

function makePageRoutes ({
  items, pageSize, pageToken = 'page', route, decorate,
}) {
  const itemsCopy = [...items] // Make a copy of the items
  const pages = [] // Make an array for all of the different pages

  while (itemsCopy.length) {
    // Splice out all of the items into separate pages using a set pageSize
    pages.push(itemsCopy.splice(0, pageSize))
  }

  const totalPages = pages.length

  // Move the first page out of pagination. This is so page one doesn't require a page number.
  const firstPage = pages[0]

  const routes = [
    {
      ...route,
      ...decorate(firstPage, 1, totalPages), // and only pass the first page as data
    },
    // map over each page to create an array of page routes, and spread it!
    ...pages.map((page, i) => ({
      ...route, // route defaults
      path: `${route.path}/${pageToken}/${i + 1}`,
      ...decorate(page, i + 1, totalPages),
    })),
  ]

  return routes
}
