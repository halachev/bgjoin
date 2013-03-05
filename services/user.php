<?php
   
	include "connect.php";
	include "json_unicode.php";
	
	define ('insert', insert);
	define ('edit', edit);
	define ('delete', delete);
	define ('LogIn', LogIn);
	define ('allUsers', allUsers);
	define ('LoadMore', LoadMore);
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
		private $userLastId;
		private $method;
		
		
	    function __construct(
			$_id, 	
		    $_sessionId,		
			$_username, 
			$_password, 
			$_email, 
			$_descr,
			$_limit,
			$_userLastId,
			$_method) {
			
			$this->id = $_id;
			$this->sessionId = $_sessionId;
			$this->username = $_username;
			$this->password = $_password;
			$this->email = $_email;
			$this->descr = $_descr;
			$this->limit = $_limit;
			$this->userLastId = $_userLastId;
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
				$this->users();  
				break;	
			case LoadMore:
				$this->LoadMore();  
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
		
		function users()
		{
			if ($this->limit > 0)
				$results = mysql_query("select * from users order by id  limit $this->limit");
			else
				$results = mysql_query("select * from users order by id ");
			
			$data = array();
			
			while ($row = mysql_fetch_assoc($results)) {
			   $data[] = $row;
			}
		   
			echo json_safe_encode($data);
			
		}
		
		
		function insert()
		{
			
			$username = convertToCyrillic(filter($this->username));
			$password = filter($this->password);
			$email = filter($this->email);
			
			
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
		  $email = filter($this->email);
		  $descr = filter($this->descr);	
		  $descr = convertToCyrillic($descr);
		   
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
			$username = filter($this->username);
			$password = filter($this->password);
			
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
		
		
		function LoadMore()
		{
			$last_id = $this->userLastId;
			$sql = mysql_query("SELECT * FROM users WHERE id > '$last_id' ORDER BY id LIMIT $this->limit");
			
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
	$username = $_POST['username'];
	$password = $_POST['password'];
	$email = $_POST['email'];
	$descr = $_POST['descr'];	
	$limit = $_POST['limit'];	
	$userLastId = $_POST['userLastId'];
	$method = $_POST['method'];
	
	$user = new User(
				$id, 
				$sessionId,
				$username, 
				$password, 
				$email, 
				$descr, 
				$limit,
				$userLastId,
				$method);
				

   function filter($data) {
    //$data = trim(htmlentities(strip_tags($data),ENT_QUOTES,"UTF-8")); 
    $data = trim($data);    
 
    if (get_magic_quotes_gpc())
        $data = stripslashes($data);
 
    $data = mysql_real_escape_string($data);
 
    return $data;
	}	

    function convertToCyrillic($_descr)
	{
	  $desc = mb_convert_encoding($_descr,'cp1251','utf8');		
	  mb_internal_encoding('cp1251');
      return $desc;
	}	
				
	
?>


