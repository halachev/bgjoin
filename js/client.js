/*
url - http://joinme.nh.zonebg.com
writen by Nurietin Mehmedov © 2013
All right reserver ...
 */

$(document).ready(function () {
	//base url
	serviceURL = 'http://joinme.nh.zonebg.com/services';
	
	//global session
	var sessionId = localStorage.getItem('sessionId');
	var currUser = localStorage.getItem('profileId');
	localStorage.removeItem('lastId');
	
	FIRST_MAX_USERS = 10;
	FIRST_MAX_EVENTS = 10;
	
	var ERROR_INSERT_EXIST_NAME = 1;
	var ERROR_INSERT_REQUARED = 2;
	var ERROR_LOGIN = 3;
	
	//user oject
	var user = {
		
		GetLastUsers : function () {
			
			myAjax("user.php", {
				limit : FIRST_MAX_USERS,
				method : "allUsers"
			}, function (_data) {
				
				var html = user.ShowUsers(_data);
				$('#rightHtml').html(html);
				
				user.LoadImages();
				$('#main-content').append('<center><a href="#LoadMore" class="button_view">Показване на още</a></center>');
				
			});
			
		},
		
		GetLastUserNotes : function (_html) {
			myAjax("user.php", {
				limit : FIRST_MAX_EVENTS,
				method : "allUsers"
			}, function (_data) {
				
				var html = user.ShowUserNotes(_data);
				
				var main_box = "";
				
				if (currUser == null)
					main_box =
						'<div class="main_box">' +
						'<div class="title">Най-лесният начин да се забавляваш!</div>' +
						'<div class="left_banner_content">' +
						'<br/><p>Присъедини се към това което търсиш.<p/>' +
						'<p>Социална мрежа за хора с общи интереси!<p>' +						
						'<p>Бъди различен последвай ме ...</p>' +
						
						'</div>';
				
				$('#leftHtml').html(main_box);
				$('#leftHtml').append(html);
				
			});
			
		},
		
		profile : function () {
			$.get('ui/profile.html', function (login_data) {
				
				system.content().html(login_data);
				
				var data = JSON.parse(currUser);
				
				var descr = "";
				if (data.descr != null)
					descr = data.descr;
				
				var html =
					
					'<a href="#delete-user" class="button_view">Изтриване</a>' +
					'<a href="#edit-user" class="button_view">Редакция</a>' +
					'<a href="#add-image" class="button_view">Качи снимка</a>' +
					
					'<span id="UserImageContainer-' + data.id + '"></span>' +
					
					'<div class="main_box">' +
					'<div class="title">' + data.username + '</div>' +
					'<div class="left_banner_content">' +
					'<p>Email: ' + data.email + '</p>' +
					'<p>Описансие: <br/>' + descr + '</p>' +
					
					'</div>';
				$('#user-profile').html(html);
				
				user.LoadImages(true);
				
			});
			
		},
		LoadImages : function (_model) {
			
			var userImage = {
				method : 'LoadImages'
			}
			
			//get user images ...
			myAjax('userImages.php', userImage, function (_userImages) {
				
				var newhtml = '';
				for (i in _userImages) {
					var image = _userImages[i];
					
					if (_model) {
						newhtml = '<a href="' + image.ImageName + '"  target="_blank"><img src="' + image.ThumbName + '" width="75" /></a>';
						
						$('#UserImageContainer-' + image.UserID + '').append('<span class="main_box">' + newhtml + '</span>');
					} else {
						newhtml = '<a href="#SelectedUser" id=' + user.id + '><img src="' + image.ThumbName + '" width="75" /></a>';
						$('#UserImageContainer-' + image.UserID + '').html(newhtml);
					}
				}
				
			});
			
		},
		
		lastPosts : function () {
			
			system.Loader(true);
			
			var lastId = localStorage.getItem('lastId');
			
			if (lastId == null) {
				// for the first time we have to store last id
				myAjax("user.php", {
					limit : FIRST_MAX_USERS,
					method : "allUsers"
				}, function (_data) {
					var id = 0;
					for (i in _data) {
						var user = _data[i];
						id = user.id;
					}
					
					localStorage.setItem('lastId', id);
					LoadMore(id);
				});
			} else {
				LoadMore(lastId);
				
			}
			
			function LoadMore(_lastId) {
				
				var data = {
					limit : FIRST_MAX_USERS,
					userLastId : _lastId,
					method : 'LoadMore'
				}
				
				myAjax("user.php", data, function (_data) {
					
					var html = user.ShowUserNotes(_data);
					
					$('#leftHtml').html(html);
					
					var html = user.ShowUsers(_data);
					$('#rightHtml').html(html);
					user.LoadImages();
					
					var id = 0;
					for (i in _data) {
						var u = _data[i];
						id = u.id;
					}
					
					localStorage.setItem('lastId', id);
					system.Loader(false);
				})
			}
			
		},
		
		UserProfile : function (_id) {
			
			$.get('ui/profile.html', function (login_data) {
				
				system.content().html(login_data);
				
				myAjax("user.php", {
					id : _id,
					sessionId : sessionId,
					method : "getUserById"
				}, function (_data) {
					
					var data = $.parseJSON(JSON.stringify(_data))[0];
					var descr = "";
					
					if (data.descr != null)
						descr = data.descr;
					
					var html =
						'<span id="UserImageContainer-' + data.id + '"></span>' +
						'<div class="main_box">' +
						'<div class="title">' + data.username + '</div>' +
						'<div class="left_banner_content">' +
						'<p>Email: ' + data.email + '</p>' +
						'<p>Описансие: <br/>' + descr + '</p>' +
						
						'</div>';
					$('#user-profile').html(html);
					
					user.LoadImages(true);
					
				});
				
			});
		},
		
		LogOut : function () {
			
			localStorage.removeItem('sessionId');
			localStorage.removeItem('profileId');
			location = "http://joinme.nh.zonebg.com/";
			
		},
		
		ShowUsers : function (users) {
			
			var html = '<div class="right_content">' +
				'<div class="blue_title">Потребители</div>';
			
			for (i in users) {
				
				var user = users[i];
				
				if (i == FIRST_MAX_USERS)
					break;
				
				html +=
				'<div class="member_tab">' +
				'<a href="#SelectedUser" id=' + user.id + '>' +
				'<div id="UserImageContainer-' + user.id + '"></div>' +
				'<div class="member_details">' +
				'<span><a href="#SelectedUser" id=' + user.id + '>' + user.username + '</a></span><br />' +
				'<p>' + user.email + '</p>' +
				'<p>' + user.descr + '</p>' +
				'<a href="#SelectedUser" id=' + user.id + ' class="read_more">Повече</a></div>' +
				'</div>';
				
			}
			
			return html;
			
		},
		
		ShowUserNotes : function (notes) {
			
			var html = '<div class="left_content"> ' +
				'<div class="blue_title">Последни предложения</div>';
			
			for (i in notes) {
				var note = notes[i];
				
				if (i == FIRST_MAX_EVENTS)
					break;
				
				html +=
				'<ul class="list">' +
				'<li><a href="#">' + note.username + '</a></li>' +
				'</ul>' +
				'<ul class="list">' +
				'<li><a href="#">' + note.email + '</a></li>' +
				'</ul>';
				
			}
			
			return html;
			
		},
		
		registerUser : function () {
			
			var data = {
				username : $('#register-user').val(),
				password : $('#register-password').val(),
				RePassword : $('#register-re-password').val(),
				email : $('#register-email').val(),
				method : "insert"
			};
			
			//check validation for user
			$(".error").hide();
			
			if (!system.testUserName(data.username))
				return;
			else if (!system.testPassword(data.password, data.RePassword))
				return;
			else if (!system.testEmail(data.email)) {
				system.error($('#register-email'), 'Невалиден email адрес!');
				return false;
			};
			
			myAjax("user.php", data, function () {
				//
			});
			
		},
		
		edit : function () {
			
			$.get('ui/edit.html', function (login_data) {
				$('#modal-form').html(login_data);
				
				var data = {
					username : $('#edit-user'),
					email : $('#edit-email'),
					descr : $('#edit-descr')
				};
				
				var user = JSON.parse(currUser);
				
				data.username.val(user.username);
				data.email.val(user.email);
				data.descr.val(user.descr);
				
				$('#btnEdit').click(function (e) {
					
					var editData = {
						id : user.id,
						sessionId : sessionId,
						username : data.username.val(),
						email : data.email.val(),
						descr : data.descr.val(),
						method : "edit"
					};
					
					myAjax("user.php", editData, function () {
						//
					});
					
				});
			});
			
			system.ShowDialog($('#modal-form'), 'Редакция');
			
		},
		
		addImage : function () {
			var x = screen.width / 2 - 700 / 2;
			var y = screen.height / 2 - 450 / 2;
			window.open('file-uploader/index.php', "Качване на снимка", '"location=1,status=1,scrollbars=1, height=485,width=700,left=' + x + ',top=' + y);
			
		},
		
		remove : function () {
			var c = confirm("Сигурен ли сте, че искате да изтриете профила?");
			
			if (c) {
				//delete
			}
		},
		
	}
	
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
					myAjax("user.php", data);
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
		
		testUserName : function (_name) {
			
			if ((_name.length <= 2) || (_name == "")) {
				system.error($('#register-user'), 'Невалидно потребителско име!');
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
				
			});
		}
	}
	
	//start application
	system.init();
	
	//handle user events
	$('#home-id').click(function (e) {
		system.init();
	});
	
	
	$('#how-it-work-id').click(function (e) {
		system.how_it_work();
	});
	
	$('#login-id').click(function (e) {
		system.ShowLoginForm();
		
	});
	
	$('#register-id').click(function (e) {
		system.ShowRegisterForm();
	});
	
	$('#my-events-id').click(function (e) {
		system.my_events();
	});
	
	$('#profile-id').click(function (e) {
		
		user.profile();
		
	});
	
	$('#exit-id').click(function (e) {
		user.LogOut();
	});
	
	$("a[href=#search-post]").live("click", function () {
		$('#rightHtml').html("");
	});
	
	//profile events
	$("a[href=#edit-user]").live("click", function () {
		user.edit();
	});
	
	$("a[href=#add-image]").live("click", function () {
		user.addImage();
	});
	
	$("a[href=#delete-user]").live("click", function () {
		user.remove();
	});
	
	$("a[href=#SelectedUser]").live("click", function (e) {
		
		if (currUser == null) {
			system.ShowRegisterForm();
			return;
		}
		var _id = $(this).attr('id');
		user.UserProfile(_id);
	});
	
	$("a[href=#LoadMore]").live("click", function (e) {
		user.lastPosts();
	});
	
	//public functions out of objects
	function myAjax(_file, _data, results) {
		
		$.ajax({
			url : serviceURL + '/' + _file,
			type : 'POST',
			dataType : "json",
			data : _data,
			
			success : function (data) {
				
				if ((_data.method == "insert")
					 || (_data.method == "edit")
					 || (_data.method == "LogIn")) {
					
					var obj = $.parseJSON(JSON.stringify(data));
					
					if (!CheckServerError(obj))
						return;
					
					//set session id for user
					var user = obj[0];
					
					sessionId = $.sha1(user.username + user.password);
					localStorage.setItem('sessionId', sessionId);
					localStorage.setItem('profileId', JSON.stringify(user));
					location = "http://joinme.nh.zonebg.com/";
				}
				
				results(data);
			},
			
			error : function (err) {
				//alert(err.result);
			}
			
		});
		
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
		
	}
	
	$(window).scroll(function () {
		
		if ($(window).scrollTop() == $(document).height() - $(window).height()) {
			
			//user.lastPosts();
			
		}
	});
	
});
