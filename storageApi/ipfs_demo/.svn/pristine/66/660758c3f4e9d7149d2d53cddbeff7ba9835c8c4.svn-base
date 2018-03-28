/**
 * Created by admin on 2016/3/31.
 */
(function (cornerstoneTools) {

    "use strict";

    function metaDataProvider(type, imageId)
    {
        //image类型不会走里面吧...
        if(type === 'imagePlane') {

            // console.log(imageId);
            // console.log(oid,suid);
            var info = dvStruct.viewer.findOriInfoByIds(imageId);
            if(!_.isUndefined(info)){
                var iPP =  info.ImageInfo.ImagePositionPatient.val;
                var spacing = info.ImageInfo.PixelSpacing.val;//Physical distance in the patient between the center of each pixel, specified by a numericpair - adjacent row spacing (delimiter)adjacent column spacing in mm. See 10.X.1.1.
                var iOP = info.ImageInfo.ImageOrientationPatient.val;//The direction cosines of the first row and the first column with respect to the patient. See Section C.7.6.2.1.1 for further explanation.
                if(!iPP||!spacing)return undefined;
                var iPPvals = iPP.split("\\");//都是斜杠吧唔
                var iOPvals = iOP.split("\\");
                var spacing = spacing.split("\\");//if(!spacing[1])spacing[1]=spacing[0];//后面这句无脑加的
                var re = {
                    frameOfReferenceUID: info.UIDS.FrameOfReferenceUID.val,
                    rows: Number(info.ImageInfo.Rows.val),
                    columns:  Number(info.ImageInfo.Columns.val),
                    rowCosines: new cornerstoneMath.Vector3(parseFloat(iOPvals[0]),parseFloat(iOPvals[1]),parseFloat(iOPvals[2])),
                    columnCosines: new cornerstoneMath.Vector3(parseFloat(iOPvals[3]),parseFloat(iOPvals[4]),parseFloat(iOPvals[5])),
                    imagePositionPatient: new cornerstoneMath.Vector3(parseFloat(iPPvals[0]),parseFloat(iPPvals[1]),parseFloat(iPPvals[2])),
                    columnPixelSpacing: parseFloat(spacing[1]),
                    rowPixelSpacing: parseFloat(spacing[0])
                };
                //console.log(re);
                return re;
            }
        }
        return undefined;
    }

    cornerstoneTools.metaData.addProvider(metaDataProvider);

}(cornerstoneTools));