/**
 * Created by admin on 2016/4/21.
 */
//-----------------------------------------ELE----------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------------
//视图数据 --- 历史，与缓存 ------  只有一层排列，自由搭配，原先是照着墨洛维搞的，跟他后处理不同，抽象层次多了编程还麻烦。很多软件是只有一层的
dvStruct.viewer={
    col:1,row:1, maxCol:1,maxRow:1,eachW:0,eachH:0,
    maxInnerCol:1,
    maxInnerRow:1,
    scrollAll:false,
    btnStates:{//做成对象是为了之后 多键自定义考虑  现在就左键
        wwwc:{enable:1,type:1},
        pan:{enable:0,type:1},
        zoom:{enable:0,type:1},
       // rotate:{enable:0,type:1},
       // probe:{enable:0,type:1},
        length:{enable:0,type:1},
       // ellipticalRoi:{enable:0,type:1},
       // rectangleRoi:{enable:0,type:1},
        angle:{enable:0,type:1}
    },
    leftBtnDisable:function(){//left mouse
        disableAllTools();
        for(var i in dvStruct.viewer.btnStates){
            if(dvStruct.viewer.btnStates[i].type&&dvStruct.viewer.btnStates[i].type==1){
                dvStruct.viewer.btnStates[i].enable=0;
            }
        }
    },
    //
    addNewWin:function(id,no){
        var newWin = {
            winId:id,//id也是html元素的id
            no:no,//第几个，有用得上的时候
            row:1,
            col:1,
            wrappers:[],
            imgObjArr:[]//,//wrapper里面只有一个imageId
            //一个窗口一个同步对象
            //synchronizerWWWC : new cornerstoneTools.Synchronizer("CornerstoneImageRendered", cornerstoneTools.wwwcSynchronizer),
            //synchronizerZoomPan : new cornerstoneTools.Synchronizer("CornerstoneImageRendered", cornerstoneTools.panZoomSynchronizer),
            //旋转----这个是自己新加的
            //synchronizerRotate : new cornerstoneTools.Synchronizer("CornerstoneImageRendered", cornerstoneTools.rotateSynchronizer)
        };
        this.winArr.push(newWin);
        return newWin;
    },
    winArr:[],
    getWinByNo:function(no){
        return _.find(dvStruct.viewer.winArr,function(o){
            return o.no==no;
        });
    },
    //返回eachW eahcH
    calInnerEachSize:function(a) {
        //id或者obj
        if (_.isObject(a)) {
            re = a;
        } else {
            var re = _.find(dvStruct.viewer.winArr, function (o) {
                return o.winId == a;
            });
        }
        if (_.isObject(re)) {
            return [(dvStruct.viewer.eachW-2) / re.col, (dvStruct.viewer.eachH-2) / re.row];
        }
        return undefined;
    },
    //返回选中的win
    getCheckedWin:function() {
        var id = $('.seriesWindow.checked').attr('id');
        var win = _.find(dvStruct.viewer.winArr, function (o) {
            return o.winId == id;
        });
        return win;
    },
    //寻找一个win
    getWin:function(wid){
        var re = _.find(dvStruct.viewer.winArr, function (o) {
            return o.winId == a;
        });
        return re;
    },
    //建一个包
    createWrapper:function(o){
        return {
            pid: o.pid,//parent id
            eid: o.eid,//element的id ------ id就够了
            element: o.element,
            suid:undefined,
            stack:{
                currentImageIdIndex: 0,
                imageIds:[]
            }
        }
    },
    clearWrapper:function(w){
        w.suid = undefined;
        w.stack.currentImageIdIndex = 0;
        w.stack.imageIds = [];
    },
    //遍历wrapper
    eachElement:function(opts){
        if(!_.isObject(opts))opts={};
        if(_.isObject(opts.win)){
            var arr = [opts.win];
        }else{
            var arr = dvStruct.viewer.winArr;
        }
        for(var i = 0;i<arr.length;i++){
            var win = arr[i];
            for(var j=0;j<win.wrappers.length;j++){
                if(opts.callback){//console.log(win.wrappers[j]);
                    opts.callback(win.wrappers[j].element,win.wrappers[j]);
                }
            }
        }
    },
    eachWin:function(opts){
        if(!_.isObject(opts))opts={};
        var arr = dvStruct.viewer.winArr;
        for(var i = 0;i<arr.length;i++){
            if(opts.callback){
                opts.callback(arr[i]);
            }
        }
    },
    getWrapperById : function(eid){
        var arr = dvStruct.viewer.winArr;
        for(var i = 0;i<arr.length;i++){
            var win = arr[i];
            for(var j=0;j<win.wrappers.length;j++){
                var wrapper = win.wrappers[j];
                if(wrapper.eid == eid){
                    return wrapper;
                }
            }
        }
        return undefined;
    }
};
dvStruct.viewer.findOriInfoByIds=function(imageId){//由于绘制逻辑似乎不简单，cornerstone里面的onViewportUpdated，并不完全受我控制还
    var arr = imageId.split(':');
    var winId = arr[1];
    var suid = arr[2];
    var win  = _.find(dvStruct.viewer.winArr,function(o){
        return  o.winId==winId;
    });
    var re = _.find(win.imgObjArr,function(o){
        return o.imageId == imageId;
    });
    if(_.isObject(re)){
        var oriImageId = re.bindOriImageId;
        return dvStruct.findOriInfoByIds(oriImageId,suid);
    }
    return undefined;
}

