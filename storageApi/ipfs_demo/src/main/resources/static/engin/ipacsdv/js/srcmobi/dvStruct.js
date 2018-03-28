/**
 * Created by admin on 2016/3/25.
 */
if(!dvStruct){
    var dvStruct = {};
}
//promise缓存---原始的
dvStruct.imgObjArr = [];
//html大容器
dvStruct.container = undefined;
//图像数据
dvStruct.seriesArr = [];
dvStruct.insertSeries = function(newS){
    if(dvStruct.seriesArr.length==0){dvStruct.seriesArr.push(newS);
        return;}
    for(var i=0;i<dvStruct.seriesArr.length;i++){
        //字典不比后面大就插前面
        if(!firstIsBigger(newS.suid,dvStruct.seriesArr[i].suid)){
            dvStruct.seriesArr.splice(i, 0, newS);
            return;
        }
    }
    //没有可插的就加后面
    dvStruct.seriesArr.push(newS);
}
//添加序列
dvStruct.addSeries = function(suid,dicomCoverted){
    //这是在已经检查过series的存在之后
    var newS = {
        suid:suid,
        dicomArr:[]
    };
    dvStruct.insertSeries(newS);
    //添加第一个对象
    newS.dicomArr.push(dicomCoverted);
    commEventHandler.fireEvent({type:'dicomSeriesAdded',suid:suid,dicomCoverted:dicomCoverted});
    return newS;
}
dvStruct.dicomInsert = function(series,dicomCoverted){
    if(series.dicomArr.length==0){series.dicomArr.push(dicomCoverted);
        commEventHandler.fireEvent({type:'dicomAddedPush',series:series,dicomCoverted:dicomCoverted});
        return;}
    for(var i=0;i<series.dicomArr.length;i++){
        //字典不比后面大就插前面
        if(parseInt(dicomCoverted.iid)<parseInt(series.dicomArr[i].iid)){
            series.dicomArr.splice(i, 0, dicomCoverted);
            commEventHandler.fireEvent({type:'dicomAddedSplice',series:series,dicomCoverted:dicomCoverted,i:i});
            return;
        }
    }
    //没有可插的就加后面
    series.dicomArr.push(dicomCoverted);
    commEventHandler.fireEvent({type:'dicomAddedPush',series:series,dicomCoverted:dicomCoverted});
}
dvStruct.addDicom = function(dicomCoverted){
    var suid = dicomCoverted.infoSet.UIDS.SeriesUID.val;
    var series = dvStruct.findSeries(suid);
    if(series){
        dvStruct.dicomInsert(series,dicomCoverted);
    }else{
        series = dvStruct.addSeries(suid,dicomCoverted);
    }
    //console.log(series);
    //触发事件
    commEventHandler.fireEvent({type:'dicomAdded',suid:suid,dicomCoverted:dicomCoverted,series:series});
}
dvStruct.findSeries = function(seriesUid){
    return _.find(dvStruct.seriesArr,function(o){
        return o.suid == seriesUid;
    });
}
dvStruct.countSNo = function(seriesUid){
    var No=0;
    var re= _.find(dvStruct.seriesArr,function(o){
        No++;
        return o.suid == seriesUid;
    });
    return No;
}
dvStruct.findOriInfoByIds = function(imageId,suid){
    var s = dvStruct.findSeries(suid);
    if(!_.isUndefined(s)){
        var arr = s.dicomArr;
        var re = _.find(arr,function(o){
            return o.imageId == imageId;
        });
        if(!_.isUndefined(re)){
            return re.infoSet
        }
    }
    return undefined;
}