const perPage = 20;
let firstBlog = new Date();
let tags = [];
let onlyPage = true;
let option = new Map(Object.entries({
	endDate: new Date(),
	page: 1,
	startDate: new Date(),
	tag: [],
	text: ""
}));

// 将所有的文章标签存放至tags
onBlogsList((l) => {
	for (let item of l) {
		for (tag of item.tags) {
			if (tags.indexOf(tag) == -1) {
				tags.push(tag);
			}
		}
	}
});

function getMaxPage(list) {
	// 返回总页数
	let page = list.length / perPage;
	if (parseInt(page) == page) {
		return page;
	} else {
		return parseInt(list.length / perPage) + 1;
	}
}

function setFirstBlogTime(blogsList) {
	let i = blogsList.length - 1;
	let time = blogsList[i].time;
	firstBlog = new Date(time);
	option.set("startDate", firstBlog);
}

function setOption() {
	for (let item of location.search.slice(1).split("&")) {
		let key = decodeURIComponent(item.split("=", 1)[0]);
		let value = decodeURIComponent(item.slice(key.length + 1));
		if (option.get(key) == undefined) {
			continue;
		}
		if (key != "page") {
			onlyPage = false;
		}
		if (key == "page") {
			value = Math.max(parseInt(value) || 1, 1);
		} else if ((key == "startDate") || (key == "endDate")) {
			let date = value.split("-");
			value = new Date(date);
			if (value.toString() == "Invalid Date") {
				if (key == "startDate") {
					value = firstBlog;
				} else {
					value = new Date();
				}
			} else {
				if ((key == "startDate") && (value < firstBlog)) {
					value = firstBlog;
				} else if ((key == "endDate") && (value > (new Date()))) {
					value = new Date();
				}
			}
		} else if (key == "tag") {
			value = value.split(",");
		}
		option.set(key, value);
	}
	if (option.get("startDate") > option.get("endDate")) {
		let d = option.get("startDate");
		option.set("startDate", option.get("endDate"));
		option.set("endDate", d);
	}
}

function setSelectOptions() {
	for (let tag of tags) {
		$("#searchModal-tags").append(`<option value="${tag}">${tag}</option>`);
	}
}

function showBlogsList(blogsList) {
	// 挺复~杂~的一个函数, 下面会慢慢解释的
	let count = 1;
	// 是否开始显示博客列表了呢?
	// 在第一页的时候总是为true
	let canShow = (onlyPage && (option.get("page") == 1))? true: false;
	// 有些人会自己输入URL, 极有可能"?"后面的东西是随便输入的, 比如"?page=<一个很大的数字>"
	// 所以这里会修正错误的数据
	if (option.get("page") > getMaxPage(blogsList)) {
		option.set("page", getMaxPage(blogsList));
		if (onlyPage && (option.get("page") == 1)) {
			canShow = true;
		}
	}
	for (let blog of blogsList) {
		if (canShow) {
			let tagsHtml = "";
			for (let tag of blog.tags) {
				tagsHtml += `<a href="blogs.html?tag=${tag}"><span class="badge rounded-pill bg-primary me-1">${tag}</span></a>`;
			}
			let html = "";
			html = "<li class='list-group-item d-flex justify-content-between align-items-start'>";
			html+= "<div class='ms-2 me-auto'>";
			html+= `${getBlogFileName(...blog.time, false)} &raquo; <a href="blog.html?${getBlogFileName(...blog.time, false)}">${blog.title}</a>`;
			html+=`</div><div class="blog-tags-list">${tagsHtml}</div></li>`;
			$("#blog-list").append(html);
			count ++;
			if (count > perPage) {
				break
			}
		} else {
			count ++;
			if (perPage * (option.get("page") - 1) + 1 == count) {
				canShow = true; count = 1;
			}
		}
	}
	// 显示页码
	if (getMaxPage(blogsList) > 1) {
		let start = 0, end = 0, now = option.get("page"), pages = getMaxPage(blogsList);
		if (pages > 5) {
			if ((now - 2 >= 1) && (now + 2 <= pages)) {
				start = now - 2; end = now + 2;
			} else if (now - 2 < 1) {
				start = 1; end = 5;
			} else if (now + 2 > pages) {
				start = pages - 4; end = pages;
			}
		} else {
			start = 1; end = pages;
		}
		$("#pagination").append(`<li class="page-item ${(now == 1)? "disabled": ""}"><a class="page-link" href="${(now == 1)? "javascript:void(0)": "blogs.html?page=" + (now - 1)}">&laquo;</a></li>`);
		for (let page = start; page <= end; page ++) {
			$("#pagination").append(`<li class="page-item ${(now == page)? "active": ""}"><a class="page-link" href="${(now == page)? "javascript:void(0)": "blogs.html?page=" + page}">${page}</li>`);
		}
		$("#pagination").append(`<li class="page-item ${(now == pages)? "disabled": ""}"><a class="page-link" href="${(now == pages)? "javascript:void(0)": "blogs.html?page=" + (now + 1)}">&raquo;</a></li>`);
		$("#pagination-container").removeClass("d-none");
	}
}

