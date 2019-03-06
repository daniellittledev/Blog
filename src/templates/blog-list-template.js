import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"

export default class BlogList extends React.Component {
  render() {
    const posts = this.props.data.allMarkdownRemark.edges
    return (
      <Layout>
        <h2>posts</h2>
        {posts.map(({ node }) => {
          const title = node.frontmatter.title || node.fields.path
          return <div key={node.frontmatter.path}>
            <div><span>{node.frontmatter.tags && node.frontmatter.tags[0]}</span> <span>{node.frontmatter.date}</span></div>
            <a href={node.frontmatter.path}>{title}</a>
            <p>
              {node.frontmatter.description || node.excerpt}
            </p>
          </div>
        })}
        {(this.props.pageContext.next) ? <a href={this.props.pageContext.next}>Older Posts</a> : null}
        {(this.props.pageContext.prev) ? <a href={this.props.pageContext.prev}>Newer Posts</a> : null}

      </Layout>
    )
  }
}

export const blogListQuery = graphql`
  query blogListQuery($skip: Int!, $limit: Int!) {
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { draft: { eq: false } } }
      limit: $limit
      skip: $skip
    ) {
      edges {
        node {
          excerpt(pruneLength: 280)
          frontmatter {
            path
            title
            author
            date(formatString: "MMMM Do, YYYY")
            tags
          }
        }
      }
    }
  }
`