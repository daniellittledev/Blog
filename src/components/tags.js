import React from "react"
import { StaticQuery, Link, graphql } from "gatsby"

import _ from "lodash"
import kebabCase from "lodash/kebabCase"

import "./tags.css"

const Tags = () => (
  <StaticQuery
    query={graphql`
    query {
        allMarkdownRemark(
          sort: {order: DESC, fields: [frontmatter___date]},
          filter: {frontmatter: {draft: {eq: false}}},
          limit: 1000
        ) {
          edges {
            node {
              frontmatter {
                tags
              }
            }
          }
        }
      }
    `}
    render={data => {
      var allTags = data.allMarkdownRemark.edges.map(x => x.node.frontmatter.tags)
      var groupedTags = _.groupBy(_.flatMap(allTags).filter(x => !!x))
      var sortedTags = _.sortBy(Object.keys(groupedTags), x => groupedTags[x])
      var topTags = _.take(sortedTags, 12)

      return (<div className="tags">
        {topTags.map(tag => (<Link key={tag} className="tag" to={`/tags/${kebabCase(tag)}/`}>{tag}</Link>))}
      </div>)
    }} />
)
export default Tags
