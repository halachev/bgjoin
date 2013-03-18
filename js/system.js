//system object
var system = {
	
	init : function () {
		
		if (sessionId == null) {
			$('#main-text').show();
			$('#profile-id').hide();
			$('#my-requests-id').hide();
			$('#my-events-id').hide();
			$('#exit-id').hide();
			$('#register-id').show();
			$('#facebook-login').show();
			$('#login-id').show();
			$('#how-it-work-id').show();
		} else {
			$('#main-text').hide();
			$('#profile-id').show();
			$('#my-requests-id').show();
			$('#my-events-id').show();
			$('#exit-id').show();
			$('#register-id').hide();
			$('#facebook-login').hide();
			$('#login-id').hide();
			$('#how-it-work-id').hide();
			
			user.my_requests_count();
			
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
		
		// check for go back button
		gethash();
		system.search();
		
		//check for hash string ???
		var hash = window.location.hash; // get !#
		id = hash.slice(1).replace('!', '') // replace
			
			//at the moment we have only event view ...
			if (id > 0)
				$('#main-content').load('/ui/view-event.php?_escaped_fragment_=' + id + '');
			else
				user.GetLastUserEvents(); // first load events
			
			
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
			position : 'center',
			buttons : {
				"Close" : function () {
					
					// remove temporary image from images table
					//if does not have event
					
					var eventResponse = localStorage.getItem('eventResponse');
					if (eventResponse != null)
						user.deleteTempImage(eventResponse);
					
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
			position : 'center',
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
		system.Loader(true);
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
			system.Loader(false);
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
				
				var values = '<option value="0">Избрете категория</option>';
				
				for (i in _data) {
					var interest = _data[i];
					values += '<option value="' + interest.id + '">' + interest.int_name + '</option>';
					
				}
				
				$('#ints-id').html(values);
				
				$("#ints-id").change(function () {
					var _id = $('#ints-id').val();
					
					if (_id > 0)
						system.GetEventsByIntID(_id);
					else
						system.initContent();
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
			id : _id,
			limit : FIRST_MAX_EVENTS,
			method : "GetEventsByIntID"
		}, function (_data) {
			var html = user.ShowUserEvents(_data);
			system.content().html(html);
			
			if (_data.length <= 0) {
				alert("Няма намерени резултати!");
			}
			
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
