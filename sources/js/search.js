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
for (let blog of getBlogsList()) {
	for (let tag of blog.tags) {
		if (tags.indexOf(tag) == -1) {
			tags.push(tag);
		}
	}
}

function buildQuery(page=1) {
	let query = [];
	if (option.get("text").length > 0) {
		query.push(`text=${option.get("text")}`);
	}
	if (option.get("tag").join(",").length > 0) {
		query.push(`tag=${option.get("tag").join(",")}`);
	}
	if (option.get("startDate").length > 0) {
		query.push(`startDate=${option.get("startDate")}`);
	}
	if (option.get("endDate").length > 0) {
		query.push(`endDate=${option.get("endDate")}`);
	}
	query.push(`page=${page}`);
	return query.join("&");
}

function getMaxPage(list) {
	// 返回总页数
	let page = list.length / perPage;
	if (parseInt(page) == page) {
		return page;
	} else {
		return parseInt(list.length / perPage) + 1;
	}
}

function setFirstBlogTime() {
	let i = getBlogsList().length - 1;
	let time = getBlogsList()[i].time;
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
		} else if (key == "text") {
			value = value.toLowerCase();
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
	let canShow = (option.get("page") == 1)? true: false;
	// 有些人会自己输入URL, 极有可能"?"后面的东西是随便输入的, 比如"?page=<一个很大的数字>"
	// 所以这里会修正错误的数据
	if (option.get("page") > getMaxPage(blogsList)) {
		option.set("page", getMaxPage(blogsList));
		if (option.get("page") == 1) {
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
		$("#pagination").append(`<li class="page-item ${(now == 1)? "disabled": ""}"><a class="page-link" href="${(now == 1)? "javascript:void(0)": "blogs.html?" + buildQuery(now - 1)}">&laquo;</a></li>`);
		for (let page = start; page <= end; page ++) {
			$("#pagination").append(`<li class="page-item ${(now == page)? "active": ""}"><a class="page-link" href="${(now == page)? "javascript:void(0)": "blogs.html?" + buildQuery(page)}">${page}</li>`);
		}
		$("#pagination").append(`<li class="page-item ${(now == pages)? "disabled": ""}"><a class="page-link" href="${(now == pages)? "javascript:void(0)": "blogs.html?" + buildQuery(now + 1)}">&raquo;</a></li>`);
		$("#pagination-container").removeClass("d-none");
	}
}

function searchBlogs() {
	let matchedBlogs = [], blogsList;
	$.ajax({
		"async": false,
		"url": "blogs/cache.json",
		"success": (data) => {
			blogsList = data;
		}
	});
	for (let blog of blogsList) {
		// 匹配startDate与endDate
		let blogDate = new Date(blog.time);
		if (!((option.get("startDate") <= blogDate) && (blogDate <= option.get("endDate")))) {
			continue;
		}
		// 匹配tag
		let unmatch = false;
		for (let tag of option.get("tag")) {
			if (blog.tags.indexOf(tag) == -1) {
				unmatch = true;
			}
		}
		if (unmatch) {
			continue;
		}
		// 匹配text
		if (option.get("text").length > 0) {
			if (!((blog.content.indexOf(option.get("text")) != -1) || (blog.title.indexOf(option.get("text")) != -1))) {
				continue;
			}
		}
		matchedBlogs.push(blog);
	}
	if (matchedBlogs.length > 0) {
		showBlogsList(matchedBlogs);
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
