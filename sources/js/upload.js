function canUpload() {
	if (document.forms[1].checkValidity()) {
		$("#submit-upload").removeAttr("disabled");
	} else {
		$("#submit-upload").attr("disabled", "disabled");
	}
}

function uploadFile(imagesList) {
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
	let sha = "abcdef";
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
