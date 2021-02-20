import React from "react"
import { StaticQuery, graphql } from "gatsby"

import Layout from "../components/layout"
import "./blog-list-template.css"

import PostMetadata from "../components/post-metadata"
import { Helmet } from "react-helmet"

export default class BlogList extends React.Component {
  render() {
    const data = this.props.data
    const posts = this.props.data.allMarkdownRemark.edges
    const metadata = data.site.siteMetadata
    metadata.pageUrl = `${data.site.siteMetadata.siteUrl}${this.props.url_path}`
    return (
      <Layout>
        <Helmet>
          <title>Daniel Little Dev</title>
          <meta name="description" content={metadata.description}/>
          <link rel="canonical" href={metadata.pageUrl} />

          <meta property="og:site_name" content={metadata.title}/>
          <meta property="og:type" content="website"/>
          <meta property="og:title" content={metadata.title}/>
          <meta property="og:description" content={metadata.description}/>
          <meta property="og:url" content={metadata.pageUrl}/>

          <meta name="twitter:card" content="summary"/>
          <meta name="twitter:title" content={metadata.title}/>
          <meta name="twitter:description" content={metadata.description}/>
          <meta name="twitter:url" content={metadata.pageUrl}/>
          <meta name="twitter:site" content={ "@" + metadata.twitterHandle }/>

        </Helmet>
        <div className="blog-list">
          {posts.map(({ node }) => {
            const title = node.frontmatter.title || node.fields.path
            return (
            <div className="post-preview" key={node.frontmatter.path}>
              <div className="content">
                <PostMetadata frontmatter={node.frontmatter}/>
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
              <div className="clear"/>
            </div>
          </div>
        </div>
      </Layout>
    )
  }
}

export const blogListQuery = graphql`
  query BlogListQuery($skip: Int!, $limit: Int!) {
    site {
      siteMetadata {
        title
        description
        siteUrl
        twitterHandle
      }
    }
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