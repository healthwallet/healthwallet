/**
 * Created by admin on 2016/6/13.
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
        sNo:dicomCoverted.infoSet.SeriesInfo.SeriesNo.val,//sNo --- 不用这个排   还是suid --- 时间
        dicomArr:[],
        sideImageIds:[]
    };
    newS.sideImageIds.push({
        farsideImageId:dicomCoverted.imageId
        ,nearsideImageId:dicomCoverted.imageId
    });
    //初始化offset(算距离的时候消除整个序列相对原点的偏移)  这里还不能直接赋值，因为序列就位了dicom没就位还
    newS.offset = undefined;
    //把新的序列排序插入
    dvStruct.insertSeries(newS);
    //添加第一个对象
    newS.dicomArr.push(dicomCoverted);
    //触发新序列添加事件
    commEventHandler.fireEvent({type:'dicomSeriesAdded',suid:suid,sNo:newS.sNo,dicomCoverted:dicomCoverted});
    return newS;
}
dvStruct.dicomInsert = function(series,dicomCoverted){
    if(series.dicomArr.length==0){
        series.dicomArr.push(dicomCoverted);
        commEventHandler.fireEvent({type:'dicomAddedPush',series:series,dicomCoverted:dicomCoverted});
        return;}
    for(var i=0;i<series.dicomArr.length;i++){//series.dicomArr.length 是动态的！！！所以前面return弄丢会出现循环 danm！
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
dvStruct.addDicom = function(dicomCoverted,infoAfterAnalysised){
    var suid = dicomCoverted.infoSet.UIDS.SeriesUID.val;
    infoAfterAnalysised.suid = suid;//传参给文件
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
dvStruct.findSeriesByElement = function(element){
    var winId = $(element).parents('.seriesWindow:first').attr('id');

    var w = _.find(dvStruct.viewer.winArr,function(w){
        return w.winId == winId ;
    });
    if(!_.isUndefined(w)){
        var suid = w.wrappers[0].suid;
        var s = dvStruct.findSeries(suid);
        /*console.log("pcssssssssssssssssssssssssss");
        console.log(s);*/
        return s;
    }
    return undefined;
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
dvStruct.findOriInfoOnlyByOriId = function(imageId){
    for(var i=0;i<dvStruct.seriesArr.length;i++){
        var s = dvStruct.seriesArr[i];
        if(!_.isUndefined(s)){
            var arr = s.dicomArr;
            var re = _.find(arr,function(o){
                return o.imageId == imageId;
            });
            if(!_.isUndefined(re)){
                return re.infoSet
            }
        }
    }
    return undefined;
}

//----------------eventHandler

