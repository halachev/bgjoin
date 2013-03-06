
//public functions out of objects
function myAjax(_file, _data, results) {
	
	$.ajax({
		url : serviceURL + '/' + _file,
		type : 'POST',
		dataType : "json",
		data : _data,
		
		success : function (data) {
			results(data);
		},
		
		error : function (err) {
			//alert(err.result);
		}
		
	});
	
}

function CheckServerError(obj) {
	
	if (typeof obj.error_message != 'undefined') {
		if ((obj.error_message != "")) {
			$(".error").hide();
			var err = JSON.parse(JSON.stringify(obj));
			var err_message = err.error_message;
			system.error($('#error-message'), err_message);
			return false;
		}
	} else
		return true;
	
}

$(window).scroll(function () {
	
	if ($(window).scrollTop() == $(document).height() - $(window).height()) {
		
		//user.lastPosts();
		
	}
});
