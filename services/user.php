<?php
   
	include "connect.php";
	include "base.php";
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
	define ('GetUsersByText', GetUsersByText);
	define ('SetNewPassword', SetNewPassword);
	define ('sendMail', sendMail);
	define ('forgetPass', forgetPass);
	
	
	define ('REQUARED_FIELDS', REQUARED_FIELDS);
	define ('EXIST_USERNAME', EXIST_USERNAME);
	define ('INVALID_USERNAME', INVALID_USERNAME);
	define ('EMAIL_RESPONSE', EMAIL_RESPONSE);
	define ('ERROR_EMAIL_RESPONSE', ERROR_EMAIL_RESPONSE);


	class User extends Base      
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
			
			parent::__construct();      
			
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
			case GetUsersByText:
				echo $this->GetUsersByText($_username);  
				break;
			case forgetPass:
				echo $this->forgetPass();  
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
		
		function users()
		{
			if ($this->limit > 0)
				$results = mysql_query("select u.id, u.username, u.descr,  
						i.objectid, i.ImageName, 
						i.ThumbName, 
						i.type from users u
						left outer join images  i on (i.objectid = u.id) order by u.id desc limit $this->limit");
		
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
			$email = filter($this->email);
			
			
			if ((!$username) || (!$password) || (!$email))
			{
				$data = array("error_message" => REQUARED_FIELDS);
				echo json_safe_encode($data);
				exit;				
			}
			
			//проверка за същесвуващо име
			$count = $this->ExistUserName($username);
			
			if ($count > 0) 
			{
				$data = array("error_message" => EXIST_USERNAME);				
				echo json_safe_encode($data);
			
			}
			
			else
			{
				$sessionID = generateGuid();	
				$results = mysql_query("insert into users (username, password, email, sessionID) values('$username', '$password', '$email', '$sessionID') ");
			
				$this->sendMail();
				
				// връщаме новия обект на клиента
				$newId = mysql_insert_id();							
				echo $this->getUserById($newId);
			}
		}
		
		
		function edit()
		{
			
			if ($this->sessionId != $this->userSessionID)
			{
			    $data = array();
				return json_safe_encode($data);				
			}
		
			$id = $this->id;		  
			$descr = filter($this->descr);	
			$descr = convertToCyrillic($descr);
			   
			$result = mysql_query("update users set descr='$descr' where id='$id'");
			 
			echo $this->getUserById($id);
		}
		
		function getUserById($id)
		{		   
			if ($this->sessionId != $this->userSessionID)
			{
			    $data = array();
				return json_safe_encode($data);				
			}
			
			$results = mysql_query("select u.id, u.username, u.descr, u.sessionID, 
						i.objectid, 
						i.ImageName, 
						i.ThumbName, 
						i.type from users u
						left outer join images  i on (i.objectid = u.id) where u.id='$id'");
			
			$data = array();
			
			while ($row = mysql_fetch_assoc($results)) {
			   $data[] = $row;
			}
		   		    
			return json_safe_encode($data);
		}
		
		
		function getUserByName($_name)
		{		   
			
			
			//first we must to generate new GUID ...
			$sessionID = generateGuid();					
			$sql = mysql_query("update users set sessionID = '$sessionID' where username='$_name' ");  
			
			$results = mysql_query("select u.id, u.username, u.descr, u.sessionID, 
						i.objectid, i.ImageName, i.ThumbName, i.type from users u
						left outer join images  i on (i.objectid = u.id) where u.username='$_name'");
			
			$data = array();
			
			while ($row = mysql_fetch_assoc($results)) {
			   $data[] = $row;
			}
		   	
			//store login 
			$_SESSION['userID'] = $data[0]['id'];
			
			return json_safe_encode($data);
		}
		
		function LogIn()
		{	
			$username = convertToCyrillic(filter($this->username));
			$password = filter(md5($this->password));
						
			//first we must to generate new GUID ...
			$sessionID = generateGuid();					
			$sql = mysql_query("update users set sessionID = '$sessionID' where username='$username' and password='$password' ");  
			
			
			//then result json object to user ...
			$results = mysql_query("select u.id, u.username, u.descr, u.sessionID,  
						i.objectid, i.ImageName, 
						i.ThumbName, 
						i.type 
						from users u
						left outer join images  i on (i.objectid = u.id) where u.username='$username' and u.password='$password' ");
			
			$count = mysql_num_rows($results);
			if (!$count) 
			{
			    $data = array("error_message" => INVALID_USERNAME);
				echo json_safe_encode($data);
				exit;
			}
						
			$data = array();
			
			while ($row = mysql_fetch_assoc($results)) {
			   $data[] = $row;
			}
				
			//store login 
			$_SESSION['userID'] = $data[0]['id'];
			
			echo json_safe_encode($data);
				
		}
		
		function ExistUserName($username)
		{
			$results = mysql_query("select username from users where username='$username'");
			
			return mysql_num_rows($results);
		}
		
		function GetUsersByText()
		{		
			$username = $this->username;
			
			$sql = mysql_query("select u.id, u.username, u.descr,  i.objectid, i.ImageName, i.ThumbName, i.type from users u
						left outer join images  i on (i.objectid = u.id) where u.username like '%$username%' group by u.id order by u.id desc");
			
			$data = array();
			
			while($row=mysql_fetch_array($sql))
			{
				  $data[] = $row;
			} 
			
			echo json_safe_encode($data);
		}
		
		function delete()
		{
			//
		}
				
		function LoadMore()
		{
			$last_id = $this->userLastId;
			$sql = mysql_query("SELECT u.id, u.username, u.descr FROM users u WHERE id < '$last_id' ORDER BY id desc LIMIT $this->limit");
			
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
				$data = array("error_message" => EMAIL_RESPONSE);				
				echo json_safe_encode($data);
			}
			
		}
		
		
		
		function forgetPass()
		{
			$email = $this->email;
			
			if (!$email)
				$sql = ""; //mysql_query("SELECT id, username, email, password from users");
			else
				$sql = mysql_query("SELECT id, username, email, password from users where email='$email'");
			
			$count = mysql_num_rows($sql);
			
			if (!$count)
			{
				$data = array("error_message" => ERROR_EMAIL_RESPONSE);				
				echo json_safe_encode($data);
				exit;
			}
			
			$data = array();
			
			while($row=mysql_fetch_array($sql))
			{		
				  $pass = rand_string();
				  $hashPass = md5($pass); 
				  
				  $id = $row['id'];
				  $result = mysql_query("update users set password = '$hashPass' where id='$id'");
							  
				  $obj = array(
					"id"=> $id,
					"username"=>$row['username'],
					"password"=> $pass,
					"email"=>$row['email']
				  );	
				  
				  $data[] = $obj;
			} 
			
			echo json_safe_encode($data);
		}
		
		function SetNewPassword()
		{
			if ($this->sessionId != $this->userSessionID)
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