commEventHandler.addEventListener('dicomAdded',function(event){
    //-------------位置信息相关-------------------------
    var newSourceImagePlane = cornerstoneTools.metaData.get('imagePlane', event.dicomCoverted.imageId);
    var newPosition = newSourceImagePlane.imagePositionPatient;
    var newSourceImageNormal = newSourceImagePlane.rowCosines.clone().cross(newSourceImagePlane.columnCosines);
    var seeked = false;
    for(var i=0;i<event.series.sideImageIds.length;i++){
        var sides = event.series.sideImageIds[i];
        var farplane =  cornerstoneTools.metaData.get('imagePlane', sides.farsideImageId);
        var farplaneNormal = farplane.rowCosines.clone().cross(farplane.columnCosines);
        var angleInRadians = newSourceImageNormal.angleTo(farplaneNormal);
        angleInRadians = Math.abs(angleInRadians);
        //判断平行
        if (angleInRadians < 0.1) { // 0.5 radians = ~30 degrees  0.1弧度(rad)=5.729578度(°)  还真的有乱拍的，就是不知道这个图。。。留什么好
            seeked = true;
            //算离原点最远的一面以及离这一面最远的一面
            var farpos =  farplane.imagePositionPatient;
            var farmore =  dvStruct.vo.farsideCal(farpos,newPosition);
            console.log(newPosition,farpos,farmore,dvStruct.vo.notSame(farpos,farmore));
            if(dvStruct.vo.notSame(farpos,farmore)){
                sides.farsideImageId = event.dicomCoverted.imageId;
            }else{
                var nearpos =  dvStruct.vo.getPositionById(sides.nearsideImageId);
                if(dvStruct.vo.calDistanceSquared([nearpos,farpos])<dvStruct.vo.calDistanceSquared([newPosition,farpos])){
                    sides.nearsideImageId = event.dicomCoverted.imageId;
                }
            }
            break;
        }
    }
    if(!seeked){
        event.series.sideImageIds.push({
            farsideImageId:event.dicomCoverted.imageId,
            nearsideImageId:event.dicomCoverted.imageId
        });
    }

    //算偏移
    //if(!!!event.series.offset){
    //    event.series.offset = dvStruct.vo.getPositionById(event.dicomCoverted.imageId)
    //}else{
    //    var oldOfs = event.series.offset;
    //    var nearly = dvStruct.vo.nearToOrigin(oldOfs,newPosition);
    //    if(dvStruct.vo.notSame(nearly,oldOfs)){
    //        event.series.offset = nearly;
    //        //这里可以发个事件
    //    }
    //}

    //其它
    var node;
    var iid = event.series.dicomArr[0].iid;
    var imageId = event.series.dicomArr[0].imageId;
    $(dvStruct.container).find('.leftGallery .img').each(function(){
        if($(this).attr('suid')==event.suid){
            var s = dvStruct.findSeries(event.suid);
            if(!_.isUndefined(s)){
                var num = s.dicomArr.length;
                $(this).parent().find('.total').text(num);
            }
            return false;
        }
    });console.log(event.dicomCoverted);
    //查左边序列是否要更新
    $(dvStruct.container).find('.leftGallery .img').each(function(){
        if($(this).attr('suid')==event.suid){
            var theiid = $(this).attr('iid');
            if(parseInt(iid)<parseInt(theiid)){
                var ele = $(this).get(0);
                var enableEle = cornerstone.getEnabledElement(ele);enableEle.viewport=undefined;
                cornerstone.loadImage(imageId).then(function(image) {
                    cornerstone.displayImage(ele, image);
                });
            }
        }
    });
});

