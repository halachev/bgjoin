//system object
var system = {
	
	init : function () {
		
		system.search();
		if (sessionId == null) {
			$('#profile-id').hide();
			$('#my-events-id').hide()
			$('#exit-id').hide();
			$('#register-id').show();
			$('#login-id').show();
			$('#how-it-work-id').show();
		} else {
			$('#profile-id').show();
			$('#my-events-id').show()
			$('#exit-id').show();
			$('#register-id').hide();
			$('#login-id').hide();
			$('#how-it-work-id').hide();
		}
		
		system.initContent();
	},
	
	content : function () {
		
		return $('#main-content');
	},
	
	initContent : function () {
		var html =
			'<div class="center_bg">' +
			
			'<div id="leftHtml"></div>' +
			'<div id="rightHtml"></div>' +
			
			'<div class="clear"></div>' +
			
			'</div>';
		
		user.GetLastUserNotes(); // assigned to leftHtml
		user.GetLastUsers(); // assigned to rightHtml
		
		this.content().html(html);
		
		this.content().append('<center><a href="#LoadMore" class="button_view">Показване на още</a></center>');
		
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
			
			$('#btnLogin').click(function (e) {
				var data = {
					username : $('#login-name').val(),
					password : $('#login-password').val(),
					method : "LogIn"
				};
				myAjax("user.php", data, function (_data) {
					user.UserStorage(_data);
				});
			});
		});
		
		this.ShowDialog($('#modal-form'), 'Вход');
		
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
			}
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
	
	how_it_work : function () {
		
		$.get('ui/how-it-works.html', function (login_data) {
			
			system.content().html(login_data);
			
		});
	},
	search : function () {
		
		var shtml =
			'<div class="search_tab">' +
			'<div class="search_title">Търси</div>' +
			'<div class="search_form">' +
			'<input type="text" class="small_input" />' +
			'<a href="#search-post" class="search_bt" ><img src="images/search.gif" /></a>' +
			'</div>' +
			'</div>';
		
		$('#search-id').html(shtml);
		
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
		
		_element.after('<span class="error">' + _message + '</span>');
	},
	
	my_events : function () {
		$.get('ui/my-events.html', function (login_data) {
			
			system.content().html(login_data);
			$('#add-event-id').click(function () {
				user.addEvent();
			})
			
		});
	},
	
	ints: function () {
		system.Loader(true);
		$.get('ui/my-ints.html', function (login_data) {
			
			system.content().html(login_data);
			
			var data = {				
				method: 'interests'
			}
			
			myAjax('ints.php', data, function (_data) {				
				var html = system.ShowInts(_data);
				
				$('#my-ints-list').html(html);
				system.Loader(false);
			});
			
		});
		
	},
	
	
	ShowInts : function (ints) {
		
		var html = '';	
		
		for (i in ints) {
			var interes = ints[i];
			html += '<ul><a href="#" ><p class="small">' + interes.name + '</p></a></ul>';							
		}
		
		return html;
		
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
