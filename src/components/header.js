import { Link } from "gatsby"
import PropTypes from "prop-types"
import React from "react"
import "./header.css"

const Header = ({ siteTitle }) => (
  <header>
    <div className="content" >
      <span className="title">
        <Link
          to="/"
          style={{
            textDecoration: `none`,
          }}
        >
          {siteTitle}
        </Link>
      </span>

      <nav className="main">
        <ul className="nav-items">
          <li className="nav-home"><a href="/">Home</a></li>
          <li className="nav-about"><a href="/about/">About</a></li>
        </ul>
      </nav>

    </div>
  </header>
)

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