function updateTotalImgNo(win){
    for(var i=0;i<win.wrappers.length;i++){
        var wrapper = win.wrappers[i];
        var len = wrapper.stack.imageIds.length;
        if(len>0){
            var wrapperBox = $(wrapper.element).parent();
            $(wrapperBox).find('.js-info-totalNo').text('/'+len);
        }
    }
}
//以push的方式同步插入到窗体
commEventHandler.addEventListener('dicomAddedPush',function(event){if(dvStruct.showHander)console.log('dicomAddedPush');
    ////同步到窗体-------窗体内的数字更新就暂时不加了(懒得加)（要改，1把总数提出来 单独，2，在这里改总数）
    var dataSet = event.dicomCoverted.dataSet;
    for(var i=0;i<dvStruct.viewer.col*dvStruct.viewer.row;i++){
        var win  = dvStruct.viewer.winArr[i];//console.log(win);
        if(win.wrappers[0].suid == event.series.suid){
            var newImgObj =   createNewImageObject(dataSet,'series:'+win.winId+':'+event.series.suid);
            var newImgId =  event.dicomCoverted.imageId;
            newImgObj.bindOriImageId = newImgId;//这个用来获取对应的原始信息
            win.imgObjArr.push(newImgObj);
            //用的是同一个数组
            var wrapper = win.wrappers[0];
            if(wrapper.stack.imageIds.length>0){
                wrapper.stack.imageIds.push(newImgObj.imageId);
                //至于N*N这个。。。
                var len =wrapper.stack.imageIds.length;
                if(len>1&&len<=win.col*win.row){
                    var wrapChange = win.wrappers[len-1]; var lastWrapper = win.wrappers[len-2];
                    var enabledElement = cornerstone.getEnabledElement(wrapChange.element);
                    wrapChange.stack.imageIds = wrapper.stack.imageIds;
                    wrapChange.stack.currentImageIdIndex = lastWrapper.stack.currentImageIdIndex+1>=len?0:lastWrapper.stack.currentImageIdIndex+1;
                    //清空信息----放前面
                    dvStruct.viewer.emptyInfo(wrapChange);
                    //清掉viewport之后它才会重画
                    enabledElement.viewport = undefined;//console.log(enabledElement);
                    reDrawWrapper(wrapChange);
                    dvStruct.fun.elementIni(wrapChange.element,win);
                    dvStruct.fun.checkAndSetActive(wrapChange.element);
                    //添加信息
                    dvStruct.viewer.fillInfo(wrapChange);//console.log(wrapper);
                }
                //把图片总数更新了
                updateTotalImgNo(win);
            }
        }
    }
});
//以splice的形式插入
commEventHandler.addEventListener('dicomAddedSplice',function(event){if(dvStruct.showHander)console.log('dicomAddedSplice');
    var dataSet = event.dicomCoverted.dataSet;
    var insertIndex = event.i;
    for(var i=0;i<dvStruct.viewer.col*dvStruct.viewer.row;i++) {
        var win = dvStruct.viewer.winArr[i];
        if (win.wrappers[0].suid == event.series.suid) {
            //创建对象
            var newImgObj =   createNewImageObject(dataSet,'series:'+win.winId+':'+event.series.suid);
            var newImgId =  event.dicomCoverted.imageId;
            newImgObj.bindOriImageId = newImgId;
            //obj插入
            win.imgObjArr.splice(i,0,newImgObj);
            var wrapper = win.wrappers[0];
            if(wrapper.stack.imageIds.length>0){
                //id插入
                wrapper.stack.imageIds.splice(insertIndex,0,newImgObj.imageId);//由于是通的，共用一个数组的引用，所以就这样了
                //图未全的时候
                var  len =wrapper.stack.imageIds.length;
                if(len>1&&len<=win.col*win.row){
                    for(var j=0;j<len;j++){
                        var wp = win.wrappers[j];
                        var enabledElement = cornerstone.getEnabledElement(wp.element);
                        if(j==len-1){
                            //新出一个图像
                            var lastWrapper = win.wrappers[len-2];
                            wp.stack.imageIds = wrapper.stack.imageIds;
                            wp.stack.currentImageIdIndex = lastWrapper.stack.currentImageIdIndex+1>=len?0:lastWrapper.stack.currentImageIdIndex+1;
                            //清空信息----放前面
                            dvStruct.viewer.emptyInfo(wp);
                            //清掉viewport之后它才会重画
                            enabledElement.viewport = undefined;//console.log(enabledElement);
                            reDrawWrapper(wp);
                            dvStruct.fun.elementIni(wp.element,win);
                            dvStruct.fun.checkAndSetActive(wp.element);
                            //添加信息
                            dvStruct.viewer.fillInfo(wp);//console.log(wrapper);
                        }else{//console.log(wp.stack.currentImageIdIndex,insertIndex);
                            if(wp.stack.currentImageIdIndex >= insertIndex){
                                reDrawWrapper(wp);
                            }
                        }
                    }
                }else if(len>=win.col*win.row){
                    for(var j=0;j<win.col*win.row;j++){
                        var wp = win.wrappers[j];
                        var enabledElement = cornerstone.getEnabledElement(wp.element);
                        if(wp.stack.currentImageIdIndex >= insertIndex){
                            reDrawWrapper(wp);
                        }
                    }
                }
                updateTotalImgNo(win);
            }
        }
    }
});

