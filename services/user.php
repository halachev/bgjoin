<?php
   
	include "connect.php";
	include "json_unicode.php";
	
	header('content-type text/html charset=utf-8');
	
	define ('insert', insert);
	define ('edit', edit);
	define ('delete', delete);
	define ('LogIn', LogIn);
	define ('allUsers', allUsers);
	define ('getUserById', getUserById);

	
	class User 
	{
		private $id;
		private $sessionId;
		private $username;
		private $password;
		private $email;
		private $descr;
		private $limit;
		private $method;
		
		
	    function __construct(
			$_id, 	
		    $_sessionId,		
			$_username, 
			$_password, 
			$_email, 
			$_descr,
			$_limit,
			$_method) {
			
			$this->id = $_id;
			$this->sessionId = $_sessionId;
			$this->username = $_username;
			$this->password = $_password;
			$this->email = $_email;
			$this->descr = $_descr;
			$this->limit = $_limit;
			$this->method = $_method;
			
			//$method = $_SERVER['REQUEST_METHOD'];
			
			switch ($_method) {
			  case insert:
				$this->insert();  
				break;	
			  case edit:
				$this->edit();  
				break;				
			  case LogIn:
				$this->LogIn();  
				break;
			  case allUsers:
				$this->users($_limit);  
				break;					
			  case delete:
				$this->delete();  
				break;			
			  case getUserById:
				echo $this->getUserById($_id);  
				break;							
			  default:
				throw new Exception('Invalid REQUEST_METHOD');
				break;
			}
			
		}
		
		function users($limit)
		{
			if ($limit > 0)
				$results = mysql_query("select * from users order by id desc limit $limit");
			else
				$results = mysql_query("select * from users order by id desc");
			
			$data = array();
			
			while ($row = mysql_fetch_assoc($results)) {
			   $data[] = $row;
			}
		   
			echo json_safe_encode($data);
			
		}
		
		
		function insert()
		{
			
			$username = mysql_real_escape_string($this->username);
			$password = mysql_real_escape_string($this->password);
			$email = mysql_real_escape_string($this->email);
			
			
			if ((!$username) || (!$password) || (!$email))
			{
				$data = array("error_message" => "Всички полета задължителни!");
				echo json_safe_encode($data);
				exit;				
			}
			
			//проверка за същесвуващо име
			$count = $this->ExistUserName($username);
			
			if ($count > 0) 
			{
				$data = array("error_message" => "Името е заето!");				
				echo json_safe_encode($data);
			
			}
			
			else
			{
				$results = mysql_query("insert into users (username, password, email) values('$username', '$password', '$email') ");
			
				// връщаме новия обект на клиента
				$newId = mysql_insert_id();							
				echo $this->getUserById($newId);
			}
		}
		
		
		function edit()
		{
		  $id = $this->id;
		  $email = $this->email;
		  $descr = $this->descr;	
		   
		  $result = mysql_query("update users set descr='$descr', email='$email' where id='$id'");
		 
		  echo $this->getUserById($id);
		}
		
		function getUserById($id)
		{
			if (($this->sessionId == "") && ($this->method != insert))
			{
			    $data = array();
				return json_safe_encode($data);				
			}
			
			$results = mysql_query("select * from users where id='$id'");
			
			$data = array();
			
			while ($row = mysql_fetch_assoc($results)) {
			   $data[] = $row;
			}
		   		    
			return json_safe_encode($data);
		}
		
		
		function LogIn()
		{	
			$username = $this->username;
			$password = $this->password;
			
			$results = mysql_query("select * from users where username='$username' and password='$password' ");
			$count = mysql_num_rows($results);
			if (!$count) 
			{
			    $data = array("error_message" => "Невалиден потребител!");
				echo json_safe_encode($data);
				exit;
			}
						
			$data = array();
			
			while ($row = mysql_fetch_assoc($results)) {
			   $data[] = $row;
			}
		   				
			
			//echo json_encode($data);		
			echo json_safe_encode($data);
				
		}
		
		function ExistUserName($username)
		{
			$results = mysql_query("select username from users where username='$username'");
			
			return mysql_num_rows($results);
		}
		
		function delete()
		{
		
		}

	}
	
	
	$id = $_POST['id'];
	$sessionId = $_POST['sessionId'];
	$username = $_POST['username'];
	$password = $_POST['password'];
	$email = $_POST['email'];
	$descr = $_POST['descr'];	
	$limit = $_POST['limit'];	
	$method = $_POST['method'];
	
	$user = new User(
		$id, 
		$sessionId,
		$username, 
		$password, 
		$email, 
		$descr, 
		$limit,
		$method);
	
?>


