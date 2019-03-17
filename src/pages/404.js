import React from "react"

import { Link } from "gatsby"
import Layout from "../components/layout"
import SEO from "../components/seo"

const NotFoundPage = () => (
  <Layout>
    <SEO title="404: Not found" />
    <div className="content spacer">
      <h1>Page Not Found</h1>
      <p>There is no page for this route, try searching <Link to="/">Home</Link> to find what you're looking for.</p>
    </div>
  </Layout>
)

export default NotFoundPage