dvStruct.viewer.bindSeries = function(win,suid){
    //原始series数据
    var series = dvStruct.findSeries(suid);
    var imgs = series.dicomArr;
    var imgids = [];
    win.imgObjArr = [];//清空与不清空，就在这一念间
    for(var i=0;i<imgs.length;i++){
        //把element的id以及原始suid和imageId的信息也传入imgId里去
        var imgObj = createNewImageObject(imgs[i].dataSet,'series:'+win.winId+':'+suid);
        imgObj.bindOriImageId = imgs[i].imageId;//这个用来获取对应的原始信息
        win.imgObjArr.push(imgObj);
        imgids.push(imgObj.imageId);
    }
    var len = imgids.length;
    //联动先去掉
    //for(var i=0;i<dvStruct.viewer.maxInnerCol*dvStruct.viewer.maxInnerRow;i++) {
    //    var wrapper = win.wrappers[i];
    //    dvStruct.fun.removeSync(win,wrapper.element);
    //}
    for(var i=0;i<dvStruct.viewer.maxInnerCol*dvStruct.viewer.maxInnerRow;i++){
        var wrapper = win.wrappers[i];
        wrapper.suid = suid;
        //imageIds
        wrapper.stack.imageIds = [];//只有当前显示的才有imageIds，这个会用在很多判断
        if(i<win.col*win.row){
            var enabledElement = cornerstone.getEnabledElement(wrapper.element);
            //suid
            //初始的索引
            //如果图片数量还没wrapper多，则多余的画布无效化
            if(i<len){
                wrapper.stack.currentImageIdIndex = i;
            }
            //画
            console.log(i,len-1);
            if(i<len){
                wrapper.stack.imageIds = imgids;
                //清空信息----放前面
                dvStruct.viewer.emptyInfo(wrapper);
                //清掉viewport之后它才会重画
                enabledElement.viewport = undefined;//console.log(enabledElement);
                console.log(i,wrapper);
                reDrawWrapper(wrapper);
                dvStruct.fun.elementIni(wrapper.element,win);
                dvStruct.fun.checkAndSetActive(wrapper.element);
                //添加信息
                dvStruct.viewer.fillInfo(wrapper);//console.log(wrapper);
            }else{
                //id清空
                wrapper.stack.imageIds = [];
                //如果有图了，则清空
                var img = cornerstone.getImage(wrapper.element);//console.log(img);
                // 所以下面自己写清空
                if(_.isObject(img)){
                    //先把动作去掉，特别是需要图的
                    cornerstoneTools.mouseInput.disable(wrapper.element);
                    dvStruct.fun.disableTools(wrapper.element);
                    // clear the canvas
                    var context = enabledElement.canvas.getContext('2d');
                    context.setTransform(1, 0, 0, 1, 0, 0);//还非要加这个 作者没有置回去
                    context.fillStyle = 'black';
                    context.fillRect(0,0, enabledElement.canvas.width, enabledElement.canvas.height);
                    //
                    enabledElement.data={};enabledElement.image=undefined;
                    //清空信息-------放后面
                    dvStruct.viewer.emptyInfo(wrapper);
                }
            }
        }
    }
}

