//See: https://www.gatsbyjs.org/docs/node-apis/

const path = require("path")

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions

  const blogPostTemplate = path.resolve(`src/templates/blogTemplate.js`)

  return graphql(`
    {
      allMarkdownRemark(
        sort: { order: DESC, fields: [frontmatter___date] }
        filter: { frontmatter: { draft: { eq: false } } }
        limit: 1000
      ) {
        edges {
          node {
            frontmatter {
              path
              draft
            }
          }
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      return Promise.reject(result.errors)
    }

    result.data.allMarkdownRemark.edges.forEach(({ node }) => {
      createPage({
        path: node.frontmatter.path,
        component: blogPostTemplate,
        context: {}, // additional data can be passed via context
      })
    })

    // Create blog-list pages
    const posts = result.data.allMarkdownRemark.edges
      .filter(p => !p.node.frontmatter.draft)

    const postsPerPage = 10
    const numPages = Math.ceil(posts.length / postsPerPage)
    Array.from({ length: numPages }).forEach((_, i) => {
      var getPath = (index) => index === 0 ? `/` : `/page/${index + 1}`
      createPage({
        path: getPath(i),
        component: path.resolve("./src/templates/blog-list-template.js"),
        context: {
          limit: postsPerPage,
          skip: i * postsPerPage,

          next: i < numPages - 1 ? getPath(i + 1) : null,
          prev: i > 0 ? getPath(i - 1) : null
        },
      })
    })

  })
}