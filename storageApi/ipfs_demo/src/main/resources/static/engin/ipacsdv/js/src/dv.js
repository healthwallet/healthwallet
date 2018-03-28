/**
 * Created by admin on 2016/3/21.
 */
//resize监听
(function($,h,c){
    var a=$([]),e=$.resize=$.extend($.resize,{}),i,k="setTimeout",j="resize",d=j+"-special-event",b="delay",f="throttleWindow";e[b]=250;e[f]=true;
    $.event.special[j]={
        setup:function(){
            if(!e[f]&&this[k]){
                return false}
            var l=$(this);a=a.add(l);
            $.data(this,d,{w:l.width(),h:l.height()});
            if(a.length===1){g()}
        },
        teardown:function(){
            if(!e[f]&&this[k]){return false}
            var l=$(this);a=a.not(l);
            l.removeData(d);
            if(!a.length){clearTimeout(i)}
        },
        add:function(l){
            if(!e[f]&&this[k]){return false}
            var n;function m(s,o,p){
                var q=$(this),r=$.data(this,d);
                r.w=o!==c?o:q.width();
                r.h=p!==c?p:q.height();
                n.apply(this,arguments)
            }
            if($.isFunction(l)){
                n=l;return m
            }else{
                n=l.handler;l.handler=m
            }
        }
    };
    function g(){
        i=h[k](
            function(){
                a.each(function(){
                    var n=$(this),m=n.width(),l=n.height(),o=$.data(this,d);
                    if(m!==o.w||l!==o.h){n.trigger(j,[o.w=m,o.h=l])}
                });
                g()
            },e[b])
    }
})(jQuery,this);

function build_dicom_imgViewer_templates(dicom_imgViewer_tmps){
    dicom_imgViewer_tmps.container =  _.template($('#dvContainerTemp').text());
    dicom_imgViewer_tmps.viewportWrapper = _.template($('#viewportWrapperTemp').text());
    dicom_imgViewer_tmps.preview =  _.template($('#dvPreviewTemp').text());
    dicom_imgViewer_tmps.seriesWindow =  _.template($('#seriesWindowTemp').text());
}
var get_dicom_imgViewer_templates = (function(){
    var dicom_imgViewer_tmps;
    return function(name){
        if(_.isUndefined(name)){
            return dicom_imgViewer_tmps||(function(name){
                    dicom_imgViewer_tmps = {};build_dicom_imgViewer_templates(dicom_imgViewer_tmps);return dicom_imgViewer_tmps;})();
        }else{
            if(_.isObject(dicom_imgViewer_tmps)){
                return dicom_imgViewer_tmps[name];
            }else{
                return (function(name){
                    dicom_imgViewer_tmps = {};build_dicom_imgViewer_templates(dicom_imgViewer_tmps); return dicom_imgViewer_tmps[name];})();
            }
        }
    }
})();

function onViewportUpdated(e) {//console.log(e);
    var viewport = cornerstone.getViewport(e.target);//element能找到。。然后current Image
    var wrapper = dvStruct.viewer.getWrapperById($(e.target).attr('id'));//cornerstone的内置的一种对象
    var wrapperBox = $(e.target).parent();//这个是一个jquery找的dom的对象
    // console.log(viewport,wrapper,wrapperBox);

    $(wrapperBox).find('.js-info-wwwl').text("WL/WW: " + Math.round(viewport.voi.windowCenter) + "/" + Math.round(viewport.voi.windowWidth));
    //$(wrapperBox).find('.js-info-zoom').text("Zoom: " + viewport.scale.toFixed(2));
    //
    var toolData = cornerstoneTools.getToolState(wrapper.element, 'stack');
    if(toolData === undefined || toolData.data === undefined || toolData.data.length === 0) {
        return;
    }
    var stack = toolData.data[0];
    // Update Image number overlay
    $(wrapperBox).find('.js-info-nowNo').text('Im: '+(parseInt(stack.currentImageIdIndex) + 1));
    var imageId = cornerstone.getImage(e.target).imageId;
    //console.log(imageId);
    var suid = wrapper.suid;
    var info = dvStruct.viewer.findOriInfoByIds(imageId,suid);
    if(info){
        var theT = info.SeriesInfo.SliceThickness.val,theL = info.SeriesInfo.SliceLocation.val;
        if(theT||theL){
            try {
                theT = theT ? parseFloat(theT).toFixed(1) : theT;
                theL = theL ? parseFloat(theL).toFixed(1) : theL;
            }catch (e){console.error(e);}
            $(wrapperBox).find('.js-TL').text('T: '+theT+'mm L: '+theL+'mm');//这个跟专业软件显示得不一样呢，这个要算吧
        }
    }
};

