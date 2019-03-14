import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import PostMetadata from "../components/post-metadata"
import TagList from "../components/tag-list"

export default function Template({
  data, // this prop will be injected by the GraphQL query below.
}) {
  const { markdownRemark } = data // data.markdownRemark holds our post data
  const { frontmatter, html } = markdownRemark
  return (
    <Layout>
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
              <div>{frontmatter.author}</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export const pageQuery = graphql`
  query($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        path
        title
        tags
        author
      }
    }
  }
`