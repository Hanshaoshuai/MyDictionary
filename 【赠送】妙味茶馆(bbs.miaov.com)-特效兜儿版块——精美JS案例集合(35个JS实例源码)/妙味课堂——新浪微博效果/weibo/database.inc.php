<?php
$db_host="localhost";
$db_database="test";
$db_user="root";
$db_pass="";

$__db_conn=null;

function _db_open()
{
	global $db_host;
	global $db_database;
	global $db_user;
	global $db_pass;
	
	$conn=mysql_connect($db_host,$db_user,$db_pass);
	mysql_select_db($db_database,$conn);
	mysql_query("SET NAMES utf8",$conn);
	
	return $conn;
}

function db_query_norp($sql,$conn)
{
	global $__db_conn;

	mysql_query($sql,$__db_conn);
}

function _db_query($sql,$conn)
{
	$res=mysql_query($sql,$conn);
	if(!$res)
	{
		return array();
	}
	
	$arr=array();
	
	for($i=0,$l=mysql_fetch_row($res);$l;$l=mysql_fetch_row($res),$i++)
	{
		$arr[$i]=$l;
	}
	return $arr;
}

function _db_close($conn)
{
	mysql_close($conn);
}

function db_init()
{
	global $__db_conn;
	
	$__db_conn=_db_open();
}

function db_query_once($sql)
{
	global $__db_conn;

	$res=_db_query($sql,$__db_conn);
	
	return $res;
}

function db_query_once_norp($sql)
{
	global $__db_conn;
	
	db_query_norp($sql,$__db_conn);
}

function db_query_once_page($sql,$page,$size)
{
	$start=($page-1)*$size;
	$sql.=" LIMIT {$start},{$size}";
	return db_query_once($sql);
}

function db_get_row_num($table,$where='')
{
	$sql="SELECT count(*) FROM {$table}";
	if($where!='')
	{
		$sql.=" WHERE {$where}";
	}
	
	$results=db_query_once($sql);
	
	return (int)$results[0][0];
}

function db_insert($table,$arr)
{
	$keys='';
	$values='';
	
	reset($arr);
	while($key=key($arr))
	{
		$keys.=$key.",";
		$values.="'".$arr[$key]."',";
		next($arr);
	}
	
	$keys=substr($keys,0,strlen($keys)-1);
	$values=substr($values,0,strlen($values)-1);
	
	$sql="INSERT INTO {$table} ({$keys}) VALUES({$values})";
	
	db_query_once_norp($sql);
}

function db_update($table,$arr,$condition='')
{
	$first='';
	$sql="UPDATE {$table} SET ";
	
	reset($arr);
	while($key=key($arr))
	{
		$value=$arr[$key];
		$sql.=$first."{$key}='{$value}'";
		$first=',';
		next($arr);
	}
	
	strlen($condition) and $sql.=" WHERE {$condition}";

	db_query_once_norp($sql);
}

db_init();
?>