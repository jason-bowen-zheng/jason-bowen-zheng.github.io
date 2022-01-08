const mathsTips = [
	"幂函数系数必为1，与坐标轴不交。",
	"用指对互换解指对方程。",
	"复合函数法求值域可不考虑函数天然定义域。",
	"不等式两边可同时开正奇次方，但不可开正偶次方。",
	"证明奇偶性最讨厌！",
	"等式恒成立：标准化叙述，系数全为零。",
	"零点丫的不是点！",
	"用对数恒等式解指数不等式。",
	"域的问题最基本理念：将待求的\"范围和最值\"部分用一个字母表示，得到函数，并求值域。",
	"高次不等式用穿针引线法。",
	"函数中的自变量可以在取值范围内换成任意的值或式，甚至是一坨屎。",
	"慎用多次基本不等式，除非等号成立条件相同。",
	"对数不等式&#215;1。",
	"狗都不想用基本不等式！",
	"等式有解：标准化叙述，参变分离，求变量边的值域。",
	"等式恒成立：标准化叙述，分清参变，化为<b>f(x)=0</b>，将所有变量归类合并得系数，系数全为零。"
];

const quotes = [
	["史家之绝唱，无韵之离骚。", "鲁迅"],
	["我向往自由，我要谈恋爱！", "逍遥散人"],
	["我亦无他，惟手熟尔。", "宋&middot;欧阳修"],
	["生存，还是毁灭，这是个问题。", "莎士比亚"],
	["人生如梦，一樽还酹江月。", "宋&middot;苏轼"],
	["无边落木萧萧下，不尽长江滚滚来。", "唐&middot;杜甫"],
	["不识庐山真面目，只缘身在此山中。", "宋&middot;苏轼"],
	["长风破浪会有时，直挂云帆济沧海。", "唐&middot;李白"],
	["先天下之忧而忧，后天下之乐而乐。", "宋&middot;范仲淹"],
	["人生自古谁无死，留取丹心照汗青。", "宋&middot;文天祥"],
	["世界是你们的，也是我们的，但是归根结底是你们的。", "毛泽东"],
	["人有悲欢离合，月有阴晴圆缺，此事古难全。", "宋&middot;苏轼"],
	["君不见，黄河之水天上来，奔流到海不复回。", "唐&middot;李白"],
	["海纳百川，有容乃大；壁立千仞，无欲则刚。", "清&middot;林则徐"],
	["鸟之将死，其鸣也哀；人之将死，其言也善。", "春秋&middot;曾参"],
	["安得广厦千万间，大庇天下寒士俱欢颜，风雨不动安如山。", "唐&middot;杜甫"]
];

function checkUpload() {
	if (location.hostname.indexOf(".github.io") == -1) {
		$("#submit-upload").attr("disabled", "disabled");
	}
}

function getArticleFileName(year, month, day) {
	month = (month.toString().length == 1)? `0${month}`: month.toString();
	day = (day.toString().length == 1)? `0${day}`: day.toString();
	return `articles/${year}-${month}-${day}.md`;
}

function onArticlesList(callback) {
	$.ajax({
		"url": "articles/lists.json",
		"success": (list) => {
			callback(list);
		}
	});
}

function showDailyImage() {
	let now = new Date();
	$.ajax({
		"url": "sources/images/lists.json",
		"success": (list) => {
			let index = (now.getDate() + now.getHours()) % list.length;
			$("#daily-image").attr("src", `sources/images/${list[index].name}`);
			$("#img-desp").html(list[index].description);
			$("#daily-image").attr("alt", list[index].description);
		}
	});
}

function showLatestArticle(articlesList) {
	index = articlesList.length - 1;
	$("#article-title").text(articlesList[index][1]);
	$.ajax({
		"url": getArticleFileName(...articlesList[index][0]),
		"error": (xhr) => {
			$("#article-content").html(`<span class="text-muted">文件未成功读取，错误代码：${xhr.status}。</span>`);
		},
		"success": (text) => {
			result = marked.parse(text);
			$("#article-content").html(result.slice(0, result.indexOf("</p>") + 4));
		}
	});
}

function showMathsTips() {
	let now = new Date();
	let index = (now.getDate() + now.getHours()) % mathsTips.length;
	$("#maths-tips").html(mathsTips[index]);
}

function showQuote() {
	let now = new Date();
	let index = (now.getDate() + now.getHours()) % quotes.length;
	if (now.getMonth() == 0 && now.getDate() == 1 && now.getHours() == 0) {
		$("#quote").html(`<b>宋&middot;王安石</b>：爆竹声中一岁除，春风送暖入屠苏。`);
	} else if (now.getMonth() == 1 && now.getDate() == 14) {
		$("#quote").html(`<b>乔治&middot;艾略特</b>：我不但喜欢被人爱，还喜欢有人告诉爱上了我。`);
	} else {
		$("#quote").html(`<b>${quotes[index][1]}</b>：${quotes[index][0]}`);
	}
}

function showToday() {
	let now = new Date();
	let num2name = ["日", "一", "二", "三", "四", "五", "六"];
	$("#today").html(`今天是${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`);
	$("#today").html($("#today").html() + `（星期${num2name[now.getDay()]}），`);
	let thisYear = new Date(now.getFullYear(), 0);
	let nextYear = new Date(now.getFullYear() + 1, 0);
	if (thisYear - now < nextYear - now) {
		$("#today").html($("#today").html() + `是今年的第${parseInt((now - thisYear) / 86400000 + 1)}天。`);
	} else {
		$("#today").html($("#today").html() + `距明年还有${parseInt((nextYear - now) / 86400000 + 1)}天。`);
	}
	$("#today").html($("#today").html() + `<br>UTC时间：${now}。`);
	$("#today-wikipedia").html(`<a href="https://zh.wikipedia.org/wiki/${now.getMonth() + 1}月${now.getDate()}日">维基百科：${now.getMonth() + 1}月${now.getDate()}日</a>`);
}

