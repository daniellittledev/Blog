import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import PostMetadata from "../components/post-metadata"
import TagList from "../components/tag-list"
import Helmet from "react-helmet"
import "prismjs/themes/prism-solarizedlight.css"
import Img from "gatsby-image"

function first(values) {
  values = (values || [])
  return values.length > 0 ? values[0] : ""
}

function csv(values) {
  return (values || []).join(', ')
}

export default function Template({
  data, // this prop will be injected by the GraphQL query below.
}) {
  const { markdownRemark } = data // data.markdownRemark holds our post data
  const { frontmatter, html } = markdownRemark
  const meta = data.site.siteMetadata
  return (
    <Layout>
      <Helmet>
        <title>{frontmatter.title}</title>
        <meta name="twitter:label1" content="Written by"/>
        <meta name="twitter:data1" content={meta.author}/>
        <meta name="twitter:label2" content="Filed under"/>
        <meta name="twitter:data2" content={csv(frontmatter.tags)}/>
        <meta name="twitter:site" content={ "@" + meta.twitterHandle }/>
        <meta name="twitter:creator" content={ "@" + meta.twitterHandle }/>
        { frontmatter.image && (<meta name="twitter:image" content={`${meta.siteUrl}${frontmatter.image}`}/>)}

        <meta property="og:url" content={`${meta.siteUrl}${frontmatter.path}`}/>
        { frontmatter.image && (<meta property="og:image" content={`${meta.siteUrl}${frontmatter.image}`}/>)}
        <meta property="article:published_time" content={frontmatter.date}/>
        <meta property="article:modified_time" content={frontmatter.date}/>
        <meta property="article:tag" content={first(frontmatter.tags)}/>
      </Helmet>
      <div className="blog-post">
        <div className="content">
          <div className="pre-post">
            <PostMetadata frontmatter={frontmatter}/>
          </div>
          <article>
            <h1>{frontmatter.title}</h1>
            <div
              className="blog-post-content"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </article>
          <div className="spacer">
            <div className="hr"></div>
          </div>
          <div className="spacer">
            <TagList tags={frontmatter.tags}/>
          </div>
        </div>
        <div className="post-post">
          <div className="content">
            <div className="author">
              <img className="profile" src="/daniel.little.jpg" alt="Daniel Little"/>
              <span className="author-name">Written by {frontmatter.author}</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export const pageQuery = graphql`
  query($path: String!) {
    site {
      siteMetadata {
        title
        description
        siteUrl
        twitterHandle
        author
      }
    }
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      frontmatter {
        dateCreated: date(formatString: "MMMM DD, YYYY")
        path
        title
        tags
        author
        date
      }
    }
  }
`