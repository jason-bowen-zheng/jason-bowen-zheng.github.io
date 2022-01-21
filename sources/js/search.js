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
		if (key == "count") {
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
