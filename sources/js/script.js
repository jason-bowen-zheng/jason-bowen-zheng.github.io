const mathsTips = [
	"幂函数系数必为1，与坐标轴不交。",
	"用指对互换解指对方程。",
	"复合函数法求值域可不考虑函数天然定义域。",
	"不等式两边可同时开正奇次方，但不可开正偶次方。",
	"证明奇偶性真讨厌！",
	"等式恒成立：标准化叙述，系数全为零。",
	"零点丫的不是点！",
	"用对数恒等式解指数不等式。",
	"域的问题最基本理念：将待求的\"范围和最值\"部分用一个字母表示，得到函数，并求值域。",
	"高次不等式用穿针引线法。",
	"函数中的自变量可以在取值范围内换成任意的值或式，甚至是一坨屎。",
	"慎用多次基本不等式，除非等号成立条件相同。",
	"对数不等式&times;1。",
	"狗都不想用基本不等式！",
	"等式有解：标准化叙述，参变分离，求变量边的值域。",
	"等式恒成立：标准化叙述，分清参变，化为<b>f(x)=0</b>，将所有变量归类合并得系数，系数全为零。",
	"sin<sup>2</sup><i>&alpha;</i>+cos<sup>2</sup><i>&alpha;</i>=1",
	"奇变偶不变，符号看象限。"
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
	// 我认为的"人生如梦，一樽还酹江月"英语翻译，还很押韵呢！
	["Life likes a dream and I should carpe diem!", "作者"],
	["先天下之忧而忧，后天下之乐而乐。", "宋&middot;范仲淹"],
	["人生自古谁无死，留取丹心照汗青。", "宋&middot;文天祥"],
	["以声之色，塑花之形；将你之名，刻于我心。", "《声之形》"],
	["世界是你们的，也是我们的，但是归根结底是你们的。", "毛泽东"],
	["人有悲欢离合，月有阴晴圆缺，此事古难全。", "宋&middot;苏轼"],
	["君不见，黄河之水天上来，奔流到海不复回。", "唐&middot;李白"],
	["海纳百川，有容乃大；壁立千仞，无欲则刚。", "清&middot;林则徐"],
	["鸟之将死，其鸣也哀；人之将死，其言也善。", "春秋&middot;曾参"],
	["人类的伟大是勇气的伟大，人类的赞歌是勇气的赞歌。", "全体人类"],
	["安得广厦千万间，大庇天下寒士俱欢颜，风雨不动安如山。", "唐&middot;杜甫"]
];

let blogsListCache = null;

function getBlogFileName(year, month, day, fullPath=true) {
	month = (month.toString().length == 1)? `0${month}`: month.toString();
	day = (day.toString().length == 1)? `0${day}`: day.toString();
	if (!fullPath) {
		return `${year}-${month}-${day}`;
	} else {
		return `blogs/${year}-${month}-${day}.md`;
	}
}

function renderMarkdown(text) {
	// 渲染Markdown
	let renderer = new marked.Renderer();

	const blockMath = {
		// 行间公式
		name: "blockMath",
		level: "block",
		start(src) {
			let match =  src.match(/\$\$/);
			return match? match.index: undefined;
		},
		tokenizer(src, tokens) {
			const rule = /^\$\$([^\$\$]+?)\$\$/;
			const match = rule.exec(src);
			if (match) {
				return {
					type: "blockMath",
					raw: match[0],
					text: match[0],
					tokens: []
				};
			}
		},
		renderer(token) {
			return `${token.raw.replace(/</g, "&lt;").replace(/>/g, "&gt;")}`;
		}
	};

	const inlineMath = {
		// 行内公式
		name: "inlineMath",
		level: "inline",
		start(src) {
			let match =  src.match(/\$/);
			return match? match.index: undefined;
		},
		tokenizer(src, tokens) {
			const rule = /^\$([^\$]+?)\$/;
			const match = rule.exec(src);
			if (match) {
				return {
					type: "inlineMath",
					raw: match[0],
					text: match[0],
					tokens: []
				};
			}
		},
		renderer(token) {
			return `${token.raw.replace(/</g, "&lt;").replace(/>/g, "&gt;")}`;
		}
	};

	renderer.image = function (href, title, text) {
		return `<img alt="${text}" src="${(href.indexOf("//") != -1)? href: "sources/images/" + href}">`;
	};
	renderer.hr = function () {
		return "<div class='split' style='width: 50%'></div>";
	};
	marked.setOptions({
		highlight: (code) => {
			return hljs.highlightAuto(code).value;
		},
		renderer: renderer
	});
	marked.use({
		extensions: [blockMath, inlineMath]
	});
	return marked.parse(text);
}