//一开始等待绑定的窗口以及序列
dvStruct.waitingBind = [];
dvStruct.addWaitingBind = function(suid,win){dvStruct.waitingBind.push({suid:suid,win:win});}
var checkAndBind = function(suid){
    for(var i = 0;i<dvStruct.waitingBind.length;i++){
        if(dvStruct.waitingBind[i].suid == suid){
            //没有被绑才绑
            if(!dvStruct.waitingBind[i].win.wrappers[0].suid){
                dvStruct.viewer.bindSeries(dvStruct.waitingBind[i].win,suid);
            }
            //从等待绑定的序列中移除
            dvStruct.waitingBind.splice(i,1)
            break;
        }
    }
}

commEventHandler.addEventListener('dicomSeriesAdded',function(event){
    if(dvStruct.showHander)console.log('dicomSeriesAdded');
    var tmp = get_dicom_imgViewer_templates('preview');
    var id = guid(8,'gallery');
    var imageId = event.dicomCoverted.imageId;
    var iid =  event.dicomCoverted.iid;
    if($(dvStruct.container).find('.leftGallery .imgBox').length==0){
        $(dvStruct.container).find('.leftGallery').append(tmp({
            id:id,suid:event.suid,imageId:imageId,iid:iid,sNo:event.sNo
        }));
    }else{
        var done = false;
        $(dvStruct.container).find('.leftGallery .imgBox').each(function(){
            var suid = $(this).find('.img').attr('suid');
            if(!firstIsBigger(event.suid,suid)){
                $(this).before(tmp({
                    id:id,suid:event.suid,imageId:imageId,iid:iid
                }));
                done=true;return false;
            }
        });
        if(!done){
            $(dvStruct.container).find('.leftGallery').append(tmp({
                id:id,suid:event.suid,imageId:imageId,iid:iid
            }));
        }
    }
    var ele = $(dvStruct.container).find('#'+id).get(0);
    cornerstone.enable(ele);
    //小图要取消对scroll事件的限制，不然滚动条事件触发不了，这里hack一下(不是这里？？)
    cornerstoneTools.mouseWheelInput.disable(ele);$(ele).off('mousewheel DOMMouseScroll');
    //绘制小图
    cornerstone.loadImage(imageId).then(function(image) {console.log('dicomSeriesAdded:',image);
        cornerstone.displayImage(ele, image);
    });
    //检查是否有需要绑定的
    checkAndBind(event.suid);
    //序列号的添加/修改
    // console.time('testt');
    $(dvStruct.container).find('.leftGallery').find('.imgBox').each(function(){
        var suid = $(this).children('.img').attr('suid');
        $(this).find('.se').text('Se: '+dvStruct.countSNo(suid));
    });
    for(var i=0;i<dvStruct.viewer.maxCol*dvStruct.viewer.maxRow;i++) {
        var win = dvStruct.viewer.winArr[i];
        if (win&&win.wrappers[0].suid) {
            var no  = dvStruct.countSNo(win.wrappers[0].suid);
            for(var j=0;j<win.wrappers.length;j++){
                if(win.wrappers[j].stack.imageIds.length>0)
                    $(win.wrappers[j].element).parents('.viewportWrapper').find('.js-info-SeNo').text('Se: '+no);;
            }
        }
    }
    // console.timeEnd('testt');
});

function reDrawWrapper(wrapper){//console.log(wrapper);
    var imageId = wrapper.stack.imageIds[wrapper.stack.currentImageIdIndex];
    if(imageId){
        cornerstone.loadImage(imageId).then(function(image) {
            try {
                //if(type&&type=='forceIniRender')cornerstone.initializeGrayscaleRenderCanvas(image);
                cornerstone.displayImage(wrapper.element, image);
                //方位标签
                cornerstoneTools.orientationMarkers.enable(wrapper.element);
            }catch(e){
                console.error(e);//updateImage: image has not been loaded yet
                console.error(image,imageId,wrapper.element);
            }
        });
    }
}

commEventHandler.addEventListener('bindImage',function(event){if(dvStruct.showHander)console.log('bindImage');
    event.eleObj.imageId = event.imageId; reDrawEle(event.eleObj);
});

dvStruct.showHander = true;