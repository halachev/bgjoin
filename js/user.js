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
		location = "http://bgjoin.com/";
		
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
