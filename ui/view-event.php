<?php
	
	//event view 
	//special for search engine optimization especially for sharing url ...
	
	include "../services/connect.php";
	
	$id = $_GET['_escaped_fragment_'];

	$results = mysql_query("select e.*,  
		i.objectid, 
		i.ImageName , 
		i.ThumbName, 
		i.type, 
		ints.int_name,
		_user.username as username
		from events e
		left outer join images  i on (i.objectid = e.id) 
		left outer join users _user on (_user.id = e.user_id) 
		left outer join interests  ints on (ints.id = e.int_id)  
		where e.id='$id'");
			

	if (!$results) exit;
			
	$events = array();
	while ($row = mysql_fetch_assoc($results)) {
		
		$events[] = $row;				
		$image .= '<a href="' .$row['ImageName']. '" id="image-dialog"><img class="border" src="' . $row['ThumbName']. '" width="160"/></a>';
		
	}
	
	if ($events)
	{
		$row = $events[0];
		
		$title  = convertToCyrillic($row['name']); 
		$date  = $row['date']; 
		$descr = convertToCyrillic($row['descr']);
		$detail = '<a class="link" href="#selectedEvent" id=' .$id.'>Детайли</a>';
		$username = convertToCyrillic($row['username']);
		$user_id = $row['user_id'];
		
		$data = '<article>'.
					'<p class=text-1>'.$title.'</p>'.			
					'<p class="p0"><strong>Дата на събитие: </strong><br/>'.$date.'</p>' .$image.			
					'<p class="p0">Описание: <p class="text-1">'.$descr.'</p></p>'.	$detail.				
					'<p class="p0"><b>Добавено от: </b><a href="#selected-user" id='.$user_id.'>'.$username.'</a></p><br/>'.
					'</article>';
					
		echo $data;
	}
	
	function convertToCyrillic($_str) {
	  $_str = mb_convert_encoding($_str,'utf8','cp1251');		
	  mb_internal_encoding('cp1251');
      return $_str;
	  
	}
		
?>

<div style="margin: 20px;" id="event-detail"></div>


