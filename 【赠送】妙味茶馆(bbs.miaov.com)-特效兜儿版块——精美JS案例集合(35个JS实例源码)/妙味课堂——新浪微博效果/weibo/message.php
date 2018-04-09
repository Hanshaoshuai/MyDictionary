<?php
require('database.inc.php');

$act=$_GET['act'];
$msg=urldecode($_GET['msg']);
$name=urldecode($_GET['name']);

switch($act)
{
	case 'post':
		$sql="INSERT INTO message (ID,msg,name) VALUES(0, '{$msg}', '{$name}')";
		db_query_once_norp($sql);
		$sql="SELECT ID FROM message ORDER BY ID DESC LIMIT 1";
		$results=db_query_once($sql);
		echo $results[0][0];
		break;
	case 'new':
		$id=$_GET['id'];
		$sql="SELECT ID, msg, name FROM message WHERE ID>{$id} ORDER BY ID DESC LIMIT 1";
		$results=db_query_once($sql);
		$str_result=$results[0][0].':'.urlencode($results[0][1]).':'.urlencode($results[0][2]);
		
		echo $str_result;
		break;
}
?>