import React from "react"
import PropTypes from "prop-types"
import { StaticQuery, graphql } from "gatsby"

import Header from "./header"
import Tags from "./tags"
import "./layout.css"

const Layout = ({ children }) => (
  <StaticQuery
    query={graphql`
      query SiteTitleQuery {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={data => (
      <>
        <Header siteTitle={data.site.siteMetadata.title} />
        <div
          style={{
            margin: `0 auto`,
            maxWidth: 960,
            padding: `0px 1.0875rem 1.45rem`,
            paddingTop: 0,
          }}
        >
          <main>
            {children}
          </main>
          <div>
            <Tags/>
          </div>
          <footer>
            <p class="main">
              Copyright &copy; <a href="https://www.daniellittle.xyz">Daniel Little Coding Blog</a>. {new Date().getFullYear()} &bull; All rights reserved.
            </p>
            {` `}
            <ul class="social">
              <li><a href="https://twitter.com/lavinski" target="_blank" class="twitter" title="Twitter" rel="noopener noreferrer"><i class="fa fa-twitter"></i></a></li>
              <li><a href="https://github.com/lavinski" target="_blank" class="github" title="GitHub" rel="noopener noreferrer"><i class="fa fa-github"></i></a></li>
              <li><a href="https://stackoverflow.com/users/200442/daniel-little" target="_blank" class="stackoverflow" title="StackOverflow" rel="noopener noreferrer"><i class="fa fa-stack-overflow"></i></a></li>
              <li><a href="https://www.daniellittle.xyz/rss" target="_blank" class="rss" title="RSS"><i class="fa fa-rss"></i></a></li>
            </ul>
          </footer>
        </div>
      </>
    )}
  />
)

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
