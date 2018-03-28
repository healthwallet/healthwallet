/**
 * Created by admin on 2016/4/25.
 */

//数据链接数组,解冻需要
var callFlawFlag=false;
var urlFlawArr=[];
/*
 * 数组解冻
 * ImageDataFlaw
 * */
function callFlaw() {
    if(callFlawFlag){
        return
    }
    callFlawFlag=true;
    if(urlFlawArr.length<1){
        return;
    }
    else{
        pop_up({title: "数据提档提示", message: "数据已归档，正在请求提档！", yesName: "确定", noName: "取消"});
        console.log("正在请求解冻");
        console.log(urlFlawArr);
    }
    var dataStr=urlFlawArr.join();
    $.ajax({
        type: 'post',
        data: "urls="+dataStr,
        url: "http://112.74.64.43:8888/restoreKey",
        success: function (data) {
            console.log(data);
            if(data.ok==true||data.ok==false){
                //数据已归档，正在请求解冻，
                pop_up({title: "数据提档提示", message: "数据已归档，正在请求提档，请稍后刷新页面（约1分钟）！", yesName: "确定", noName: "取消"});
            }
            // pop_up({title: "数据提档提示", message: "数据请求提档失败，请联系工程人员！", yesName: "确定", noName: "取消"});

        }
    });

}

function infoFormat(x){// [0:0:512:512] 取出类似这种
    if(!str)return undefined;
    var str=$.trim(x.slice(1,-1));
    return str.split(':');
}
console.log("in outputTranslate:--------------------------");

function outputTranslate(dataArr){
    var a=dataArr;
    var backArr=[];
     console.log("in outputTranslate:-------------3333-------------");
     console.log("a.length:"+a.length);
     console.log(a);   /* */

    for(var i=0;i< a.length;i++){
        backArr.push({
            No:i,
            total:a[i].items.length,
            dicoms:[],
            suid:a[i].CSeriesID
        });
         console.log("a[i].items.length:"+a[i].items.length); /**/
        for(var j=0;j<a[i].items.length;j++){//插入序列的原始信息
            //dicom文件对象原始信息--后台给的
            var o=a[i].items[j];
            /* ;*/ console.log("a[i].items[j]===================");
             console.log(o);
            urlFlawArr.push(o.czip);//数据解冻 如果这里添加，就无论是否解冻都会提示
            var spaces=infoFormat(o.CSpace);//貌似是ruler用
            var cutInfo=infoFormat(o.CRect);
            var size = parseInt(o.ICol)*parseInt(o.IRow);//判断宽高大致推算大小
            var oriInfo={
                cutPoint:!cutInfo?undefined:[parseInt(cutInfo[1]),parseInt(cutInfo[0])],//0行 1列 即 0y 1x
                iw:!cutInfo?undefined:parseInt(cutInfo[2]),
                ih:!cutInfo?undefined:parseInt(cutInfo[3]),
                seriesNo : i,
                No : j,
                iCol: parseInt(o.ICol),
                iRow:parseInt(o.IRow),
                preview:o.jpg,
                rulerX:!spaces?undefined:spaces[0],
                rulerY:!spaces?undefined:spaces[1],
                wl: parseInt(o.IWL),
                ww:parseInt(o.IWW),
                maxCt:(parseInt(o.IWL)+parseInt(o.IWW)/2),//最大的用于判断用什么类型装数
                dTime: o.dsj,
                age: o.age,
                sex: o.csex,
                studynum:o.tre,//studynum sj add
                CPName: o.cpname,
                CHos:o.chos,
                CLocalStr: o.CLocalStr,
                CVec: o.CVec,//这个格式有两种，貌似都没什么用//cvec就是locStr后面一坨
                CModality:o.cmodality,//MR 类型
                CImageType:o.CImageType,
                CThick:o.CThick,//切片厚度
                CTre: o.CTre,
                CDes:o.cdes,//部位？
                theUrl:o.czip?o.czip:'',
                ISNum:o.ISNum,
                IQNum:o.IQNum,
                IINum:parseInt(o.IINum),
                INum:o.INum,
                CRGB:o.CRGB,
                CBZ: o.CBZ? o.CBZ:'',
                imageId: o.cimageid
            };
            backArr[i].dicoms.push(oriInfo);
        }
    }
    /* console.log("backArr===================");
     console.log(backArr); */
    return backArr;
}
function outputTranslateEdu(dataArr){
    var a=dataArr;
    var backArr=[];
    for(var i=0;i< a.length;i++){
        backArr.push({
            No:i,
            total:a[i].items.length,
            dicoms:[],
            suid:a[i].CSeriesID
        });
        for(var j=0;j<a[i].items.length;j++){//插入序列的原始信息
            //dicom文件对象原始信息--后台给的
            var o=a[i].items[j];
            var oriInfo={
                seriesNo : i,
                No : j,
                theUrl:o.URL?o.URL:'',
                seriesId: o.SeriesID,
                imageId: o.ImageID
            };
            backArr[i].dicoms.push(oriInfo);
        }
    }
    return backArr;
}

function searchBackInfo(imageId){
    var obj;
    _.each(dvStruct.outputSeriesArr,function(o){
        var re =_.find(o.dicoms,function(oo){
           return oo.imageId==imageId;
        });
        if(re){
            obj = re;return false;
        }
    });
    return obj;
}