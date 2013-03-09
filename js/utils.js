
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

function gethash() {
	
	$(window).on('hashchange', function () {
		var hash = location.hash.substring(1); // strip the leading # symbol
		
		switch (hash) {
		case 'home':
			system.init(); 
			break;
			
		case 'my-events':
			user.my_events();
			break;
			
		case 'my-requests':
			user.my_requests();
			break;
			
		case 'my-ints':
			system.ints(); 
			break;
			
		case 'how-it-work-id':
			system.how-it-work-id(); 
			break;
			
		case 'Profile':
			user.profile();
			break;
		
		
		case 'contact-id':
			system.contacts();
			break;
			
			
		case 'service-id':
			system.services();
			break;	
			
		case 'about-id':
			system.about();
			break;	
			
			
		}
		
	});
	
}

function getUrlVars() {
	var vars = [],
	hash;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for (var i = 0; i < hashes.length; i++) {
		hash = hashes[i].split('=');
		vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	}
	return vars;
}
