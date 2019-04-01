import React from "react"
import "./post-metadata.css"

const PostMetadata = (props) => {
    const frontmatter = props.frontmatter
    return (
    <div className="post-metadata">
        <div>{ frontmatter.tags && frontmatter.tags[0] && <span className="tag">{frontmatter.tags && frontmatter.tags[0]}</span> }</div>
        { frontmatter.dateCreated && <time>{frontmatter.dateCreated}</time> }
    </div>
    )
}

export default PostMetadata