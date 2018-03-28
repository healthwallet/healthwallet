/**
 * Created by admin on 2016/3/30.
 */
var dvStruct = dvStruct||{};
dvStruct.fun = dvStruct.fun||{};
//
var synchronizer = new cornerstoneTools.Synchronizer("CornerstoneNewImage", cornerstoneTools.updateImageSynchronizer);
dvStruct.fun.enableReferenceLines  = function(element){
    cornerstoneTools.referenceLines.tool.enable(element,synchronizer);
}
dvStruct.fun.disableReferenceLines  = function(element){
    cornerstoneTools.referenceLines.tool.disable(element,synchronizer);
}
//初始化对象
dvStruct.fun.elementIni = function(element,win){
    cornerstoneTools.mouseInput.enable(element);//这个判定我还自己做了一遍，也是醉了
    //cornerstoneTools.mouseWheelInput.enable(element);//结合伪彩有问题貌似
    //cornerstoneTools.stackScrollWheel.activate(element);
    // Enable all tools we want to use with this element
    //cornerstoneTools.wwwc.activate(element, 1); // ww/wc is the default tool for left mouse button
    //cornerstoneTools.pan.activate(element, 2); // pan is the default tool for middle mouse button
    //cornerstoneTools.zoom.activate(element, 4); // zoom is the default tool for right mouse button
    //cornerstoneTools.zoomWheel.activate(element); // zoom is the default tool for middle mouse wheel
    cornerstoneTools.wwwc.enable(element);
    cornerstoneTools.pan.enable(element);
    cornerstoneTools.zoom.enable(element);
    cornerstoneTools.probe.enable(element);
    cornerstoneTools.probeUnSave.enable(element);
    cornerstoneTools.length.enable(element);
    cornerstoneTools.twolines.enable(element);
    cornerstoneTools.ellipticalRoi.enable(element);
    cornerstoneTools.rectangleRoi.enable(element);
    cornerstoneTools.angle.enable(element);
    cornerstoneTools.rotate.enable(element);
    //定位线
    synchronizer.add(element);//这里改写过，
    //cornerstoneTools.referenceLines.tool.enable(element, synchronizer);
    //同步
    if(win){
        win.synchronizerWWWC.add(element);
        win.synchronizerZoomPan.add(element);
        //win.synchronizerRotate.add(element);
    }
};
dvStruct.fun.removeSync = function(win,element){
    synchronizer.remove(element);
    win.synchronizerWWWC.remove(element);
    win.synchronizerZoomPan.remove(element);
}

function setAllEle(callbackFun){
    dvStruct.viewer.eachElement({
        callback:function(element,wrapper){
            try {
                var img = cornerstone.getImage(element);
                if(_.isObject(img))
                {
                    callbackFun(element);
                }
            }catch(e){console.error(e);}
        }
    });
}

//找鼠标位置，不在图窗返回undefined
dvStruct.whereIsMouse = undefined;
dvStruct.init=dvStruct.init||{};
dvStruct.init.checkMouseOnViewpoint = function(){
    var $node = $(dvStruct.container).find('.js-imageViewer');
    $node.on('mousemove',function(e){
        var x = e.pageX,y= e.pageY;
        var vArea = $(dvStruct.container).find('.js-imageViewer');
        var ofs = $(vArea).offset();
        //计算鼠标所在行列
        var cols = Math.ceil((x - ofs.left)/dvStruct.viewer.eachW);
        var rows = Math.ceil((y - ofs.top)/dvStruct.viewer.eachH);
        if(cols<=0||cols>dvStruct.viewer.col||rows<=0||rows>dvStruct.viewer.row){
            dvStruct.whereIsMouse = undefined;
        }else{
            var No = dvStruct.viewer.col * (rows-1) + cols -1;
            dvStruct.whereIsMouse =  dvStruct.viewer.getWinByNo(No);
        }
    });
    $node.on('mouseleave',function(e){
        dvStruct.whereIsMouse = undefined;
    });
}

