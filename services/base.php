<?php
	session_start();
	
	class Base
	{
		public $userSessionID; 
		
		function __construct()
		{	
		  $id = $_SESSION['userID'];	
		  $this->userSessionID = $this->getSessionByUserID($id);		 
		}
		
		function getSessionByUserID($id)
		{
			$results = mysql_query("select sessionID from users where id='$id'");
				
			if (!$results) exit;
			
			$data = array();
					
			while ($row = mysql_fetch_assoc($results)) {
				$data[] = $row;
			}
			
			$row = $data[0];   
			$sessionID = $row['sessionID'];
			
			return $sessionID;
		}
	}
?>