dvStruct.viewer.emptyInfo = function(wrapper){
    console.log('emptyInfo:',wrapper);
    var wrapperBox = $(wrapper.element).parent();
    $(wrapperBox).find('.js-info').text('');
};
dvStruct.viewer.fillInfo = function(wrapper){
    //同一个序列的设备啥的应该都一样吧
    var imageId = wrapper.stack.imageIds[wrapper.stack.currentImageIdIndex];
    var suid = wrapper.suid;
    var info = dvStruct.viewer.findOriInfoByIds(imageId,suid);
    if(_.isUndefined(info))return;
    var sNo = dvStruct.countSNo(suid);
    var wrapperBox = $(wrapper.element).parent();
    try {
        $(wrapperBox).find('.js-info-totalNo').text('/'+wrapper.stack.imageIds.length);
        $(wrapperBox).find('.js-info-SeNo').text('Se: '+sNo);
        $(wrapperBox).find('.js-info-PatientName').text(info.PatientInfo.PatientName.val);
        $(wrapperBox).find('.js-info-PatientID').text(info.PatientInfo.PatientID.val);
        $(wrapperBox).find('.js-info-PatientSex').text(' '+info.PatientInfo.PatientSex.val);
        if(birth){
            var birth = info.PatientInfo.PatientBirthDate.val;
            $(wrapperBox).find('.js-info-PatientBirthDate').text(birth.substr(0, 4) + '/' + birth.substr(4, 2) + '/' + birth.substr(6, 2));
        }
        $(wrapperBox).find('.js-info-InstitutionName').text(info.EquipmentInfo.InstitutionName.val);
        $(wrapperBox).find('.js-info-ProtocolName').text(info.StudyInfo.ProtocolName.val);
        $(wrapperBox).find('.js-info-StudyDescription').text(info.StudyInfo.StudyDescription.val);

        var backInfo = searchBackInfo(info.UIDS.InstanceUID.val);
        if(backInfo){
            $(wrapperBox).find('.js-info-CBZ').text(backInfo.CBZ);
        }
        if(info.ImageInfo.FieldofView.val){
            //field of view 扫描视野 0018,0094
            $(wrapperBox).find('.js-info-fov').text('FOV:'+parseFloat(info.ImageInfo.FieldofView.val).toFixed(1));
        }
        if(info.SomeUsefulInfo.MagneticFieldStrength.val)$(wrapperBox).find('.js-info-MagneticFieldStrength').text('FS: '+info.SomeUsefulInfo.MagneticFieldStrength.val);
        if(info.SomeUsefulInfo.RepetitionTime.val||info.SomeUsefulInfo.RepetitionTime.val)$(wrapper).find('.js-info-TrTe').text('TR: '+info.SomeUsefulInfo.RepetitionTime.val+' TE: '+info.SomeUsefulInfo.EchoTime.val);
        //var date = info.InstanceInfo.ContentDate.val.toString();var time = info.InstanceInfo.ContentTime.val.toString();
        var date = info.StudyInfo.StudyDate.val.toString();var time =  info.StudyInfo.StudyTime.val.toString();
        if(date&&time){
            $(wrapperBox).find('.js-info-datetime').text(date.substr(0, 4) + '/' + date.substr(4, 2) + '/' + date.substr(6, 2) + ' ' + time.substr(0, 2) + ':' + time.substr(2, 2) + ':' + time.substr(2, 2));
        }
    }catch (e){
        console.error(e);
    }
}