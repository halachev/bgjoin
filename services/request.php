<?php
   
	include "connect.php";
	include "utils.php";
	include "json_unicode.php";
	
	define ('insert', insert);
	define ('delete', delete);
	define ('requests', requests);
	define ('LoadMore', LoadMore);
	define ('MyRequests', MyRequests);
	define ('getRequestById', getRequestById);

	
	class Request 
	{
		private $id;
		private $sessionId;
		private $sender_user_id;
		private $user_id;
		private $event_id;
		private $date;
		private $descr;		
		private $limit;
		private $method;
		
		
	    function __construct(
			$_id, 	
		    $_sessionId,	
			$_sender_user_id,			
			$_user_id,
			$_event_id, 	
			$_date,
			$_descr, 	
			$_limit,
			$_method) {
			
			$this->id = $_id;
			$this->sessionId = $_sessionId;	
			$this->sender_user_id = $_sender_user_id;
			$this->user_id = $_user_id;
			$this->event_id = $_event_id;	
			$this->date = $_date;				
			$this->descr = $_descr;						
			$this->limit = $_limit;			
			$this->method = $_method;
			
			switch ($_method) {
			  case insert:
				$this->insert();  
				break;										
			  case requests:
				$this->requests();  
				break;	
			  case MyRequests:
				$this->MyRequests();  
				break;
			  case LoadMore:
				$this->LoadMore();  
				break;
			  case delete:
				$this->delete();  
				break;			
			  case getRequestById:
				echo $this->getRequestById($_id);  
				break;							
			  default:
				throw new Exception('Invalid REQUEST_METHOD');
				break;
			}
			
		}
		
		function events()
		{
			if ($this->limit > 0)
				$results = mysql_query("select * from requests order by id desc limit $this->limit");
			else
				$results = mysql_query("select * from requests order by id desc ");
			
			$data = array();
			
			while ($row = mysql_fetch_assoc($results)) {
			   $data[] = $row;
			}
		   
			echo json_safe_encode($data);
			
		}
		
		
		function insert()
		{
			
			$user_id = $this->user_id;
			$sender_user_id = $this->sender_user_id;
			$event_id = $this->event_id;
			$date = $this->date;
			$descr = convertToCyrillic(filter($this->descr));			
			
			
			if ($sender_user_id == $user_id)
			{
				$data = array("error_message" => "не може да правите заявки към ваши събития!");
				echo json_safe_encode($data);
				exit;				
			}
			
			if ((!$user_id) || (!$event_id) || (!$descr))
			{
				$data = array("error_message" => "Всички полета задължителни!");
				echo json_safe_encode($data);
				exit;				
			}
			
			//проверка за същесвуваща заявка
			$count = $this->ExistRequest();
			
			if ($count > 0) 
			{
				$data = array("error_message" => "Името е заето!");				
				echo json_safe_encode($data);
			
			}
			
			else
			{
				$results = mysql_query("insert into requests (sender_user_id, user_id, event_id, date, descr) values('$sender_user_id', '$user_id', '$event_id', '$date', '$descr') ");
			
				// връщаме новия обект на клиента
				$newId = mysql_insert_id();							
				echo $this->getRequestById($newId);
			}
		}
		
		
		function getRequestById($id)
		{
			if (($this->sessionId == "") && ($this->method != insert))
			{
			    $data = array();
				return json_safe_encode($data);				
			}
			
			$results = mysql_query("select * from requests where id='$id'");
			
			$data = array();
			
			while ($row = mysql_fetch_assoc($results)) {
			   $data[] = $row;
			}
		   		    
			return json_safe_encode($data);
		}
		
			
		function ExistRequest()
		{
		    $user_id = $this->user_id;
			$event_id = $this->event_id;
			$results = mysql_query("select name from requests where user_id='$name' and event_id='$event_id'");
			
			return mysql_num_rows($results);
		}
		
		function delete()
		{
		
		}
		
		function MyRequests()
		{
		
			echo $this->getRequestByUserId($this->user_id);
			
		}
		
		
		function getRequestByUserId($id)
		{
			if ($this->sessionId == "")
			{
			    $data = array();
				return json_safe_encode($data);				
			}
			
			$results = mysql_query("select * from requests where user_id='$id'");
			
			$data = array();
			
			while ($row = mysql_fetch_assoc($results)) {
			   $data[] = $row;
			}
		   		    
			return json_safe_encode($data);
		}
		
		function LoadMore()
		{
			$last_id = $this->userLastId;
			$sql = mysql_query("select * from events where id < '$last_id' ORDER BY id desc LIMIT $this->limit");
			
			$data = array();
			
			while($row=mysql_fetch_array($sql))
			{
				  $data[] = $row;
			} 
			
			echo json_safe_encode($data);
			
		}

	}
	
	
	$id = $_POST['id'];
	$sessionId = $_POST['sessionId'];	
	$sender_user_id = $_POST['sender_user_id'];		
	$user_id = $_POST['user_id'];	
	$event_id = $_POST['event_id'];
	$date = $_POST['date'];	
	$descr = $_POST['descr'];	
	$limit = $_POST['limit'];		
	$method = $_POST['method'];
	
	$Request = new Request(
				$id, 
				$sessionId,	
				$sender_user_id,			
				$user_id,
				$event_id,
				$date,
				$descr,
				$limit,
				$method);	
?>


