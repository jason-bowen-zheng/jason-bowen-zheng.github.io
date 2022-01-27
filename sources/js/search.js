let firstArticle = new Date();
let onlyPage = true;
let option = new Map(Object.entries({
	endDate: new Date(),
	page: 1,
	startDate: new Date(),
	tag: [],
	text: ""
}));

function getMaxPage(list) {
	// 以6个月为界分页, 返回所分的页数
	let count = 1; i = 0; date = list[0].time.slice(0, 2);
	for (article of list) {
		if (date.toString() != article.time.slice(0, 2)) {
			i ++;
		}
		if (i >= 6) {
			i = 0; count ++;
		}
	}
	return count;
}

function setFirstArticleTime(articlesList) {
	let i = articlesList.length - 1;
	time = articlesList[i].time;
	firstArticle = new Date(time[0], time[1] - 1, time[2]);
	option.set("startDate", firstArticle);
}

function setOption() {
	for (item of location.search.slice(1).split("&")) {
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
			value = new Date(date[0], date[1] - 1, date[2]);
			if (value.toString() == "Invalid Date") {
				if (key == "startDate") {
					value = firstArticle;
				} else {
					value = new Date();
				}
			} else {
				if ((key == "startDate") && (value < firstArticle)) {
					value = firstArticle;
				} else if ((key == "endDate") && (value > (new Date()))) {
					value = new Date();
				}
			}
		} else if (key == "tag") {
			value = value.split(",");
		}
		option.set(key, value);
	}
}

function showArticlesList(articlesList) {
	// 挺复杂的一个函数, 下面会慢慢解释的
	let count = 0, i = 0;
	// 是否开始显示文章列表了呢?
	// 在第一页的时候总是为true
	let canShow = (onlyPage && (option.get("page") == 1))? true: false;
	// 有些人会自己输入URL, 极有可能"?"后面的东西是随便输入的, 比如"?page=<一个很大的数字>"
	// 所以这里会修正错误的数据
	if (option.get("page") > getMaxPage(articlesList)) {
		option.set("page", getMaxPage(articlesList));
		if (onlyPage && (option.get("page") == 1)) {
			canShow = true;
		}
	}
	let date = articlesList[0].time.slice(0, 2);
	let html = "";
	if (canShow) {
		$("#list").append(`<h5>${date[0]}年${date[1]}月</h5>`);
	}
	for (article of articlesList) {
		if (date.toString() != article.time.slice(0, 2)) {
			// 这个if和上面的getMaxPage差不多
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
			date = article.time.slice(0, 2);
			$("#list").append("<ul>" + html + "</ul>");
			$("#list").append(`<div><h5>${date[0]}年${date[1]}月</h5>`);
			html = "";
		}
		if (canShow) {
			html += `<li>${getArticleFileName(...article.time, false)} &raquo; <a href="articles.html?${getArticleFileName(...article.time, false)}">${article.title}</a></li>`;
		}
	}
	if (html.length > 0) {
		$("#list").append("<ul>" + html + "</ul>");
	}
	// 显示页码
	if (getMaxPage(articlesList) > 1) {
		let start = 0, end = 0, now = option.get("page"), pages = getMaxPage(articlesList);
		if (articlesList.length > 5) {
			if ((now - 2 >= 1) && (now + 2 <= pages)) {
				start = now - 2; end = now + 2;
			} else if (now - 2 < 1) {
				start = 1; end = 5;
			} else if (now + 2 > pagew) {
				start = pages - 5; end = pages;
			}
		} else {
			start = 1; end = pages;
		}
		$("#pagination").append(`<li class="page-item ${(now == 1)? "disabled": ""}"><a class="page-link" href="${(now == 1)? "javascript:void(0)": "article.html?page=" + (now - 1)}">&laquo;</a></li>`);
		for (let page = start; page <= end; page ++) {
			$("#pagination").append(`<li class="page-item ${(now == page)? "active": ""}"><a class="page-link" href="${(now == page)? "javascript:void(0)": "article.html?page=" + page}">${page}</li>`);
		}
		$("#pagination").append(`<li class="page-item ${(now == pages)? "disabled": ""}"><a class="page-link" href="${(now == pages)? "javascript:void(0)": "article.html?page=" + (now + 1)}">&raquo;</a></li>`);
		$("#pagination-container").removeClass("d-none");
	}
}
