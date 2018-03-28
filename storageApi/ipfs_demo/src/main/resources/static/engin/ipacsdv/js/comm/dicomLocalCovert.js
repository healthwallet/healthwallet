/**
 * Created by admin on 2016/3/28.
 */

//dicom转换
function dicomLocalCovert(res,callback){

    //解析dicom
    var dicomPart10AsArrayBuffer = res;
    var byteArray = new Uint8Array(dicomPart10AsArrayBuffer);
    var dataSet = dicomParser.parseDicom(byteArray);
    if(!dataSet){alert('解析失败');return undefined;}
    //console.log(dataSet);
    //提取dicom信息
    var infoSet = getDicomInfo(dataSet);//console.log(infoSet);

    callback(dataSet);
    var imgObj = createNewImageObject(dataSet);dvStruct.imgObjArr.push(imgObj);
    return {dataSet:dataSet,infoSet:infoSet,imageId:imgObj.imageId,iid:infoSet.InstanceInfo.InstanceNumber.val};
}
function dicomLocalCoverUint8(byteArray,callback){
    var dataSet = dicomParser.parseDicom(byteArray);
    if(!dataSet){alert('解析失败');return undefined;}
    var infoSet = getDicomInfo(dataSet);//console.log(infoSet);

    callback(dataSet);
    var imgObj = createNewImageObject(dataSet);dvStruct.imgObjArr.push(imgObj);
    return {dataSet:dataSet,infoSet:infoSet,imageId:imgObj.imageId,iid:infoSet.InstanceInfo.InstanceNumber.val};
}

function getDicomInfo(dataSet) {
    var infoSet = {};
    var encodeWay = dataSet.string('x00080005');//这个就是Specific Character Set
    encodeWay = encodeWay ? encodeWay.toUpperCase() : undefined;
    // console.log('encodeWay', encodeWay);
    // console.log(dataSet);
    //奇葩事件记录  ISO_IR 100 可以识别却不可以解 iso-ir-100别名CP819 latin1 ISO_8859-1  GB18030也是可以解。。。。用 CP936也可以解 。。。也就是说，编码是中文，但是机器没改。。就是卧了个槽，话说这是日本人的编码吧，喔日本人
    //有了上面的事件，所以先做一个匹配度判断，能匹配的直接国标了
    if(encodeWay=='ISO_IR 192'||encodeWay=='ISO 10646-1'||encodeWay=='ISO 10646-2'){//UTF-8 ----
        infoDecode(dataSet, infoSet,'UTF-8');//但是用utf-8解出来都是数呢
        return infoSet;
    }else{
        if (_.isObject(jschardet)) {//这个的代价比较大，三百多k啊
            if (encodeWay && encodeWay.indexOf('GB') < 0) {
                var patientName = dataSet.string('x00100010');
                var institutionName = dataSet.string('x00080080');
                var studyDescription = dataSet.string('x00081030');
                var eo = jschardet.detect(patientName + institutionName + studyDescription);
                if (_.isObject(eo) && eo.confidence > 0.5) {
                    encodeWay = eo.encoding.toUpperCase();
                } else {//识别也可能不准，外国文字？？马蛋外国的就不管了---以后大不了地区判断
                    console.log(eo);
                    encodeWay = 'GB18030';
                }
            }
        } else {
            encodeWay = 'GB18030';//直接暴力用国标
        }
    }
    if (encodeWay && iconvForUse.encodingExists(encodeWay)) {//判断编码存在
        // console.log('exsit', iconvForUse.encodingExists(encodeWay));
        infoDecode(dataSet, infoSet, encodeWay);
    } else if (encodeWay && encodeWay.indexOf('GB') > -1) {//避免万一出现gb2313这种操蛋的情况
        encodeWay = 'GB18030';
        infoDecode(dataSet, infoSet, encodeWay);
    } else {
        console.log('没有特别编码  或者为 不能识别的编码方式');//console.log('encodeWay:',encodeWay);console.log( dataSet.string('x00080005'));
        //infoDecode(dataSet,infoSet,'');
        encodeWay = 'GB18030';//马蛋，居然有不带的，那就这样搞了
        infoDecode(dataSet, infoSet, encodeWay);
    }
    return infoSet;
}

