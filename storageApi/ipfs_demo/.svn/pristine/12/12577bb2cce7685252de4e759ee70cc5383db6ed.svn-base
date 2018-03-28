/**
 * Created by admin on 2016/3/28.
 */
//-------------------------//也不是所有的都在这里面，形成闭环的，再各自文件
//suid dicomCoverted
commEventHandler.addEventListener('dicomAdded',function(event){
    var node;
    var iid = event.series.dicomArr[0].iid;
    var imageId = event.series.dicomArr[0].imageId;
    $(dvStruct.container).find('.imgGallery .img').each(function(){
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
    $(dvStruct.container).find('.imgGallery .img').each(function(){
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
commEventHandler.addEventListener('dicomAddedPush',function(event){//alert('dicomAddedPush');
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
commEventHandler.addEventListener('dicomAddedSplice',function(event){//alert('dicomAddedSplice');
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
if(!dvStruct){
    var dvStruct={};
}
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
    var tmp = get_dicom_imgViewer_templates('preview');
    var id = guid(8,'gallery');
    var imageId = event.dicomCoverted.imageId;
    var iid =  event.dicomCoverted.iid;
    if($(dvStruct.container).find('.imgGallery .js-imgBox').length==0){
        $(dvStruct.container).find('.imgGallery .js-gallery').append(tmp({
            id:id,suid:event.suid,imageId:imageId,iid:iid,sNo:event.sNo
        }));
    }else{
        var done = false;
        $(dvStruct.container).find('.imgGallery .js-imgBox').each(function(){
            var suid = $(this).find('.img').attr('suid');
            if(!firstIsBigger(event.suid,suid)){
                $(this).before(tmp({
                    id:id,suid:event.suid,imageId:imageId,iid:iid
                }));
                done=true;return false;
            }
        });
        if(!done){
            $(dvStruct.container).find('.imgGallery .js-gallery').append(tmp({
                id:id,suid:event.suid,imageId:imageId,iid:iid
            }));
        }
    }
    var ele = $(dvStruct.container).find('#'+id).get(0);
    //绘制小图
    cornerstone.enable(ele);
    cornerstone.loadImage(imageId).then(function(image) {console.log('dicomSeriesAdded:',image);
        cornerstone.displayImage(ele, image);
    });
    //检查是否有需要绑定的
    checkAndBind(event.suid);
    //序列号的添加/修改
   // console.time('testt');
    $(dvStruct.container).find('.imgGallery').find('.js-imgBox').each(function(){
        var suid = $(this).find('.img').attr('suid');
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

commEventHandler.addEventListener('bindImage',function(event){
    event.eleObj.imageId = event.imageId; reDrawEle(event.eleObj);
});