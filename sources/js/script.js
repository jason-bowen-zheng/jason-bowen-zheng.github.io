maths_tips = [
	"幂函数系数必为1，与坐标轴不交",
	"用指对互换解指对方程",
	"复合函数法求值域可不考虑函数天然定义域",
	"不等式两边可同时开正奇次方，但不可开正偶次方",
	"证明奇偶性最讨厌！",
	"等式恒成立：标准化叙述，系数全为零",
	"零点丫的不是点！",
	"用对数恒等式解指数不等式",
	"域的问题最基本理念：将待求的\"范围和最值\"部分用一个字母表示，得到函数，并求值域",
	"高次不等式用穿针引线法",
	"函数中的自变量可以在取值范围内换成任意的值或式，甚至是一坨屎",
	"慎用多次基本不等式，除非等号成立条件相同",
	"对数不等式&#215;1",
	"狗都不想用基本不等式！",
	"等式有解：标准化叙述，参变分离求值域"
];

saying = [
	["史家之绝唱，无韵之离骚。", "鲁迅"],
	["我亦无他，惟手熟尔。", "宋&middot;欧阳修"],
	["生存，还是毁灭，这是个问题。", "莎士比亚"],
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

images = [];
$.ajax({
	"url": "sources/images/lists.json",
	"success": (data) => {
		images = data;
	}
});

function show_daily_image() {
	now = new Date();
	index = (now.getDate() + now.getHours()) % images.length;
	$("#daily-image").attr("src", `sources/images/${images[index]["name"]}`);
	$("#img-desp").html(images[index]["description"]);
}

function show_maths_tips() {
	now = new Date();
	index = (now.getDate() + now.getHours()) % maths_tips.length;
	$("#maths-tips").html(maths_tips[index]);
}

function show_saying() {
	now = new Date();
	index = (now.getDate() + now.getHours()) % saying.length;
	if (now.getMonth() == 0 && now.getDate() == 1 && now.getHours() == 0) {
		$("#saying").html(`<b>宋&middot;王安石</b>：爆竹声中一岁除，春风送暖入屠苏。`);
	} else if (now.getMonth() == 1 && now.getDate() == 14) {
		$("#saying").html(`<b>乔治&middot;艾略特</b>：我不但喜欢被人爱，还喜欢有人告诉爱上了我。`);
	} else {
		$("#saying").html(`<b>${saying[index][1]}</b>：${saying[index][0]}`);
	}
}

