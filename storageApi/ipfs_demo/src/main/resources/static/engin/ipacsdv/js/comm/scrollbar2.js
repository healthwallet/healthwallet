/**
 * Created by SongJing on 2017/3/17.
 */


/*
* 获取鼠标点击位置x,y
* */
function GetPostion(e) {
    var x = getX(e);
    var y = getY(e);
}
/*
 * 获取鼠标点击位置x
 * */
function getX(e) {
    e = e || window.event;

    return e.pageX || e.clientX + document.body.scrollLeft;
}
/*
 * 获取鼠标点击位置y
 * */
function getY(e) {
    e = e|| window.event;
    return e.pageY || e.clientY + document.body.scrollTop;
}
/*
右侧图像切换滚动条
*/ 

$(function () {
    function goToShowIndexX(scale) {

        var win =  dvStruct.whereIsMouse;
        dvStruct.fun.elementPaging(win);
        dvStruct.fun.synPagingCheck(win);

        if(_.isObject(win)){
            for(var i=0;i<win.col*win.row;i++){
                var wrapper = win.wrappers[i];
                var stack = wrapper.stack;
                var len = stack.imageIds.length;
                var imgIndex=parseInt(len*scale);
// console.log("图像索引："+imgIndex);
                if(len>0){
                        if(imgIndex<=0){
                            stack.currentImageIdIndex = 0;
                        }
                        else if(imgIndex>=len) {
                            stack.currentImageIdIndex=len-1;
                        }else
                         {
                            stack.currentImageIdIndex=imgIndex;
                        }
                    var imageId = stack.imageIds[stack.currentImageIdIndex];
                    cornerstone.loadImage(imageId).then(function(image){
                        cornerstone.displayImage(wrapper.element, image);
                    });
                }
            }
        }

    }
    function goToShowIndexY(scale) {

        var win =  dvStruct.whereIsMouse;
        dvStruct.fun.elementPaging(win);
        dvStruct.fun.synPagingCheck(win);

        if(_.isObject(win)){
            for(var i=0;i<win.col*win.row;i++){
                var wrapper = win.wrappers[i];
                var stack = wrapper.stack;
                var len = stack.imageIds.length;
                var imgIndex=parseInt(len*scale);
// console.log("图像索引："+imgIndex);
                if(len>0){
                    if(imgIndex<=0){
                        stack.currentImageIdIndex = 0;
                    }
                    else if(imgIndex>=len) {
                        stack.currentImageIdIndex=len-1;
                    }else
                    {
                        stack.currentImageIdIndex=imgIndex;
                    }
                    var imageId = stack.imageIds[stack.currentImageIdIndex];
                    cornerstone.loadImage(imageId).then(function(image){
                        cornerstone.displayImage(wrapper.element, image);
                    });
                }
            }
        }

    }
    var isMove=false;
    var sliderX;//鼠标离控件左上角的相对位置
    var sliderY;//鼠标离控件左上角的相对位置
    var moveBlockDom;
    var moveSliderDom;
    var maxLeft;
    var maxBotoom;
    //鼠标移动到滚动条上并且当前窗口中图像数大于1
    $(document).on('mouseenter', '.imgSlider', function (){
        var seriesLength = parseInt($(this).parents('.seriesWindow').find('.js-info-totalNo').text().slice(1));
        if(seriesLength>1){
            $(this).css("opacity", "1");
        }
    });

    //当前状态仍为图像切换则不隐藏当前操作的滚动条
    $(document).on('mouseleave', '.imgSlider', function (){
        if(!isMove){
            $(this).css("opacity","0");
        }

    });
    $(document).on('click', '.imgSlider', function (e){
        var sliderW=$(this).width();
        var blockW=$(this).children('.imgblock').width();
        var MaxW=sliderW-blockW;


        var sliderH=$(this).height();
        var blockH=$(this).children('.imgblock').height();
        var MaxH=sliderH-blockH;

        var x = getX(e);
        var y = getY(e);
        var offset=$(this).offset();
        var detaX=x-offset.left;

        var detaY=y-offset.top;

       /* if(detaX>MaxW)
            detaX=MaxW;
        if(detaX<0)
            detaX=0;
        $(this).children('.imgblock').css({"left":detaX});*/

        if(detaY>MaxH)
            detaY=MaxH;
        if(detaY<0)
            detaY=0;
        // console.log(MaxH);
        // console.log(detaY);
        $(this).children('.imgblock').css({"top":detaY});


        var scaleX=detaX/MaxW;

        var scaleY=detaY/MaxH;
        goToShowIndexY(scaleY);
    });
    $(document).on('mousedown', '.imgblock', function (e) {

        isMove = true;
        sliderX=$(this).parent('.imgSlider').offset().left;
        sliderY=$(this).parent('.imgSlider').offset().top;

        moveBlockDom=$(this);
        moveSliderDom=$(this).parent('.imgSlider');

        maxLeft=$(this).parent('.imgSlider').width()-$(this).width();

        maxBotoom=$(this).parent('.imgSlider').height()-$(this).height();

    });
    //鼠标弹起，隐藏所有滚动条
    $(document).on('mouseup', function (ev) {
        isMove = false;
        $('.imgSlider').each(function () {
            $(this).css("opacity", "0");
        });
    });

     $(document).on('mousemove',function (e) {
        if (isMove) {
           /* var detaX=e.pageX-sliderX;//控件左上角到屏幕左上角的相对位置
            if(detaX<0){
                detaX=0;
            }
           else if(detaX>maxLeft){
                detaX=maxLeft;
            }
            moveBlockDom.css({"left":detaX});
            var scaleX=detaX/maxLeft;*/


            var detaY=e.pageY-sliderY;//控件左上角到屏幕左上角的相对位置
            if(detaY<0){
                detaY=0;
            }
            else if(detaY>maxBotoom){
                detaY=maxBotoom;
            }
          //  console.log(detaY);
            moveBlockDom.css({"top":detaY});

            var scaleY=detaY/maxBotoom;
            goToShowIndexY(scaleY);
        }
    });

});

