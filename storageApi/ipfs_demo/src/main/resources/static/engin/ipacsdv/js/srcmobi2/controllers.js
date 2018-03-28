/**
 * Created by admin on 2016/3/30.
 */
var dvStruct = dvStruct||{};
dvStruct.fun = {};

//初始化对象
dvStruct.fun.elementIni = function(element,win){
    cornerstoneTools.touchInput.enable(element);
    cornerstoneTools.wwwcTouchDrag.activate(element);
    cornerstoneTools.zoomTouchPinch.activate(element);
   //cornerstoneTools.panMultiTouch.deactivate(element);
    cornerstoneTools.touchDragTool.deactivate(element);
};

function setAllEle(callbackFun){
    dvStruct.viewer.eachElement({
        callback:function(element,wrapper){
            try {
                var img = cornerstone.getImage(element);
                if(_.isObject(img))
                    callbackFun(element);
            }catch(e){console.error(e);}
        }
    });
}

//这个在disable或者初始ini之后
dvStruct.fun.checkAndSetActive = function(element){
    for(var i in dvStruct.viewer.btnStates){
        if(dvStruct.viewer.btnStates[i].enable){console.log(i);
            if(i=='referenceLines'){
                cornerstoneTools.referenceLines.tool.enable(element, synchronizer);
            }else{
                cornerstoneTools[i].activate(element, 1);
            }
        }else{
            if(i=='referenceLines'){
                cornerstoneTools.referenceLines.tool.disable(element, synchronizer);
            }else{
                cornerstoneTools[i].deactivate(element, 1);
            }
        }
    }
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
    }
}
dvStruct.fun.prevPage = function(){
    if(dvStruct.viewer.scrollAll){
        var arr = dvStruct.viewer.winArr;
        var len = dvStruct.viewer.col*dvStruct.viewer.row;
        for(var i=0;i<len;i++){
            dvStruct.fun.elementPaging(arr[i]);
        }
    }else{
        var win =  dvStruct.whereIsMouse;
        dvStruct.fun.elementPaging(win,'prev');
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

dvStruct.fun.clearToolState = function(){
    // var checkedWin  = dvStruct.viewer.getCheckedWin();
    checkedWin= dvStruct.viewer.winArr[0];
    if(checkedWin){
        var len = checkedWin.wrappers.length;
        for(var i=0;i<len;i++){
            var wrapper = checkedWin.wrappers[i];
            if(wrapper.stack.imageIds.length>0){
                var element =wrapper.element;
                cornerstoneTools.clearToolState(element, "length");
                cornerstoneTools.clearToolState(element, "probe");
                cornerstoneTools.clearToolState(element, "rectangleRoi");
                cornerstoneTools.clearToolState(element, "ellipticalRoi");
                cornerstoneTools.clearToolState(element, "length");
                cornerstoneTools.clearToolState(element, "angle");
                cornerstone.updateImage(element);
            }
        }
    }
}

dvStruct.fun.invert = function(){
    var arr = dvStruct.viewer.winArr;
    var wrapper = arr[0].wrappers[0];
    if(wrapper.stack.imageIds.length>0){
        dvStruct.fun.invertEle(wrapper.element);
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

//旋转---------cornerstione的作者的设计，是带不了旋转的，旋转只能90度转，画线才没得问题
dvStruct.fun.rotate = function(){
    var checkedWin  = dvStruct.viewer.winArr[0];
    var wrapper = checkedWin.wrappers[0];
    if(wrapper.stack.imageIds.length>0){
        var viewport = cornerstone.getViewport(wrapper.element);
        viewport.rotation=(viewport.rotation+90)%360;
        cornerstone.setViewport(wrapper.element , viewport);
    }
}


//播放 ---------- 规则参考chafey，简单粗暴
dvStruct.playSpeed = 10;//framesPerSecond       1000/framesPerSecond
dvStruct.isplaying=false;
dvStruct.fun.play = function(){
    var checkedWin  = dvStruct.viewer.getCheckedWin();
    if(checkedWin){
        //播放也是序列内部联动的
        cornerstoneTools.diy.winPlayClip(checkedWin,dvStruct.playSpeed);//自写函数
    }else{
        var arr = dvStruct.viewer.winArr;
        var len = dvStruct.viewer.col*dvStruct.viewer.row;
        for(var i=0;i<len;i++){
            cornerstoneTools.diy.winPlayClip(arr[i],dvStruct.playSpeed);
        }
    }
    dvStruct.isplaying=true;
}
//-----停止----没啥好想的，全部停止 -------  方便 --------免得改布局的时候还要各种判断
dvStruct.fun.stop = function(){
    var arr = dvStruct.viewer.winArr;
    var len = dvStruct.viewer.col*dvStruct.viewer.row;
    for(var i=0;i<len;i++){
        cornerstoneTools.diy.winStopClip(arr[i]);
    }
    dvStruct.isplaying=false;
}