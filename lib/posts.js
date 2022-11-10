import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkEmbedImages from 'remark-embed-images'
import html from 'remark-html'
//import { getReposIndex } from './gits'
import { request as oreq } from "@octokit/request"
import request from 'request'

const postsDirectory = path.join(process.cwd(), 'posts')

// function refreshPosts(data) {
//     data.forEach(repo => {
//         let rawUrl = `https://raw.githubusercontent.com/${repo[2]}/${repo[3]}/portf.md`
//         request(rawUrl, function (error, response, body) {
//             if (response.statusCode == 200) {
//                 fs.writeFile(postsDirectory + `/${repo[0]}.md`, body, function (err) {
//                     if (err) throw err;
//                     console.log('Done!')
//                     console.log(postsDirectory + `/${repo[0]}.md`)
//                 })
//             }
//         });
//     })
// }

// export async function getReposIndex(name) {
//     // Fetch all repo names from GitHub
//     const res = await oreq('GET /users/{username}/repos', {
//         username: name
//     })
//     const hi = "no"
//     const no = "no"
//     let repoData = []
//     res.data.forEach(repo => {
//         repoData.push([repo.name, repo.description, repo.full_name, repo.default_branch])
//     })
//     console.log(repoData)
//     // refreshPosts(repoData)
//     return { hi, no }
// }

export function getSortedPostsData() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames.map(fileName => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '')

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents)

    // Combine the data with the id
    return {
      id,
      ...matterResult.data
    }
  })
  // Sort posts by date
  return allPostsData.sort(({ date: a }, { date: b }) => {
    if (a < b) {
      return 1
    } else if (a > b) {
      return -1
    } else {
      return 0
    }
  })
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory)

  // Returns an array that looks like this:
  // [
  //   {
  //     params: {
  //       id: 'ssg-ssr'
  //     }
  //   },
  //   {
  //     params: {
  //       id: 'pre-rendering'
  //     }
  //   }
  // ]
  return fileNames.map(fileName => {
    return {
      params: {
        id: fileName.replace(/\.md$/, '')
      }
    }
  })
}

export async function getPostData(id) {
  const fullPath = path.join(postsDirectory, `${id}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents)
  console.log("Ahaha", matterResult)

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkEmbedImages)
    .use(html)
    .process(matterResult.content)
  let contentHtml = processedContent.toString()

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    ...matterResult.data
  }
}
