<?php   	include "connect.php";		header('content-type text/html charset=utf-8');		define ('edit', edit);	define ('LoadImages', LoadImages);	define ('delete', delete);			class UserImage 	{		private $id;		private $userId;		private $method;					    function __construct($_id, $_userId, $_method) {						$this->id = $_id;				$this->userId = $_userId;							$this->method = $_method;						switch ($_method) {			  case edit:				$this->edit();  				break;				 case LoadImages:				$this->LoadImages();  				break;			  case delete:				$this->delete();  				break;							 						  default:				throw new Exception('Invalid REQUEST_METHOD');				break;			}					}						function edit()		{		  $id = $this->id;		  $userId = $this->userId;		   		  $result = mysql_query("update user_Images set UserID='$userId' where id='$id'");		 		  echo json_encode($result);		}				function LoadImages()		{									$results = mysql_query("select * from user_Images");						$data = array();						while ($row = mysql_fetch_assoc($results)) {			   $data[] = $row;			}		   		    			echo json_encode($data);		}				function delete()		{				}	}			$id = $_POST['id'];	$userId = $_POST['userId'];		$method = $_POST['method'];		$UserImage = new UserImage($id, $userId, $method);	?>