//信息解析
function infoDecode(dataSet,infoSet,encodeWay){
    //信息组织  ----  data-dicom ---- 字符串处理    -----data-dicomUint---- 用length再怎么怎么滴 这里参考Chris Hafey的dragAndDropParse
    infoSet.PatientInfo = {
        PatientName:{
            tag:'x00100010',
            val:'',des:'',type:'data-dicom'
        },
        PatientID:{
            tag:'x00100020',
            val:'',des:'',type:'data-dicom'
        },
        PatientBirthDate:{
            tag:'x00100030',
            val:'',des:'',type:'data-dicom'
        },
        PatientBirthTime:{
            tag:'x00100032',
            val:'',des:'',type:'data-dicom'
        },
        PatientsAge:{
            tag:'x00101010',val:'',des:'',type:'data-dicom'
        },
        PatientSex:{
            tag:'x00100040',
            val:'',des:'',type:'data-dicom'
        },
        PatientWeight:{
            tag:'x00101030',
            val:'',des:'',type:'data-dicom'
        },
        PregnancyStatus:{//怀孕状态
            tag:'x001021c0',
            val:'',des:'',type:'data-dicom'
        },
        AccessionNumber:{
            tag:'x00080050',
            val:'',des:'',type:'data-dicom'
        },
        PatientPosition:{//病人位置   HFP头在前俯卧，HFS头在前仰卧
            tag:'x00185100',
            val:'',des:'',type:'data-dicom'
        },
    };
    infoSet.StudyInfo = {
        StudyDescription:{//描述
            tag:'x00081030',
            val:'',des:'',type:'data-dicom'
        },
        ProtocolName:{
            tag:'x00181030',
            val:'',des:'',type:'data-dicom'
        },
        Accession:{
            tag:'x00080050',
            val:'',des:'',type:'data-dicom'
        },
        StudyId:{
            tag:'x00200010',
            val:'',des:'',type:'data-dicom'
        },
        StudyDate:{//检查日期
            tag:'x00080020',
            val:'',des:'',type:'data-dicom'
        },
        StudyTime:{
            tag:'x00080030',
            val:'',des:'',type:'data-dicom'
        },
        ModalitiesInStudy:{//一个检查中含有的不同检查类型.
            tag:'x00080061',
            val:'',des:'',type:'data-dicom'
        }
    };
    infoSet.SeriesInfo = {
        SeriesDescription:{
            tag:'x0008103e',
            val:'',des:'',type:'data-dicom'
        },
        SeriesNo:{
            tag:'x00200011',
            val:'',des:'',type:'data-dicom'
        },
        Modality:{
            tag:'x00080060',
            val:'',des:'',type:'data-dicom'
        },
        BodyPart:{//身体部位
            tag:'x00180015',
            val:'',des:'',type:'data-dicom'
        },
        SeriesDate:{
            tag:'x00080021',
            val:'',des:'',type:'data-dicom'
        },
        SeriesTime:{
            tag:'x00080031',
            val:'',des:'',type:'data-dicom'
        },
        SliceThickness:{//层厚 mm  T
            tag:'x00180050',
            val:'',des:'',type:'data-dicom'
        },
        SpacingBetweenSlices:{//层与层之间的间距,单位为mm   --------  这个也特么不建议使用 ---  不过本来就没有用
            tag:'x00180088',val:'',des:'',type:'data-dicom'
        },
        SliceLocation:{//实际的相对位置，单位为mm.  L?  ----------  有时会是空的？？  ----------  老外说，不要用这个，经常空的，而且错的
            tag:'x00201041',
            val:'',des:'',type:'data-dicom'
        },
        MRAcquisition:{
            tag:'x00180023',val:'',des:'',type:'data-dicom'
        },
        FlipAngle:{
            tag:'x00181314',val:'',des:'',type:'data-dicom'
        }
    };
    infoSet.InstanceInfo={
        InstanceNumber:{//实例码 识别图像的号码？
            tag:'x00200013',
            val:'',des:'',type:'data-dicom'
        },
        ContentDate:{//影像拍摄的日期.
            tag:'x00080023',
            val:'',des:'',type:'data-dicom'
        },
        ContentTime:{//影像拍摄的日期.
            tag:'x00080033',
            val:'',des:'',type:'data-dicom'
        },
        AcquisitionNumber:{
            tag:'x00200012',
            val:'',des:'',type:'data-dicom'
        },
        AcquisitionDate:{
            tag:'x00080022',
            val:'',des:'',type:'data-dicom'
        },
        AcquisitionTime:{
            tag:'x00080032',
            val:'',des:'',type:'data-dicom'
        }
    };
    infoSet.ImageInfo={
        Rows:{
            tag:'x00280010',
            val:'',des:'',type:'data-dicomUint'
        },
        Columns:{
            tag:'x00280011',
            val:'',des:'',type:'data-dicomUint'
        },
        PhotometricInterpretation:{//MONOCHROME1，MONOCHROME2.用来判断图像是否是彩色的，MONOCHROME1/2是灰度图，RGB则是真彩色图，还有其他.
            tag:'x00280004',
            val:'',des:'',type:'data-dicom'
        },
        ImageType:{
            tag:'x00080008',
            val:'',des:'',type:'data-dicom'
        },
        BitsAllocated:{
            tag:'x00280100',
            val:'',des:'',type:'data-dicomUint'
        },
        BitsStored:{
            tag:'x00280101',
            val:'',des:'',type:'data-dicomUint'
        },
        HighBit:{
            tag:'x00280102',
            val:'',des:'',type:'data-dicomUint'
        },
        PixelRepresentation:{
            tag:'x00280103',
            val:'',des:'',type:'data-dicomUint'
        },
        RescaleSlope:{
            tag:'x00281053',
            val:'',des:'',type:'data-dicom'
        },
        RescaleIntercept:{
            tag:'x00281052',
            val:'',des:'',type:'data-dicom'
        },
        ImagePositionPatient:{
            tag:'x00200032',
            val:'',des:'',type:'data-dicom'
        },
        ImageOrientationPatient:{
            tag:'x00200037',
            val:'',des:'',type:'data-dicom'
        },
        PixelSpacing:{
            tag:'x00280030',
            val:'',des:'',type:'data-dicom'
        },
        ImagerPixelSpacing:{//DR的像素值存放位置
            tag:'x00181164',
            val:'',des:'',type:'data-dicom'
        },
        SamplesPerPixel:{
            tag:'x00280002',
            val:'',des:'',type:'data-dicomUint'
        },
        WindowCenter:{
            tag:'x00281050',
            val:'',des:'',type:'data-dicomUint'
        },
        WindowWidth:{
            tag:'x00281051',
            val:'',des:'',type:'data-dicomUint'
        },
        RescaleType:{
            tag:'x00281054',
            val:'',des:'',type:'data-dicomUint'
        },
        FieldofView:{
            tag:'x00180094',
            val:'',des:'',type:'data-dicom'
        }
    };
    infoSet.EquipmentInfo={
        Manufacturer:{
            tag:'x00080070',
            val:'',des:'',type:'data-dicom'
        },
        Model:{
            tag:'x00081090',
            val:'',des:'',type:'data-dicom'
        },
        StationName:{
            tag:'x00081010',
            val:'',des:'',type:'data-dicom'
        },
        AETitle:{
            tag:'x00020016',
            val:'',des:'',type:'data-dicom'
        },
        InstitutionName:{
            tag:'x00080080',
            val:'',des:'',type:'data-dicom'
        },
        SoftwareVersion:{
            tag:'x00181020',
            val:'',des:'',type:'data-dicom'
        },
        ImplementationVersionNam:{
            tag:'x00020013',
            val:'',des:'',type:'data-dicom'
        }
    };
    infoSet.UIDS = {
        StudyUID:{
            tag:'x0020000d',
            val:'',des:'',type:'data-dicom'
        },
        SeriesUID:{
            tag:'x0020000e',
            val:'',des:'',type:'data-dicom'
        },
        InstanceUID:{
            tag:'x00080018',
            val:'',des:'',type:'data-dicom'
        },
        SOPClassUID:{
            tag:'x00080016',
            val:'',des:'',type:'data-dicom'
        },
        TransferSyntaxUID:{
            tag:'x00020010',
            val:'',des:'',type:'data-dicom'
        },
        FrameOfReferenceUID:{
            tag:'x00200052',
            val:'',des:'',type:'data-dicom'
        },
    };
    infoSet.SomeUsefulInfo = {
        MagneticFieldStrength:{
            tag:"x00180087",
            val:'',des:'',type:'data-dicom'
        },
        RepetitionTime:{
            tag:"x00180080",
            val:'',des:'',type:'data-dicom'
        },
        EchoTime:{
            tag:'x00180081',
            val:'',des:'',type:'data-dicom'
        },
        //sj add
        kvp:{
            tag:'x00180060' ,
            val:'',des:'',type:'data-dicom'
        },
        mA:{
            tag:'x00181151',
            val:'',des:'',type:'data-dicom'
        },
        ww:{
            tag:'x00281051',
            val:'',des:'',type:'data-dicom'
        },
        wc:{
            tag:'x00281050',
            val:'',des:'',type:'data-dicom'
        }
        //sj add end
    };
    var others = {};
    for(var i in dataSet.elements){
        var tag = dataSet.elements[i].tag;
        var newInfo = true;
        for(var j in infoSet){
            var infoChildrenSet = infoSet[j];
            for(var k in infoChildrenSet){
                //console.log(infoChildrenSet[k].tag,tag);
                if(infoChildrenSet[k].tag==tag){
                    newInfo = false;break;
                }
            }
        }
        if(newInfo){
            others[i] = {
                tag:tag,
                val:'',des:'',type:'data-dicom'
            };
        }
    }
    //console.log(infoSet);
    infoSet.others = others;
    //翻译和取值
    try {
        for (var i in infoSet) {
            var infoChildrenSet = infoSet[i];
            for (var j in infoChildrenSet) {
                var info = infoChildrenSet[j];
                if (info.tag == 'x7fe00010')continue;//x7fe00010是数据
                matchDict(info);//字典匹配
                var tag = info.tag;
                if (info.type == 'data-dicom') {
                    var element = dataSet.elements[tag];
                    var text = "";
                    if (element !== undefined) {
                        var str = dataSet.string(tag);
                        if (str !== undefined) {
                            if (!encodeWay) {
                                text = str;
                            } else {
                                if (encodeWay == 'UTF-8') {
                                    text = iconvForUse.decode(str, encodeWay);
                                } else {
                                    //据说不推荐 但可以直接传str，因为并不是node后台，并没有Buffer.concat()
                                    //这个uint8Array试试，原理上应该是这个
                                    //x00020000 ，FileMetaInformationGroupLength,取出来前就是奇葩字符
                                    var b = new Uint8Array(str.length);
                                    for (var k = 0; k < b.length; k++) {
                                        var x = str.charCodeAt(k);
                                        b[k] = x;
                                    }
                                    //try {
                                    //console.log(b);
                                    text = iconvForUse.decode(b, encodeWay);
                                    //}catch(e){
                                    //    console.error(e);console.log(b,encodeWay);console.log(iconvForUse);
                                    //}
                                }
                            }
                        }
                    }
                    info.val = text;
                } else if (info.type == 'data-dicomUint') {
                    var element = dataSet.elements[tag];
                    var text = "";
                    if (element !== undefined) {
                        if (element.length === 2) {
                            text += dataSet.uint16(tag);
                        }
                        else if (element.length === 4) {
                            text += dataSet.uint32(tag);
                        }
                    }
                    info.val = text;
                }
            }
        }
    }catch(e){
        console.error('infoSet iconv error');
        console.error(e);
    }
}

