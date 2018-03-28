/**
 * Created by admin on 2016/5/6.
 */
if(!dvStruct)dvStruct = {};
if(!dvStruct.viewer)dvStruct.viewer = {};

if(!dvStruct.fun)dvStruct.fun = {};//...这个分类太糟糕了，但还是兼容下以前写的吧

dvStruct.viewer.btnStates={//做成对象是为了之后 多键自定义考虑  现在就左键,
    wwwc:{enable:0,type:0},
    pan:{enable:0,type:0},
    zoom:{enable:0,type:0},
    rotate:{enable:0,type:0},
    probe:{enable:0,type:0},
    probeUnSave:{enable:0,type:0},
    length:{enable:0,type:0},
    twolines:{enable:0,type:0},
    ellipticalRoi:{enable:0,type:0},
    rectangleRoi:{enable:0,type:0},
    angle:{enable:0,type:0},
    referenceLines:{enable:false}
};
dvStruct.viewer.leftBtnDisable = function(){//left mouse
    disableAllTools(1);
    for(var i in dvStruct.viewer.btnStates){
        if(dvStruct.viewer.btnStates[i].type&&dvStruct.viewer.btnStates[i].type==1){
            dvStruct.viewer.btnStates[i].enable=0;
        }
    }
};
dvStruct.viewer.middleBtnDisable = function(){
    disableAllTools(2);
    for(var i in dvStruct.viewer.btnStates){
        if(dvStruct.viewer.btnStates[i].type&&dvStruct.viewer.btnStates[i].type==2){
            dvStruct.viewer.btnStates[i].enable=0;
        }
    }
};
dvStruct.viewer.rightBtnDisable = function(){
    disableAllTools(4);
    for(var i in dvStruct.viewer.btnStates){
        if(dvStruct.viewer.btnStates[i].type&&dvStruct.viewer.btnStates[i].type==4){
            dvStruct.viewer.btnStates[i].enable=0;
        }
    }
};

function disableAllTools(type){
    dvStruct.viewer.eachElement({
        callback:function(element,wrapper){
            try {
                var img = cornerstone.getImage(element);
                if(_.isObject(img))
                    dvStruct.fun.disableTools(element,type);
            }catch(e){console.error(e);}
        }
    });
}

dvStruct.fun.disableTools = function(element,type)
{
    if(!type)type=1;//1是左键 2 is middle mouse button// 4 is right mouse button// 5 means left mouse button and right mouse button
    console.log(element,type);
    cornerstoneTools.wwwc.deactivate(element, type);
    cornerstoneTools.pan.deactivate(element, type);
    cornerstoneTools.zoom.deactivate(element, type);
    cornerstoneTools.rotate.deactivate(element, type);
    cornerstoneTools.probe.deactivate(element, type);
    cornerstoneTools.probeUnSave.deactivate(element, type);
    cornerstoneTools.length.deactivate(element, type);
    cornerstoneTools.ellipticalRoi.deactivate(element, type);
    cornerstoneTools.rectangleRoi.deactivate(element, type);
    cornerstoneTools.angle.deactivate(element, type);
    cornerstoneTools.twolines.deactivate(element, type);
};

//这个在disable或者初始ini之后
dvStruct.fun.checkAndSetActive = function(element){
    for(var i in dvStruct.viewer.btnStates){
        var type = dvStruct.viewer.btnStates[i].type;
        if(dvStruct.viewer.btnStates[i].enable){
            if(i=='referenceLines'){
                cornerstoneTools.referenceLines.tool.enable(element, synchronizer);
            }else{
                cornerstoneTools[i].activate(element, type);
            }
        }else{
            if(i=='referenceLines'){
                cornerstoneTools.referenceLines.tool.disable(element, synchronizer);
            }else{
                cornerstoneTools[i].deactivate(element, type);
            }
        }
    }
};

