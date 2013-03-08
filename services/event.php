<?php
   
	include "connect.php";
	include "utils.php";
	include "json_unicode.php";
	
	define ('insert', insert);
	define ('edit', edit);
	define ('delete', delete);
	define ('events', events);
	define ('LoadMore', LoadMore);
	define ('MyEvents', MyEvents);
	define ('getEventById', getEventById);

	
	class Event 
	{
		private $id;
		private $sessionId;
		private $name;
		private $date;
		private $descr;
		private $int_id;		
		private $user_id;
		private $limit;
		private $method;
		
		
	    function __construct(
			$_id, 	
		    $_sessionId,		
			$_name, 
			$_date, 
			$_descr, 			
			$_int_id,
			$_user_id,
			$_limit,
			$_method) {
			
			$this->id = $_id;
			$this->sessionId = $_sessionId;
			$this->name = $_name;
			$this->date = $_date;
			$this->descr = $_descr;
			$this->int_id = $_int_id;
			$this->user_id = $_user_id;
			$this->limit = $_limit;			
			$this->method = $_method;
			
			switch ($_method) {
			  case insert:
				$this->insert();  
				break;	
			  case edit:
				$this->edit();  
				break;							 
			  case events:
				$this->events();  
				break;	
			  case MyEvents:
				$this->MyEvents();  
				break;
			  case LoadMore:
				$this->LoadMore();  
				break;
			  case delete:
				$this->delete();  
				break;			
			  case getEventById:
				echo $this->getEventById($_id);  
				break;							
			  default:
				throw new Exception('Invalid REQUEST_METHOD');
				break;
			}
			
		}
		
		function events()
		{
			if ($this->limit > 0)
				$results = mysql_query("select e.*,  i.objectid, i.ImageName, i.ThumbName, i.type from events e
						left outer join images  i on (i.objectid = e.id) order by id desc limit $this->limit");
			else
				$results = mysql_query("select e.*,  i.objectid, i.ImageName, i.ThumbName, i.type from events e
						left outer join images  i on (i.objectid = e.id) order by id desc ");
			
			$data = array();
			
			while ($row = mysql_fetch_assoc($results)) {
			   $data[] = $row;
			}
		   
			echo json_safe_encode($data);
			
		}
		
		
		function insert()
		{
			
			$name = convertToCyrillic(filter($this->name));
			$date = $this->date;
			$descr = convertToCyrillic(filter($this->descr));
			$int_id = $this->int_id;
			$user_id = $this->user_id;
			
			if ((!$name) || (!$date) || (!$descr))
			{
				$data = array("error_message" => "Всички полета задължителни!");
				echo json_safe_encode($data);
				exit;				
			}
			
			//проверка за същесвуващо име
			$count = $this->ExistEventName();
			
			if ($count > 0) 
			{
				$data = array("error_message" => "Името е заето!");				
				echo json_safe_encode($data);
			
			}
			
			else
			{
				$results = mysql_query("insert into events (name, date, descr, int_id, user_id) values('$name', '$date', '$descr', '$int_id', '$user_id') ");
			
				// връщаме новия обект на клиента
				$newId = mysql_insert_id();							
				echo $this->getEventById($newId);
			}
		}
		
		
		function edit()
		{
		  $id = $this->id;
		  $name = filter($this->name);
		  $date = filter($this->date);	
		  $descr = convertToCyrillic($this->descr);
		   
		  $result = mysql_query("update events set name='$name', date='$date', descr='$descr' where id='$id'");
		 
		  echo $this->getUserById($id);
		}
		
		function getEventById($id)
		{
			if (($this->sessionId == "") && ($this->method != insert))
			{
			    $data = array();
				return json_safe_encode($data);				
			}
			
			$results = mysql_query("select e.*,  i.objectid, i.ImageName, i.ThumbName, i.type from events e
						left outer join images  i on (i.objectid = e.id)  where e.id='$id'");
			
			$data = array();
			
			while ($row = mysql_fetch_assoc($results)) {
			   $data[] = $row;
			}
		   		    
			return json_safe_encode($data);
		}
		
			
		function ExistEventName()
		{
		    $name = $this->name;
			$results = mysql_query("select name from events where name='$name'");
			
			return mysql_num_rows($results);
		}
		
		function delete()
		{
		
		}
		
		function MyEvents()
		{
		
			echo $this->getEventByUserId($this->user_id);
			
		}
		
		
		function getEventByUserId($id)
		{
			if ($this->sessionId == "")
			{
			    $data = array();
				return json_safe_encode($data);				
			}
			
			$results = mysql_query("select * from events where user_id='$id'");
			
			$data = array();
			
			while ($row = mysql_fetch_assoc($results)) {
			   $data[] = $row;
			}
		   		    
			return json_safe_encode($data);
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
	$sessionId = $_POST['sessionId'];
	$name = $_POST['name'];
	$date = $_POST['date'];
	$descr = $_POST['descr'];
	$int_id = $_POST['int_id'];	
	$user_id = $_POST['user_id'];	
	$limit = $_POST['limit'];		
	$method = $_POST['method'];
	
	$event = new Event(
				$id, 
				$sessionId,
				$name, 
				$date, 
				$descr, 
				$int_id, 				
				$user_id,
				$limit,
				$method);	
?>


