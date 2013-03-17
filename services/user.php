<?php
   
	include "connect.php";
	include "utils.php";
	include "json_unicode.php";
	include "email/class.phpmailer.php";    
	
	define ('insert', insert);
	define ('edit', edit);
	define ('delete', delete);
	define ('LogIn', LogIn);
	define ('users', users);
	define ('LoadMore', LoadMore);
	define ('getUserById', getUserById);
	define ('getUserById', getUserByName);
	define ('SetNewPassword', SetNewPassword);
	define ('sendMail', sendMail);

	
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
		private $emailBody;
		private $emailSubject;
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
			$_emailBody,
			$_emailSubject,
			$_method) {
			
			$this->id = $_id;
			$this->sessionId = $_sessionId;
			$this->username = $_username;
			$this->password = $_password;
			$this->email = $_email;
			$this->descr = $_descr;
			$this->limit = $_limit;
			$this->userLastId = $_userLastId;
			$this->emailBody = $_emailBody;
			$this->emailSubject = $_emailSubject;
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
			  case users:
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
			 case getUserByName:
				echo $this->getUserByName($_username);  
				break;	
		     case SetNewPassword:
				echo $this->SetNewPassword();  
				break;	
			 case sendMail:
				echo $this->sendMail();  
				break;	
				
			  default:
				throw new Exception('Invalid REQUEST_METHOD');
				break;
			}
			
		}
		
		function users()
		{
			if ($this->limit > 0)
				$results = mysql_query("select u.*,  i.objectid, i.ImageName, i.ThumbName, i.type from users u
						left outer join images  i on (i.objectid = u.id) order by u.id desc limit $this->limit");
			else
				$results = mysql_query("select u.*,  i.objectid, i.ImageName, i.ThumbName, i.type from users u
					left outer join images  i on (i.objectid = u.id) order by u.id desc ");
			
			$data = array();
			
			while ($row = mysql_fetch_assoc($results)) {
			   $data[] = $row;
			}
		   
			echo json_safe_encode($data);
			
		}
		
		
		function insert()
		{
			
			$username = convertToCyrillic(filter($this->username));
			$password = filter(md5($this->password));
			//$password = filter($this->password);
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
			
				$this->sendMail();
				
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
			
			$results = mysql_query("select u.*,  i.objectid, i.ImageName, i.ThumbName, i.type from users u
						left outer join images  i on (i.objectid = u.id) where u.id='$id'");
			
			$data = array();
			
			while ($row = mysql_fetch_assoc($results)) {
			   $data[] = $row;
			}
		   		    
			return json_safe_encode($data);
		}
		
		
		function getUserByName($_name)
		{		   
			if (($this->sessionId == "") && ($this->method != insert))
			{
			    $data = array();
				return json_safe_encode($data);				
			}
			
			$results = mysql_query("select u.*,  i.objectid, i.ImageName, i.ThumbName, i.type from users u
						left outer join images  i on (i.objectid = u.id) where u.username='$_name'");
			
			$data = array();
			
			while ($row = mysql_fetch_assoc($results)) {
			   $data[] = $row;
			}
		   		    
			return json_safe_encode($data);
		}
		
		function LogIn()
		{	
			$username = filter($this->username);
			$password = filter(md5($this->password));
			//$password = filter($this->password);
			
			$results = mysql_query("select u.*,  i.objectid, i.ImageName, i.ThumbName, i.type from users u
						left outer join images  i on (i.objectid = u.id) where u.username='$username' and u.password='$password' ");
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
			//
		}
				
		function LoadMore()
		{
			$last_id = $this->userLastId;
			$sql = mysql_query("SELECT * FROM users WHERE id < '$last_id' ORDER BY id desc LIMIT $this->limit");
			
			$data = array();
			
			while($row=mysql_fetch_array($sql))
			{
				  $data[] = $row;
			} 
			
			echo json_safe_encode($data);
			
		}
		
		function sendMail()
		{
			
			$mail = new PHPMailer();
			
			$body = convertToCyrillic($this->emailBody);
						
			$body  = eregi_replace("[\]",'',$body);

			$mail->IsSMTP(); 
					
			$mail->SMTPAuth   = true;                  
			$mail->SMTPSecure = "ssl";                 
			$mail->Host       = "smtp.gmail.com";      
			$mail->Port       = 465;                   
			$mail->Username   = "bgjoin@gmail.com";  
			$mail->Password   = "palladium1";            
			$mail->CharSet = 'windows-1251'; 
			
			$ourEmail = 'info@bgjoin.com';
			
			$mail->SetFrom($ourEmail, 'bgjoin');

			$mail->AddReplyTo($ourEmail, "bgjoin");

			$mail->Subject  = convertToCyrillic( $this->emailSubject);
		    
			// optional, comment out and test
			$mail->AltBody  = convertToCyrillic( $this->emailSubject);

			$mail->MsgHTML($body);
			
			$mail->AddAddress(filter($this->email), convertToCyrillic( $this->emailSubject));
			
			// attachment
			$mail->AddAttachment("../images/logo.png");      
			
			//send
			$mail->Send();
			
			if ($this->method != insert)
			{
				$data = array("email_message" => "Потребителя ще бъде уведомен по email!");				
				echo json_safe_encode($data);
			}
			
		}
		
		function SetNewPassword()
		{
			if ($this->sessionId == "")
			{
			    $data = array();
				return json_safe_encode($data);				
			}
			
			$id = $this->id;
			$password = filter(md5($this->password));
			 
			$result = mysql_query("update users set password='$password' where id='$id'");
			 
			echo $this->getUserById($id);
		
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
	$emailBody = $_POST['emailBody'];	
	$emailSubject = $_POST['emailSubject'];	
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
				$emailBody,
				$emailSubject,
				$method);		
	
?>


