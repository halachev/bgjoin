/*
url - http://newlove.nh.zonebg.com
writen by Nurietin Mehmedov © 2013
All right reserver ...
 */

$(document).ready(function () {
	//base url
	serviceURL = 'http://joinme.nh.zonebg.com/services';
	
	//global session
	var sessionId = localStorage.getItem('sessionId');
	var currUser = localStorage.getItem('profileId');
	
	FIRST_MAX_USERS = 5; 
	FIRST_MAX_EVENTS = 10;
	
	var ERROR_INSERT_EXIST_NAME = 1;
	var ERROR_INSERT_REQUARED = 2;
	var ERROR_LOGIN = 3;
	
	//user oject
	var user = {
		
		GetLastUsers : function () {
			myAjax("user.php", {
				limit: FIRST_MAX_USERS,
				method : "allUsers"
			}, function (_data) {
				var html = user.ShowUsers(_data);
				$('#rightHtml').html(html);
				
				user.LoadImages();
			
			});
			
		},
		
		GetLastUserNotes : function (_html) {
			myAjax("user.php", {
				limit: FIRST_MAX_EVENTS,
				method : "allUsers"}, function (_data) {
				
				var html = user.ShowUserNotes(_data);
								
				var main_box = "";
			
				if (currUser == null)
					main_box = 
					'<div class="main_box">' +
					'<div class="title">Най-лесният начин да се забавляваш!</div>' +
					'<div class="left_banner_content">' +
					'<p>'+ 
						'Присъедини се към това което търсиш.<br/>' +
						'Социална мрежа за хора с общи интереси!' +
						'Край на скуката!<br/>' +
						'Бъди различен последвай ме ...</p>' +
					'</p>' +					
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
				'<span id="UserImageContainer-' + data.id + '"></span>' +
				'<div class="main_box">' +
				'<div class="title">' + data.username + '</div>' +
				'<div class="left_banner_content">' +
				'<p>Email: ' + data.email + '</p>' +
				'<p>Описансие: <br/>' + descr + '</p>' +
				
				'<a href="#edit-user">Редакция</a> |' +
				'<a href="#add-image">Качи снимка</a> |' +
				'<a href="#delete-user">Изтриване</a>' +	
				
				'</div>';
				$('#user-profile').html(html);
				
				user.LoadImages(true);
				
			});
			
		},
		LoadImages: function(_model)
		{
			
			  // var data = JSON.parse(currUser);
				
				var userImage = {
					//userId: data.id, 
					method: 'LoadImages'
				}
				
				//get user images ...
				myAjax('userImages.php', userImage, function (_userImages){
					
					var newhtml = '';
					for (i in _userImages)
					{
						var image = _userImages[i];
						
						if (_model)
						{
							newhtml = '<a href="'+ image.ImageName +'"  target="_blank"><img src="'+ image.ImageName +'" width="75" /></a>';
						
							$('#UserImageContainer-' + image.UserID +'').append('<span class="main_box">' + newhtml + '</span>');
						}
						else
						{
						    newhtml = '<a href="#SelectedUser" id=' + user.id + '><img src="'+ image.ImageName +'" width="75" /></a>';						
							$('#UserImageContainer-' + image.UserID +'').html(newhtml);
						}
					}
					
				});
		
		},
		
		UserProfile: function (_id)
		{
				
			$.get('ui/profile.html', function (login_data) {
				
				system.content().html(login_data);	
				
				myAjax("user.php", 
				{id: _id, sessionId: sessionId, method: "getUserById" }, function (_data){
					
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
			location = "http://newlove.nh.zonebg.com/";
			
		},
		
		ShowUsers : function (users) {
			
			var html = '<div class="right_content">' +
				'<div class="blue_title">Последни потребители</div>';
			
			for (i in users) {
			
				var user = users[i];				
				
				if (i == FIRST_MAX_USERS) break;
								
				html +=
					'<div class="member_tab">' +
					'<a href="#SelectedUser" id=' + user.id + '>' +
					'<div id="UserImageContainer-' + user.id + '"></div>' +
					'<div class="member_details">' +
					'<span><a href="#SelectedUser" id=' + user.id + '>' + user.username + '</a></span><br />' +
					'<p>' + user.email + '</p>' +
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
				
				if (i == FIRST_MAX_EVENTS) break;
				
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
		
		edit: function ()
		{
			
			$.get('ui/edit.html', function (login_data) {
				$('#modal-form').html(login_data);
				
				var data = 
				{
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
						id: user.id,
						sessionId: sessionId,
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
		
		addImage: function ()
		{							
			var x = screen.width/2 - 700/2;
			var y = screen.height/2 - 450/2;
			window.open('file-uploader/index.php', "Качване на снимка",'"location=1,status=1,scrollbars=1, height=485,width=700,left='+x+',top='+y);
					
		},
		
		remove: function ()
		{
		   var c = confirm("Сигурен ли сте, че искате да изтриете профила?");
		   
		   if (c)
		   {
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
				
				'<a href="#" class="view_all">Всички</a>' +
				'<div class="clear"></div>' +
				
				'</div>';
			
			user.GetLastUserNotes(); // assigned to leftHtml
			user.GetLastUsers(); // assigned to rightHtml
			
			this.content().html(html);
			
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
				'<div class="form_row">' +
				'<label class="small">Търся:</label>' +
				'<input type="text" class="small_input" />' +
				'</div>' +
				'<div class="form_row">' +
				'<label class="large">Пол:</label>' +
				'<input type="text" class="large_input"  />' +
				'<input type="checkbox" class="checkbox" />' +
				'<label class="small">+ photo</label>' +
				'</div>' +
				'<div class="form_row">' +
				'<input type="image" src="images/search.gif" class="search_bt" />' +
				'</div>' +
				'</div>' +
				'</div>';
			
			$('#search-id').html(shtml);
			
		},
		
		testUserName : function (_name) {
					
			if ((_name.length <= 2) || (_name == ""))
			{
				system.error($('#register-user'), 'Невалидно потребителско име!');
				return false;
			}
			else
				return true;
			
		},
		
		testPassword : function (_first, _second) {
			
			if (_first == '')
			{
				system.error($('#register-password'), 'Въведете парола');
				return false;
			}
			
			else if (_second == '')
			{
				system.error($('#register-re-password'), 'Повторете паролата отново');
				return false;
			}
			
			else if (_first != _second)
			{
				system.error($('#error-message'), 'Паролите не съвпадат!');
				return false;
			}
			else
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
		
		if (currUser == null)
		{
			system.ShowRegisterForm();
			return;
		}
		var _id = $(this).attr('id'); 		
		user.UserProfile(_id);
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
									
					if (!CheckServerError(obj)) return;
					
					//set session id for user
					var user = obj[0];
					
					sessionId = $.sha1(user.username + user.password);
					localStorage.setItem('sessionId', sessionId);
					localStorage.setItem('profileId', JSON.stringify(user));
					location = "http://newlove.nh.zonebg.com/";
				}
				
				
				results(data);
			},
			
			error : function (err) {
				alert(err.result);
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
			}
			else
			  return true;
			
		}
		
	}
	
});
