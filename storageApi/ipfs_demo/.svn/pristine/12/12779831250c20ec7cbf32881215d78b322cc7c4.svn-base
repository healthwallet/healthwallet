(function($, cornerstone, cornerstoneTools) {

    'use strict';
    function dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }
    function saveAllAs(filename,opts) {
        var canvasDiv = document.createElement('div');
        var opts = opts||{};
        var size = opts.size||500;
        canvasDiv.style.width = size;canvasDiv.style.height = size;

        cornerstone.enable(canvasDiv);
        var canvas = $(canvasDiv).find('canvas').get(0);canvas.width = size;canvas.height=size;canvas.style.width = size;canvas.style.height = size;

        var zip = new JSZip();
        var folder = zip.folder(filename);

    /*    for(var i=0;i<dvStruct.imgObjArr.length;i++){
            var imagePromise = dvStruct.imgObjArr[i].imagePromise;
            imagePromise.then(function(image){
                cornerstone.displayImage(canvasDiv,image);
            });
            if( opts.type=='png'){
                var picurl = canvas.toDataURL('image/png');
                var picblob = dataURLtoBlob(picurl);
                folder.file(i+'.png',picblob);
            }else{
                var picurl = canvas.toDataURL('image/jpeg');
                var picblob = dataURLtoBlob(picurl);
                folder.file(i+'.jpg',picblob);
            }
        }*/
        //sj change
        var imagePromise;
        for(var i=0;i<dvStruct.seriesArr.length;i++)//遍历所有序列
        {
            for(var j=0;j<dvStruct.seriesArr[i].dicomArr.length;j++)//遍历单个序列的所有文件
            {
                var targetImageId =  dvStruct.seriesArr[i].dicomArr[j].imageId ;
                //通过targetImageId找到对应的imagePromise
                for(var k=0;k<dvStruct.imgObjArr.length;k++) {
                    if(dvStruct.imgObjArr[k].imageId===targetImageId)
                    {
                        imagePromise = dvStruct.imgObjArr[k].imagePromise ;
                        imagePromise.then(function(image){
                            // cornerstone.displayImage(canvasDiv,image);
                            cornerstone.displayImageForJpg(canvasDiv,image);//调用专门的函数绘制jpg保存图像
                            return;
                        });//绘制图像
                        //保存图像
                        if( opts.type=='png'){
                            var picurl = canvas.toDataURL('image/png');
                            var picblob = dataURLtoBlob(picurl);
                            folder.file(i.toString()+"_"+j.toString()+'.png',picblob);
                        }else{
                            var picurl = canvas.toDataURL('image/jpeg');
                            var picblob = dataURLtoBlob(picurl);
                            folder.file(i.toString()+"_"+j.toString()+'.jpg',picblob);
                        }
                        k=0;
                        break;
                    }
                }
            }
        }
        //sj change end


        if (JSZip.support.blob) {
            zip.generateAsync({type:"blob"}).then(function (blob) {
                fileSaveAs(blob, filename+".zip");
            }, function (err) {
                console.error(err);
            });
            return false;
        }
    }

    cornerstoneTools.saveAllAs = saveAllAs;

})($, cornerstone, cornerstoneTools);
