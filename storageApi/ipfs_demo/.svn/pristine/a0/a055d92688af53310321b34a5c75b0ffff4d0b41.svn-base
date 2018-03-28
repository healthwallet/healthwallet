/**
 * Created by admin on 2016/3/29.
 */

var dvStruct = dvStruct||{};
dvStruct.dragToCanv = {
    suid:undefined,
    clear:function(){
        var o = dvStruct.dragToCanv;
        o.suid = undefined;
        var div = o.getDiv();
        $(div).css('visibility', 'hidden');
    },
    pos:{
        top:0,left:0,
        x:0,y:0,
        lastX:0,lastY:0
    },
    divSize:{
        w:0,h:0
    },
    on:function(suid,pos,e){
        var o = dvStruct.dragToCanv;
        o.suid = suid;
        var div = o.getDiv();
        var w = $(div).width();
        o.pos.top = pos.top;o.pos.left = pos.left;
        o.pos.x = e.pageX;o.pos.y =e.pageY;
        o.pos.lastX = o.pos.x;o.pos.lastY = o.pos.y;
        $(div).css({
            top: (pos.top) + 'px',left: (pos.left) + 'px'
        });
        $(div).css('visibility', 'visible');
        o.dragOn();
    }
    ,
    getDiv:(function(){
        var dragToCanvDiv;
        return function(){
            return dragToCanvDiv||(function(){
                    var tmp = '<div style="visibility: hidden" id="js-dragToCanvDiv" class="dragToCanvDiv"></div>';
                    $(document.body).append(tmp);
                    dragToCanvDiv = document.getElementById('js-dragToCanvDiv');
                    var o = dvStruct.dragToCanv;
                    var size = o.divSize;
                    size.w = $(dragToCanvDiv).outerWidth();
                    size.h = $(dragToCanvDiv).outerHeight();
                    return dragToCanvDiv;
                })()
        }
    })(),
    dragOn:function(){
        $(document.body).on('mousemove',function(e){
            var x=  e.pageX,y= e.pageY;
            var pos =  dvStruct.dragToCanv.pos;
            var ofsX = x - pos.x;
            var ofsY = y - pos.y;
            var div = dvStruct.dragToCanv.getDiv();
            $(div).css({
                top: (pos.top+ofsY) + 'px',left: (pos.left + ofsX) + 'px'
            });
            pos.lastX = x;pos.lastY = y;
        });
        $(document.body).on('mouseup mouseleave',function(e){
            $(document.body).off('mouseleave');
            $(document.body).off('mousemove');
            $(document.body).off('mouseup');
            var o  = dvStruct.dragToCanv;
            var win = o.checkOn();//console.log(win);
            if(win){
                dvStruct.viewer.bindSeries(win,dvStruct.dragToCanv.suid);
            }
            o.clear();
        });
    },
    checkOn:function(){
        //只是点一下
        var pos =  dvStruct.dragToCanv.pos;//console.log(pos);
        if(Math.abs(pos.lastX-pos.x)<4&&Math.abs(pos.lastY-pos.y)<4){
            var checkedWin  = dvStruct.viewer.getCheckedWin();//console.log(checkedWin);
            if(checkedWin){
               return checkedWin;
            }
            return undefined;
        }
        //拖拽判定
        var vArea = $(dvStruct.container).find('.js-imageViewer');
        var ofs = $(vArea).offset();
        var w = $(vArea).width();
        var h = $(vArea).height();
        var minx = ofs.left,miny=ofs.top,maxx=ofs.left+ w,maxy=ofs.top+h;
        //-------------------------------
        var div = dvStruct.dragToCanv.getDiv();
        var divOfs = $(div).offset();
        var divW = $(div).outerWidth();
        var divH = $(div).outerHeight();
        var divminX = divOfs.left,divminY = divOfs.top,divmaxX = divOfs.left+divW,divmaxY = divOfs.top+divH;
        if(!(divmaxX<=minx||divminX>=maxx||divmaxY<=miny||divminY>=maxy)){
            var centerx = (divminX+divmaxX)/2;
            var centery = (divminY+divmaxY)/2;
            var cols = Math.ceil((centerx - ofs.left)/dvStruct.viewer.eachW);
            var rows = Math.ceil((centery - ofs.top)/dvStruct.viewer.eachH);
            var No = dvStruct.viewer.col * (rows-1) + cols -1;
            return dvStruct.viewer.getWinByNo(No);
        }
        return undefined;
    }
};

function bindDragToCanv(){
    $('.leftGallery').mousedown(function(e){
        var ele = e.target;
        var dragAble = false;var imgNode;
        if($(ele).hasClass('js-dragToCanv')){
            dragAble=true;imgNode = $(ele);
        }
        if(!dragAble&&$(ele).parents('.js-dragToCanv').length>0){
            dragAble=true;imgNode = $(ele).parents('.js-dragToCanv');
        }
        if(dragAble){
            var pos = $(imgNode).offset();
            var suid = $(imgNode).attr('suid');
            dvStruct.dragToCanv.on(suid,pos,e);
        }
    });
}