/**
 * Created by admin on 2016/3/28.
 */
function dvLocalLoader(imageId){
    //console.log(dvStruct.imgObjArr);
    var re =  _.find(dvStruct.imgObjArr,function(o){
        return o.imageId == imageId;
    });console.log('dvLocalLoader:',re);
    return re.imagePromise;
}
cornerstone.registerImageLoader('oridcm',dvLocalLoader);

function dvSeriesLoader(imageId){
    var re;
    var arr = imageId.split(':');
    winId = arr[1];
    var win  = _.find(dvStruct.viewer.winArr,function(o){
        return o.winId==winId;
    });
    if(_.isObject(win)){
        var re = _.find(win.imgObjArr,function(o){
            return o.imageId == imageId;
        });
    }
    if(_.isObject(re))return re.imagePromise;
    console.error('dvSeriesLoader:no re no imagePromise');
}
cornerstone.registerImageLoader('series',dvSeriesLoader);