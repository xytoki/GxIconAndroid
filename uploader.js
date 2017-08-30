var fs=require("fs");
var request=require("request");
var cookie=new Buffer(process.env.COOLAPK_COOKIE, 'base64').toString();
function randomWord(randomFlag, min, max){
    var str = "",
	range = min,
	arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    // 随机产生
    if(randomFlag){
	range = Math.round(Math.random() * (max-min)) + min;
    }
    for(var i=0; i<range; i++){
	pos = Math.round(Math.random() * (arr.length-1));
	str += arr[pos];
    }
    return str;
}
var id="o_"+randomWord(false,28);
fs.readFile(__dirname+'/app/build/outputs/apk/com.e123.gxicon.signed.apk',function(err,theApk){
	if(err)process.exit(1);
	var r=request.post({
		url: 'https://developer.coolapk.com/apk/uploadApkFile?name=com.e123.gxicon.signed.apk&chunk=0&chunks=1&aid=156776&id='+id+'&type=&size=4267351',
		body:theApk,
		headers: {
			"Content-Length":theApk.length,
			'Content-Type': 'application/octet-stream',
			'cookie': cookie
		}
	},function (error, response, body) {
		var b=(JSON.parse(body));
		console.log(b);
		if(typeof(b.error)=="object")process.exit(1);
		request({
			url:"https://developer.coolapk.com/do?c=apk&m=edit&id=156776",
			headers: {'cookie': cookie}
		},function(err,res,body){
			console.log("Waiting 15s for security scanning...");
			setTimeout(function(){
				console.log("Submitting apk version...");
				var c="https://developer.coolapk.com/do?c=apk&m=editApkVersion"+body.split("/do?c=apk&m=editApkVersion")[1].split('"')[0];
				request({url:c,headers: {'cookie': cookie}},function(err,res,body){
					var vcode=body.split('name="version" value="')[1].split('"')[0];
					var afile=body.split('name="apkfile" value="')[1].split('"')[0];
					var rfile=body.split('name="realfile" value="')[1].split('"')[0];
					var rhash=body.split('name="requestHash" value="')[1].split('"')[0];
					console.log(vcode,afile,rfile,rhash);
					request.post({
						url:c,
						formData: {
							submit:"1",
							requestHash:rhash,
							version:vcode,
							apkfile:afile,
							realfile:rfile,
							changelog:"该版本由打包系统自动发布。\r\n欢迎大家使用自助打包服务，也希望各位多多上传~\r\n感谢酷友支持"
						},
						headers: {'cookie': cookie}
					},function(err,res,body){
						console.log("COOLAPK done");
					});
				});
			},15000);
		});
	});
});
