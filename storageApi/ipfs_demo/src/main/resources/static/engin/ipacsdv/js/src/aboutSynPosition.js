/**
 * Created by admin on 2016/6/13.
 */
if(!dvStruct){
    var dvStruct = {};
}
dvStruct.vo = {};
dvStruct.vo.getPositionById = function(imageId){
    var sourceImagePlane = cornerstoneTools.metaData.get('imagePlane', imageId);
    return sourceImagePlane.imagePositionPatient;
};
dvStruct.vo.calDistanceSquared = function(vectors,offsets){
    var aVec = vectors[0];
    var bVec = vectors[1];
    //!![]为真哦，这里扫盲下
    if(!!offsets&&offsets.length>1){
        var aofs = offsets[0],bofs = offsets[1];
        aVec.x -= aofs.x;
        aVec.y -= aofs.y;
        aVec.z -= aofs.z;
        bVec.x -= bofs.x;
        bVec.y -= bofs.y;
        bVec.z -= bofs.z;
    }
    var dx = aVec.x - bVec.x;
    var dy = aVec.y - bVec.y;
    var dz = aVec.z - bVec.z;
    //只是用于比大小的话没必要再开方了
    return dx * dx + dy * dy + dz * dz;
};

dvStruct.vo.farsideCal = function(va,vb){
    var move = 500000;//全部移动到一侧 再比较
    return ((va.x+move)*(va.x+move) + (va.y+move)*(va.y+move) + (va.z+move)*(va.z+move))<((vb.x+move)*(vb.x+move) + (vb.y+move)*(vb.y+move) + (vb.z+move)*(vb.z+move))?vb:va;
};
dvStruct.vo.notSame = function(va,vb){
    return (va.x==vb.x&&va.y==vb.y&&va.z==vb.z)?false:true;
};

//---------------------------------------------------
//offset有时因为图少的原因可能有问题   而且。。。。可能有横图 竖图 同时在。。。。总之offset不是这么定的。至于不能联动不同医院，日期，设备不同的，只能抱歉了

//-------------syn-----------------------------------
dvStruct.synposition = {};
dvStruct.synposition.enable = false;
dvStruct.synposition.findAndSyn=function(imageId,wrapper){
    function otherPaging(win,nowPage){
        //其它的
        for(var k=1;k<win.col*win.row;k++){
            var wrapper = win.wrappers[k];
            var stack = wrapper.stack;
            var len = stack.imageIds.length;
            if(len>0){
                stack.currentImageIdIndex=nowPage+k;
                if(stack.currentImageIdIndex<len){
                }else{
                    stack.currentImageIdIndex-=len;
                }
                var imageId = stack.imageIds[stack.currentImageIdIndex];
                cornerstone.loadImage(imageId).then(function(image){
                    cornerstone.displayImage(wrapper.element, image);
                });
            }
        }
    }
    var suid = wrapper.suid;
    var p1 = cornerstoneTools.metaData.get('imagePlane', imageId);
    var ind = wrapper.stack.currentImageIdIndex;
    var sourceImagePosition = p1.imagePositionPatient;
    //offset矫正
    var ss = dvStruct.findSeries(suid);
    console.log(ss.offset,imageId);
    //sourceImagePosition.x-=ss.offset.x;
    //sourceImagePosition.y-=ss.offset.y;
    //sourceImagePosition.z-=ss.offset.z;
    if(_.isUndefined(p1))return;
    //叉乘求法向量
    var normal1 = p1.rowCosines.clone().crossVectors(p1.rowCosines,p1.columnCosines);
    normal1.normalize();
    //遍历各个窗
    for(var i=0;i<dvStruct.viewer.winArr.length;i++){
        var win = dvStruct.viewer.winArr[i];
        var wrap = win.wrappers[0];
        if(!!!wrap.suid)continue;
        //排除自己
        //console.log($(wrap.element).parents('.seriesWindow:first').attr('id'),$(wrapper.element).parents('.seriesWindow:first').attr('id'));
        if($(wrap.element).parents('.seriesWindow:first').attr('id')==$(wrapper.element).parents('.seriesWindow:first').attr('id')){
            continue;
        }
        //相同序列
        if(dvStruct.viewer.winArr[i].wrappers[0].suid == suid){
            wrap.stack.currentImageIdIndex =ind;
            cornerstone.loadImage(imageId).then(function(image){
                cornerstone.displayImage(wrap.element, image);
            });
            continue;
        }

        //计算最接近的面
        var minDistance = Number.MAX_VALUE;
        var newImageIdIndex = -1;
        var ts =  dvStruct.findSeries(wrap.suid);
        $.each(wrap.stack.imageIds, function(index, imageId) {
            //检测平行
            var imageId2 = wrap.stack.imageIds[index];
            var p2 = cornerstoneTools.metaData.get('imagePlane', imageId2);
            if(_.isUndefined(p2))return true;
            var normal2 = p2.rowCosines.clone().crossVectors(p2.rowCosines,p2.columnCosines);
            normal2.normalize();
            if(normal1.clone().cross(normal2).length()<1e-3){
                //算作平行
                var imagePlane = cornerstoneTools.metaData.get('imagePlane', imageId);
                var imagePosition = imagePlane.imagePositionPatient;
                //offset矫正
                //imagePosition.x-=ts.offset.x;
                //imagePosition.y-=ts.offset.y;
                //imagePosition.z-=ts.offset.z;
                //距离
                console.log(sourceImagePosition,imagePosition);
                var distance = dvStruct.vo.calDistanceSquared([sourceImagePosition,imagePosition]);
                if (distance < minDistance) {
                    minDistance = distance;
                    newImageIdIndex = index;
                }
            }
        });
        //console.log(minDistance,newImageIdIndex,wrap.element,wrap.stack.currentImageIdIndex);
        //就是当前平面
        if (newImageIdIndex === wrap.stack.currentImageIdIndex) {
            return;
        }
        if (newImageIdIndex !== -1) {
            wrap.stack.currentImageIdIndex = newImageIdIndex;
            cornerstone.loadImage(wrap.stack.imageIds[newImageIdIndex]).then(function(image) {
                cornerstone.displayImage(wrap.element, image);
            }, function(error) {
               console.error(error);
            });
            otherPaging(win,newImageIdIndex);
        }
    }
}