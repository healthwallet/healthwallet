/**
 * Created by admin on 2016/4/6.
 */
var io = io || {};
io.Url = {
    load:function(url){
        var xhrRequestPromise =  io.Url.xhrRequest(url);
        return xhrRequestPromise;
    },
    xhrRequest:function(url) {//参考cornerstone，但是1，没有deferred——因为有压缩文件，结果不止一个；2，不用imageId
        // Make the request for the DICOM P10 SOP Instance
        var deferred = $.Deferred();
        var xhr = new XMLHttpRequest();
        xhr.open("get", url, true);
        xhr.responseType = "arraybuffer";
        cornerstoneWADOImageLoader.internal.options.beforeSend(xhr);
        xhr.onreadystatechange = function (oEvent) {
            // TODO: consider sending out progress messages here as we receive the pixel data
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    // request succeeded, create an image object and resolve the deferred
                    // Parse the DICOM File
                    var dicomPart10AsArrayBuffer = xhr.response;
                    var urlArr = url.split('/');
                    var fname = urlArr[urlArr.length-1];
                    var infoAfterAnalysised = {};
                    commEventHandler.fireEvent({type:'dicomDownloaded',name:fname,data:dicomPart10AsArrayBuffer,infoAfterAnalysised:infoAfterAnalysised});
                    var pos = url.lastIndexOf(".");
                    var ext =url.substring(pos,url.length);
                    unit.loadingProcessing.updateProcessing();
                    //后台传过来的是原文件或者一重zip
                    if (ext.toLowerCase() != ".zip" ){
                        var byteArray = new Uint8Array(dicomPart10AsArrayBuffer);
                        var dataSet = dicomParser.parseDicom(byteArray);
                        if(_.isObject(dataSet)){
                            var imgObj = createNewImageObject(dataSet);
                            var infoSet = getDicomInfo(dataSet);
                            var dicom = {dataSet:dataSet,infoSet:infoSet,imageId:imgObj.imageId,iid:infoSet.InstanceInfo.InstanceNumber.val};
                            dvStruct.imgObjArr.push(imgObj);
                            dvStruct.addDicom(dicom,infoAfterAnalysised);//infoAfterAnalysised是为了把序列与下载的dicom关联起来
                        }
                    }else{
                        var zip = new JSZip();
                        var zipPromise = zip.loadAsync(dicomPart10AsArrayBuffer);
                        zipPromise.then(function(zip){
                            for (var nameOfFileContainedInZipFile in zip.files)
                            {
                                var fileContainedInZipFile = zip.files[nameOfFileContainedInZipFile];
                                //console.log(fileContainedInZipFile);
                                //先判断类型，文件还是文件夹
                                if(fileContainedInZipFile.dir){
                                }else{
                                    dealUrlFile(zip,fileContainedInZipFile,infoAfterAnalysised);
                                }
                            }
                        });
                    }
                } else {
                    unit.loadingProcessing.updateProcessing(url);
                    // request failed, reject the deferred
                    deferred.reject(xhr.response);
                }
            }
        };
        xhr.onprogress = function (oProgress) {
            // console.log('progress:',oProgress)
            if (oProgress.lengthComputable) {  //evt.loaded the bytes browser receive
                //evt.total the total bytes seted by the header
                var loaded = oProgress.loaded;
                var total = oProgress.total;
                var percentComplete = Math.round((loaded / total) * 100);
            }
        };
        xhr.send();
        return deferred.promise();
    }
};
function dealUrlFile(zip,fileContainedInZipFile,infoAfterAnalysised){
    var name_pos = fileContainedInZipFile.name.lastIndexOf(".");
    var name_ext =fileContainedInZipFile.name.substring(name_pos,fileContainedInZipFile.name.length);
    if (name_ext.toLowerCase() != ".zip" ){
        var promise = zip.file(fileContainedInZipFile.name).async("uint8array");
        promise.then(function(byteArray){
            var dataSet = dicomParser.parseDicom(byteArray);
            if(_.isObject(dataSet)){
                var imgObj = createNewImageObject(dataSet);
                var infoSet = getDicomInfo(dataSet);
                var dicom = {dataSet:dataSet,infoSet:infoSet,imageId:imgObj.imageId,iid:infoSet.InstanceInfo.InstanceNumber.val};
                dvStruct.imgObjArr.push(imgObj);
                dvStruct.addDicom(dicom,infoAfterAnalysised);
            }
        });
    }else{
        goUrlZipWay(fileContainedInZipFile,infoAfterAnalysised);
    }
}
function goUrlZipWay(fileContainedInZipFile,infoAfterAnalysised){
    var zip = new JSZip();
    var promise = zip.loadAsync(fileContainedInZipFile._data.compressedContent);
    promise.then(function (zip) {
        for (var nameOfFileContainedInZipFile in zip.files) {
            var fileContainedInZipFile2 = zip.files[nameOfFileContainedInZipFile];
            //先判断类型，文件还是文件夹
            if (fileContainedInZipFile2.dir) {
            } else {
                dealUrlFile(zip,fileContainedInZipFile2,infoAfterAnalysised);
            }
        }
    });
}

