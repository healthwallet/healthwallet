/**
 * Created by admin on 2016/5/30.
 */
function helperIni(){
    function addBtnHelper($node, title, opts) {
        if(!opts)opts={};
        if(!opts.txt){
            var txt=''
        }else{var txt = opts.txt;}
        var w = Math.max(title.length,txt.length)*14+20;
        w = w>150?150:w;
        var html = '<div class="help" style="width: '+w+'px">';
        html += '<div class="triangle"></div>';
        html += '<span class="title">' + title + '</span><br/>';
        if (opts.txt)html += '<p class="gray" style="width: '+(w-20)+'px">' + opts.txt + '</p>';
        html += '</div>';
        $node.append(html);
    }

    addBtnHelper($('.js-default'), '默认鼠标');
    addBtnHelper($('.js-wwwl'), '调窗');
    addBtnHelper($('.js-wwwldiy'), '数值调窗');
    addBtnHelper($('.js-invert'), '反显');
    addBtnHelper($('.js-fakecolor'), '伪彩');
    addBtnHelper($('.js-zoom'), '缩放');
    // addBtnHelper($('.js-cw'), '旋转');
    //sj add
    addBtnHelper($('.js-ccw'), '左旋');
    addBtnHelper($('.js-cw'), '右旋');
    //sj add end
    addBtnHelper($('.js-pan'), '移动');
    addBtnHelper($('.js-reference'), '定位线');
    addBtnHelper($('.js-probe'), '点测量');
    addBtnHelper($('.js-probeUnSave'), '点测量',{txt: '图像上不保留点'});
    addBtnHelper($('.js-length'), '线测量');
    addBtnHelper($('.js-twolines'), '心胸比');
    addBtnHelper($('.js-angle'), '角度测量');
    addBtnHelper($('.js-ellipse'), '椭圆测量');
    addBtnHelper($('.js-rect'), '矩形测量');
    addBtnHelper($('.js-clearToolState'), '清空测量');
    addBtnHelper($('.js-play'), '播放');
    addBtnHelper($('.js-stop'), '停止');
    addBtnHelper($('.js-layoutSelector'), '窗口布局', {txt: '一个窗口对应一个序列'});
    addBtnHelper($('.js-innerlayoutSelector'), '序列布局', {txt: '即子窗口布局改变'});
    addBtnHelper($('.js-scrollAll'), '翻页联动');
    addBtnHelper($('.js-infoVisible'), '显示信息');
    addBtnHelper($('.js-fileSave'), '下载保存', {txt:'仅下载已从服务端发到浏览器的dicom集'});
    addBtnHelper($('.js-fileSaveJpg'), '下载保存为jpg');//sj add
    addBtnHelper($('.js-syn'), '图像联动');
    addBtnHelper($('.js-mpr'), 'mpr');
//帮助
    var helpTiming;
    $(".btnArea").hover(function () {
        var _this = this;
        helpTiming = setTimeout(function () {
            //console.log(node);console.log('timing');
            $(_this).find(".help").show();
        }, 1000);
    }, function () {
        $(this).find(".help").hide();
        try {
            clearTimeout(helpTiming);
        } catch (e) {
        }
    });
};