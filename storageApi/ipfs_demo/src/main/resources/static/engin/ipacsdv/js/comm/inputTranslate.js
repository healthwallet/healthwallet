/**
 * Created by Administrator on 2016/10/24.
 */
function GetRequest() {
    var url = location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = (strs[i].split("=")[1]);
        }
    }
    return theRequest;
}

function deepCopy(p, c) {
    var c = c || {};
    for (var i in p) {
        if (typeof p[i] === 'object'&&p[i]!=null) {
            c[i] = (p[i].constructor === Array) ? [] : {};
            deepCopy(p[i], c[i]);
        } else {
            c[i] = p[i];
        }
    }
    return c;
}

	
function Getoutput(id,pcode,localurl)
{
    console.log("++++++++++++++++++++++++++++++++++++++++++++");
    console.log(id);
    console.log(pcode);
    console.log(localurl);
var result="";
$.ajax({
    type: "get",
    url: "http://travel.nat300.top/test/findDicomdataByStudyId/{studyId}",
    data: { studyId: id,pcode:pcode},
    async: false,
    success: function (data) {
       // debugger;
        var retval = data;

        if(retval.status!=200||retval.msg!="OK"){
            alert(retval.msg);
            return;
        }
        var json = retval.data;//JSON.parse(+'}');
        var dicoms = [];
        var dicom = {};
        dicom.CSeriesID = "";
        dicom.items = [];
        for (var j = 0; j < json.length; j++) {

            //  console.log(json[j].uRL.replace("D:\\App\\Tomcat 7.0\\webapps\\ROOT","http://61.190.254.59:8080"));
          //  console.log(json[j].jpg);
            if (dicom.CSeriesID == json[j].cseriesid) { continue; }
            else { dicom.CSeriesID = json[j].cseriesid }
            for (var i = 0; i < json.length; i++) {
               // json[i].CURL=json[i].cURL.replace(GetdicomPath(),GetpacsUrl());//.replace(new RegExp(/(\\\\)/g),"/");
                json[i].czip=json[i].czip.replace(GetdicomPath(),GetpacsUrl());
                if (dicom.CSeriesID == json[i].cseriesid) { dicom.items.push(json[i]); }
                if (i == json.length - 1) {
                    var tempdicom = deepCopy(dicom);
                    dicoms.push((tempdicom));
                    dicom.items = [];
                }
            }

        }
        var	dicomsstr =JSON.stringify(dicoms);//

        dicomsstr=dicomsstr.replace(new RegExp(/(\\\\)/g),"/");
        //dicomsstr=dicomsstr.replace(new RegExp(/(\/)/g),"\\\/");
        //console.log('\/');
        //	console.log('\\');
        //dicomsstr=dicomsstr.replace(new RegExp(/(\/)/g),"\\/");
        //dicomsstr=dicomsstr.replace(new RegExp(/(\\)/g),"\\/");
        var outstr = "{ \"dicom\": " + dicomsstr + "}";
        //		outstr=outstr.replace(new RegExp(/(\/)/g),"\\/");
        //	outstr=outstr.replace(new RegExp(/(\\)/g),"\\");
      //  console.log("-----------------------------------");
      //  console.log(JSON.stringify(outstr));
      //  $("#dicomOutput").text((outstr));

        //console.log("zczczczczczzzzzzzzzzzzzzzzzzz");
        //console.log(outstr);
	 // result=outstr;
        result= GetLoclImage(outstr,localurl);
        //console.log("zczczczczczzzwwwwwwwzzzzzzzzzzzzzzzz");
        //console.log(GetLoclImage(outstr));
        // console.log("1");
        //    console.log($("#dicomOutput").text());
        //   console.log("2");
        //  console.log(dicoms);
    }
});
	return result;
}

function Getoutput1(urls){
    var dicoms = [];
    var dicom = {};
    dicom.CSeriesID = "";
    dicom.items = [];
    urls= JSON.parse(urls);
    for (var i= 0; i < urls.length; i++) {
        var items= {};
        items.czip=urls[i];
        dicom.items.push(items);
    }
    dicoms.push(dicom);
    var	dicomsstr =JSON.stringify(dicoms);//
    dicomsstr=dicomsstr.replace(new RegExp(/(\\\\)/g),"/");
    var outstr = "{ \"dicom\": " + dicomsstr + "}";
    return outstr;
}

function GetLoclImage(outstr,localurl) {
   // debugger;
    var result=outstr;
            $.ajax({
                type: "post",
                url: localurl,
                data: {data: outstr},
                async: false,
                success: function (data) {
                    console.log("1231231321231");
                    result= data;
                }
                //statusCode:{
                //    404:function(){
                //        //说明请求的url不存在
                //        alert('说明请求的url不存在');
                //        result= outstr;
                //    },
                //    500:function(){
                //        //说明请求的url调用出错
                //        alert('说明请求的url调用出错');
                //        result= outstr;
                //    }
                //}

            });
    console.log("result:"+result);
   return result;
}