var config = {
    drawAllMarkers: true
}

// Comment this out to draw only the top and left markers
cornerstoneTools.orientationMarkers.setConfiguration(config);

function btnIni() {
}

function checkAndSynByWinId(winId){
    if(dvStruct.synposition.enable){
        var win = dvStruct.viewer.findWin(winId);
        var wrapper = win.wrappers[0];
        var stack = wrapper.stack;
        var imageId = stack.imageIds[stack.currentImageIdIndex];
        dvStruct.synposition.findAndSyn(imageId,wrapper);
    }
}

;(function($){
    //取名短点
    var tmps;
    //默认参数
    var defaults = {
        viewer:dvStruct.viewer
    };
    function dvResize(){
        var h = this.find('.dvContainer').height();
        var w = this.find('.js-imageViewer').width();
        var th = this.find('.js-topPannel').height();
        this.find('.js-imageViewer').height(h - th);
        var vh = this.find('.js-imageViewer').height();
        var vw = this.find('.js-imageViewer').width();
        var eachW = parseInt(vw/this.opts.viewer.col);
        var eachH = parseInt(vh/this.opts.viewer.row);
        //大窗的size
        this.find('.seriesWindow').css({'height':eachH+'px','width':eachW+'px'});
        dvStruct.viewer.eachW = eachW;dvStruct.viewer.eachH = eachH;
        //只有一个窗时选中
        if(dvStruct.viewer.row==1&&dvStruct.viewer.col==1){
            $(".seriesWindow:first").click();
        }
        //子窗的size
        this.find('.seriesWindow').each(function(){
            var wid = $(this).attr('id');
            var size = dvStruct.viewer.calInnerEachSize(wid);
            $(this).find('.viewportWrapper').css({'height':size[1]+'px','width':size[0]+'px'});
        });
        //画布要重新处理
        dvStruct.viewer.eachElement({
            callback:function(element){
                cornerstone.resize(element,true);
            }
        });
    }
    dvStruct.dvResize =dvResize;
    //容器id
    var containerId = 'dv';
    $.fn.extend({
        "dv":function(options){
            //this----jquery对象
            //console.log(this);
            //覆盖默认参数
            var opts = this.opts = $.extend({}, defaults, options);console.log(opts);
            //模板
            tmps = get_dicom_imgViewer_templates();
            dvStruct.container = this;
            //html生成
            this.append(tmps.container({'containerId':containerId}));//容器
            btnIni();
            var viewerNode = this.find('.js-imageViewer');
            for(var i=0;i<opts.viewer.maxCol*opts.viewer.maxRow;i++){
                var id = guid(8,'win');
                //外窗html
                viewerNode.append(tmps.seriesWindow({
                    no:i,id:id
                }));
                //外窗对象
                var newWin = dvStruct.viewer.addNewWin(id,i);
                //小窗----实际窗
                var winNode = document.getElementById(id);
                for(var j=0;j<opts.viewer.maxInnerCol*opts.viewer.maxInnerRow;j++){
                    var eid = guid(8,'ele');
                    var iid = guid(8,'view');
                    //内窗html
                    $(winNode).append(tmps.viewportWrapper({
                        no:j,id:iid,eid:eid
                    }));
                    //内窗对象
                    var arg = {
                        pid:id,
                        eid:eid,
                        element:document.getElementById(eid)
                    };
                    cornerstone.enable(arg.element);//先enable了
                    var wrapper = dvStruct.viewer.createWrapper(arg,j);
                    newWin.wrappers.push(wrapper);
                }
            }
            //初始展示的布局数目
            if(_.isObject(opts.defaultShow)){
                if(opts.defaultShow.num<=1){
                }else if(opts.defaultShow.num<=2){
                    dvStruct.viewer.col=2;dvStruct.viewer.row=1;
                }else if(opts.defaultShow.num<=4){
                    dvStruct.viewer.col=2;dvStruct.viewer.row=2;
                }else if(opts.defaultShow.num<=6){
                    dvStruct.viewer.col=3;dvStruct.viewer.row=2;
                }else if(opts.defaultShow.num<=9){
                    dvStruct.viewer.col=3;dvStruct.viewer.row=3;
                }else if(opts.defaultShow.num<=12){
                    dvStruct.viewer.col=4;dvStruct.viewer.row=3;
                }else{
                    dvStruct.viewer.col=4;dvStruct.viewer.row=4;
                }
                var len = Math.min(opts.defaultShow.suidArr.length,16);
                for(var i=0;i<len;i++){
                    dvStruct.addWaitingBind(opts.defaultShow.suidArr[i],dvStruct.viewer.winArr[i]);
                }
            }
            //选中
            $('.seriesWindow').click(function(e){//console.log(e);
                if(!$(this).hasClass('checked')){
                    $('.seriesWindow').removeClass('checked');
                    $(this).addClass('checked');
                    //判断同步
                    checkAndSynByWinId($(this).attr('id'));
                    //如果选中了定位线
                    if($('.js-reference').hasClass('checked')){
                        //定位线关开
                        $('.js-reference').click(); //$('.js-reference').click();
                    }
                }
            });
            //布局ready
            dvResize.call(this);
            dvStruct.viewer.initBtnDiy();//按钮状态初始化
            helperIni();
            //画布元素初始化
            dvStruct.viewer.eachWin({
                callback:function(win){
                    for(var j=0;j<win.wrappers.length;j++){
                        var ele = win.wrappers[j].element;
                        var wrapper = win.wrappers[j];
                        cornerstoneTools.addStackStateManager(ele, ['stack', 'playClip','referenceLines']);
                        cornerstoneTools.addToolState(ele, 'stack', wrapper.stack);
                        $(ele).on("CornerstoneImageRendered", onViewportUpdated);
                    }
                }
            });
            //可拖放图像
            bindDragToCanv();
            //可识别鼠标在布局区域
            dvStruct.init.checkMouseOnViewpoint();
            //取消选中----右键
            $(".seriesWindow").on('contextmenu', function(e) {//console.log(e);
                if( $('.btnArea.rightBtnActive').length==0||$('.btnArea.rightBtnActive').hasClass('js-default')){
                    if($(this).hasClass('checked')){
                        $(this).removeClass('checked');
                    }else{
                        $(".seriesWindow").removeClass('checked');
                        $(this).addClass('checked');
                    }
                }
            });
            //子分格
            $('.js-innerlayoutSelector').click(function(){
                var ofs = $(this).offset();
                var h = $(this).height();
                var w= $(this).width();
                var place = {
                    x:parseInt(ofs.left+w/2),
                    y:parseInt(ofs.top+h)
                }
                unit.innerLayoutSelector.show(place,'left');
                //预防万一
                $('.js-stop').click();
            });
            //可改变布局
            $('.js-layoutSelector').click(function(e){
                var ofs = $(this).offset();
                var h = $(this).height();
                var w= $(this).width();
                var place = {
                    x:parseInt(ofs.left+w/2),
                    y:parseInt(ofs.top+h)
                }
                unit.layoutSelector.show(place,'left');
            });
            //
            $('.js-refresh').click(function(e){
                dvStruct.fun.reset();
            });
            //上下翻页滚动 不能绑dvStruct.container，不然影响左边
            $(dvStruct.container).find('.viewer').on('mousewheel DOMMouseScroll', function (e) {
                // Firefox e.originalEvent.detail > 0 scroll back, < 0 scroll forward
                // chrome/safari e.originalEvent.wheelDelta < 0 scroll back, > 0 scroll forward
                if (e.originalEvent.wheelDelta < 0 || e.originalEvent.detail > 0) {
                    dvStruct.fun.nextPage();
                } else {
                    dvStruct.fun.prevPage();
                }
                //prevent page fom scrolling
                return false;
            });
            //联动
            $('.js-scrollAll').click(function(){
                dvStruct.viewer.scrollAll = ~dvStruct.viewer.scrollAll;
                if($(this).hasClass('checked')){
                    $(this).removeClass('checked')
                }else{
                    $(this).addClass('checked')
                }
            });
            unit.speedSlider.ini();
            //播放设置
            $('.playSpeedSetBtn').click(function(e){
                e.preventDefault();
                unit.speedSlider.show();
            });
            //播放
            $('.js-play').click(function(){
                dvStruct.fun.play();
                $('.js-stop').removeClass('checked');
                $(this).addClass('checked');
                $('.playSpeedSetBtn').show();
            });
            //停止
            $('.js-stop').click(function(){
                dvStruct.fun.stop();
                $('.js-play').removeClass('checked');
                $(this).addClass('checked');
                $('.playSpeedSetBtn').hide();
            });
            //反显
            $('.js-invert').click(function(){
                dvStruct.fun.invert();
                //if($(this).hasClass('checked')){
                //    $(this).removeClass('checked')
                //}else{
                //    $(this).addClass('checked')
                //}
            });
            //伪彩
            $('.js-fakecolor').click(function(){
                dvStruct.fun.fake();
            });
            //屏蔽右键
            $(".js-default,.js-zoom,.js-pan,.js-wwwl,.js-probeUnSave,.js-probe,.js-length,.js-angle,.js-ellipse,.js-rect").on('contextmenu', function(e) {e.preventDefault();return false;});
            function mouseDownCheckE(e,_this,filter){
                if(filter&&filter!=e.which)return -1;
                var d=0;//避免重复
                if($(_this).hasClass('rightBtnActive')){
                    d=4;
                    $(_this).removeClass('rightBtnActive');dvStruct.viewer.rightBtnDisable();//
                }
                if($(_this).hasClass('leftBtnActive')){
                    d=1;
                    $(_this).removeClass('leftBtnActive');dvStruct.viewer.leftBtnDisable();//
                }
                if($(_this).hasClass('middleBtnActive')){
                    d=2;
                    $(_this).removeClass('middleBtnActive');dvStruct.viewer.middleBtnDisable();//
                }
                if(3 == e.which){//右键
                    $('.btnArea').removeClass('rightBtnActive');
                    $(_this).addClass('rightBtnActive');
                    var type = 4;
                    if(d!=4)dvStruct.viewer.rightBtnDisable();//
                }else if(2 == e.which){//中键
                    $('.btnArea').removeClass('middleBtnActive');
                    $(_this).addClass('middleBtnActive');
                    var type = 2;
                    if(d!=2)dvStruct.viewer.middleBtnDisable();
                }else{
                    $('.btnArea').removeClass('leftBtnActive');
                    $(_this).addClass('leftBtnActive');
                    var type = 1;
                    if(d!=1)dvStruct.viewer.leftBtnDisable();
                }
                return type;
            }
            //缩放
            $('.js-zoom').mousedown(function(e){
                var type = mouseDownCheckE(e,this);
                dvStruct.viewer.saveDiyStat('js-zoom',type);
                dvStruct.viewer.btnStates.zoom.enable = true;dvStruct.viewer.btnStates.zoom.type=type;
                setAllEle(function(element){
                    //cornerstoneTools.zoom.activate(element,type);
                    dvStruct.fun.checkAndSetActive(element);
                })
            });

            //旋转
            $('.js-cw').click(function(){
                dvStruct.fun.rotate();
                //不用它自带的了----为了保证不出问题，只做90度旋转
                //$('.btnArea').removeClass('leftBtnActive');
                //$(this).addClass('leftBtnActive');
                //dvStruct.viewer.leftBtnDisable();
                //dvStruct.viewer.btnStates.rotate.enable = true;
                //setAllEle(function(element){
                //    cornerstoneTools.rotate.activate(element, 1);
                //})
            });

            //sj add
            //旋转2
            $('.js-ccw').click(function(){
                dvStruct.fun.rotate2();

            });
            //sj add


            //翻转
            $('.js-vRev').click(function() {
                dvStruct.fun.rev('v');
            });
            $('.js-hRev').click(function() {
                dvStruct.fun.rev('h');
            });
            //移动
            $('.js-pan').mousedown(function(e){
                var type = mouseDownCheckE(e,this);
                dvStruct.viewer.saveDiyStat('js-pan',type);
                dvStruct.viewer.btnStates.pan.enable = true;dvStruct.viewer.btnStates.pan.type=type;
                setAllEle(function(element){
                    //cornerstoneTools.pan.activate(element,type);
                    dvStruct.fun.checkAndSetActive(element);
                });
            });

            //调窗
            $('.js-wwwl').mousedown(function(e){
                var type = mouseDownCheckE(e,this);
                dvStruct.viewer.saveDiyStat('js-wwwl',type);
                dvStruct.viewer.btnStates.wwwc.enable = true;dvStruct.viewer.btnStates.wwwc.type=type;
                setAllEle(function(element){
                    //cornerstoneTools.wwwc.activate(element, type);
                    dvStruct.fun.checkAndSetActive(element);
                })
            });
            //------------corner这货的实现有问题，测量只能左键
            //点探针
            $('.js-probe').mousedown(function(e){
                var type = mouseDownCheckE(e,this,1);if(type==-1)return;
                dvStruct.viewer.saveDiyStat('js-probe',type);
                dvStruct.viewer.btnStates.probe.enable = true;dvStruct.viewer.btnStates.probe.type=type;
                setAllEle(function(element){
                    //cornerstoneTools.probe.activate(element, type);
                    dvStruct.fun.checkAndSetActive(element);
                })
            });
            //点探针
            $('.js-probeUnSave').mousedown(function(e){
                var type = mouseDownCheckE(e,this,1);if(type==-1)return;
                dvStruct.viewer.saveDiyStat('js-probeUnSave',type);
                dvStruct.viewer.btnStates.probeUnSave.enable = true;dvStruct.viewer.btnStates.probeUnSave.type=type;
                setAllEle(function(element){
                    //cornerstoneTools.probe.activate(element, type);
                    dvStruct.fun.checkAndSetActive(element);
                })
            });
            //测量画线
            $('.js-length').mousedown(function(e){
                var type = mouseDownCheckE(e,this,1);if(type==-1)return;

                dvStruct.viewer.saveDiyStat('js-length',type);
                dvStruct.viewer.btnStates.length.enable = true;dvStruct.viewer.btnStates.length.type=type;
                setAllEle(function(element){
                    //cornerstoneTools.length.activate(element, type);
                    dvStruct.fun.checkAndSetActive(element);
                })
            });
            //两条线 双线 心胸比
            $('.js-twolines').mousedown(function(e){
                var type = mouseDownCheckE(e,this,1);if(type==-1)return;

                dvStruct.viewer.saveDiyStat('js-twolines',type);
                dvStruct.viewer.btnStates.twolines.enable = true;dvStruct.viewer.btnStates.twolines.type=type;
                setAllEle(function(element){
                    //cornerstoneTools.length.activate(element, type);
                    dvStruct.fun.checkAndSetActive(element);
                })
            });

            //测量角度
            $('.js-angle').mousedown(function(e){
                var type = mouseDownCheckE(e,this,1);if(type==-1)return;

                dvStruct.viewer.saveDiyStat('js-angle',type);
                dvStruct.viewer.btnStates.angle.enable = true;dvStruct.viewer.btnStates.angle.type=type;
                setAllEle(function(element){
                    //cornerstoneTools.angle.activate(element, type);
                    dvStruct.fun.checkAndSetActive(element);
                })
            });
            //测量椭圆
            $('.js-ellipse').mousedown(function(e){
                var type = mouseDownCheckE(e,this,1);if(type==-1)return;

                dvStruct.viewer.saveDiyStat('js-ellipse',type);
                dvStruct.viewer.btnStates.ellipticalRoi.enable = true;dvStruct.viewer.btnStates.ellipticalRoi.type=type;
                setAllEle(function(element){
                    //cornerstoneTools.ellipticalRoi.activate(element, type);
                    dvStruct.fun.checkAndSetActive(element);
                })
            });
            //测量矩形
            $('.js-rect').mousedown(function(e){
                var type = mouseDownCheckE(e,this,1);if(type==-1)return;

                dvStruct.viewer.saveDiyStat('js-rect',type);
                dvStruct.viewer.btnStates.rectangleRoi.enable = true;dvStruct.viewer.btnStates.rectangleRoi.type=type;
                setAllEle(function(element){
                    //cornerstoneTools.rectangleRoi.activate(element, type);
                    dvStruct.fun.checkAndSetActive(element);
                });
            });
            //定位线
            $('.js-reference').click(function(){
                if($(this).hasClass('checked')){
                    $(this).removeClass('checked')
                }else{
                    $(this).addClass('checked')
                }
                if(dvStruct.viewer.btnStates.referenceLines.enable){
                    dvStruct.viewer.btnStates.referenceLines.enable = false;
                    setAllEle(function(element){
                        dvStruct.fun.disableReferenceLines(element);
                    })
                }else{
                    dvStruct.viewer.btnStates.referenceLines.enable = true;
                    setAllEle(function(element){
                        dvStruct.fun.enableReferenceLines(element);
                    })
                }
            });
            //信息文字
            $('.js-infoVisible').click(function(){
                if($(this).hasClass('checked')){
                    $(this).removeClass('checked');
                    $('.js-info').hide();
                }else{
                    $(this).addClass('checked');
                    $('.js-info').show();
                }
            });
            //

            //清空
            $('.js-clearToolState').click(function() {
                dvStruct.fun.clearToolState();
            });
            //
            $('.js-default').mousedown(function(e){
                var type = mouseDownCheckE(e,this);
                dvStruct.viewer.saveDiyStat('js-default',type);
                setAllEle(function(element){
                    dvStruct.fun.checkAndSetActive(element);
                })
            });

            //快捷调窗/自定义调窗
            $('.js-wwwldiy').click(function(){
                unit.quickWWWL.show();
            });

            //窗口变化
            $(dvStruct.container).resize(function(){
                dvResize.call(dvStruct.container);
            });

            //快捷键
            try{
                var listener = new window.keypress.Listener();
                var my_combos = listener.register_many([
                    {
                        "keys"          : "pageup",
                        "is_exclusive"  : true,
                        "on_keydown"    : function() {console.log('pageup');
                            dvStruct.fun.prevPage();
                        },
                        "on_keyup"      : function(e) {},
                    },
                    {
                        "keys"          : "pagedown",
                        "is_exclusive"  : true,
                        "on_keydown"    : function() {
                            dvStruct.fun.nextPage();
                        },
                        "on_keyup"      : function(event) {
                            // Normally because we have a keyup event handler,
                            // event.preventDefault() would automatically be called.
                            // But because we're returning true in this handler,
                            // event.preventDefault() will not be called.
                            //return true
                        },
                    }
                ]);
            }catch(e){
                console.error(e);
            }

            //保存下载
            $('.js-fileSave').click(function(){
                dvStruct.saveDownloaded();
            });

            //保存下载为jpg格式
            $('.js-fileSaveJpg').click(function(){
                var obj={
                    size:512,
                    type:'jpg'
                }
                cornerstoneTools.saveAllAs('dcm2jpg',obj);
            });

            //同步
            $('.js-syn').click(function(){
                dvStruct.synposition.enable = !dvStruct.synposition.enable;
                if(dvStruct.synposition.enable){
                    $(this).addClass('checked');
                    //判断同步
                    var checkedWin  = dvStruct.viewer.getCheckedWin();
                    if(checkedWin){
                        checkAndSynByWinId(checkedWin.winId);
                    }
                }else{
                    $(this).removeClass('checked');
                }
            });

            dvStruct.seriesForMpr = [];
            $('.js-mpr').click(function(){
                var checkedWin = dvStruct.viewer.getCheckedWin();
                if(checkedWin){
                    if(checkedWin.wrappers[0].suid){
                        var _suid = checkedWin.wrappers[0].suid;
                        dvStruct.seriesForMpr = _.filter(dvStruct.downloadedDcmFiles,function(o){
                            return _suid== o.infoAfterAnalysised.suid;
                        });
                        $('#papaFrame').css('visibility','visible');
                        dvStruct.mprOpen = true;
                        if($('#mprFrame').attr('src')==''){
                            $('#mprFrame').attr('src','papa_gai/html/papa.html');
                        }else{
                            var f = mprFrame;
                            if(f.window.checkAndLoad){
                                console.log('called checkAndLoad');
                                f.window.checkAndLoad();
                            }
                        }
                        return;
                    }
                }
                alert('请选中图像窗');
            });
            $('.js-mprClose').click(function(){
                $('#papaFrame').css('visibility','hidden');
                dvStruct.mprOpen = false;
                dvStruct.seriesForMpr = [];
                var f = mprFrame;
                if(f.window.clearAll){
                    f.window.clearAll();
                }
            });
            //$('.js-mprHide').click(function(){
            //    $('#papaFrame').css('visibility','hidden');
            //    dvStruct.mprOpen = false;
            //});
        }
    });
})(jQuery);