function searchBlogs(blogsList) {
	let canAdd = false;
	let html = "";
	for (let blog of blogsList) {
		canAdd = true;
		// 匹配startDate与endDate
		let blogDate = new Date(blog.time);
		if (!((option.get("startDate") <= blogDate) && (blogDate <= option.get("endDate")))) {
			canAdd = false;
		}
		// 匹配tag
		for (let tag of option.get("tag")) {
			if (blog.tags.indexOf(tag) == -1) {
				canAdd = false;
				break;
			}
		}
		// 匹配text
		if (blog.title.indexOf(option.get("text")) == -1) {
			canAdd = false;
		}
		if (option.get("text").length > 0) {
			$.ajax({
				"async": false,
				"url": getBlogFileName(...blog.time),
				"success": (text) => {
					// 清除各种Markdown标记
					// 1~6号标题
					text = text.replace(/^#{1,6}\s*/gm, "")
						// 数学标记（行间，行内）
						.replace(/\$\$.+?\$\$/g, "").replace(/\$.+?\$/g, "")
						// 无序/有序列表
						.replace(/^\s*-\s*/gm, "").replace(/^\d+\.\s*/gm, "")
						// 引用，粗体，粗斜体
						.replace(/^\s*>*\s*/gm, "").replace(/\*\*\*?/g, "")
						// 超链接
						.replace(/\[(.+?)\]\(.+?\)/g, "$1")
						// <div>标签
						.replace(/<div.+?>/g, "").replace(/<\/div>/g, "")
						// HTML实体引用，空白
						.replace(/&.+?;/g, "").replace(/\s/g, "");
					if (text.indexOf(option.get("text")) != -1) {
						canAdd = true;
					}
				}
			});
		}
		if (canAdd) {
			let tagsHtml = "";
			for (let tag of blog.tags) {
				tagsHtml += `<a href="blogs.html?tag=${tag}"><span class="badge rounded-pill bg-primary me-1">${tag}</span></a>`;
			}
			html += "<li class='list-group-item d-flex justify-content-between align-items-start'>";
			html += "<div class='ms-2 me-auto'>";
			html += `${getBlogFileName(...blog.time, false)} &raquo; <a href="blog.html?${getBlogFileName(...blog.time, false)}">${blog.title}</a>`;
			html +=`</div><div class="blog-tags-list">${tagsHtml}</div></li>`;
		}
	}
	if (html.length > 0) {
		$("#blog-list").append(html);
	} else {
		$("#blog-list").append("<p align='center' class='text-muted' style='font-size: 200%'>没有找到 :(</p>");
	}
}

function submitSearchForm() {
	let options = [];
	let text = encodeURIComponent($("#searchModal-text").val());
	if (text.length > 0) {
		options.push(`text=${text}`);
	}
	let tags = [];
	for (let element of $("#searchModal-tags").children()) {
		if (element.selected) {
			tags.push(element.text);
		}
	}
	if (tags.join(",").length > 0) {
		options.push(`tag=${tags.join(",")}`);
	}
	let startDate = $("#searchModal-start-date").val();
	if (startDate.length > 0) {
		options.push(`startDate=${startDate}`);
	}
	let endDate = $("#searchModal-end-date").val();
	if (endDate.length > 0) {
		options.push(`endDate=${endDate}`);
	}
	location.href=`blogs.html?${options.join("&")}`;
}
