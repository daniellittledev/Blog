import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import PostMetadata from "../components/post-metadata"
import TagList from "../components/tag-list"
import Helmet from "react-helmet"
import "prismjs/themes/prism-solarizedlight.css"
//import Img from "gatsby-image"

function first(values) {
  values = values || []
  return values.length > 0 ? values[0] : ""
}

function csv(values) {
  return (values || []).join(", ")
}

export default function Template({
  data, // this prop will be injected by the GraphQL query below.
}) {
  const { markdownRemark } = data // data.markdownRemark holds our post data
  const { frontmatter, html } = markdownRemark
  const meta = data.site.siteMetadata
  meta.pageUrl = `${meta.siteUrl}${frontmatter.path}`
  return (
    <Layout>
      <Helmet>
        <title>{frontmatter.title} - Daniel Little Dev</title>
        <link rel="canonical" href={meta.pageUrl} />

        <meta property="og:title" content={frontmatter.title} />
        <meta property="og:description" content={markdownRemark.excerpt} />
        <meta property="og:url" content={meta.pageUrl} />
        {frontmatter.image && (
          <meta
            property="og:image"
            content={`${meta.siteUrl}${frontmatter.image}`}
          />
        )}

        <meta name="twitter:card" content="summary"/>
        <meta name="twitter:title" content={frontmatter.title} />
        <meta name="twitter:description" content={markdownRemark.excerpt} />
        <meta name="twitter:url" content={meta.pageUrl} />

        <meta name="twitter:label1" content="Written by" />
        <meta name="twitter:data1" content={meta.author} />
        <meta name="twitter:label2" content="Filed under" />
        <meta name="twitter:data2" content={csv(frontmatter.tags)} />
        <meta name="twitter:site" content={"@" + meta.twitterHandle} />
        <meta name="twitter:creator" content={"@" + meta.twitterHandle} />
        {frontmatter.image && (
          <meta
            name="twitter:image"
            content={`${meta.siteUrl}${frontmatter.image}`}
          />
        )}

        <meta property="article:published_time" content={frontmatter.date} />
        <meta property="article:modified_time" content={frontmatter.date} />
        <meta property="article:tag" content={first(frontmatter.tags)} />
      </Helmet>
      <div className="blog-post">
        <div className="content">
          <div className="pre-post">
            <PostMetadata frontmatter={frontmatter} />
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
            <TagList tags={frontmatter.tags} />
          </div>
        </div>
        <div className="post-post">
          <div className="content">
            <div className="author">
              <img
                className="profile"
                src="/daniel.little.jpg"
                alt="Daniel Little"
              />
              <span className="author-name">
                Written by {frontmatter.author}
              </span>
            </div>
          </div>
          <div className="content">
            <div className="subscribe">
              <div className="subscribe-message">
                If you enjoyed this post, subscribe to the <a href="/rss">rss feed</a> or mailing list. I'll only ever email you about a new post. 
              </div>
              <div id="mc_embed_signup">
                <form
                  action="https://dev.us10.list-manage.com/subscribe/post?u=240a8a31cc1b5422e7bee8db0&amp;id=2e58d0e026"
                  method="post"
                  id="mc-embedded-subscribe-form"
                  name="mc-embedded-subscribe-form"
                  className="validate"
                  target="_blank"
                  noValidate
                >
                  <div id="mc_embed_signup_scroll">
                    <div className="mc-field-group">
                      <input
                        placeholder="Email Address"
                        type="email"
                        name="EMAIL"
                        className="required email"
                        id="mce-EMAIL"
                      />
                    </div>
                    <div className="mc-field-group">
                      <input
                        placeholder="Name"
                        type="text"
                        name="MMERGE3"
                        className=""
                        id="mce-MMERGE3"
                      />
                    </div>
                    <div id="mce-responses" className="clear">
                      <div
                        className="response"
                        id="mce-error-response"
                        style={{ display: "none" }}
                      ></div>
                      <div
                        className="response"
                        id="mce-success-response"
                        style={{ display: "none" }}
                      ></div>
                    </div>
                    <div
                      style={{ position: "absolute", left: "-5000px" }}
                      aria-hidden="true"
                    >
                      <input
                        type="text"
                        name="b_240a8a31cc1b5422e7bee8db0_2e58d0e026"
                        tabIndex="-1"
                      />
                    </div>
                    <div className="clear">
                      <input
                        type="submit"
                        value="Subscribe"
                        name="subscribe"
                        id="mc-embedded-subscribe"
                        className="button"
                      />
                    </div>
                  </div>
                </form>
              </div>
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
      excerpt(pruneLength: 280)
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
