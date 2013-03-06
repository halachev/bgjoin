<?php

function filter($data) {
    //$data = trim(htmlentities(strip_tags($data),ENT_QUOTES,"UTF-8")); 
    $data = trim($data);    
 
    if (get_magic_quotes_gpc())
        $data = stripslashes($data);
 
    $data = mysql_real_escape_string($data);
 
    return $data;
}	

function convertToCyrillic($_str)
{
	  $_str = mb_convert_encoding($_str,'cp1251','utf8');		
	  mb_internal_encoding('cp1251');
      return $_str;
}	
			
?>