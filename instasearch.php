<?php  
header('Content-type: application/json');

//Following tutorial by Jake Rocheleau:
//http://www.hongkiat.com/blog/instagram-photo-search/

$client = "35b072784eab4b4db51d8094cfb18127";
$lat = $_POST['lat'];
$lng = $_POST['lng'];

$api = "https://api.instagram.com/v1/media/search?lat=".$lat."&lng=".$lng."&client_id=".$client;

function get_curl($url) {  
    if(function_exists('curl_init')) {  
        $ch = curl_init();  
        curl_setopt($ch, CURLOPT_URL,$url);  
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);  
        curl_setopt($ch, CURLOPT_HEADER, 0);  
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);  
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);   
        $output = curl_exec($ch);  
        echo curl_error($ch);  
        curl_close($ch);  
        return $output;  
    } else{  
        return file_get_contents($url);  
    }  
} 

$response = get_curl($api);
$images = array();

if($response){
        foreach(json_decode($response)->data as $item){		
        $src = $item->images->standard_resolution->url;
        $thumb = $item->images->thumbnail->url;
        $url = $item->link;
        $latitude = $item->location->latitude;
        $longitude = $item->location->longitude;
        $id = $item->id;
            

        $images[] = array(
        "src" => htmlspecialchars($src),
        "thumb" => htmlspecialchars($thumb),
        "url" => htmlspecialchars($url),
        "latitude" =>htmlspecialchars($latitude),
        "longitude" => htmlspecialchars($longitude),
        "id" => htmlspecialchars($id)
        );

    }
}

print_r(str_replace('\\/', '/', json_encode($images)));
die();

?>