import React from "react"
import PropTypes from "prop-types"
import { StaticQuery, graphql } from "gatsby"
import { Helmet } from "react-helmet"

import Header from "./header"
import Tags from "./top-tags"
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
      <div>
        <Helmet>
          <link href="https://fonts.googleapis.com/css?family=Noto+Serif:400,700|Montserrat|Varela+Round|Oxygen" rel="stylesheet"/>
          <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous"></link>
        </Helmet>
        <Header siteTitle={data.site.siteMetadata.title} />
        <div>
          <main>
            {children}
          </main>
          <footer>
            <p className="copyright">
              Copyright &copy; <a href="https://www.daniellittle.xyz">Daniel Little Coding Blog</a>. {new Date().getFullYear()} &bull; All rights reserved.
            </p>
            {` `}
            <ul className="social">
              <li><a href="https://twitter.com/lavinski" target="_blank" className="twitter" title="Twitter" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a></li>
              <li><a href="https://github.com/lavinski" target="_blank" className="github" title="GitHub" rel="noopener noreferrer"><i className="fab fa-github"></i></a></li>
              <li><a href="https://stackoverflow.com/users/200442/daniel-little" target="_blank" className="stackoverflow" title="StackOverflow" rel="noopener noreferrer"><i className="fab fa-stack-overflow"></i></a></li>
              <li><a href="https://www.daniellittle.xyz/rss" target="_blank" className="rss" title="RSS"><i className="fas fa-rss"></i></a></li>
            </ul>
          </footer>
        </div>
      </div>
    )}
  />
)

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