//翻页---------------规则参考chafey，鼠标在那上面就翻页上面的
dvStruct.fun.nextPage = function(){
    if(dvStruct.viewer.scrollAll){
        var arr = dvStruct.viewer.winArr;
        var len = dvStruct.viewer.col*dvStruct.viewer.row;
        for(var i=0;i<len;i++){
            dvStruct.fun.elementPaging(arr[i]);
        }
    }else{
        var win =  dvStruct.whereIsMouse;
        dvStruct.fun.elementPaging(win);
        dvStruct.fun.synPagingCheck(win);
    }
}
dvStruct.fun.prevPage = function(){
    if(dvStruct.viewer.scrollAll){
        var arr = dvStruct.viewer.winArr;
        var len = dvStruct.viewer.col*dvStruct.viewer.row;
        for(var i=0;i<len;i++){
            dvStruct.fun.elementPaging(arr[i],'prev');
        }
    }else{
        var win =  dvStruct.whereIsMouse;
        dvStruct.fun.elementPaging(win,'prev');
        dvStruct.fun.synPagingCheck(win);
    }
}
dvStruct.fun.elementPaging = function(win,type){
    if(_.isObject(win)){
        for(var i=0;i<win.col*win.row;i++){
            var wrapper = win.wrappers[i];
            var stack = wrapper.stack;
            var len = stack.imageIds.length;
            if(len>0){
                if(type=='prev'){
                    if(stack.currentImageIdIndex<=0){
                        stack.currentImageIdIndex = len-1;
                    }else{
                        stack.currentImageIdIndex--;
                    }
                }else{
                    if(stack.currentImageIdIndex<len-1){
                        stack.currentImageIdIndex++;
                    }else{
                        stack.currentImageIdIndex=0;
                    }
                }

                var imageId = stack.imageIds[stack.currentImageIdIndex];
                cornerstone.loadImage(imageId).then(function(image){
                    cornerstone.displayImage(wrapper.element, image);
                });
            }
        }
    }
}
dvStruct.fun.synPagingCheck = function(win){
    if(dvStruct.synposition.enable){
        var wrapper = win.wrappers[0];
        var stack = wrapper.stack;
        var imageId = stack.imageIds[stack.currentImageIdIndex];
        dvStruct.synposition.findAndSyn(imageId,wrapper);
    }
}

//播放 ---------- 规则参考chafey，简单粗暴
dvStruct.playSpeed = 10;//framesPerSecond       1000/framesPerSecond
dvStruct.isplaying=false;
dvStruct.savedPlaying = [];//改变速度的时候的缓存   -------  实际上暂时并没用
dvStruct.fun.play = function(useSave){
    if(useSave&&dvStruct.savedPlaying.length>0){
        for(var i=0;i<dvStruct.savedPlaying.length;i++){
            cornerstoneTools.diy.winPlayClip(dvStruct.savedPlaying[i],dvStruct.playSpeed);
        }
    }else{
        var checkedWin  = dvStruct.viewer.getCheckedWin();
        if(checkedWin){
            //播放也是序列内部联动的
            cornerstoneTools.diy.winPlayClip(checkedWin,dvStruct.playSpeed);//自写函数
            dvStruct.savedPlaying.push(checkedWin);
        }else{
            var arr = dvStruct.viewer.winArr;
            var len = dvStruct.viewer.col*dvStruct.viewer.row;
            for(var i=0;i<len;i++){
                cornerstoneTools.diy.winPlayClip(arr[i],dvStruct.playSpeed);
                dvStruct.savedPlaying.push(arr[i]);
            }
        }
    }
    dvStruct.isplaying=true;
}
//-----停止----没啥好想的，全部停止 -------  方便 --------免得改布局的时候还要各种判断
dvStruct.fun.stop = function(notCancelSave){
    var arr = dvStruct.viewer.winArr;
    var len = dvStruct.viewer.col*dvStruct.viewer.row;
    for(var i=0;i<len;i++){
        cornerstoneTools.diy.winStopClip(arr[i]);
    }
    dvStruct.isplaying=false;
    if(!!!notCancelSave){
        dvStruct.savedPlaying = [];
    }
}
//----------------------------------------
//目前还只有全部反显
dvStruct.fun.invert = function(){
    var checkedWin  = dvStruct.viewer.getCheckedWin();
    if(checkedWin){
        //反显只有一个就是了
        var wrapper = checkedWin.wrappers[0];
        if(wrapper.stack.imageIds.length>0){
            dvStruct.fun.invertEle(wrapper.element);
        }
    }else{
        var arr = dvStruct.viewer.winArr;
        var len = dvStruct.viewer.col*dvStruct.viewer.row;
        for(var i=0;i<len;i++){
            //有联动
            var wrapper = arr[i].wrappers[0];
            if(wrapper.stack.imageIds.length>0){
                dvStruct.fun.invertEle(wrapper.element);
            }
        }
    }
}

