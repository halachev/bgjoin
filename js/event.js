//event oject
var event = {
	currUser: function ()
	{
		var data = JSON.parse(currUser);
		return data;
	},
	insert: function ()
	{
		
		var data = {
			name : $('#event-name').val(),
			date : $('#event-date').val(),
			descr : $('#event-descr').val(),
			int_id : 1,
			user_id: currUser.id,
			method : "insert"
		};
		
		//check validation for user
		$(".error").hide();
		
		if (!system.testString(data.name))
			return;		
		else if (!system.testString(data.descr))
			return;	
		
		myAjax("event.php", data, function () {
			//
		});
	},
	
	edit: function ()
	{
	
	},
	
	remove: function ()
	{
	
	}

}