//把里面的buffer拷贝出来改写成这个
Uint8Array.prototype.slice = function slice (start, end) {
    var len = this.length
    start = ~~start
    end = end === undefined ? len : ~~end

    if (start < 0) {
        start += len
        if (start < 0) start = 0
    } else if (start > len) {
        start = len
    }

    if (end < 0) {
        end += len
        if (end < 0) end = 0
    } else if (end > len) {
        end = len
    }

    if (end < start) end = start

    var newBuf
    if (Uint8Array.TYPED_ARRAY_SUPPORT) {
        newBuf = this.subarray(start, end)
        newBuf.__proto__ = Uint8Array.prototype
    } else {
        var sliceLen = end - start
        newBuf = new Uint8Array(sliceLen, undefined)
        for (var i = 0; i < sliceLen; i++) {
            newBuf[i] = this[i + start]
        }
    }

    if (newBuf.length) newBuf.parent = this.parent || this

    return newBuf
}

Uint8Array.prototype.copy = function copy (target, targetStart, start, end) {
    if (!start) start = 0
    if (!end && end !== 0) end = this.length
    if (targetStart >= target.length) targetStart = target.length
    if (!targetStart) targetStart = 0
    if (end > 0 && end < start) end = start

    // Copy 0 bytes; we're done
    if (end === start) return 0
    if (target.length === 0 || this.length === 0) return 0

    // Fatal error conditions
    if (targetStart < 0) {
        throw new RangeError('targetStart out of bounds')
    }
    if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
    if (end < 0) throw new RangeError('sourceEnd out of bounds')

    // Are we oob?
    if (end > this.length) end = this.length
    if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start
    }

    var len = end - start
    var i

    if (this === target && start < targetStart && targetStart < end) {
        // descending copy from end
        for (i = len - 1; i >= 0; i--) {
            target[i + targetStart] = this[i + start]
        }
    } else if (len < 1000 || !Uint8Array.TYPED_ARRAY_SUPPORT) {
        // ascending copy from start
        for (i = 0; i < len; i++) {
            target[i + targetStart] = this[i + start]
        }
    } else {
        Uint8Array.prototype.set.call(
            target,
            this.subarray(start, start + len),
            targetStart
        )
    }

    return len
}

//字典描述匹配
function matchDict(infoEle){
    var tag = infoEle.tag;
    if(tag){
        tag = '('+ tag.substr(1,4).toUpperCase()+','+tag.substr(5,4).toUpperCase() +')';
        if(TAG_DICT[tag]&&_.isObject(TAG_DICT[tag])){
            infoEle.des = TAG_DICT[tag].name;
        }
    }
}