
/*jslint browser: true, node: true */
/*global $, PAPAYA_MENU_UNSELECTABLE, PAPAYA_MENU_SLIDER, PAPAYA_MENU_HOVERING_CSS */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.ui = papaya.ui || {};


/*** Constructor ***/
papaya.ui.MenuItemSlider = papaya.ui.MenuItemSlider || function (viewer, label, action, callback, dataSource, method,
                                                                 modifier) {

        // console.log("---------------------------MenuItemSlider--------------------------------------");
    if (action === "alphaneg") {
        action = "alpha";
        modifier = viewer.getScreenVolumeIndex(viewer.screenVolumes[parseInt(modifier)].negativeScreenVol).toString();
    }

    this.viewer = viewer;
    this.label = label;
    this.index = modifier;
    this.modifier = "";
    if (!papaya.utilities.StringUtils.isStringBlank(modifier)) {
        this.modifier = "-" + modifier;
    }

    this.dataSource = dataSource;
    this.method = method;
    this.action = action;
    this.event = ((this.action.toLowerCase().indexOf("alpha") != -1) || this.viewer.screenVolumes[0].isHighResSlice) ?
        "change" : "input change";
    this.id = this.action.replace(/ /g, "_") + this.viewer.container.containerIndex + "_" + this.index;
    this.callback = callback;
    this.screenVol = dataSource;//this.viewer.screenVolumes[this.index];

};


/*** Prototype Methods ***/
//PAPAYA_MENU_SLIDER
papaya.ui.MenuItemSlider.prototype.buildHTML = function (parentId) {
    // console.log("---------------------------MenuItemSlider---------------buildHTML-----------------------");

    var html, thisHtml, sliderId, sliderHtml, menuItem, event;

    event = this.event;
    sliderId = this.id + "Slider";

     html = "<li id='" + this.id + "'><span style='padding-right:5px;' class='" + PAPAYA_MENU_UNSELECTABLE + "'>" +
        this.label + ":</span><input min='0' max='100' value='" + parseInt((1.0 - this.screenVol[this.action]) * 100,
            10) + "' id='" + sliderId + "' class='" + PAPAYA_MENU_SLIDER + "' type='range' /></li>";
     $("#" + parentId).append(html);

/*    $('.sliderBox').append(html);
console.log("=======================+++++++++++++++++++++++++++++");*/



    // console.log("======================================PAPAYA_MENU_SLIDER============================================");
    thisHtml = $("#" + this.id);
    thisHtml.hover(function () { $(this).toggleClass(PAPAYA_MENU_HOVERING_CSS); });
    sliderHtml = $("#" + sliderId);

    menuItem = this;

var sliderValue=0;
    $("#" + this.id + "Slider").on(event, function () {

        if(sliderType=="X"){
            menuItem.action="rotationX";
            // sliderValue=$('#sliderVal1').val();

        }
        else if(sliderType=="Y"){
            menuItem.action="rotationY";
            // sliderValue=$('#sliderVal2').val();

        }
        else{
            menuItem.action="rotationZ";
            // sliderValue=$('#sliderVal3').val();

        }

          menuItem.screenVol[menuItem.action] = 1.0 - (sliderHtml.val() / 100.0);
        // menuItem.screenVol[menuItem.action] = 1.0 - (sliderValue / 100.0);
        menuItem.doAction();
        menuItem.viewer.drawViewer(true, false);
    });
    


};



papaya.ui.MenuItemSlider.prototype.doAction = function () {
  
    if(sliderType=="X"){

        this.action="rotationX";
    }
    else if(sliderType=="Y"){

        this.action="rotationY";
    }
    else{

        this.action="rotationZ";
    }
    // console.log( this.action);
    this.callback(this.action, null, true);
};
