import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import "./blog-list-template.css"
import Tags from "../components/tags";

export default class BlogList extends React.Component {
  render() {
    const posts = this.props.data.allMarkdownRemark.edges
    return (
      <Layout>
        <div className="blog-list">
          {posts.map(({ node }) => {
            const title = node.frontmatter.title || node.fields.path
            return (
            <div className="post-preview" key={node.frontmatter.path}>
              <div className="content">
                <div className="post-metadata">
                  <div>{ node.frontmatter.tags && node.frontmatter.tags[0] && <span className="tag">{node.frontmatter.tags && node.frontmatter.tags[0]}</span> }</div>
                  { node.frontmatter.date && <time>{node.frontmatter.date}</time> }
                </div>
                <h2><a href={node.frontmatter.path}>{title}</a></h2>
                <p className="excerpt">
                  {node.frontmatter.description || node.excerpt}
                </p>
              </div>
            </div>)
          })}
          <div className="pagination">
            <div className="content">
              {(this.props.pageContext.next) ? <a className="next" href={this.props.pageContext.next}>Older Posts</a> : null}
              {(this.props.pageContext.prev) ? <a className="previous" href={this.props.pageContext.prev}>Newer Posts</a> : null}
            </div>
          </div>
        </div>
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