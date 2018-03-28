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
    var wrapper = dvStruct.viewer.getWrapperById($(e.target).attr('id'));
    var wrapperBox = $(e.target).parent();
    //console.log(viewport);
    $(wrapperBox).find('.js-info-wwwl').text("WL/WW: " + Math.round(viewport.voi.windowCenter) + "/" + Math.round(viewport.voi.windowWidth));
    $(wrapperBox).find('.js-info-zoom').text("Zoom: " + viewport.scale.toFixed(2));
    //
    var toolData = cornerstoneTools.getToolState(wrapper.element, 'stack');
    if(toolData === undefined || toolData.data === undefined || toolData.data.length === 0) {
        return;
    }
    var stack = toolData.data[0];
    // Update Image number overlay
    $(wrapperBox).find('.js-info-nowNo').text('Im: '+(parseInt(stack.currentImageIdIndex) + 1));
    var imageId = cornerstone.getImage(e.target).imageId;
    var suid = wrapper.suid;
    //暂时不显示这个
    var info = dvStruct.viewer.findOriInfoByIds(imageId,suid);//console.log(info);
    if(info){
        var theT = info.SeriesInfo.SliceThickness.val,theL = info.SeriesInfo.SliceLocation.val;
        if(theT||theL){
            $(wrapperBox).find('.js-TL').text('T: '+theT+'mm L: '+theL+'mm');//这个跟专业软件显示得不一样呢，这个要算吧
        }
    }
};

var config = {
    drawAllMarkers: true
}

// Comment this out to draw only the top and left markers
cornerstoneTools.orientationMarkers.setConfiguration(config);

;(function($){
    //取名短点
    var tmps;
    //默认参数
    var defaults = {
        viewer:dvStruct.viewer,
        urls:[]
    };
    function dvResize(){
        var h = this.find('.dvContainer').height();
        //var w = this.find('.js-imageViewer').width();
        w = 0;
        var th = this.find('.js-topPannel').height();console.log(th);
        this.find('.js-imageViewer').height(h - th);
        var vh = this.find('.js-imageViewer').height();
        var vw = this.find('.js-imageViewer').width();
        var eachW = parseInt(vw/this.opts.viewer.col);
        var eachH = parseInt(vh/this.opts.viewer.row);
        //大窗的size
        this.find('.seriesWindow').css({'height':eachH+'px','width':eachW+'px'});
        dvStruct.viewer.eachW = eachW;dvStruct.viewer.eachH = eachH;
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
            //覆盖默认参数
            var opts = this.opts = $.extend({}, defaults, options);
            //模板
            tmps = get_dicom_imgViewer_templates();
            dvStruct.container = this;
            //html生成
            this.append(tmps.container({'containerId':containerId}));//容器
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
                    var wrapper = dvStruct.viewer.createWrapper(arg);
                    newWin.wrappers.push(wrapper);
                }
            }
            //初始展示的布局数目
            if(_.isObject(opts.defaultShow)){
                var len = Math.min(opts.defaultShow.suidArr.length,1);
                for(var i=0;i<len;i++){
                    dvStruct.addWaitingBind(opts.defaultShow.suidArr[i],dvStruct.viewer.winArr[i]);
                }
            }
            //布局ready
            dvResize.call(this);
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
            //可识别鼠标在布局区域
            dvStruct.init.checkMouseOnViewpoint();
            ////选中
            //$('.seriesWindow').click(function(e){//console.log(e);
            //    $('.seriesWindow').removeClass('checked');
            //    $(this).addClass('checked');
            //});
            ////取消选中----右键
            //$(".seriesWindow").on('contextmenu', function(e) {//console.log(e);
            //    $(this).removeClass('checked');
            //});
            //上下翻页
            $('.js-paging .prev').click(function(){
                dvStruct.fun.prevPage();
            });
            $('.js-paging .next').click(function(){
                dvStruct.fun.nextPage();
            });

            //手势调窗
            $('.js-wwwl').on('touchstart',function(){
                $('.btnArea').removeClass('leftBtnActive');
                $(this).addClass('leftBtnActive');
                var element = dvStruct.viewer.winArr[0].wrappers[0].element;
                //cornerstoneTools.panMultiTouch.deactivate(element);
                cornerstoneTools.touchDragTool.deactivate(element);
                cornerstoneTools.wwwcTouchDrag.activate(element);
                //cornerstoneTools.zoomTouchPinch.activate(element);
            });
            //手势移动
            $('.js-pan').on('touchstart',function(){
                $('.btnArea').removeClass('leftBtnActive');
                $(this).addClass('leftBtnActive');
                var element = dvStruct.viewer.winArr[0].wrappers[0].element;
                //cornerstoneTools.zoomTouchPinch.deactivate(element);
                cornerstoneTools.wwwcTouchDrag.deactivate(element);
                //cornerstoneTools.panMultiTouch.activate(element);
                cornerstoneTools.touchDragTool.activate(element);
            });
            //旋转
            $('.js-cw').click(function(){
                dvStruct.fun.rotate();
            });
            //窗口变化
            $(dvStruct.container).resize(function(){//console.log(dvStruct.container);
                dvResize.call(dvStruct.container);
            });
            //播放
            $('.js-play').click(function(){
                $(this).hide();$('.js-stop').show();
                $('.playSpeedSetBtn').show();
                dvStruct.fun.play();
                $('.js-stop').removeClass('checked');
                $(this).addClass('checked');
            });

            //停止
            $('.js-stop').click(function(){
                $(this).hide();
                $('.js-play').show();
                $('.playSpeedSetBtn').hide();
                dvStruct.fun.stop();
                $('.js-play').removeClass('checked');
                $(this).addClass('checked');
            });

            unit.speedSlider.ini();
            //播放设置
            $('.playSpeedSetBtn').on('touchstart',function(e){
                e.preventDefault();
                unit.speedSlider.show();
            });

            //反显
            $('.js-invert').on('touchstart',function(){
                dvStruct.fun.invert();
            });

            //打开关闭图列
            $('.js-hideGallery').click(function(){
                $(dvStruct.container).find('.leftGallery').hide(500);
            });
            $('.js-openGallery').click(function(){
                $(dvStruct.container).find('.leftGallery').show(500);
            });

            //选择序列
            //不直接用imagebox，降低点击面
            $('.leftGallery').on('touchstart',function(e){
                var ele = e.target;
                if($(ele).parents('.imgIn').length>0){
                    var node = $(ele).parents('.imgBox').find('.img').get(0);
                    var suid = $(node).attr('suid');
                    var win = dvStruct.viewer.winArr[0];
                    dvStruct.viewer.bindSeries(win,suid);
                }
            });

            $('.js-refresh').on('touchstart',function(e){
                var win = dvStruct.viewer.winArr[0];
                var suid = win.wrappers[0].suid;
                if(suid){
                    dvStruct.viewer.bindSeries(win,suid);
                }
            });
            //窗口变化
            $(dvStruct.container).resize(function(){
                dvResize.call(dvStruct.container);
            });
        }
    });
})(jQuery);