dvStruct.fun.invertEle = function(element){
    var viewport = cornerstone.getViewport(element);
    if(viewport){
        if (viewport.invert === true) {
            viewport.invert = false;
        } else {
            viewport.invert = true;
        }
        cornerstone.setViewport(element , viewport);
    }
}

dvStruct.fun.fake = function(){
    var checkedWin  = dvStruct.viewer.getCheckedWin();
    if(checkedWin){
        var len = checkedWin.wrappers.length;
        for(var i=0;i<len;i++){
            var wrapper = checkedWin.wrappers[i];
            if(wrapper.stack.imageIds.length>0){
                dvStruct.fun.fakeEle(wrapper.element);
            }
        }
    }else{
        var arr = dvStruct.viewer.winArr;
        var len = dvStruct.viewer.col*dvStruct.viewer.row;
        for(var i=0;i<len;i++){
            for(var j=0;j<arr[i].wrappers.length;j++){
                var wrapper = arr[i].wrappers[j];
                if(wrapper.stack.imageIds.length>0){
                    dvStruct.fun.fakeEle(wrapper.element);
                }
            }
        }
    }
}

dvStruct.fun.reset = function(){
    var checkedWin  = dvStruct.viewer.getCheckedWin();
    if(!!checkedWin){
        var len = checkedWin.wrappers.length;
        for(var i=0;i<len;i++){
            var wrapper = checkedWin.wrappers[i];
            if(wrapper.stack.imageIds.length>0){
                cornerstone.reset(wrapper.element);
            }
        }
    }else{
        var arr = dvStruct.viewer.winArr;
        var len = dvStruct.viewer.col*dvStruct.viewer.row;
        for(var i=0;i<len;i++){
            for(var j=0;j<arr[i].wrappers.length;j++){
                var wrapper = arr[i].wrappers[j];
                if(wrapper.stack.imageIds.length>0){
                    cornerstone.reset(wrapper.element);
                }
            }
        }
    }
}

dvStruct.fun.wwwc = function(ww,wc){
    var checkedWin  = dvStruct.viewer.getCheckedWin();
    if(checkedWin){
        var len = checkedWin.wrappers.length;
        for(var i=0;i<len;i++){
            var wrapper = checkedWin.wrappers[i];
            if(wrapper.stack.imageIds.length>0){
                var viewport = cornerstone.getViewport(wrapper.element);
                viewport.voi.windowWidth = ww;
                viewport.voi.windowCenter = wc;
                cornerstone.setViewport(wrapper.element, viewport);
            }
        }
    }else{
        var arr = dvStruct.viewer.winArr;
        var len = dvStruct.viewer.col*dvStruct.viewer.row;
        for(var i=0;i<len;i++){
            for(var j=0;j<arr[i].wrappers.length;j++){
                var wrapper = arr[i].wrappers[j];
                if(wrapper.stack.imageIds.length>0){
                    var viewport = cornerstone.getViewport(wrapper.element);
                    viewport.voi.windowWidth = ww;
                    viewport.voi.windowCenter = wc;
                    cornerstone.setViewport(wrapper.element, viewport);
                }
            }
        }
    }
}

dvStruct.fun.fakeEle = function(element){
    var viewport = cornerstone.getViewport(element);
    if(viewport){console.log(viewport.fakeColor );
        if (viewport.fakeColor === true) {
            viewport.fakeColor = 'printBack';
        } else {
            viewport.fakeColor = true;
        }
        cornerstone.setViewport(element , viewport);
    }
}

//dvStruct.fun.delLastMeasurement = function(){
//    var checkedWin  = dvStruct.viewer.getCheckedWin();
//    if(checkedWin){
//        var wrapper = checkedWin.wrappers[0];
//        if(wrapper.stack.imageIds.length>1){
//            cornerstoneTools.delLastMeasurement(wrapper.element,'length');
//            cornerstone.updateImage(wrapper.element);
//        }
//    }
//}
dvStruct.fun.clearToolState = function(){
    var checkedWin  = dvStruct.viewer.getCheckedWin();
    if(checkedWin){
        var len = checkedWin.wrappers.length;
        for(var i=0;i<len;i++){
            var wrapper = checkedWin.wrappers[i];
            if(wrapper.stack.imageIds.length>0){
                var element =wrapper.element;
                try{
                    cornerstoneTools.clearToolState(element, "length");
                    cornerstoneTools.clearToolState(element, "probe");
                    cornerstoneTools.clearToolState(element, "rectangleRoi");
                    cornerstoneTools.clearToolState(element, "ellipticalRoi");
                    cornerstoneTools.clearToolState(element, "length");
                    cornerstoneTools.clearToolState(element, "angle");
                    cornerstoneTools.clearToolState(element, "twolines");
                }catch(e){
                    console.error(e);
                }
                cornerstone.updateImage(element);
            }
        }
    }
}

