const fs = require("fs")
let cache = []

function getBlogFileName(year, month, day) {
    month = (month.toString().length == 1) ? `0${month}` : month.toString()
    day = (day.toString().length == 1) ? `0${day}` : day.toString()
    return `blogs/${year}-${month}-${day}.md`
}

for (let blog of JSON.parse(fs.readFileSync("blogs/index.json"))) {
    text = fs.readFileSync(getBlogFileName(...blog.time)).toString()
    text = text.replace(/^#{1,6}\s*/gm, "").replace(/<!\-\-.+?\-\->/gsm, "")
        .replace(/\$\$([^\$\$]+?)\$\$/g, "").replace(/\$([^\$]+?)\$/g, "")
        .replace(/\s*-\s*/gm, "").replace(/\s*\d+\.\s*/gm, "")
        .replace(/\s*>*\s*/gm, "").replace(/\*\*\*?/g, "").replace(/__/g, "")
        .replace(/\[(.+?)\]\(.+?\)/g, "$1").replace(/&.+?;/g, "")
        .replace(/[|:-]/g, "").replace(/\\/g, "").replace(/['"，。、；：？（）‘’“”]/g, "")
    cache.push({
        time: blog.time,
        title: blog.title,
        tags: blog.tags,
        content: text
    })
}

fs.writeFileSync("blogs/cache.json", JSON.stringify(cache))