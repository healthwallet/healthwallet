/**
 * Created by admin on 2016/4/26.
 */
if(!dvStruct){
    var dvStruct={}
}

dvStruct.enableSaveDownloaded = true;

dvStruct.downloadedDcmFiles=[];

commEventHandler.addEventListener('dicomDownloaded',function(event){
    if(!dvStruct.enableSaveDownloaded)return;
    dvStruct.downloadedDcmFiles.push({
        name:event.name,
        data:event.data,
        infoAfterAnalysised:event.infoAfterAnalysised
    });
});

dvStruct.saveDownloaded = function(){
    if(dvStruct.share)//如果为分享状态则不允许下载dcm格式，但可以下载为jpg
    {
        alert ("注：分享模式下，无法下载原dicom文件，请您选择下载jpg文件!");
        return;
    }
    var zip = new JSZip();
    var folder = zip.folder("dicoms");
    // console.log(dvStruct.downloadedDcmFiles);
    // for(var i=0;i<dvStruct.downloadedDcmFiles.length;i++){
    //     var fl = dvStruct.downloadedDcmFiles[i];
    //     folder.file(fl.name, fl.data);
    // }

    //sj change
    for(var i=0;i<dvStruct.seriesArr.length;i++)//遍历所有序列
    {
        for(var j=0;j<dvStruct.seriesArr[i].dicomArr.length;j++)//遍历单个序列的所有文件
        {
            var f1=dvStruct.seriesArr[i].dicomArr[j].dataSet;
            var fileName=i.toString()+"_"+j.toString()+".dcm";//文件名
            folder.file(fileName,f1.byteArray );
        }
    }
    //sj change end

    if (JSZip.support.blob) {
        zip.generateAsync({type:"blob"}).then(function (blob) {console.log(blob);
            fileSaveAs(blob, "dicoms.zip");
        }, function (err) {
            console.error(err);
        });
        return false;
    }
};//