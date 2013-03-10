//user oject

var user = {
	
	currentUser : function () {
		
		var data = JSON.parse(currUser);
		return data;
	},
	
	InitServerTime : function () {
		myAjax('time.php', "", function (data) {
			localStorage.setItem("serverTime", data.serverTime);
		});
	},
	
	GetLastUsers : function () {
		system.Loader(true);
		
		myAjax("user.php", {
			limit : FIRST_MAX_USERS,
			method : "users"
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
					'<div style="background: #f5f5f5; margin: 20px; float: right; padding: 20;">' +
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
		
		user.UserProfile(user.currentUser().id, true);
	},
	
	UserProfile : function (_id, IsMyProfile) {
		
		$.get('ui/profile.html', function (login_data) {
			
			system.content().html(login_data);
			
			var data = {
				id : _id,
				sessionId : sessionId,
				method : "getUserById"
			}

			
			myAjax("user.php", data, function (_data) {
				
				var html = '';
				
				if (IsMyProfile) {
					
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
						html += '<a href="' + _user.ImageName + '" id="image-dialog">&nbsp;&nbsp; <img src="' + _user.ThumbName + '" width="100"/></a>';
					else
						html += '<img src="images/user.png" width="35"/>';
						
					html += '<div class="blue_title">' + _user.username + '</div>' +
						'<p>Описансие: <br/>' + _descr + '</p>';
				
				}
				
				$('#user-profile').html(html);
				
				//profile events
				$("a[href=#edit-user]").live("click", function () {
					user.edit();
				});
				
				$("a[href=#add-image]").live("click", function () {
					user.addImage(user_image);
				});
				
				$("a[href=#delete-user]").live("click", function () {
					user.remove();
				});
				
			});
			
		});
	},
	
	lastUserPosts : function () {
		
		system.Loader(true);
		
		var lastId = localStorage.getItem('lastId');
		
		if (lastId == null) {
			// for the first time we have to store last id
			myAjax("user.php", {
				limit : FIRST_MAX_USERS,
				method : "users"
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
	
	LogOut : function () {
		
		localStorage.removeItem('sessionId');
		localStorage.removeItem('profileId');
		localStorage.removeItem('eventResponse');		
		location = pageUrl;
		
	},
	
	ShowUsers : function (users) {
		
		var html = '<div class="right_content">' +
			'<div class="title"><img src="images/users-icon.png" />&nbsp;&nbsp;Потребители</div><br/><a href="#LoadMore" class="button_view">Показване на още</a>';
		
		for (i in users) {
			
			var user = users[i];
			
			if (i == FIRST_MAX_USERS)
				break;
			var descr = "";
			if (user.descr != null)
				descr = user.descr;
			
			html +=
			'<div class="member_tab">' +
			'<div class="member_details">';
			
			if (user.ImageName != null)
				html += '<a href="#selected-user" id=' + user.id + '><img class="data-text" src="' + user.ImageName + '" width="100"/></а>';
			else
				html += '<a href="#selected-user" id=' + user.id + '><img class="data-text" src="images/user.png" width="35"/></а>';
			
			html += '<div><a href="#selected-user" id=' + user.id + '>' + '<p class="data-text">' + user.username + '</p></a></div>' +
			'<p style="padding: 15px;">' + descr + '</p>' +
			'<a href="#selected-user" id=' + user.id + ' class="read_more">Повече</a></div>' +
			'</div>';
			
		}
		
		return html;
	},
	
	ShowUserEvents : function (events) {
		
		var html = '<div class="left_content"> ' +
			'<div class="title"><img src="images/event_icon.png" />&nbsp;&nbsp;Последни предложения &nbsp;&nbsp;' +
			'</div><br/>';
		
		for (i in events) {
			var event = events[i];
			
			if (i == FIRST_MAX_EVENTS)
				break;
			
			var image = '';
			
			if (event.ThumbName != null)
				image = '<img class="data-text" src="' + event.ThumbName + '" width="100"/>';
			
			html +=
			
			'<a href="#selectedEvent" id=' + event.id + '>' +
			'<p class="data-text">' + event.name + '</p>' + image + '</a>' +
			'<p style="padding: 15px;">' + event.date + '</p><br/>';
			
		}
		
		$("a[href=#selectedEvent]").live("click", function () {
			if (currUser == null) {
				system.ShowRegisterForm();
				return;
			}
			var _id = $(this).attr('id');
			user.viewEvent(_id);
		});
		
		return html;
		
	},
	
	registerUser : function () {
		$('#btnRegister').attr("disabled", "disabled");
		$('#error-message').html("<p>Регистрация, моля изчакайте ...</p>");
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
			$('#error-message').html("");
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
	
	addImage : function (_uploatType) {
		var x = screen.width / 2 - 700 / 2;
		var y = screen.height / 2 - 450 / 2;
		
		var uploadDir = "";
		
		if (_uploatType == user_image)
			uploadDir = 'file-uploader/';
		else if (_uploatType == event_image)
			uploadDir = 'event-uploader/';
		
		window.open(uploadDir + 'index.php', "Качване на снимка", '"location=1,status=1,scrollbars=1, height=485,width=700,left=' + x + ',top=' + y);
		
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
			$('#event-date').datetimepicker();
			
			var data = {
				sessionId : sessionId,
				method : 'interests'
			}
			$('#error-message').html('<h1>Зарежда ...</h1>');
			myAjax('ints.php', data, function (_data) {
				
				var interestsValues = "";
				for (i in _data) {
					var interest = _data[i];
					interestsValues += '<option value="' + interest.id + '">' + interest.int_name + '</option>';
				}
				
				$('#event-interest').html(interestsValues);
				$('#error-message').hide('slow');
			})
			
			$('#add-event-image').click(function () {
				user.addImage(event_image);
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
				
		if (data.name.length > 50)
		{		    
			system.error($('#event-name'), '<p>Максимална дължина на заглавие 50 знака!</p>');			
			return false;
		}
		
		
		if (data.descr.length > 250)
		{		    
			system.error($('#event-descr'), '<p>Максимална дължина на описание 250 знака!</p>');			
			return false;
		}
		
		//check validation for user
		$(".error").hide();
		
		if (!system.testString(data.name, $('#event-name'), 'Попълнете полето заглавие!'))
			return;
		else if (!system.testString(data.descr, $('#event-descr'), 'Попълнете полето описание!'))
			return;
		
		myAjax("event.php", data, function (_data) {
			var data = $.parseJSON(JSON.stringify(_data));
			var event = data[0];
			
			$('#my-events-list').append("<h1>Успешно дабавихте вашето събитие!</h1>");
			$('#modal-form').dialog("close");
			
			//update image objectid and type by event
			//read eventResponse from localStorage
			var eventResponse = localStorage.getItem('eventResponse');
			user.updateImage(eventResponse, event.id, event_image);
			//
			
		});
	},
	
	my_events : function () {
		
		system.Loader(true);
		$.get('ui/my-events.html', function (login_data) {
			
			system.content().html(login_data);
			
			user.InitServerTime();
			serverDateTime = localStorage.getItem("serverTime");
			
			var data = {
				sessionId : sessionId,
				user_id : system.currentUser().id,
				method : 'MyEvents'
			};
			
			myAjax('event.php', data, function (_data) {
				
				var html = "";
				
				for (i in _data) {
					event = _data[i];
					
					var style = "";
					if (event.date >= serverDateTime)
						style = "class = data-text";
					else
						style = "class = data-text-line-through";						
					
					html += '<a href="#my_event-view" id="' + event.id + '"><p ' + style + '>' + event.name + ' - '+ event.date + '</p></a>';
					
				}
				
				$('#my-events-list').html(html);
				system.Loader(false);
			})
			
			$('#add-event-id').click(function () {
				user.addEvent();
			})
			
			$("a[href=#my_event-view]").live('click', function () {
				
				var _id = $(this).attr('id');
				user.viewEvent(_id);
			})
			
		});
	},
	
	viewEvent : function (_eventId) {
		
		//view mode
		$.get('ui/view-event.html', function (login_data) {
			
			system.content().html(login_data);
			
			var data = {
				sessionId : sessionId,
				id : _eventId,
				method : 'getEventById'
			};
			
			var image = "";
			myAjax("event.php", data, function (_data) {
				
				var event = $.parseJSON(JSON.stringify(_data))[0];
				
				if (event.ThumbName != null)
					image += '<a href="' + event.ImageName + '" id="image-dialog">&nbsp;&nbsp; <img src="' + event.ThumbName + '" width="100"/></a>';
				
				var _descr = ""
					if (event.descr != null)
						_descr = event.descr;
					
					var html = '';
				
				if (event.user_id != user.currentUser().id)
					html += '<a href="#make-event-request" class="button_view">Заявка</a>';
				else {
					html += '<a href="#remove-event-request" class="button_view">Изтриване</a>';
					html += '<a href="#edit-event-request" class="button_view">Редакция</a>';
					
				}
				
				html += image +
				'<p class="blue_title">' + event.name + '</p>' +
				'<p><b>Дата:</b><br/>' + event.date + '</p>' +
				'<p><b>Интереси:</b><br/>' + event.int_name + '</p>' +
				'<p><b>Описание:</b><br/>' + _descr + '</p>' +
				'<p class="blue_title"">Изберете бутона заявка, ако проявявате интерес към това събитие.</p>';
				
				$('#event-detail').html(html);
				localStorage.setItem('user_id', event.user_id);
			})
			
			//edit mode
			$("a[href=#edit-event-request]").live("click", function (e) {
				
				$.get('ui/edit-event.html', function (login_data) {
					$('#modal-form').html(login_data);
					$('#event-date').datetimepicker();
					
					var data = {
						sessionId : sessionId,
						id : _eventId,
						method : 'getEventById'
					};
					
					myAjax("event.php", data, function (_data) {
						var event = $.parseJSON(JSON.stringify(_data))[0];
						
						$('#event-name').val(event.name);
						$('#event-date').val(event.date);
						$('#event-descr').val(event.descr);
					});
					
					$('#btn-edit-event').click(function () {
						
						$('#event-detail').append('<h1>Изпратихте заявка към потребителя.<br/>Успех!</h1>');
						
						var user_id = localStorage.getItem('user_id');
						
						var data = {
							sessionId : sessionId,
							id : _eventId,
							name : $('#event-name').val(),
							date : $('#event-date').val(),
							descr : $('#event-descr').val(),
							method : 'edit'
						};
						
						myAjax('event.php', data, function (_data) {
							
							if (!CheckServerError(_data))
								return;
							$('#modal-form').dialog("close");
							user.viewEvent(_eventId);
						});
					});
					
				});
				
				system.ShowDialog($('#modal-form'), 'Редакция');
				
			});
			
			$("a[href=#remove-event-request]").live("click", function (e) {
				
				var c = confirm('Изтриване на събитие?');
				
				if (!c)
					return;
				
				var data = {
					sessionId : sessionId,
					id : _eventId,
					method : 'delete'
				};
				
				myAjax("event.php", data, function (_data) {
					$('#event-detail').html('<p class="title">Събитието беше успешно изтрито!</p>').show('slow');
				});
				
			});
			
			//request mode
			$("a[href=#make-event-request]").live("click", function (e) {
				
				var html = '<p>кратко описание:</p><br/>' +
					'<textarea rows="3" cols="30" id="request-descr"></textarea><br/>' +
					'<input type="button" id="request-id" value="Изпрати">' +
					'<div id="error-message"></div>';
				
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
						if (!CheckServerError(_data))
							return;
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
					html += '<a href="#" class="blue_title"><p class="data-text">' + request.descr + '</p></a>';
				}
				
				$('#my-request-list').html(html);
				system.Loader(false);
				
			})
			
		});
		
	},
	
	updateImage : function (response, objectid, _type) {
		
		for (i in response) {
			
			var image = JSON.parse(response)[i];
			
			data = {
				id : image.id,
				objectid : objectid,
				type : _type,
				method : 'edit'
			};
			
			myAjax('images.php', data, function (_data) {
				//image was added!!!
				localStorage.removeItem('eventResponse');	
			});
		};
		
	},
	
	storeEventResponse : function (response) {
		
		localStorage.setItem('eventResponse', response);
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