//var storage = window.localStorage;
//function showStorage(){
//    for(var i=0;i<storage.length;i++){
//        //key(i)获得相应的键，再用getItem()方法获得对应的值
//        document.write(storage.key(i)+ " : " + storage.getItem(storage.key(i)) + "<br>");
//    }
//}

(dvStruct.viewer.getBtnDiy = function(){
    if(localStorage.getItem('btnDiyStat')!='undefined'&&!!localStorage.getItem('btnDiyStat')){
        var re = JSON.parse(localStorage.getItem('btnDiyStat'));
        //因为一旦有更新的话，以前的字段就不知道能不能用了，所以这里要用代码确保一下
        var c = false;
        if(!re.default){re.default={enable:0,type:0,cls:'js-default'};}
        if(!re.wwwc){re.wwwc={enable:0,type:0,cls:'js-wwwl'};}
        if(!re.pan){re.pan={enable:0,type:0,cls:'js-pan'};}
        if(!re.zoom){re.zoom={enable:0,type:0,cls:'js-zoom'};}
        if(!re.probe){re.probe={enable:0,type:0,cls:'js-probe'};}
        if(!re.probeUnSave){re.probeUnSave={enable:0,type:0,cls:'js-probeUnSave'};}
        if(!re.length){re.length={enable:0,type:0,cls:'js-length'};}
        if(!re.twolines){re.twolines={enable:0,type:0,cls:'js-twolines'};}
        if(!re.ellipticalRoi){re.ellipticalRoi={enable:0,type:0,cls:'js-ellipse'};}
        if(!re.rectangleRoi){re.rectangleRoi={enable:0,type:0,cls:'js-rect'};}
        if(!re.angle){re.angle={enable:0,type:0,cls:'js-angle'};}
        if(c)localStorage.setItem('btnDiyStat',JSON.stringify(re));
    }else{
        localStorage.setItem('btnDiyStat',JSON.stringify({
            default:{enable:1,type:4,cls:'js-default'},
            wwwc:{enable:1,type:1,cls:'js-wwwl'},
            pan:{enable:0,type:0,cls:'js-pan'},
            zoom:{enable:0,type:0,cls:'js-zoom'},
            probe:{enable:0,type:0,cls:'js-probe'},
            probeUnSave:{enable:0,type:0,cls:'js-probeUnSave'},
            length:{enable:0,type:0,cls:'js-length'},
            twolines:{enable:0,type:0,cls:'js-twolines'},
            ellipticalRoi:{enable:0,type:0,cls:'js-ellipse'},
            rectangleRoi:{enable:0,type:0,cls:'js-rect'},
            angle:{enable:0,type:0,cls:'js-angle'}
        }));
    }
    return JSON.parse(localStorage.getItem('btnDiyStat'));
})();
//
dvStruct.viewer.initBtnDiy = function(){
    var stat = dvStruct.viewer.getBtnDiy();console.log(stat);
    $('.js-topPannel .btnArea').removeClass('leftBtnActive').removeClass('rightBtnActive').removeClass('middleBtnActive');
    for(var i in stat){
        if(stat[i].enable){
            for(var j in dvStruct.viewer.btnStates){
                if(i==j){
                    dvStruct.viewer.btnStates[j].type = stat[i].type;
                    dvStruct.viewer.btnStates[j].enable = stat[i].enable;
                }
            }
            switch(stat[i].type){
                case 1:
                    $('.'+stat[i].cls).addClass('leftBtnActive');break;
                case 2:
                    $('.'+stat[i].cls).addClass('middleBtnActive');break;
                case 4:
                    $('.'+stat[i].cls).addClass('rightBtnActive');break;
            }
        }
    }
}

//按钮，键位类型
dvStruct.viewer.saveDiyStat = function(cls,type){
    var stat = dvStruct.viewer.getBtnDiy();
    for(var i in stat){
        if(stat[i].type==type){
            stat[i].type=0;stat[i].enable=0;
        }
        if(stat[i].cls==cls){
            stat[i].type=type;stat[i].enable=1;
        }
    }
    localStorage.setItem('btnDiyStat',JSON.stringify(stat));
}