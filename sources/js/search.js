let onlyPage = true;
let option = new Map(Object.entries({
	count: 20,
	endDate: new Date(),
	page: 1,
	startDate: new Date(),
	tag: [],
	text: ""
}));

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
		if ((key == "count") || (key == "page")) {
			value = parseInt(value);
		} else if ((key == "startDate") || (key == "endDate")) {
			let date = value.split("-");
			value = new Date(date[0], date[1] - 1, date[2]);
		} else if (key == "tag") {
			value = value.split(",");
		}
		option.set(key, value);
	}
}

function showArticlesList(articlesList) {
	let count = 0;
	let date = articlesList[0].time.slice(0, 2);
	let html = "";
	$("#list").append(`<h5>${date[0]}年${date[1]}月</h5>`);
	for (article of articlesList) {
		if (count > 6) {
			break;
		}
		if (date.toString() != article.time.slice(0, 2)) {
			date = article.time.slice(0, 2);
			$("#list").append("<ul>" + html + "</ul>");
			$("#list").append(`<div><h5>${date[0]}年${date[1]}月</h5>`);
			html = "";
			count ++;
		}
		html += `<li>${getArticleFileName(...article.time, false)} &rsaquo;&rsaquo; <a href="articles.html?${getArticleFileName(...article.time, false)}">${article.title}</a></li>`;
	}
	$("#list").append("<ul>" + html + "</ul>");
}

