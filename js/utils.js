 
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
			
			var err = "";
			switch(err_message)
			{
			   //user
			   case "INVALID_USERNAME" : err = 'Невалидно потребителско имe или парола!';
			   break;
			   
			   case "REQUARED_FIELDS" : err = 'Всички полета задължителни!';
			   break;
			   
			   case "EXIST_USERNAME" : err = 'Потребителско име е заето!';
			   break;
			
			   //events
			   case "EVENT_REQUARED_FIELDS" : err = 'Всички полета задължителни!';
			   break;
			   
			   case "MAX_EVENT_NAME" : err = 'Максимална дължина на заглавие 50 знака!';
			   break;
			   
			   case "MAX_EVENT_DESCR" : err = 'Максимална дължина на описание 500 знака';
			   break;
			   
			   case "EXIST_EVENT" : err = 'Вече има събитие със същото име!';
			   break;
			   
			   //requests
			   case "MAKE_SELF_REQUEST" : err = 'Не може да правите заявки към ваши събития!';
			   break;
			   
			   case "REQUEST_REQUARED_FIELDS" : err = 'Всички полета задължителни!';
			   break;
			   
			   case "EXIST_REQUEST" : err = 'Вече сте направил заявка за това събитие!';
			   break;
			  
				
			}
			
			system.error($('#error-message'), err);
			return false;
		}
	} else
		return true;
	
}

$(window).scroll(function () {
	
	if ($(window).scrollTop() == $(document).height() - $(window).height()) {
		
		//user.lastUserPosts();
		
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
			
		case 'users':
			user.GetLastUsers();
			break;
			
		case 'how-it-work-id':
			system.how - it - work - id();
			break;
			
		case 'Profile':
			user.profile();
			break;
			
		case 'contact':
			system.contacts();
			break;
			
		case 'service':
			system.services();
			break;
			
		case 'about':
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

//password functions
var rand = function (str) {
	return str[Math.floor(Math.random() * str.length)];
};

var get = function (source, len, a) {
	for (var i = 0; i < len; i++)
		a.push(rand(source));
	return a;
};

var alpha = function (len, a) {
	return get("A1BCD2EFG3HIJ4KLM5NOP6QRS7TUV8WXY9Z", len, a);
};
var symbol = function (len, a) {
	return get("-:;_$!", len, a);
};

//end password functions