function loadBlog(which) {
	// 对which（哪篇博客）的检查比较松: 2022-01-08和2022-1-8（以及任何能被Date构造函数识别的字符串）都能定位到同一篇（在网页中为了统一都会补零）
	// 年月日之间必须是用短横线（"-"）分割的
	which = which.split("-");
	let now = [parseInt(which[0]), parseInt(which[1]), parseInt(which[2])];
	let loaded = false;
	for (let blog of getBlogsList()) {
		// 使用 Array.toString() == Array 可能比较简单
		if (blog.time.toString() == now) {
			$("#blog-title").text(blog.title);
			document.title = `个人小站 - ${blog.title}`;
			loaded = true;
			for (tag of blog.tags) {
				$("#blog-tags").append(`<a href="blogs.html?tag=${tag}"><span class="badge rounded-pill bg-primary me-1">${tag}</span></a>`);
			}
			$.ajax({
				"async": false,
				"url": getBlogFileName(...now),
				"error": (xhr) => {
					$("#blog-container").html(`<span class="text-muted">文件未成功读取，错误代码：${xhr.status}。</span>`);
				},
				"success": (text) => {
					$("#blog-container").html(renderMarkdown(text));
					if ($("#blog-container").children()[0].nodeName == "H1") {
						$("#blog-title").text($("#blog-container").children()[0].innerText);
						$("#blog-container").children()[0].remove();
					}
					if (blog.showGitalk) {
						let gitalk = new Gitalk({
							clientID: "e2d5986e5e12e075dfc0",
							clientSecret: "d69a3f824c4f51e89f2562727c1fa6e7da467a45",
							repo: "jason-bowen-zheng.github.io",
							owner: "jason-bowen-zheng",
							admin: ["jason-bowen-zheng"],
							id: getBlogFileName(...now, false)
						});
						if (location.href.indexOf(".github.io") != -1) {
							gitalk.render("gitalk-container");
						}
					}
				}
			});
		}
	}
	if (!loaded) {
		$("#blog-container").html(`<p align="center"><code>${getBlogFileName(...now, fullPath=false)}</code>不存在。</p>`);
	}
}

function getBlogsList() {
	if (blogsListCache != null) {
		return blogsListCache;
	} else {
		$.ajax({
			"async": false,
			"url": "blogs/index.json",
			"success": (list) => {
				blogsListCache = list;
			}
		});
		return blogsListCache;
	}
}

function showDailyImage() {
	let now = new Date();
	$.ajax({
		"url": "sources/images/lists.json",
		"success": (list) => {
			let index = (now.getDate() + now.getHours()) % list.length;
			$("#daily-image").attr("src", `sources/images/${list[index].name}`);
			$("#daily-image").attr("alt", list[index].description);
			$("#img-desp").html(list[index].description || "一幅没有描述的图片");
		}
	});
}

function showLatestBlog() {
	let blog = getBlogsList()[0];
	$("#blog-title").text(blog.title);
	$.ajax({
		"url": getBlogFileName(...blog.time),
		"error": (xhr) => {
			$("#blog-content").html(`<span class="text-muted">内容未成功读取，错误代码：${xhr.status}。</span>`);
		},
		"success": (text) => {
			let result = renderMarkdown(text);
			for (tag of blog.tags) {
				$("#blog-tags").append(`<a href="blogs.html?tag=${tag}"><span class="badge rounded-pill bg-primary me-1">${tag}</span></a>`);
			}
			$("#blog-content").html(result.slice(result.indexOf("<p>"), result.indexOf("</p>") + 4));
			$("#blog-time").text(getBlogFileName(...blog.time, false));
			$("#blog-link").attr("href", `blog.html?${getBlogFileName(...blog.time, false)}`);	
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
	$("#quote").html(`<b>${quotes[index][1]}</b>：${quotes[index][0]}`);
}

function showRecentBlog() {
	let count = 0;
	let now = new Date();
	for (let blog of getBlogsList()) {
		let date = new Date(blog.time);
		// 2592000000s 是30天
		if ((0 < now - date) && (now - date < 2592000000)) {
			$("#recent-blogs").append(`<li>${getBlogFileName(...blog.time, false)} &raquo; <a href="blog.html?${getBlogFileName(...blog.time, false)}">${blog.title}</a></li>`);
			count ++;
			if (count >= 5) {
				return;
			}
		}
	}
	if (count == 0) {
		$("#recent-blogs").append(`<li>${getBlogFileName(...blog.time, false)} &raquo; <a href="blog.html?${getBlogFileName(...blog.time, false)}">${blog.title}</a></li>`);
	}
}

function showToday() {
	let now = new Date();
	let num2name = ["日", "一", "二", "三", "四", "五", "六"];
	$("#today").html(`今天是${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`);
	$("#today").html($("#today").html() + `（星期${num2name[now.getDay()]}），`);
	let lunar = calendar.solar2lunar();
	$("#today").html($("#today").html() + `农历${lunar.gzYear}年${lunar.IMonthCn}${lunar.IDayCn}`);
	if (lunar.lunarFestival || lunar.Term) {
		$("#today").html($("#today").html() + "（" + (lunar.lunarFestival || lunar.Term) + "）");
	}
	let thisYear = new Date(now.getFullYear(), 0);
	let nextYear = new Date(now.getFullYear() + 1, 0);
	// 一年过了一半了吗?
	if (thisYear - now < nextYear - now) {
		// 86400000s 是一天
		$("#today").html($("#today").html() + `，是今年的第${parseInt((now - thisYear) / 86400000 + 1)}天。`);
	} else {
		$("#today").html($("#today").html() + `，距明年还有${parseInt((nextYear - now) / 86400000 + 1)}天。`);
	}
	$("#today-lists").html(`<li><a href="https://zh.wikipedia.org/wiki/${now.getMonth() + 1}月${now.getDate()}日">维基百科：${now.getMonth() + 1}月${now.getDate()}日</a></li>`);
	if (lunar.lunarFestival || lunar.Term) {
		$("#today-lists").html($("#today-lists").html() + `<li><a href="https://zh.wikipedia.org/wiki/${lunar.lunarFestival || lunar.Term}">维基百科：${lunar.lunarFestival || lunar.Term}</li>`);
	}
}
