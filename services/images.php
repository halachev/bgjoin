﻿<?php   	include "connect.php";		header('content-type text/html charset=utf-8');		define ('edit', edit);	define ('images', images);	define ('delete', delete);			class Image 	{		private $id;		private $sessionId;		private $objectid;		private $type;		private $method;					    function __construct(				$_id, 				$_sessionId,  				$_objectid, 				$_type,				$_method) {						$this->id = $_id;				$this->sessionId = $_sessionId;				$this->objectid = $_objectid;				$this->type = $_type;							$this->method = $_method;						switch ($_method) {			  case edit:				$this->edit();  				break;				 case images:				$this->images();  				break;			  case delete:				$this->delete();  				break;							 						  default:				throw new Exception('Invalid REQUEST_METHOD');				break;			}					}						function edit()		{		  $id = $this->id;		  $sessionId = $this->sessionId;		  $objectid = $this->objectid;		  $type = $this->type;		   		  $result = mysql_query("update images set objectid='$objectid', type='$type' where id='$id'");		 		  echo json_encode($result);		}				function images()		{						if ($this->objectid > 0)			{				$objectid = $this->objectid;				$type = $this->type;				$results = mysql_query("select * from images where objectid = '$objectid' and type='$type'");			}			else				$results = mysql_query("select * from images");						$data = array();						while ($row = mysql_fetch_assoc($results)) {			   $data[] = $row;			}		   		    			echo json_encode($data);		}				function delete()		{				}	}			$id = $_POST['id'];	$sessionId = $_POST['sessionId'];	$objectid = $_POST['objectid'];		$type = $_POST['type'];		$method = $_POST['method'];		$image = new Image($id, $sessionId, $objectid, $type, $method);	?>