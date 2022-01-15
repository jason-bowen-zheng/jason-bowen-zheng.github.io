function canUpload() {
	// 这里我们不可能POST一个表单到某URL
	// 所以只能使用下面的uploadFile来执行
	// 在执行前必须先检查表单是否合规填写
	if (document.forms[1].checkValidity()) {
		$("#submit-upload").removeAttr("disabled");
	} else {
		$("#submit-upload").attr("disabled", "disabled");
	}
}

function uploadFile(imagesList) {
	// 使用GitHub API上传图像至GitHub
	// 真的非常复杂, 以至于下面的uploadImage才是用来上传文件的
	// 由于Javascript的某些函数(如btoa, encodeURI)功能受限, 故采用折中方法
	let baseURL = "https://api.github.com/repos/jason-bowen-zheng/jason-bowen-zheng.github.io";
	let failed = false;
	let date = new Date();
	let now = getArticleFileName(date.getFullYear(), date.getMonth() + 1, date.getDate(), false);
	let sha;
	$.ajax({
		"async": false,
		"url": "https://api.github.com",
		"headers": {"Authorization": `token ${$("#token").val()}`},
		"error": (xhr) => {
			if (xhr.status == 401) {
				alert("令牌错误！");
				$("#token").val("").focus();
				$("#submit-upload").attr("disabled", "disabled");
				failed = true;
			}
		}
	});
	if (failed) {
		return;
	}
	if (document.forms[1][4].checked) {
		$.ajax({
			"async": false,
			"url": `${baseURL}/contents/sources/images/lists.json`,
			"success": (data) => {
				sha = data.sha;
			}
		});
		imagesList.push({"name": $("#name").val(), "description": $("#desp").val()});
		// 因为imagesList包含Unicode字符, btoa不能转换
		// 故只能使用FileReader.readAsDataURL
		let blob = new Blob([JSON.stringify(imagesList)]);
		let reader = new FileReader();
		reader.readAsDataURL(blob);
		reader.onload = function() {
			$.ajax({
				"async": false,
				"url": `${baseURL}/contents/sources/images/lists.json`,
				"type": "put",
				"headers": {"Authorization": `token ${$("#token").val()}`},
				"data": JSON.stringify({
					"message": `${now}(upload.html)`,
					"content": reader.result.slice(13),
					"sha": sha
				}),
				"dataType": "json",
				"success": (data) => {},
				"error": (xhr) => {
					alert(`更新索引文件失败：${xhr.responseJSON.message}`);
					failed = true;
				}
			});
			if (failed) {
				return;
			}
			uploadImage(imagesList);
		};
	} else {
		uploadImage(imagesList);
	}
}

function uploadImage(imagesList) {
	let baseURL = "https://api.github.com/repos/jason-bowen-zheng/jason-bowen-zheng.github.io";
	let failed = false;
	let date = new Date();
	let now = getArticleFileName(date.getFullYear(), date.getMonth() + 1, date.getDate(), false);
	// 空字符串的sha256值
	let sha = "e3b0c44298fc1c14";
	for (item of imagesList) {
		if (item.name == $("#name").val()) {
			$.ajax({
				"async": false,
				"url": `${baseURL}/contents/sources/images`,
				"success": (data) => {
					for (item of data) {
						if (item.name == $("#name").val()) {
							sha = item.sha;
						}
					}
				}
			});
		}
	}
	let reader = new FileReader();
	reader.readAsDataURL(document.forms[1].file.files[0]);
	reader.onload = function() {
		$.ajax({
			"async": false,
			"url": `${baseURL}/contents/sources/images/${$("#name").val()}`,
			"type": "put",
			"headers": {"Authorization": `token ${$("#token").val()}`},
			"data": JSON.stringify({
				"message": `${now}(upload.html)`,
				"content": reader.result.slice(22),
				"sha": sha
			}),
			"dataType": "json",
			"success": (data) => {},
			"error": (xhr) => {
				alert(`更新图片失败：${xhr.responseJSON.message}`);
				failed = true;
			}
		});
		if (failed) {
			return;
		}
		location.href = "upload.html";
	};
}
