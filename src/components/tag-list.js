import React from "react"
import "./tag-list.css"
import kebabCase from "lodash/kebabCase"
import { Link } from "gatsby"

const TagList = (props) => {
    const tags = props.tags
    return (
    <div className="tags">
        {tags.map(tag => (<Link key={tag} className="tag" to={`/tags/${kebabCase(tag)}/`}>{tag}</Link>))}
    </div>
    )
}

export default TagList