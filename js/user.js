//user oject
var user = {
	currentUser : function () {
		
		var data = JSON.parse(currUser);
		return data;
	},
	
	GetLastUsers : function () {
		system.Loader(true);
		myAjax("user.php", {
			limit : FIRST_MAX_USERS,
			method : "allUsers"
		}, function (_data) {
			
			var html = user.ShowUsers(_data);
			$('#rightHtml').html(html);
			
			system.Loader(false);
		});
		
	},
	
	GetLastUserEvents : function (_html) {
		system.Loader(true);
		myAjax("event.php", {
			limit : FIRST_MAX_EVENTS,
			method : "events"
		}, function (_data) {
			
			var html = user.ShowUserEvents(_data);
			
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
			
			$('#leftHtml').html('<br/>' + main_box);
			$('#leftHtml').append(html);
			system.Loader(false);
		});
		
	},
	
	profile : function () {
		
		var data = user.currentUser();
		user.UserProfile(data.id, true);
	},
	
	lastUserPosts : function () {
		
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
				
				var html = user.ShowUserEvents(_data);
				
				var html = user.ShowUsers(_data);
				
				$('#rightHtml').html(html);
				
				$('#rightHtml').hide();
				$('#rightHtml').fadeIn(2000);
				
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
	
	UserProfile : function (_id, isCurrentView) {
		
		$.get('ui/profile.html', function (login_data) {
			
			system.content().html(login_data);
			
			myAjax("user.php", {
				id : _id,
				sessionId : sessionId,
				method : "getUserById"
			}, function (_data) {
				
				var html = '';
				
				if (isCurrentView) {
					
					html = '<a href="#delete-user" class="button_view">Изтриване</a>' +
						'<a href="#edit-user" class="button_view">Редакция</a>' +
						'<a href="#add-image" class="button_view">Качи снимка</a>';
				}
				
				for (i in _data) {
					var _user = $.parseJSON(JSON.stringify(_data))[i];
					
					var _descr = "";
					
					if (typeof _user == 'undefined')
						return;
					
					if (_user.descr != null)
						_descr = _user.descr;
					
					if (_user.ThumbName != null)
						html += '<a href="' + _user.ImageName + '" id="image-dialog">&nbsp;&nbsp; <img src="' + _user.ThumbName + '" width="75"/></a>';
					else
						html = '<img src="images/user.png" width="35"/>';
					
				}
				
				html += '<div class="blue_title">' + _user.username + '</div>' +
				'<p>Описансие: <br/>' + _descr + '</p>';
				
				$('#user-profile').html(html);
				
			});
			
		});
	},
	
	LogOut : function () {
		
		localStorage.removeItem('sessionId');
		localStorage.removeItem('profileId');
		location = pageUrl;
		
	},
	
	ShowUsers : function (users) {
		var html = '<div class="right_content">' +
			'<div class="title">Потребители <br/><img src="images/users-icon.png" /></div><br/>';
		
		for (i in users) {
			
			var user = users[i];
			
			if (i == FIRST_MAX_USERS)
				break;
			
			html +=
			'<div class="member_tab">' +
			'<div class="member_details">';
			
			if (user.ImageName != null)
				html += '<a href="#SelectedUser" id=' + user.id + '><img src="' + user.ImageName + '" width="75"/></а>';
			else
				html += '<a href="#SelectedUser" id=' + user.id + '><img src="images/user.png" width="35"/></а>';
			
			html += '<div><a class="blue_title" href="#SelectedUser" id=' + user.id + '>' + user.username + '</a></div>' +
			'<p>' + user.descr + '</p>' +
			'<a href="#SelectedUser" id=' + user.id + ' class="read_more">Повече</a></div>' +
			'</div>';
			
		}
		
		return html;
	},
	
	ShowUserEvents : function (events) {
		
		var html = '<div class="left_content"> ' +
			'<div class="title">Последни предложения <br/><img src="images/event_icon.png" /></div><br/>';
		
		for (i in events) {
			var event = events[i];
			
			if (i == FIRST_MAX_EVENTS)
				break;
			
			html +=
			'<ul class="list">' +
			'<li><a href="#selectedEvent" id=' + event.id + '><p>' + event.name + '</p></a></li>' +
			
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
		
		if (!system.testString(data.username, $('#register-user'),
				'Невалидно потребителско име!'))
			return;
		else if (!system.testPassword(data.password, data.RePassword))
			return;
		else if (!system.testEmail(data.email)) {
			system.error($('#register-email'), 'Невалиден email адрес!');
			return false;
		};
		
		myAjax("user.php", data, function (_data) {
			user.UserStorage(_data, true);
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
			
			var _user = user.currentUser();
			
			data.username.val(_user.username);
			data.email.val(_user.email);
			data.descr.val(_user.descr);
			
			$('#btnEdit').click(function (e) {
				
				var editData = {
					id : _user.id,
					sessionId : sessionId,
					username : data.username.val(),
					email : data.email.val(),
					descr : data.descr.val(),
					method : "edit"
				};
				
				myAjax("user.php", editData, function (_data) {
					user.UserStorage(_data, false);
					$('#modal-form').dialog("close");
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
	
	addEvent : function () {
		
		$.get('ui/add-event.html', function (login_data) {
			$('#modal-form').html(login_data);
			system.ShowDialog($('#modal-form'), 'Ново събитие');
			$('#event-date').datepicker();
			
			var data = {
				sessionId : sessionId,
				method : 'interests'
			}
			$('#error-message').html('<h1>Зарежда ...</h1>');
			myAjax('ints.php', data, function (_data) {
				
				var interestsValues = "";
				for (i in _data) {
					var interest = _data[i];
					interestsValues += '<option value="' + interest.id + '">' + interest.name + '</option>';
				}
				
				$('#event-interest').html(interestsValues);
				$('#error-message').hide('slow');
			})
			
			$('#btn-add-event').click(function () {
				user.event_insert();
			})
			
		});
	},
	
	event_insert : function () {
		
		var data = {
			sessionId : sessionId,
			name : $('#event-name').val(),
			date : $('#event-date').val(),
			descr : $('#event-descr').val(),
			int_id : $('#event-interest').val(),
			user_id : user.currentUser().id,
			method : "insert"
		};
		
		//check validation for user
		$(".error").hide();
		
		if (!system.testString(data.name, $('#event-name'), 'Попълнете полето заглавие!'))
			return;
		else if (!system.testString(data.descr, $('#event-descr'), 'Попълнете полето описание!'))
			return;
		
		myAjax("event.php", data, function (_data) {
			//var data = $.parseJSON(JSON.stringify(_data));
			//var event = data[0];
			$('#my-events-list').append("<h1>Успешно дабавихте вашето събитие!</h1>");
			$('#modal-form').dialog("close");
		});
	},
	
	my_events : function () {
		system.Loader(true);
		$.get('ui/my-events.html', function (login_data) {
			
			system.content().html(login_data);
			
			var data = {
				sessionId : sessionId,
				user_id : system.currentUser().id,
				method : 'MyEvents'
			};
			
			myAjax('event.php', data, function (_data) {
				
				var html = "";
				
				for (i in _data) {
					event = _data[i];
					html += '<a href="#" class="blue_title"><p>' + event.name + '</p></a>';
				}
				
				$('#my-events-list').html(html);
				system.Loader(false);
			})
			
			$('#add-event-id').click(function () {
				user.addEvent();
			})
			
		});
	},
	
	viewEvent : function (_eventId) {
		
		$.get('ui/view-event.html', function (login_data) {
			
			system.content().html(login_data);
			
			var data = {
				sessionId : sessionId,
				id : _eventId,
				method : 'getEventById'
			};
			
			myAjax("event.php", data, function (_data) {
				
				var event = $.parseJSON(JSON.stringify(_data))[0];
				var html =
					
					'<a href="#make-event-request" class="button_view">Заявка</a>' +
					'<p class="blue_title">' + event.name + '</p>' +
					'<p><b>Дата:</b><br/>' + event.date + '</p>' +
					'<p><b>Описание:</b><br/>' + event.descr + '</p>' +
					'<p class="blue_title"">Изберете бутона заявка, ако проявявате интерес към това събитие.</p>';
				
				$('#event-detail').html(html);
				localStorage.setItem('user_id', event.user_id);
			})
			
			$("a[href=#make-event-request]").live("click", function (e) {
				
				var html = '<p>кратко описание:</p><br/>' +
					'<textarea rows="3" cols="30" id="request-descr"></textarea><br/>' +
					'<input type="button" id="request-id" value="Изпрати">';
				
				$('#modal-form').html(html);
				system.ShowDialog($('#modal-form'), 'Изпращане');
				
				$('#request-id').click(function () {
					
					$('#event-detail').append('<h1>Изпратихте заявка към потребителя.<br/>Успех!</h1>');
					
					var user_id = localStorage.getItem('user_id');
					
					var data = {
						sessionId : sessionId,
						sender_user_id : system.currentUser().id,
						user_id : user_id,
						event_id : _eventId,
						descr : $('#request-descr').val(),
						method : 'insert'
					}
					
					myAjax('request.php', data, function (_data) {
						
						var request = $.parseJSON(JSON.stringify(_data))[0];
						localStorage.removeItem('user_id');
						$('#modal-form').dialog("close");
					});
				});
				
			})
			
		});
		
	},
	
	my_requests : function () {
		system.Loader(true);
		$.get('ui/my-requests.html', function (login_data) {
			
			system.content().html(login_data);
			
			var data = {
				sessionId : sessionId,
				user_id : user.currentUser().id,
				method : 'MyRequests'
			}
			myAjax('request.php', data, function (_data) {
				
				var html = "";
				
				for (i in _data) {
					request = _data[i];
					html += '<a href="#" class="blue_title"><p>' + request.descr + '</p></a>';
				}
				
				$('#my-request-list').html(html);
				system.Loader(false);
				
			})
			
		});
		
	},
	
	UserStorage : function (data, canRefresh) {
		
		var _data = $.parseJSON(JSON.stringify(data));
		if (!CheckServerError(_data))
			return;
		
		var user = _data[0];
		sessionId = $.sha1(user.username + user.password);
		localStorage.setItem('sessionId', sessionId);
		localStorage.setItem('profileId', JSON.stringify(user));
		
		if (canRefresh)
			location = pageUrl;
		
	}
	
}
