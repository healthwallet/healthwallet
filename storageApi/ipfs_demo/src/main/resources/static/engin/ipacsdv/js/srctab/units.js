/**
 * Created by admin on 2016/3/29.
 */
var unit = {};
unit.mask = {
    getMask:(function(){
        var maskDiv;
        return function(){
            return maskDiv||(function(){
                    $(document.body).append('<div id="unitMask"></div>');
                    return maskDiv = document.getElementById('unitMask');
                })();
        };
    })(),
    show:function(){
        var mask = this.getMask();
        $(mask).show();
    },
    hide:function(){
        var mask = this.getMask();
        $(mask).hide();
    }
};

function layoutSelectorBuilder(col,row,idName){
    var obj= {
        cols:col, rows:row,
        layoutSelector:undefined,
        getLayoutSelector:(function(){
        return function(){
            return obj.layoutSelector||(function(){
                    var o=obj;
                    var w = o.cols * (40+3) +4;
                    var h = o.rows *(40+3) +4;
                    var html = '<div style="height:'+h+'px;width:'+w+'px;visibility: hidden" id="'+idName+'">';
                    for(var i=0;i<o.cols * o.rows;i++){
                        if(i% o.cols == 0){html += '<div class="urow">';}
                        html += '<div class="ucol" colNum='+(i% o.cols+1)+' rowNum='+(parseInt(i/ o.cols)+1)+' >'+ (i% o.cols+1) + '×' + (parseInt(i/ o.cols)+1) + '</div>';
                        if(i% o.cols == o.cols -1){html += '</div>';}
                    }
                    html+='</div>';
                    $(document.body).append(html);
                    $('#'+idName).find('.ucol').on('touchstart',function(){
                        obj.hide();
                        var col = parseInt($(this).attr('colNum'));
                        var row = parseInt($(this).attr('rowNum'));
                        obj.callback({col:col,row:row});
                    });
                    return obj.layoutSelector = document.getElementById(idName);
                })();
            };
        })(),
        show:function(place,type){
            unit.mask.show();
            var layoutSelector = this.getLayoutSelector();
            if(type=='left'){
                var w =  $(layoutSelector).width();
                var y = place.y;
                var x = place.x - w;
            }else{
                var y = place.y;
                var x = place.x;
            }
            $(layoutSelector).css({
                top: y+ 'px',
                left: x+ 'px'
            });
            $(layoutSelector).css('visibility','visible');
            $(unit.mask.getMask()).on('touchstart',function(){
                obj.hide();
            });
        },
        hide:function(){
            var layoutSelector = this.getLayoutSelector();
            $(layoutSelector).css('visibility','hidden');
            unit.mask.hide();
            $(unit.mask.getMask()).off('touchstart');
        },
        callback:function(){/* 把选中的col row传过去 */}
    }
    return obj;
}

unit.layoutSelector = layoutSelectorBuilder(dvStruct.viewer.maxCol,dvStruct.viewer.maxRow,'unitLayoutSelector');

unit.layoutSelector.callback = function(layoutObj){
    //dvStruct.viewer.usedCol = dvStruct.viewer.col;
    //dvStruct.viewer.usedRow = dvStruct.viewer.row;
    dvStruct.viewer.col = layoutObj.col;
    dvStruct.viewer.row = layoutObj.row;
    dvStruct.viewer.nowIndex = 0;
    dvStruct.dvResize.call(dvStruct.container);
};

unit.innerLayoutSelector=layoutSelectorBuilder(2,2,'unitInnerLayoutSelector');

unit.innerLayoutSelector.callback = function(layoutObj){
    console.log(layoutObj);
    var win = dvStruct.viewer.getCheckedWin();console.log(win);
    if(_.isObject(win)){
        win.col = layoutObj.col;
        win.row = layoutObj.row;
        var size = dvStruct.viewer.calInnerEachSize(win.winId);
        //内容改变
        dvStruct.viewer.resizeWin(win);
        //大小
        $('#'+win.winId).find('.viewportWrapper').css({'height':size[1]+'px','width':size[0]+'px'}).each(function(){
            console.log($(this).find('.viewport').get(0));
            cornerstone.resize($(this).find('.viewport').get(0),true);
        });
    }
};

