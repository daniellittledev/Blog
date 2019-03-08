import React from "react"
import { StaticQuery, Link, graphql } from "gatsby"

import _ from "lodash"
import kebabCase from "lodash/kebabCase"

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

      return (<div class="tags">
        <ul>
          {topTags.map(tag => (<Link to={`/tags/${kebabCase(tag)}/`}><li>{tag}</li></Link>))}
        </ul>
      </div>)
    }} />
)
export default Tags
