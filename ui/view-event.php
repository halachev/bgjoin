<?php
	include "../services/connect.php";
	include "../services/utils.php";

	$id = $_GET['_escaped_fragment_'];

	$results = mysql_query("select e.*,  
		i.objectid, i.ImageName , i.ThumbName, i.type, ints.int_name from events e
		left outer join images  i on (i.objectid = e.id) 
		left outer join interests  ints on (ints.id = e.int_id)  
		where e.id='$id'");
			

	if (!$results) exit;
			
	$data = array();
	while ($row = mysql_fetch_assoc($results)) {
				
		$title  = convertToCyrillic($row['name']); 
		$date  = $row['date']; 
		$image = $row['ImageName'];		
		$descr = convertToCyrillic($row['descr']);
		$detail = '<a class="link" href="#selectedEvent" id=' .$id.'>Детайли</a>';
		
		$data = '<article>'.
				'<p class=text-1>'.$title.'</p>'.			
				'<p class="p0"><strong>Дата на събитие: </strong><br/>'.$date.'</p>'.
				'<img class="border" src="'.$image.'" alt="" width="160">'.				
				'<p class="p0"><strong>Описание: <br/></strong>'.$descr.'</p>'.	$detail.				
				'</article>';
				
		echo $data;
	}
		
	  
?>

<div style="margin: 20px;" id="event-detail"></div>