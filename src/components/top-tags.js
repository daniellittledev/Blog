import React from "react"
import { StaticQuery, graphql } from "gatsby"

import _ from "lodash"
import TagList from "./tag-list"

const TopTags = () => (
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
      return (
        <div class="top-tags">
          <h4>Top Tags</h4>
          <TagList tags={topTags}/>
        </div>
      )
    }} />
)
export default TopTags