//旋转---------cornerstione的作者的设计，是带不了旋转的，旋转只能90度转，画线才没得问题
dvStruct.fun.rotate = function(){
    var checkedWin  = dvStruct.viewer.getCheckedWin();
    if(checkedWin){
        var len = checkedWin.wrappers.length;
        for(var i=0;i<len;i++){
            var wrapper = checkedWin.wrappers[i];
            if(wrapper.stack.imageIds.length>0){
                var viewport = cornerstone.getViewport(wrapper.element);
                viewport.rotation=(viewport.rotation+90)%360;
                cornerstone.setViewport(wrapper.element , viewport);
            }
        }
    }else{
        var arr = dvStruct.viewer.winArr;
        var len = dvStruct.viewer.col*dvStruct.viewer.row;
        for(var i=0;i<len;i++){
            for(var j=0;j<arr[i].wrappers.length;j++){
                var wrapper = arr[i].wrappers[j];
                if(wrapper.stack.imageIds.length>0){
                    var viewport = cornerstone.getViewport(wrapper.element);
                    viewport.rotation=(viewport.rotation+90)%360;
                    cornerstone.setViewport(wrapper.element , viewport);
                }
            }
        }
    }
}

//sj add
//旋转---------cornerstione的作者的设计，是带不了旋转的，旋转只能90度转，画线才没得问题
dvStruct.fun.rotate2 = function(){
    var checkedWin  = dvStruct.viewer.getCheckedWin();
    if(checkedWin){
        var len = checkedWin.wrappers.length;
        for(var i=0;i<len;i++){
            var wrapper = checkedWin.wrappers[i];
            if(wrapper.stack.imageIds.length>0){
                var viewport = cornerstone.getViewport(wrapper.element);
                viewport.rotation=(viewport.rotation+90)%360;
                cornerstone.setViewport(wrapper.element , viewport);
            }
        }
    }else{
        var arr = dvStruct.viewer.winArr;
        var len = dvStruct.viewer.col*dvStruct.viewer.row;
        for(var i=0;i<len;i++){
            for(var j=0;j<arr[i].wrappers.length;j++){
                var wrapper = arr[i].wrappers[j];
                if(wrapper.stack.imageIds.length>0){
                    var viewport = cornerstone.getViewport(wrapper.element);
                    viewport.rotation=(viewport.rotation-90)%360;//左旋
                    cornerstone.setViewport(wrapper.element , viewport);
                }
            }
        }
    }
}
//sj add end
//----------翻转---------------------------------
dvStruct.fun.rev = function(direct){
    var direct = direct||'h';
    var checkedWin  = dvStruct.viewer.getCheckedWin();
    if(checkedWin){
        var len = checkedWin.wrappers.length;
        for(var i=0;i<len;i++){
            var wrapper = checkedWin.wrappers[i];
            if(wrapper.stack.imageIds.length>0){
                var viewport = cornerstone.getViewport(wrapper.element);
                if(direct=='h') {
                    viewport.hflip = !viewport.hflip;
                }else{
                    viewport.vflip = !viewport.vflip;
                }
                cornerstone.setViewport(wrapper.element , viewport);
            }
        }
    }else{
        var arr = dvStruct.viewer.winArr;
        var len = dvStruct.viewer.col*dvStruct.viewer.row;
        for(var i=0;i<len;i++){
            for(var j=0;j<arr[i].wrappers.length;j++){
                var wrapper = arr[i].wrappers[j];
                if(wrapper.stack.imageIds.length>0){
                    var viewport = cornerstone.getViewport(wrapper.element);
                    if(direct=='h') {
                        viewport.hflip = !viewport.hflip;
                    }else{
                        viewport.vflip = !viewport.vflip;
                    }
                    cornerstone.setViewport(wrapper.element , viewport);
                }
            }
        }
    }
};