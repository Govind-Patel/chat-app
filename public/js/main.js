(function ($) {

	"use strict";

	var fullHeight = function () {

		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function () {
			$('.js-fullheight').css('height', $(window).height());
		});

	};
	fullHeight();

	$('#sidebarCollapse').on('click', function () {
		$('#sidebar').toggleClass('active');
	});

})(jQuery);

//-------------- Start Dynamic Chat App Script -----------

function getCookie(name) {
	let matches = document.cookie.match(new RegExp(
	  "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	));
	return matches ? decodeURIComponent(matches[1]) : undefined;
  }
const userData = JSON.parse(getCookie('userCookie'));
console.log(userData._id);
var sender_id = userData._id;
var receiver_id; // Global variable

var socket = io('/user-name', {
	auth: {
		token: sender_id
	}
});

$(document).ready(function ($) {
	$('.user-list').click(function () {
		var userId = $(this).attr('data-id');
		receiver_id = userId; // Assign to the global variable instead of creating a new one
		$('.start-head').hide();
		$('.chat-section').show();

		socket.emit('existsChat', { sender_id: sender_id, receiver_id: receiver_id });
	});

	// Other parts of your code...



	// update user online user status
	socket.on('getOnlineUser', function (data) {
		$('#' + data.user_id + '-status').text('Online');
		$('#' + data.user_id + '-status').removeClass('offline-status');
		$('#' + data.user_id + '-status').addClass('online-status');
	});

	//update user offline user status
	socket.on('getOfflineUser', function (data) {
		$('#' + data.user_id + '-status').text('Offline');
		$('#' + data.user_id + '-status').addClass('offline-status');
		$('#' + data.user_id + '-status').removeClass('online-status');
	});

	// chat save of user 
	$('#chat-form').submit(function (event) {
		event.preventDefault();
		var message = $('#message').val();
		// console.log(receiver_id);
		$.ajax({
			url: '/save-chat',
			type: 'post',
			data: { sender_id: sender_id, receiver_id: receiver_id, message: message },
			success: function (response) {
				// console.log(response.success);
				console.log(response.data);
				if (response.success) {
					$('#message').val('');
					let chat = response.data.message;
					let html = `
			<div class="current-user-chat" id='`+ response.data._id + `'>
			  <h5> <span>`+ chat + `</span>
			   <i class="fa fa-trash text-danger" aria-hidden="true" data-id='`+ response.data._id + `' data-toggle="modal" data-target="#deleteChatModel"></i>
			   <i class="fa fa-edit text-primary" aria-hidden="true" data-id='`+ response.data._id + `' data-msg="` + chat + `" data-toggle="modal" data-target="#editChatModel"></i>
			  </h5>
			</div>
		`;
					$('#chat-container').append(html);
					socket.emit('newChat', response.data);
					scrollChat();
				} else {
					alert(response.data.message);
				}
			}
		});
	});
	socket.on('loadNewChat', function (data) {
		if (sender_id == data.receiver_id && receiver_id == data.sender_id) {
			let html = `
		<div class="distance-user-chat" id='`+ data._id + `'>
		  <h5><span>`+ data.message + `</span></h5>
		</div>
	`;
			$('#chat-container').append(html);
		}
		scrollChat();
	});

	// load old chats 
	socket.on('loadsChat', function (data) {
		$('#chat-container').html('');
		var chats = data.chats;
		let html = '';
		for (let x = 0; x < chats.length; x++) {
			let addClass;
			if (chats[x]['sender_id'] == sender_id) {
				addClass = 'current-user-chat';
			} else {
				addClass = 'distance-user-chat';
			}
			html += `
		<div class='` + addClass + `' id='` + chats[x]['_id'] + `'>
		  <h5><span>` + chats[x]['message'] + `</span>`;
			if (chats[x]['sender_id'] == sender_id) {
				html += ` <i class="fa fa-trash text-danger" aria-hidden="true" data-id='` + chats[x]['_id'] + `' data-toggle="modal" data-target="#deleteChatModel"></i>
					<i class="fa fa-edit text-primary" aria-hidden="true" data-id='`+ chats[x]['_id'] + `' data-msg="` + chats[x]['message'] + `" data-toggle="modal" data-target="#editChatModel"></i>
				  `;
			}
			html += `
		  </h5>
		</div>
	`;
		}
		$('#chat-container').append(html);
		scrollChat();
	});

	function scrollChat() {
		$('#chat-container').animate({
			scrollTop: $('#chat-container').offset().top + $('#chat-container')[0].scrollHeight
		}, 0);
	}

	// delete chat message
	$(document).on('click', '.fa-trash', function () {
		let msg = $(this).parent().text();
		$('#delete-message').text(msg);
		$('#delete-message-id').val($(this).attr('data-id'));
		// console.log(msg);`
	})

	$('#delete-chat-form').submit(function (event) {
		event.preventDefault();
		var id = $('#delete-message-id').val();
		// console.log(id);
		$.ajax({
			url: '/delete-chat',
			type: 'POST',
			data: { id: id },
			success: function (res) {
				if (res.success == true) {
					$('#' + id).remove();
					$('#deleteChatModel').modal('hide');
					socket.emit('chatDeleted', id);
				} else {
					alert(res.msg);
				}
			}
		});
	});

	socket.on('chatMessageDeleted', function (id) {
		$('#' + id).remove();
	});

	//update user chat 
	$(document).on('click', '.fa-edit', function () {
		$('#edit-message-id').val($(this).attr('data-id'));
		$('#update-message').val($(this).attr('data-msg'));
	});

	$('#update-chat-form').submit(function (event) {
		event.preventDefault();
		var id = $('#edit-message-id').val();
		var msg = $('#update-message').val();

		// console.log(id);
		$.ajax({
			url: '/update-chat',
			type: 'POST',
			data: { id: id, message: msg },
			success: function (res) {
				if (res.success == true) {
					$('#editChatModel').modal('hide');
					$('#' + id).find('span').text(msg);
					$('#' + id).find('.fa-edit').attr('data-msg', msg);
					socket.emit('chatUpdated', { id: id, message: msg });
				} else {
					alert(res.msg);
				}
			}
		});
	});

	socket.on('chatMessageUpdate', function (data) {
		$('#' + data.id).find('span').text(data.message);
	})

});


