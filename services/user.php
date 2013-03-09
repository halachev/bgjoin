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
			$password = filter($this->password);
			$email = filter($this->email);
			
			
			if ((!$username) || (!$password) || (!$email))
			{
				$data = array("error_message" => "������ ������ ������������!");
				echo json_safe_encode($data);
				exit;				
			}
			
			//�������� �� ����������� ���
			$count = $this->ExistUserName($username);
			
			if ($count > 0) 
			{
				$data = array("error_message" => "����� � �����!");				
				echo json_safe_encode($data);
			
			}
			
			else
			{
				$results = mysql_query("insert into users (username, password, email) values('$username', '$password', '$email') ");
			
				$this->sendMail();
				
				// ������� ����� ����� �� �������
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
		
		
		function LogIn()
		{	
			$username = filter($this->username);
			$password = filter($this->password);
			
			$results = mysql_query("select u.*,  i.objectid, i.ImageName, i.ThumbName, i.type from users u
						left outer join images  i on (i.objectid = u.id) where u.username='$username' and u.password='$password' ");
			$count = mysql_num_rows($results);
			if (!$count) 
			{
			    $data = array("error_message" => "��������� ����������!");
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
			 
			 
			$username = convertToCyrillic(filter($this->username));
			$password = filter($this->password);
			$email = filter($this->email);
			
			$body = '<html><body>		
			<p>����� ����� � bgjoin.com</p>
			<h2>����� �� ������ ������!</h2>
			<p>����������:'.$username.'</p>
			<p>������:'.$password.'</p>
			<p>����������! �� ����� �� <a href="http://bgjoin.com/">bgjoin</a></p>
			</body></html>';
						
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

			$mail->Subject  = "����������� � bgjoin.com";
		    
			// optional, comment out and test
			$mail->AltBody  = "����������� � bgjoin.com"; 

			$mail->MsgHTML($body);

			$address = $email;
			$mail->AddAddress($address, "����������� � bgjoin.com");
			
			// attachment
			$mail->AddAttachment("../images/logo.png");      
			
			//send
			$mail->Send();
			
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
	
?>


