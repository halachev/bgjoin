//system object
var system = {
	
	init : function () {
	
		if (sessionId == null) {
			$('#profile-id').hide();
			$('#my-requests-id').hide();
			$('#my-events-id').hide();
			$('#exit-id').hide();
			$('#register-id').show();
			$('#facebook-login').show();
			$('#login-id').show();
			$('#how-it-work-id').show();
		} else {
			$('#profile-id').show();
			$('#my-requests-id').show();
			$('#my-events-id').show();
			$('#exit-id').show();
			$('#register-id').hide();
			$('#facebook-login').hide();
			$('#login-id').hide();
			$('#how-it-work-id').hide();
		}
		
		system.initContent();
	},
	
	currentUser : function () {
		
		var data = JSON.parse(currUser);
		return data;
	},
	
	content : function () {
		
		return $('#main-content');
	},
	
	initContent : function () {
		
		if (currUser == null)
		{
			$.get('ui/presents.html', function (login_data) {
				$('#presents-id').html(login_data);
			});
		}
		
		system.search();
		
		this.content().html('<center><a href="#LoadMore" class="button_view">Показване на още</a></center>');
		
		var html =
			
			'<div class="center_bg">' +
			
			'<div id="leftHtml"></div>' +
			'<div id="rightHtml"></div>' +
			
			'<div class="clear"></div>' +
			
			'</div>';
		
		user.GetLastUserEvents(); // assigned to leftHtml
		user.GetLastUsers(); // assigned to rightHtml
		
		this.content().html(html);
		
		this.content().append('<a href="#LoadMore" class="button_view">Показване на още</a>');
		
	},
	
	Loader : function (state) {
		if (state)
			$('div#lastPostsLoader').html('<img src="images/ajax-loader.gif">');
		else
			$('div#lastPostsLoader').html("");
		
	},
	
	ShowLoginForm : function () {
		
		$.get('ui/login.html', function (login_data) {
			$('#modal-form').html(login_data);
			
			$("#login-password").keypress(function () {
				if (event.which == 13) {
					$('#btnLogin').attr("disabled", "disabled");
					$('#error-message').html('<p class="title">Моля, изчакайте...</p>');
					onLogin();
				}
			});
			
			$('#btnLogin').click(function (e) {
				$('#btnLogin').attr("disabled", "disabled");
				$('#error-message').html('<p class="title">Моля, изчакайте...</p>');
				onLogin();
			});
			
		});
		
		system.ShowDialog($('#modal-form'), 'Вход');
		
		function onLogin() {
			
			var data = {
				username : $('#login-name').val(),
				password : $('#login-password').val(),
				method : "LogIn"
			};
			myAjax("user.php", data, function (_data) {
				
				if (_data.error_message != "")
					
					$('#btnLogin').removeAttr("disabled");
				("disabled", "disabled");
				
				user.UserStorage(_data, true);
			});
			
		}
		
	},
	
	ShowDialog : function (_id, title) {
		_id.dialog({
			title : title,
			modal : true,
			show : 'fadeIn',
			resizable : false,
			dialogClass : 'dialog-box',
			buttons : {
				"Close" : function () {
					$(this).dialog("close");
				}
			},
			
		});
	},
	
	ShowImageDialog : function (_id, title) {
		_id.dialog({
			title : title,
			modal : true,
			//show : 'fadeIn',
			resizable : false,
			//draggable: false,
			width : 'auto',
			position : 'top'
		});
	},
	
	ShowRegisterForm : function () {
		$.get('ui/register.html', function (login_data) {
			$('#modal-form').html(login_data);
			
			$('#btnRegister').click(function (e) {
				user.registerUser();
			});
			
		});
		
		this.ShowDialog($('#modal-form'), 'Нов потребител');
		
	},
	
	registerByFaceBook : function () {
		
		FB.init({
			appId : '167009306785503',
			status : true,
			cookie : true,
			oauth : true
		});
		
		function registerUser(resp) {
			
			//password
			var l = Math.floor(length / 2),
			r = Math.ceil(length / 2);
			var ret = alpha(l, symbol(1, alpha(r, []))).join('');
			
			var data = {
				username : resp.name,
				password : ret,
				email : resp.email,
				method : "insert"
			};
			
			myAjax("user.php", data, function (_data) {
				user.UserStorage(_data, true);
				location = pageUrl;
			});
			
		}
		
		function FaceBookLogin() {
			FB.api('/me', function (resp) {
				var access_token = FB.getAuthResponse()['accessToken'];
				
				sessionId = $.sha1(resp.name + resp.email);
				localStorage.setItem('sessionId', sessionId);
				
				var data = {
					sessionId : sessionId,
					username : resp.name,
					email : resp.email,
					method : 'getUserByName'
				};
				
				myAjax("user.php", data, function (_data) {
					if (_data.length <= 0)
						registerUser(resp);
					else
						user.UserStorage(_data, true);
					
				});
				
			});
		}
		
		function getUserInfo() {
			
			FaceBookLogin();
			
		}
		
		FB.getLoginStatus(function (stsResp) {
			if (stsResp.authResponse) {
				getUserInfo();
			} else {
				FB.login(function (loginResp) {
					if (loginResp.authResponse) {
						getUserInfo();
					} else {
						//alert('Please authorize this application to use it!');
					}
				}, {
					scope : 'email'
				});
			}
		});
		
	},
	
	how_it_work : function () {
		
		$.get('ui/how-it-works.html', function (login_data) {
			
			system.content().html(login_data);
			
		});
	},
	search : function () {
		
		system.Loader(true);
		$.get('ui/search.html', function (login_data) {
			$('#search-id').html(login_data);
			
			var data = {
				method : 'interests'
			}
			
			myAjax('ints.php', data, function (_data) {
				
				var values = null;
				for (i in _data) {
					var interest = _data[i];
					values += '<option value="' + interest.id + '">' + interest.int_name + '</option>';
					
				}
				
				$('#ints-id').html(values);
				
				$("#ints-id").change(function () {
					var _id = $('#ints-id').val();					
					system.GetEventsByIntID(_id);
				});
				
				$("a[href=#search-post]").live("click", function () {
					user.GetLastUsers();
				});
				
				system.Loader(false);
			});
			
		});
		
		$("#search-event").live("click", function (e) {
			//
		});
		
		$("#search-user").live("click", function (e) {
			//
		});
		
	},
	
	GetEventsByIntID : function (_id) {
		system.Loader(true);		
		myAjax("event.php", {		
			id: _id,			
			limit : FIRST_MAX_EVENTS,
			method : "GetEventsByIntID"
		}, function (_data) {			
			var html = user.ShowUserEvents(_data);			
			$('#leftHtml').html(html);
			
			if (_data.length <=0)
				alert("Няма намерени резултати!");
			
			system.Loader(false);
		});
		
	},
	
	testString : function (_name, _element, _text) {
		
		if ((_name.length <= 2) || (_name == "")) {
			system.error(_element, _text);
			return false;
		} else
			return true;
		
	},
	
	testPassword : function (_first, _second) {
		
		if (_first == '') {
			system.error($('#register-password'), 'Въведете парола');
			return false;
		} else if (_second == '') {
			system.error($('#register-re-password'), 'Повторете паролата отново');
			return false;
		} else if (_first != _second) {
			system.error($('#error-message'), 'Паролите не съвпадат!');
			return false;
		} else
			return true;
	},
	
	testEmail : function (emailAddress) {
		var pattern = new RegExp(/^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i);
		return pattern.test(emailAddress);
	},
	
	error : function (_element, _message) {
		
		$('#new-event-form span').empty();
		_element.after('<span class="error">' + _message + '</span>');
	},
	
	contacts : function () {
		$.get('ui/contact.html', function (login_data) {
			
			system.content().html(login_data);
			
		});
	},
	
	services : function () {
		$.get('ui/service.html', function (login_data) {
			
			system.content().html(login_data);
			
		});
	},
	
	about : function () {
		$.get('ui/about.html', function (login_data) {
			
			system.content().html(login_data);
			
		});
	},
	
};
