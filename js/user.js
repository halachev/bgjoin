//user object
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
			system.content().html(html);
			system.content().append('<a href="#LoadMore" class="button_view">Показване на още</a>');
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
			
			system.content().html(html);
			system.Loader(false);
		});
		
	},
	
	profile : function (e) {
		
		user.UserProfile(user.currentUser().id, true);
	},
	
	UserProfile : function (_id, IsMyProfile) {
		system.Loader(true);
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
					
					html =
						'<a href="#change-password" class="button_view">Смяна на парола</a>' +
						'<a href="#delete-user" class="button_view">Изтриване</a>' +
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
					
					var imgSize = "160";
					if (IsMyProfile)
						imgSize = "75";
					
					if (_user.ThumbName != null)
						html += '<a href="' + _user.ImageName + '" id="image-dialog"><img src="' + _user.ThumbName + '" width=' + imgSize + '/></a>';
					else
						html += '<img src="images/empty-image.png" width="' + imgSize + '"/>';
					
				}
				
				html += '<h6>' + _user.username + '</h6>' +
				'<p class="p0" >Описансие: <br/>' + _descr + '</p>' +
				'<a class="link" href="#">Събития на ' + _user.username + '</a>';
				
				system.Loader(false);
				
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
				
				$("a[href=#change-password]").live("click", function () {
					user.NewPassword();
				});
				
			});
			
		});
	},
	
	NewPassword : function () {
		$.get('ui/new-password.html', function (login_data) {
			
			$('#modal-form').html(login_data);
			
			$("#btnNewPassword").live("click", function () {
				
				var password = $('#new-password').val();
				var re_password = $('#new-re-password').val();
				
				var data = {
					id : user.currentUser().id,
					sessionId : sessionId,
					password : password,
					method : 'SetNewPassword'
				};
				
				if (password.length < 3) {
					$('#error-message').html('<p>Максимална дължина на парола 6 знака</p>');
					return;
				}
				
				if (password != re_password) {
					$('#error-message').html('<p>Паролите не съвпадат!</p>');
					return;
				}
				
				$('#error-message').html('<p>Смяна на парола!</p>');
				
				myAjax("user.php", data, function (_data) {
					
					$('#modal-form').dialog("close");
					
				});
				
			});
			
		});
		
		system.ShowDialog($('#modal-form'), 'Смяна на парола!');
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
				
				var html = user.ShowUsers(_data);
				
				system.content().html(html);
				system.content().hide();
				system.content().fadeIn(1000);
				system.content().append('<a href="#LoadMore" class="button_view">Показване на още</a>');
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
		
		var html = "<h3>Потребители</h3>";
		
		for (i in users) {
			
			var user = users[i];
			
			if (i == FIRST_MAX_USERS)
				break;
			var descr = "";
			if (user.descr != null)
				descr = user.descr;
			
			var image = '';
			
			if (user.ThumbName != null)
				image = '<a href="#selected-user" id=' + user.id + ' ><img class="border" src="' + user.ThumbName + '" alt="" width="160"></a>';
			else
				image = '<a href="#selected-user" id=' + user.id + ' ><img class="border" src="images/empty-image.png" alt="" width="160" height="160"></a>';
			
			html += '<article class="col-2">' +
			'<h6>' + user.username + '</h6>' +
			'<figure class="p2"><a href="#selected-user"></a>' + image + '</figure>' +
			
			'</article>';
			
		}
		
		return html;
	},
	
	ShowUserEvents : function (events) {
		
		var html = "<h3>Последни събития</h3>";
		
		for (i in events) {
			var event = events[i];
			
			if (i == FIRST_MAX_EVENTS)
				break;
			
			var image = '';
			
			if ((event.ThumbName != null) && (event.type == 2))
				image = '<a href="#selectedEvent" id=' + event.id + ' ><img class="border" id=' + event.id + ' src="' + event.ThumbName + '" alt="" width="160"></a>';
			else
				image = '<a href="#selectedEvent" id=' + event.id + ' ><img class="border" src="images/empty-image.png" alt="" width="160" height="160"></a>';
			
			if (event.name.length > 20)
				subStr = event.name.substr(0, 18) + '...';
			else
				subStr = event.name;
			
			html += '<article class="col-2">' +
			'<h6>' + '<a href="#selected-user" id=' + event.user_id + '>' + event.username + '</a><br/>' + subStr + '</h6>' +
			'<p class="p0">' + event.date + '</p>' +
			'<a class="link" href="#selectedEvent" id=' + event.id + '>Детайли</a>' +
			'<figure class="p2"><a href="#selectedEvent" id=' + event.id + '></a>' + image + '</figure>' +
			'</article>';
			
		}
		
		return html;
		
	},
	
	registerUser : function () {
		//$('#btnRegister').attr("disabled", "disabled");
		
		var body = '<html><body> ' +
			'<p>Добре дошли в bgjoin.com</p>' +
			'<h2>Данни за вашият акаунт!</h2>' +
			'<p>Потребител:' + $('#register-user').val() + '</p>' +
			'<p>Парола:' + $('#register-re-password').val() + '</p>' +
			'<p>Благодарим! От екипа на <a href="http://bgjoin.com/">bgjoin</a></p>' +
			'</body></html>';
		
		var data = {
			username : $('#register-user').val(),
			password : $('#register-password').val(),
			RePassword : $('#register-re-password').val(),
			email : $('#register-email').val(),
			emailSubject : 'Регистрация в bgjoin',
			emailBody : body,
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
		$('#error-message').html("<p>Регистрация, моля изчакайте ...</p>");
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
	
	remove : function (e) {
		var c = confirm("Сигурен ли сте, че искате да изтриете профила?");
		
		if (!c) {
			e.stopImmediatePropagation();
			return;
		}
		
		e.stopImmediatePropagation();
	},
	
	addEvent : function () {
		
		$.get('ui/add-event.html', function (login_data) {
			$('#modal-form').html(login_data);
			system.ShowDialog($('#modal-form'), 'Ново събитие');
			$('#event-date').datetimepicker();
			
			user.loadInts();
			
			$('#add-event-image').click(function () {
				user.addImage(event_image);
			})
			
			$('#btn-add-event').click(function () {
				user.event_insert();
			})
			
		});
	},
	
	loadInts : function (_id) {
		
		var data = {
			sessionId : sessionId,
			method : 'interests'
		}
		$('#error-message').html('<img src="images/ajax-loader.gif" />');
		myAjax('ints.php', data, function (_data) {
			
			var values = '<option value="0">Избрете категория</option>';
			
			for (i in _data) {
				var interest = _data[i];
				
				var selected = "";
				if (interest.id == _id)
					selected = 'selected';				
				
				values += '<option value="' + interest.id + '" '+ selected +'>' + interest.int_name + '</option>';
				
			}
			
			$('#event-interest').html(values);
			$('#error-message').hide('slow');
		})
		
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
		
		if (data.name.length > 50) {
			system.error($('#event-name'), '<p>Максимална дължина на заглавие 50 знака!</p>');
			return false;
		}
		
		if (data.descr.length > 250) {
			system.error($('#event-descr'), '<p>Максимална дължина на описание 250 знака!</p>');
			return false;
		}
		
		if (data.date.length <= 0) {
			
			system.error($('#event-date'), '<p>Моля, изберете дата!</p>');
			return false;
		}
		
		//check validation for user
		$(".error").hide();
		
		if (!system.testString(data.name, $('#event-name'), 'Попълнете полето заглавие!'))
			return;
		else if (!system.testString(data.descr, $('#event-descr'), 'Попълнете полето описание!'))
			return;
		
		if ($('#event-interest').val() <= 0) {
			system.error($('#event-interest'), '<p>Моля, изберете категория към събитието!</p>');
			return;
		}
		
		myAjax("event.php", data, function (_data) {
			
			var data = $.parseJSON(JSON.stringify(_data));
			var event = data[0];
			
			$('#my-events-list').html('<h1 class="data-text">Успешно дабавихте вашето събитие!</h1>');
			user.my_events();
			$('#modal-form').dialog("close");
			
			//update image objectid and type by event
			//read eventResponse from localStorage
			var eventResponse = localStorage.getItem('eventResponse');
			if (eventResponse != null)
				user.updateImage(eventResponse, event.id, event_image);
			//
			
			
		});
	},
	
	my_events : function (e) {
		
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
				
				var eventsData = [];
				for (i in _data) {
					
					var event = _data[i];
					
					var style = "";
					if (event.date >= serverDateTime)
						style = "class = data-text";
					else
						style = "class = data-text-line-through";
					
					var title = '<a href="#my_event-view" id="' + event.id + '"><p ' + style + '>' + event.name + '</p></a>';
					var actions =
						'<a class="data-text" href="#edit-event-request" id="' + event.id + '"><img src="images/edit.png"> Редакция</a>' +
						'<a class="data-text" href="#remove-event-request" id="' + event.id + '"><img src="images/del.png"> Изтриване</a>';
										
					eventsData.push({
						name : title,
						date : event.date,
						descr : event.descr.substr(0, 50) + '...',
						created : event.username,
						actions : actions
					});
				}
				
				$("a[href=#edit-event-request]").live("click", function (e) {
					
					var _id = $(this).attr('id');
					user.editEvent(_id);
					
				});
				
				$("a[href=#remove-event-request]").live("click", function (e) {
					
					var c = confirm('Изтриване на събитие?');
					
					if (c) {
						var _id = $(this).attr('id');
						user.delEvent(_id);						
					}
					
				});
				
				user.kendoGrid(system.content(), eventsData);
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
	
	editEvent : function (_eventId) {
		//edit mode
		
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
				
				user.loadInts(event.int_id);
				
			});
			
			$('#btn-edit-event').click(function () {
				
				$('#event-detail').append('<h1>Успешна редакция!</h1>');
				
				var user_id = localStorage.getItem('user_id');
				
				var data = {
					sessionId : sessionId,
					id : _eventId,
					name : $('#event-name').val(),
					date : $('#event-date').val(),
					descr : $('#event-descr').val(),
					int_id : $('#event-interest').val(),
					method : 'edit'
				};
				
				myAjax('event.php', data, function (_data) {
					
					if (!CheckServerError(_data))
						return;
					$('#modal-form').dialog("close");
					user.my_events(_eventId);
				});
			});
			
		});
		
		system.ShowDialog($('#modal-form'), 'Редакция');
		
	},
	
	delEvent : function (_eventId) {
		
		var data = {
			sessionId : sessionId,
			id : _eventId,
			method : 'delete'
		};
		
		myAjax("event.php", data, function (_data) {
			$('#event-detail').html('<p class="title">Събитието беше успешно изтрито!</p>').show('slow');
			user.my_events();
		});
		
	},
	
	viewEvent : function (_eventId) {
		
		//view mode
		system.Loader(true);
		$.get('ui/view-event.php', function (login_data) {
			
			system.content().html(login_data);
			
			var data = {
				sessionId : sessionId,
				id : _eventId,
				method : 'getEventById'
			};
			
			var image = "";
			myAjax("event.php", data, function (_data) {
				
				var event = $.parseJSON(JSON.stringify(_data))[0];
				
				if ((event.ThumbName != null) && (event.type == 2))
					image += '<a href="' + event.ImageName + '" id="image-dialog"><img src="' + event.ThumbName + '" width="160"/></a><br/><br/>';
				else
					image += '<a href="images/empty-image.png" id="image-dialog"><img src="images/empty-image.png" width="160"/></a><br/><br/>';
				var _descr = ""
					if (event.descr != null)
						_descr = event.descr;
					
					var html = '';
				
				if (event.user_id != user.currentUser().id)
					html += '<a href="#make-event-request" class="button_view">Заявка</a>';
				else {
					html += '<a href="#remove-event-request" id="' + _eventId + '" class="button_view">Изтриване</a>';
					html += '<a href="#edit-event-request" id="' + _eventId + '" class="button_view">Редакция</a>';
					
				}
				
				html +=
				'<p class="text-1">' + event.name + '</p>' + image +
				'<p class="p0"><b>Дата на събитие:</b><br/>' + event.date + '</p>' +
				'<p class="p0"><b>Категория:</b><br/>' + event.int_name + '</p>' +
				'<p class="p0"><b>Описание:</b><p class="text-1">' + _descr + '</p></p>' +
				'<p class="p0"><b>Добавено от :</b><br/>' + event.username + '</p>' +
				
				'<p class="blue_title"">Изберете бутона заявка, ако проявявате интерес към това събитие.</p>';
				
				$('#event-detail').html(html);
				system.Loader(false);
				localStorage.setItem('user_id', event.user_id);
				window.history.pushState("!", "", '#!' + _eventId + '');
				
				//edit mode
				$("a[href=#edit-event-request]").live("click", function (e) {
					user.editEvent(_eventId);
					
				});
				
				//del mode
				$("a[href=#remove-event-request]").live("click", function (e) {
					
					var c = confirm('Изтриване на събитие?');
					
					if (c) {
						var _id = $(this).attr('id');
						user.delEvent(_id);
					} else
						e.preventDefault();
					
				});
				
				//request mode
				$("a[href=#make-event-request]").live("click", function (e) {
					user.MakeRequest(_eventId);
				});
				
			})
			
		});
		
	},
	
	MakeRequest : function (_eventId) {
		
		var html = '<p>кратко съобщение:</p><br/>' +
			'<textarea rows="3" cols="30" id="request-descr"></textarea><br/>' +
			'<input type="button" id="request-id" value="Изпрати">' +
			'<div id="error-message"></div>';
		
		$('#modal-form').html(html);
		system.ShowDialog($('#modal-form'), 'Изпращане');
		
		$('#request-id').click(function (e) {
			
			var user_id = localStorage.getItem('user_id');
			
			user.InitServerTime();
			serverDateTime = localStorage.getItem("serverTime");
			
			var data = {
				sessionId : sessionId,
				sender_user_id : system.currentUser().id,
				user_id : user_id,
				event_id : _eventId,
				date : serverDateTime,
				descr : $('#request-descr').val(),
				method : 'insert'
			}
			
			myAjax('request.php', data, function (_data) {
				if (!CheckServerError(_data))
					return;
				var request = $.parseJSON(JSON.stringify(_data))[0];
				localStorage.removeItem('user_id');
				$('#modal-form').dialog("close");
				$('#event-detail').append('<h1>Изпратихте заявка към потребителя.Успех!</h1>');
				
			});
		});
		
	},
	
	my_requests_count : function () {
		var data = {
			sessionId : sessionId,
			user_id : user.currentUser().id,
			method : 'MyRequests'
		}
		
		myAjax('request.php', data, function (_data) {
			var count = _data.length;
			if (count > 0)
				$('#my-requests-id').html('Заявки (' + count + ')');
		});
	},
	
	my_requests : function (e) {
		
		$.get('ui/my-requests.html', function (login_data) {
			
			system.content().html(login_data);
			
			var data = {
				sessionId : sessionId,
				user_id : user.currentUser().id,
				method : 'MyRequests'
			}
			
			system.Loader(true);
			myAjax('request.php', data, function (_data) {
				
				var requestsData = [];
				
				for (i in _data) {
					request = _data[i];
					
					var title = '<a  class="data-text" href="#selectedEvent" id="' + request.event_id + '"><span>' + request.eventName + '</span></a>';
					var created = '<a class="data-text" href="#selected-user" id="' + request.sender_user_id + '"><span>' + request.created + '</span><br/><img src="' + request.ThumbName + '" width="75"></a>';
					var date = '<span class="data-text">' + request.date + '</span>';
					var descr = '<span class="data-text">' + request.descr + '</span>';
					var actions =
						'<a class="data-text" href="#apply-request" id="' + request.id + '"><img src="images/ok.png">Приеми</a>' +
						'<a class="data-text" href="#remove-request" id="' + request.id + '"><img src="images/del.png">Изтрий</a>';
					
					requestsData.push({
						name : title,
						date : date,
						descr : descr,
						created : created,
						actions : actions
					})
				}
				
				$("a[href=#apply-request]").live("click", function (e) {
					
					var _id = $(this).attr('id');
					user.ApplyRequest(_data, _id);
					e.preventDefault();
					
				});
				
				$("a[href=#remove-request]").live("click", function (e) {
					var c = confirm('Отказване на заявка?');
					
					if (c) {
						var _id = $(this).attr('id');
						user.DelRequest(_id);
					}
					e.preventDefault();
				});
				
				system.Loader(false);
				user.kendoGrid(system.content(), requestsData);
				
			})
			
		});
		
	},
	ApplyRequest : function (_data, _id) {
		
		system.content().html('<p class="text-1">Моля, изчакайте ...</p>');
		system.Loader(true);
		var reqData = null;
		
		for (i in _data) {
			var request = _data[i];
			
			if (request.id == _id) {
				reqData = request;
				break;
			}
		}
		
		var body = '<html><body> ' +
			'<p>Здравейте, ' + reqData.created + '</p>' +
			'<p>Потребител: ' + user.currentUser().username + ' желае да присъствате на събитието. ' + reqData.eventName + '</p>' +
			'</p>Може да се свържете на: ' + user.currentUser().email + '</p>' +
			'<p>Благодарим! oт екипа на <a href="http://bgjoin.com/">bgjoin</a></p>' +
			'</body></html>';
		
		var data = {
			email : reqData.createdEmail,
			emailSubject : 'Приета заявка от ' + user.currentUser().username + '',
			emailBody : body,
			method : 'sendMail'
		};
		
		myAjax("user.php", data, function (_data) {
			
			system.Loader(false);
			
			if (_data.error_message == "EMAIL_RESPONSE") {
				alert('Потребителя, ще бъде уведомен по емайл!');
				user.DelRequest(_id);
			}
			
		});
		
	},
	
	DelRequest : function (_id) {
		var data = {
			sessionId : sessionId,
			id : _id,
			method : 'delete'
		};
		
		myAjax("request.php", data, function (_data) {
			user.my_requests();
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
		
	},
	
	deleteTempImage : function (eventResponse) {
		var response = JSON.parse(eventResponse)[0];
		
		var data = {
			id : response.id,
			method : 'delete'
		};
		
		myAjax('images.php', data, function (_data) {
			console.log(_data)
		});
	},
	
	kendoGrid : function (_container, documentsData) {
		
		_container.kendoGrid({
			
			dataSource : {
				data : documentsData,
				pageSize : 10
			},
			
			sortable : {
				mode : "single",
				allowUnsort : false
			},
			
			selectable : "multiple",
			pageable : true,
			scrollable : false,
			
			columns : [{
					field : "name",
					title : "Събитие",
					template : "<div>#=name#</div>"
				}, {
					field : "date",
					title : "Дата",
					template : "<div>#=date#</div>"
				}, {
					field : "descr",
					title : "Описание",
					template : "<div>#=descr#</div>"
				}, {
					field : "created",
					title : "Потребител",
					template : "<div>#=created#</div>"
				}, {
					field : "actions",
					title : "Действие",
					template : "<div>#=actions#</div>"
				}
			]
		});
	}
	
}
