
function canUpload() {
	if (document.forms[1].checkValidity()) {
		$("#submit-upload").removeAttr("disabled");
	} else {
		$("#submit-upload").attr("disabled", "disabled");
	}
}

function uploadFile(imagesList) {
	let failed = false;
	let datas;
	$.ajaxSetup({async: false});
	$.ajax({
		"url": "https://api.github.com",
		"headers": {"Authorization": `token ${$("#token").val()}`},
		"error": (xhr) => {
			if (xhr.status == 401) {
				alert("令牌错误！");
				failed = true;
			}
		}
	});
	if (failed == true) {
		return;
	}
	location.href = "upload.html";
}
