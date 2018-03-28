/**
 * Created by Administrator on 2016/9/18.
 */

function getObj( imgPlaneData)
{
    var obj={
        space:new Array(imgPlaneData.rowPixelSpacing,imgPlaneData.columnPixelSpacing),

        size:new Array(imgPlaneData.rows,imgPlaneData.columns),
        o:imgPlaneData.imagePositionPatient,
        vecR:imgPlaneData.rowCosines,
        vecC:imgPlaneData.columnCosines
    };
    return obj;
}
// (function($, cornerstone, cornerstoneTools) {
//
//     'use strict';

var xloc = {

    //显示版本号
    version: function() {
        return "xloc v0.1 by xteam 2015-06-08";
    },

    //向量点乘法
    VecDot: function(v1, v2) {
        var ret = 0.0;
        for (i = 0; i < 3; i++) {
            ret += v1[i] * v2[i];
        }
        return ret;
    },
    //向量叉乘法:u x v = { u2v3-v2u3 , u3v1-v3u1 , u1v2-u2v1 }
    VecCross: function(v1, v2, pVecOut) {
        pVecOut[0] = v1[1] * v2[2] - v1[2] * v2[1];
        pVecOut[1] = v1[2] * v2[0] - v1[0] * v2[2];
        pVecOut[2] = v1[0] * v2[1] - v1[1] * v2[0];
    },
    //向量模长
    VecMode: function(v) {
        var mode;
        mode = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        return mode;
    },

    //根据2个点得到向量
    VecPoint: function(p1, p2, pVecOut) {
        for (i = 0; i < 3; i++) {
            pVecOut[i] = p2[i] - p1[i];
        }
    },

    //进行定位线计算
    LocalCalc: function(locStrIn, axStrIn) {
        var retObj = {
            flag: 0,
            value: " ",
            xp1: new Array("a", "a"),
            xp2: new Array("a", "a")
        }; //用于返回相交两点的坐标；

         var V_ZERO = 0.0001;
        //进行输入参数分解,定位图
        //var imgLoc = new TDicomInfo();
        var imgLoc = {
            space: new Array(0, 0),
            size: new Array(0, 0),
            o: new Array(0, 0, 0),
            vecR: new Array(0, 0, 0),
            vecC: new Array(0, 0, 0),
            n: new Array(0, 0, 0),
            p1: new Array(0, 0, 0),
            p2: new Array(0, 0, 0),
            p3: new Array(0, 0, 0)
        };
        imgLoc.space=locStrIn.space;
        imgLoc.size=locStrIn.size;

        imgLoc.vecR[0]=locStrIn.vecR.x;
        imgLoc.vecR[1]=locStrIn.vecR.y;
        imgLoc.vecR[2]=locStrIn.vecR.z;
        imgLoc.vecC[0]=locStrIn.vecC.x;
        imgLoc.vecC[1]=locStrIn.vecC.y;
        imgLoc.vecC[2]=locStrIn.vecC.z;

        imgLoc.o[0] = locStrIn.o.x;
        imgLoc.o[1] = locStrIn.o.y;
        imgLoc.o[2] = locStrIn.o.z;



        //进行输入参数分解,切片图
        //var imgAx = new TDicomInfo();

        var imgAx = {
            space: new Array(0, 0),
            size: new Array(0, 0),
            o: new Array(0, 0, 0),
            vecR: new Array(0, 0, 0),
            vecC: new Array(0, 0, 0),
            n: new Array(0, 0, 0),
            p1: new Array(0, 0, 0),
            p2: new Array(0, 0, 0),
            p3: new Array(0, 0, 0)
        };

        imgAx.space=axStrIn.space;
        imgAx.size=axStrIn.size;
        imgAx.vecR[0]=axStrIn.vecR.x;
        imgAx.vecR[1]=axStrIn.vecR.y;
        imgAx.vecR[2]=axStrIn.vecR.z;
        imgAx.vecC[0]=axStrIn.vecC.x;
        imgAx.vecC[1]=axStrIn.vecC.y;
        imgAx.vecC[2]=axStrIn.vecC.z;
        imgAx.o[0] = axStrIn.o.x;
        imgAx.o[1] = axStrIn.o.y;
        imgAx.o[2] = axStrIn.o.z;




        //进行行列方向矢量规范

        for (i = 0; i < 3; i++) {
            imgLoc.vecR[i] = Math.abs(imgLoc.vecR[i]) < V_ZERO ? 0 : imgLoc.vecR[i];
            imgLoc.vecC[i] = Math.abs(imgLoc.vecC[i]) < V_ZERO ? 0 : imgLoc.vecC[i];

            imgAx.vecR[i] = Math.abs(imgAx.vecR[i]) < V_ZERO ? 0 : imgAx.vecR[i];
            imgAx.vecC[i] = Math.abs(imgAx.vecC[i]) < V_ZERO ? 0 : imgAx.vecC[i];
        }
        //计算定位图和切片图的法向量
        xloc.VecCross(imgLoc.vecR, imgLoc.vecC, imgLoc.n);
        xloc.VecCross(imgAx.vecR, imgAx.vecC, imgAx.n);


        //计算定位图和切片图的P1，P2，P3
        for (i = 0; i < 3; i++) {
            //P1点
            imgLoc.p1[i] = imgLoc.o[i];
            imgAx.p1[i] = imgAx.o[i];

            //P2点
            imgLoc.p2[i] = imgLoc.p1[i] + imgLoc.vecR[i] * imgLoc.space[0] * imgLoc.size[1];
            imgAx.p2[i] = imgAx.p1[i] + imgAx.vecR[i] * imgAx.space[0] * imgAx.size[1];

            //计算P3点
            imgLoc.p3[i] = imgLoc.p1[i] + imgLoc.vecC[i] * imgLoc.space[0] * imgLoc.size[1];
            imgAx.p3[i] = imgAx.p1[i] + imgAx.vecC[i] * imgAx.space[0] * imgAx.size[1];
        }



        // 判断直线P1P2P3P4是否和定位图相交
        var t12 = 0,
            t13 = 0,
            t24 = 0,
            t34 = 0;
        for (i = 0; i < 3; i++) {
            t12 += imgLoc.n[i] * imgAx.vecR[i];
            t13 += imgLoc.n[i] * imgAx.vecC[i];
            t24 += imgLoc.n[i] * imgAx.vecC[i];
            t34 += imgLoc.n[i] * imgAx.vecR[i];
        }

        //判断是否平行
        if (Math.abs(t12) + Math.abs(t13) + Math.abs(t24) + Math.abs(t34) < V_ZERO) {
            //printf("[0:0]-[0:0]\n");
            retObj.value = "定位图和切面平行";
            return retObj;
            // return;
        }




        //P12 P34平行，计算P13 P24交点
        if (Math.abs(t12) < V_ZERO) {
            //计算实际
            //t13 = dot(a1-p1, n1);
            //t24 = dot(a1-p2, n1);
            t13 = 0.0;
            t24 = 0.0;
            for (i = 0; i < 3; i++) {
                t13 += (imgLoc.p1[i] - imgAx.p1[i]) * imgLoc.n[i];
                t24 += (imgLoc.p1[i] - imgAx.p2[i]) * imgLoc.n[i];
            }

            //计算实际p13,p24
            var p13 = new Array(0.0, 0.0, 0.0),
                p24 = new Array(0.0, 0.0, 0.0);

            //p13 = p1 + t13*c2;
            //p24 = p2 + t24*c2;
            for (i = 0; i < 3; i++) {
                p13[i] = imgAx.p1[i] + t13 * imgAx.vecC[i];
                p24[i] = imgAx.p2[i] + t24 * imgAx.vecC[i];

            }


            var vecP13A1 = new Array(0.0, 0.0, 0.0),
                vecP24A1 = new Array(0.0, 0.0, 0.0),
                vecA2A1 = new Array(0.0, 0.0, 0.0),
                vecA3A1 = new Array(0.0, 0.0, 0.0),
                tmp = 0.0;
            var cc13 = 0,
                rr13 = 0,
                cc24 = 0,
                rr24 = 0;
            xloc.VecPoint(imgLoc.p1, p13, vecP13A1);
            xloc.VecPoint(imgLoc.p1, p24, vecP24A1);
            xloc.VecPoint(imgLoc.p1, imgLoc.p2, vecA2A1);
            xloc.VecPoint(imgLoc.p1, imgLoc.p3, vecA3A1);
            //取得第一个交点
            tmp = (xloc.VecDot(vecP13A1, vecA2A1) / (xloc.VecMode(vecP13A1) * xloc.VecMode(vecA2A1)) * xloc.VecMode(vecP13A1)) / xloc.VecMode(vecA2A1);
            cc13 = parseInt(tmp * imgLoc.size[0]);
            tmp = (xloc.VecDot(vecP13A1, vecA3A1) / (xloc.VecMode(vecP13A1) * xloc.VecMode(vecA3A1)) * xloc.VecMode(vecP13A1) / xloc.VecMode(vecA3A1));
            rr13 = parseInt(tmp * imgLoc.size[1]);
            tmp = (xloc.VecDot(vecP24A1, vecA2A1) / (xloc.VecMode(vecP24A1) * xloc.VecMode(vecA2A1)) * xloc.VecMode(vecP24A1)) / xloc.VecMode(vecA2A1);
            cc24 = parseInt(tmp * imgLoc.size[0]);
            tmp = (xloc.VecDot(vecP24A1, vecA3A1) / (xloc.VecMode(vecP24A1) * xloc.VecMode(vecA3A1)) * xloc.VecMode(vecP24A1) / xloc.VecMode(vecA3A1));
            rr24 = parseInt(tmp * imgLoc.size[1]);


            retObj.xp1[0] = cc13;
            retObj.xp1[1] = rr13;
            retObj.xp2[0] = cc24;
            retObj.xp2[1] = rr24;
            retObj.flag = 1;
            retObj.value = "得到定位坐标";
            // return retObj;


            return {
                start: {x:cc13,
                    y:rr13
                } ,
                end:{x:cc24,
                    y:rr24
                }
            };

        } else //if (Math.abs(t13) < V_ZERO) //P13 P24平行，计算P12 P34交点
        {
            t12 = 0.0;
            t34 = 0.0;
            for (i = 0; i < 3; i++) {
                t13 += (imgLoc.p1[i] - imgAx.p1[i]) * imgLoc.n[i];
                t24 += (imgLoc.p1[i] - imgAx.p3[i]) * imgLoc.n[i];
            }
            //计算实际p12,p34
            var p12 = new Array(0.0, 0.0, 0.0),
                p34 = new Array(0.0, 0.0, 0.0);

            //p12 = p1 + t12*c2;
            //p34 = p3 + t34*c2;
            for (i = 0; i < 3; i++) {
                p12[i] = imgAx.p2[i] + t12 * imgAx.vecR[i];
                p34[i] = imgAx.p3[i] + t34 * imgAx.vecR[i];

            }

            var vecP12A1 = new Array(0.0, 0.0, 0.0),
                vecP34A1 = new Array(0.0, 0.0, 0.0);
            vecA2A1 = new Array(0.0, 0.0, 0.0),
                vecA3A1 = new Array(0.0, 0.0, 0.0),
                tmp = 0.0;
            cc13 = 0;
            rr13 = 0;
            cc24 = 0;
            rr24 = 0;
            xloc.VecPoint(imgLoc.p1, p12, vecP12A1);
            xloc.VecPoint(imgLoc.p1, p34, vecP34A1);
            xloc.VecPoint(imgLoc.p1, imgLoc.p2, vecA2A1);
            xloc.VecPoint(imgLoc.p1, imgLoc.p3, vecA3A1);
            //取得第一个交点
            tmp = (xloc.VecDot(vecP12A1, vecA2A1) / (xloc.VecMode(vecP12A1) * xloc.VecMode(vecA2A1)) * xloc.VecMode(vecP12A1)) / xloc.VecMode(vecA2A1);
            cc13 = parseInt(tmp * imgLoc.size[0]);
            tmp = (xloc.VecDot(vecP12A1, vecA3A1) / (xloc.VecMode(vecP12A1) * xloc.VecMode(vecA2A1)) * xloc.VecMode(vecP12A1) / xloc.VecMode(vecA3A1));
            rr13 = parseInt(tmp * imgLoc.size[1]);
            //取得第二个交点
            tmp = (xloc.VecDot(vecP34A1, vecA2A1) / (xloc.VecMode(vecP34A1) * xloc.VecMode(vecA2A1)) * xloc.VecMode(vecP34A1)) / xloc.VecMode(vecA2A1);
            cc24 = parseInt(tmp * imgLoc.size[0]);
            tmp = (xloc.VecDot(vecP34A1, vecA3A1) / (xloc.VecMode(vecP34A1) * xloc.VecMode(vecA2A1)) * xloc.VecMode(vecP34A1) / xloc.VecMode(vecA3A1));
            rr24 = parseInt(tmp * imgLoc.size[1]);

            retObj.xp1[0] = cc13;
            retObj.xp1[1] = rr13;
            retObj.xp2[0] = cc24;
            retObj.xp2[1] = rr24;
            retObj.flag = 1;
            retObj.value = "已计算出两个面的交点。";


            return {
                start: {x:cc13,
                    y:rr13
                } ,
                end:{x:cc24,
                    y:rr24
                }
            };

        }

        //	printf("[0:0]-[0:0]\n");
        retObj.value = " 传入两个面平行，不存在定位线";
        return retObj;

    },
    //****************************************************

}
//     cornerstoneTools.calcRenferenceLineSup = xloc.LocalCalc ;//定位线补充计算方法绑定到cornerstoneTools上
// })($, cornerstone, cornerstoneTools);
