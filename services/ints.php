<?php
   
	include "connect.php";
	include "utils.php";
	include "json_unicode.php";
		
	define ('interests', interests);
	define ('LoadMore', LoadMore);
		
	class Interest 
	{
		private $id;		
		private $limit;
		private $method;
		
		
	    function __construct(
			$_id, 			    									
			$_limit,
			$_method) {
			
			$this->id = $_id;											
			$this->limit = $_limit;			
			$this->method = $_method;
			
			switch ($_method) {
			
			  case interests:
				$this->interests();  
				break;	
			case LoadMore:
				$this->LoadMore();  
				break;
			default:
				throw new Exception('Invalid REQUEST_METHOD');
				break;
			}
			
		}
		
		function interests()
		{
			if ($this->limit > 0)
				$results = mysql_query("select * from interests order by id desc limit $this->limit");
			else
				$results = mysql_query("select * from interests order by id desc ");
			
			$data = array();
			
			while ($row = mysql_fetch_assoc($results)) {
			   $data[] = $row;
			}
		   
			echo json_safe_encode($data);
			
		}
		
		function LoadMore()
		{
			$last_id = $this->userLastId;
			$sql = mysql_query("SELECT * FROM events WHERE id < '$last_id' ORDER BY id desc LIMIT $this->limit");
			
			$data = array();
			
			while($row=mysql_fetch_array($sql))
			{
				  $data[] = $row;
			} 
			
			echo json_safe_encode($data);
			
		}

	}
	
	
	$id = $_POST['id'];		
	$limit = $_POST['limit'];		
	$method = $_POST['method'];
	
	$interest = new Interest(
				$id, 						
				$limit,
				$method);
					
	
?>


