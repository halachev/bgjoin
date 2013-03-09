<?php 
	
	$datetime  = date("Y-m-d H:i:s", time());
	$datetimeArray = array("serverTime" => $datetime);
	echo json_encode($datetimeArray); 

?>