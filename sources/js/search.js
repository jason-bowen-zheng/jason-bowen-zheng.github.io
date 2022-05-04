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
	// 以6个月为界分页, 返回所分的页数
	let count = 1; i = 0; date = list[0].time.slice(0, 2);
	for (let blog of list) {
		if (date.toString() != blog.time.slice(0, 2)) {
			i ++;
		}
		if (i >= 6) {
			i = 0; count ++;
		}
	}
	return count;
}

function setFirstBlogTime(blogsList) {
	let i = blogsList.length - 1;
	let time = blogsList[i].time;
	let firstBlog = new Date(time);
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
	let count = 0, i = 0;
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
	let date = blogsList[0].time.slice(0, 2);
	let html = "";
	if (canShow) {
		$("#list").append(`<h5>${date[0]}年${date[1]}月</h5>`);
	}
	// 这个for和上面的getMaxPage差不多
	for (let blog of blogsList) {
		if (date.toString() != blog.time.slice(0, 2)) {
			if (!canShow) {
				i ++;
				if (i >= 6) {
					i = 0; count ++;
				}
				if (count + 1 == option.get("page")) {
					count = 0; i = 0; canShow = true;
				} else {
					continue;
				}
			}
			count ++;
			if (count > 5) {
				break;
			}
			date = blog.time.slice(0, 2);
			$("#list").append("<ul>" + html + "</ul>");
			$("#list").append(`<div><h5>${date[0]}年${date[1]}月</h5>`);
			html = "";
		}
		if (canShow) {
			html += `<li>${getBlogFileName(...blog.time, false)} &raquo; <a href="blogs.html?${getBlogFileName(...blog.time, false)}">${blog.title}</a></li>`;
		}
	}
	if (html.length > 0) {
		$("#list").append("<ul>" + html + "</ul>");
	}
	// 显示页码
	if (getMaxPage(blogsList) > 1) {
		let start = 0, end = 0, now = option.get("page"), pages = getMaxPage(blogsList);
		if (blogsList.length > 5) {
			if ((now - 2 >= 1) && (now + 2 <= pages)) {
				start = now - 2; end = now + 2;
			} else if (now - 2 < 1) {
				start = 1; end = 5;
			} else if (now + 2 > pages) {
				start = pages - 5; end = pages;
			}
		} else {
			start = 1; end = pages;
		}
		$("#pagination").append(`<li class="page-item ${(now == 1)? "disabled": ""}"><a class="page-link" href="${(now == 1)? "javascript:void(0)": "blog.html?page=" + (now - 1)}">&laquo;</a></li>`);
		for (let page = start; page <= end; page ++) {
			$("#pagination").append(`<li class="page-item ${(now == page)? "active": ""}"><a class="page-link" href="${(now == page)? "javascript:void(0)": "blog.html?page=" + page}">${page}</li>`);
		}
		$("#pagination").append(`<li class="page-item ${(now == pages)? "disabled": ""}"><a class="page-link" href="${(now == pages)? "javascript:void(0)": "blog.html?page=" + (now + 1)}">&raquo;</a></li>`);
		$("#pagination-container").removeClass("d-none");
	}
}

function searchBlogs(blogsList) {
	let canAdd = false;
	let html = "";
	for (let blog of blogsList) {
		canAdd = true;
		// 匹配startDate与endDate
		if (option.get("startDate") <= (new Date(blog.time))) {
			if (option.get("endDate") >= (new Date(blog.time))) {
				canAdd = true;
			} else {
				canAdd = false;
			}
		} else {
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
					text = text.replace(/^#{1,6}\s*/gm, "")
						.replace(/\$\$.+?\$\$/g, "").replace(/::.+?::/g, "")
						.replace(/^\s*-\s*/gm, "").replace(/^\d+\.\s*/gm, "")
						.replace(/^\s*>*\s*/gm, "").replace(/\*\*\*?/g, "")
						.replace(/\[(.+?)\]\(.+?\)/g, "$1")
						.replace(/<div.+?>/g, "").replace(/<\/div>/g, "")
						.replace(/&.+?;/g, "").replace(/\s/g, "");
					if (text.indexOf(option.get("text")) != -1) {
						canAdd = true;
					}
				}
			});
		}
		if (canAdd){
			html += `<li>${getBlogFileName(...blog.time, false)} &raquo; <a href="blogs.html?${getBlogFileName(...blog.time, false)}">${blog.title}</a></li>`
		}
	}
	if (html.length > 0) {
		$("#list").append(html);
	} else {
		$("#list").append("<p align='center' class='text-muted' style='font-size: 500%'>...</p>");
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
	location.href=`blog.html?${options.join("&")}`;
}
