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
		
		$title  = $row['name']; 
		$date  = $row['date']; 
		$image = $row['ImageName'];		
		$descr = $row['descr'];
		
		
		$data = '<article class="col-2">'.
				'<h6>'.$title.'</h6>'.			
				'<p class="p0">'.$date.'</p>'.
				'<img class="border" src="'.$image.'" alt="" width="160">'.				
				'<p class="p0">'.$descr.'</p>'.				
				'</article>';
				
		echo $data;
	}
		
	  
?>

<div style="margin: 20px;" id="event-detail"></div>