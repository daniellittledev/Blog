//See: https://www.gatsbyjs.org/docs/node-apis/

const path = require("path")
const _ = require("lodash")

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions

  const blogPostTemplate = path.resolve(`./src/templates/blogTemplate.js`)
  const listTemplate = path.resolve("./src/templates/blog-list-template.js")
  const tagTemplate = path.resolve("./src/templates/tags.js")

  return graphql(`
    {
      allMarkdownRemark(
        sort: { order: DESC, fields: [frontmatter___date] }
        limit: 1000
      ) {
        edges {
          node {
            frontmatter {
              path
              draft
              tags
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
    const getPath = (index) => index === 0 ? `/` : `/page/${index + 1}`
    Array.from({ length: numPages }).forEach((_, i) => {
      const path = getPath(i)
      createPage({
        path,
        component: listTemplate,
        context: {
          url_path: path,

          limit: postsPerPage,
          skip: i * postsPerPage,

          next: i < numPages - 1 ? getPath(i + 1) : null,
          prev: i > 0 ? getPath(i - 1) : null
        },
      })
    })

    // Tag pages:
    let tags = []
    // Iterate through each post, putting all found tags into `tags`
    _.each(posts, edge => {
      if (_.get(edge, "node.frontmatter.tags")) {
        tags = tags.concat(edge.node.frontmatter.tags)
      }
    })
    // Eliminate duplicate tags
    tags = _.uniq(tags)

    // Make tag pages
    tags.forEach(tag => {
      createPage({
        path: `/tags/${_.kebabCase(tag)}/`,
        component: tagTemplate,
        context: {
          tag,
        },
      })
    })


    // RSS Feed

    const { createFilePath } = require(`gatsby-source-filesystem`)

    exports.onCreateNode = ({ node, actions, getNode }) => {
      const { createNodeField } = actions
      if (node.internal.type === `MarkdownRemark`) {
        const value = createFilePath({ node, getNode })
        createNodeField({
          name: `path`,
          node,
          value,
        })
      }
    }

  })
}