unit.quickWWWL = {
    ceils : [
        {ww:90,wc:35,name:'头颅平扫'},
        {ww:85,wc:40,name:'头颅增强'},
        {ww:1600,wc:450,name:'头颅骨窗'},
        {ww:1600,wc:550,name:'关节骨窗'},
        {ww:300,wc:40,name:'关节软组织窗'},
        {ww:2000,wc:450,name:'鼻窦骨窗'},
        {ww:350,wc:35,name:'鼻窦软组织窗'},
        {ww:4000,wc:650,name:'乳突'},
        {ww:2000,wc:450,name:'椎间盘骨窗'},
        {ww:350,wc:40,name:'椎间盘软组织窗'},
        {ww:1000,wc:-650,name:'肺窗'},
        {ww:1500,wc:-600,name:'肺窗2'},
        {ww:350,wc:-40,name:'纵隔窗1'},
        {ww:430,wc:55,name:'纵隔窗2'},
        {ww:200,wc:50,name:'肝脏'},
        {ww:350,wc:40,name:'肾脏'},
        {ww:300,wc:55,name:'腹部'}
    ],
    savedStatus:{
        beginOfsX:0,
        beginOfsY:0,
        prevPageX:undefined,
        prevPageY:undefined
    },
    //container:dvStruct.container,
    wwwlBoxIni:function(quickWWWLBox){
        $(quickWWWLBox).find('.closeBtn').on('mousedown',function(e){
            unit.quickWWWL.hide();
            e.stopPropagation();
        });
        $(quickWWWLBox).find('.topbar').on('mousedown',function(){
            //绑定拖拽
            $(document.body).on('mousemove',function(e){
                var x = e.pageX,y= e.pageY;
                var savedStatus = unit.quickWWWL.savedStatus;
                if(!_.isUndefined(savedStatus.prevPageX)&&!_.isUndefined(savedStatus.prevPageY)){
                    var newx = savedStatus.beginOfsX + x - savedStatus.prevPageX;
                    var newy = savedStatus.beginOfsY + y - savedStatus.prevPageY;
                    $(quickWWWLBox).css({
                        top:newy+'px',
                        left:newx+'px',
                        right:'auto',
                        bottom:'auto'
                    });
                    savedStatus.beginOfsX= newx;
                    savedStatus.beginOfsY= newy;
                }
                savedStatus.prevPageX = x;
                savedStatus.prevPageY = y;
            });
            $(document.body).on('mouseup mouseleave',function(e){
                $(document.body).off('mousedown');
                $(document.body).off('mousemove'); var savedStatus = unit.quickWWWL.savedStatus;
                savedStatus.prevPageX=undefined;savedStatus.prevPageY=undefined;
            });
        });
        $(quickWWWLBox).find('.ceilBox').click(function(e){
            var ele = e.target;
            if($(ele).hasClass('aCeil')){
                var ww = parseInt($(ele).attr('ww'));
                var wc = parseInt($(ele).attr('wc'));
                $(quickWWWLBox).find('.wwVal').val(ww);
                $(quickWWWLBox).find('.wcVal').val(wc);
            }
            e.stopPropagation();
        });
        $(quickWWWLBox).find('.yes').click(function(){
            var ww = parseInt($(quickWWWLBox).find('.wwVal').val());
            var wc = parseInt($(quickWWWLBox).find('.wcVal').val());
            if(!isNaN(ww)&&!isNaN(wc))dvStruct.fun.wwwc(ww,wc);
        });
    },
    getWWWLBox:(function(){
        var quickWWWLBox;
        return function(){
            return quickWWWLBox||(function(){
                var html = '<div id="quickWWWLBox">';
                html+='<div class="topbar"  style=" -webkit-user-select: none; -webkit-user-drag: none;touch-action: none;" ><div class="closeBtn">✖</div></div>';
                html+='<div class="calBox"  style=" -webkit-user-select: none; -webkit-user-drag: none;touch-action: none;">';
                html+='<div class="inputArea">窗位:&ensp;<input class="wcVal"></div>';
                html+='<div class="inputArea">窗宽:&ensp;<input class="wwVal"></div>';
                html+='<div class="yes">确定</div>';
                html+='</div>';
                html+='<div class="ceilBox"></div>';
                html+='</div>';
                $(dvStruct.container).append(html);
                quickWWWLBox = document.getElementById('quickWWWLBox')
                for(var i=0;i<unit.quickWWWL.ceils.length;i++){
                    var ceil = unit.quickWWWL.ceils[i];
                    $(quickWWWLBox).find('.ceilBox').append('<div class="aCeil" ww="'+ceil.ww+'" wc="'+ceil.wc+'" >'+ceil.name+'</div>');
                }
                unit.quickWWWL.wwwlBoxIni(quickWWWLBox);
                return quickWWWLBox;
            })();
        };
    })(),
    show:function(){
        unit.mask.show();
        var quickWWWLBox = unit.quickWWWL.getWWWLBox();
        $(quickWWWLBox).css({
            top:0,left:0,right:0,bottom:0
        });
        $(quickWWWLBox).show();
        var savedStatus = unit.quickWWWL.savedStatus;
        var ofs = $(quickWWWLBox).offset();
        savedStatus.beginOfsX = ofs.left;
        savedStatus.beginOfsY = ofs.top;
        savedStatus.prevPageX = undefined;
        savedStatus.prevPageY = undefined;
    },
    hide:function(){
        unit.mask.hide();
        var quickWWWLBox = unit.quickWWWL.getWWWLBox();
        $(quickWWWLBox).hide();
    }
};
unit.loadingProcessing = {
    failedUrls:[],
    getProcessiong:(function(){
        var processingBox;
        return function(){
            return processingBox||(function(){
                    var html = '<div id="processingBox" style="display: none" class="processingBox">';
                    html+='<div class="js-hide hidebtn" style="display: none"><span>✖</span></div>';
                    html+='<div class="failed" style="display: none">失败：<span class="failedNum"></span>&ensp;<span class="tryAgain">重试</span></div>';
                    html+='<div class="loadingTxt" >正在加载:<span class="now">0</span>/<span class="max"></span></div>';
                    html+='<div class="processing">';
                    html+='<div class="progress progress-striped active"><div class="progress-bar "  role="progressbar" style="width:0"></div></div>'
                    html+='</div>';
                    html+='</div>';
                    $('.leftGallery').prepend(html);
                    processingBox = document.getElementById('processingBox');
                    $(processingBox).find('.tryAgain').click(function(){
                        var maxNum= unit.loadingProcessing.failedUrls.length;
                        var arr = unit.loadingProcessing.failedUrls.concat()
                        unit.loadingProcessing.failedUrls=[]; unit.loadingProcessing.finished=0;
                        $(processingBox).find('.js-hide').hide();$(processingBox).find('.loadingTxt').show();$(processingBox).find('.failed').hide();
                        unit.loadingProcessing.init(maxNum);
                        for(var i=0;i<maxNum;i++){
                            io.Url.load(arr[i]);
                        }
                    });
                    $(processingBox).find('.js-hide').click(function(){
                        $(processingBox).hide();
                    });
                    return processingBox;
                })();
        };
    })(),
    maxNum:0,finished:0,
    clear:function(){
        this.maxNum=0;this.finished=0;this.success=0;
        var node = this.getProcessiong();
        $(node).hide();
    },
    updateProcessing:function(failedUrl){
        if(failedUrl){
            this.failedUrls.push(failedUrl);
        }else{
            this.finished++;
            var w =parseInt(this.finished/this.maxNum*100);
            var processingBox = this.getProcessiong();
            $(processingBox).find('.now').text(this.finished);
            $(processingBox).find('.progress-bar').css('width',w +'%');
        }
        if(this.finished+this.failedUrls.length==this.maxNum){
            this.end();
        }
    },
    end:function(){
        var processingBox = this.getProcessiong();
        if(this.failed>0){
            $(processingBox).find('.js-hide').show();
            $(processingBox).find('.loadingTxt').hide();
            $(processingBox).find('.failed').show().find('.failedNum').text(this.failedUrls.length);
        }else{
            $(processingBox).hide();
        }
    }
    ,
    init:function(max){
        this.maxNum = parseInt(max);if(this.maxNum>0) {
            var processingBox = this.getProcessiong();
            $(processingBox).find('.progress-bar').width(0);
            $(processingBox).find('.max').text(this.maxNum);
            $(processingBox).show();
        }
    }
};


//unit.config = {};