try {//safari 9以下没得FileReader，做个保险，不然解缩后影响后面的，要崩
    io.File = {
        zipReader: new FileReader(),
        dcmReader: new FileReader(),
        load: function (files) {
            try {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    var pos = file.name.lastIndexOf(".");
                    var ext = file.name.substring(pos, file.name.length);
                    if (ext.toLowerCase() != ".zip") {
                        io.File.dcmReader.readAsArrayBuffer(file);
                    } else {
                        io.File.zipReader.readAsArrayBuffer(file);
                    }
                }
            } catch (e) {
                console.error(e);
                alert('加载异常');
            }
        },
        checkType: function () {

        },
        //zipReaderOnload:function(e) {
        //    //console.log(e);
        //    var zipFileLoaded = new JSZip(e.target.result);
        //    //console.log(zipFileLoaded);
        //    // do something with result
        //    for (var nameOfFileContainedInZipFile in zipFileLoaded.files)
        //    {
        //        var fileContainedInZipFile = zipFileLoaded.files[nameOfFileContainedInZipFile];
        //        //console.log(fileContainedInZipFile);
        //        //先判断类型，文件还是文件夹
        //        if(fileContainedInZipFile.dir){
        //        }else{
        //            io.File.zipReader.dealFile(fileContainedInZipFile);
        //        }
        //    }
        //}
        zipReaderOnload: function (e) {
            //console.log(e);
            var zip = new JSZip();
            var promise = zip.loadAsync(e.target.result);
            //console.log(promise);
            promise.then(function (zip) {
                console.log(zip);
                // do something with result
                //zip.forEach(function (relativePath, zipEntry) {
                //    console.log(zipEntry);
                //});
                for (var nameOfFileContainedInZipFile in zip.files) {
                    var fileContainedInZipFile = zip.files[nameOfFileContainedInZipFile];
                    //console.log(fileContainedInZipFile);
                    //先判断类型，文件还是文件夹
                    if (fileContainedInZipFile.dir) {
                    } else {
                        io.File.zipReader.dealFile(fileContainedInZipFile, zip);
                    }
                }
            });
        }
    };

    io.File.zipReader.onload = io.File.zipReaderOnload;
    io.File.zipReader.dealFile = function (fileContainedInZipFile, zip) {
        var str = fileContainedInZipFile.name;
        var pos = str.lastIndexOf(".");
        var ext = str.substring(pos, str.length);
        if (ext.toLowerCase() != ".zip") {
            try {
                var onLoadView = function (dataSet) {
                };
                var promise = zip.file(fileContainedInZipFile.name).async("uint8array");
                promise.then(function (result) {//console.log(result);
                    var dicom = dicomLocalCoverUint8(result, onLoadView);//console.log(dicom);
                    if (dicom) {
                        dvStruct.addDicom(dicom,{});
                    }
                })
            } catch (error) {
                console.error(error);
            }
        } else {
            var promise = zip.file(fileContainedInZipFile.name).async("blob");
            promise.then(function (blob) {
                var reader = new FileReader();
                reader.onload = io.File.zipReaderOnload;
                reader.readAsArrayBuffer(blob);
            })
        }
    }

    io.File.dcmReader.onload = function (e) {
        //try {
        var onLoadView = function (dataSet) {
        };
        console.log(e, e.target, e.target.result);
        var dicom = dicomLocalCovert(e.target.result, onLoadView);
        if (dicom) {
            dvStruct.addDicom(dicom,{});
        }
        //} catch (error) {
        //    console.error(error);
        //    alert('解析异常');
        //}
    };

}catch(e){console.error(e);}