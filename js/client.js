﻿/*
url - http://bgjoin.com
writen by Nurietin Mehmedov © 2013
All right reserver ...
 */

//base url
serviceURL = '/services';
//pageUrl = 'http://bgjoin.nh.zonebg.com';
pageUrl = 'http://bgjoin.com';

//global session
var sessionId = localStorage.getItem('sessionId');
var currUser = localStorage.getItem('profileId');

localStorage.removeItem('User-Last-ID');
localStorage.removeItem('Event-Last-ID');


FIRST_MAX_USERS = 10;
FIRST_MAX_EVENTS = 20;

var ERROR_INSERT_EXIST_NAME = 1;
var ERROR_INSERT_REQUARED = 2;
var ERROR_LOGIN = 3;

//variants of uploaded images
var user_image = 1;
var event_image = 2;

$(document).ready(function () {
	
	//start application
	system.init();

	//handle main user events
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
	
	$('#my-requests-id').click(function (e) {
		user.my_requests();		
	});
	
	$('#my-events-id').click(function (e) {		
		user.my_events();
	});
	
	$('#profile-id').click(function (e) {
		user.profile();		
	});
	
	$("#user-id").click(function (e) {
		user.GetLastUsers();		
	})
	
	$('#exit-id').click(function (e) {
		user.LogOut();
	});
	
	$('#contact-id').click(function (e) {
		
		system.contacts();		
	});
	
	$('#service-id').click(function (e) {
		
		system.services();		
	});
	
	$('#about-id').click(function (e) {
		
		system.about();		
	});
	
	$('#terms-id').click(function (e) {
		system.terms();		
	});
	
	$("a[href=#LoadMore-events]").live("click", function (e) {
		user.lastUserEvents();
	});
	
	$("a[href=#LoadMore-users]").live("click", function (e) {
		user.lastUserPosts();
	});
	
	$('#image-dialog').live('click', function (event) {
		
		event.preventDefault();
		url = $(this).attr('href');
		var html = '<img src=' + url + ' />';
		$('#modal-form').html(html);
		system.ShowImageDialog($('#modal-form'), 'Снимка');
		
	});
	
	$("a[href=#selected-user]").live("click", function (e) {
		
		if (currUser == null) {
			system.ShowRegisterForm();
			return;
		}
		
		var _id = $(this).attr('id');
		user.UserProfile(_id, false);
		
		
	});
	
	$("a[href=#selectedEvent]").live("click", function (e) {
		
		if (currUser == null) {
			system.ShowRegisterForm();
			return;
		}
		var _id = $(this).attr('id');
		user.viewEvent(_id);
		
	});
	
	$("a[href=#facebook-login]").live("click", function () {
		
		system.registerByFaceBook();		
		
	});
	
});
