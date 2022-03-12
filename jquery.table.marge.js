/*
 * Function: used for merging cells
 * Author: Zhou Bing
 * Time: 2018/5/20
 * Dependency: jquery.1.7.1 and above
 */
; (function ($, window, document, undefined) {
    'use strict';//strict javascript mode
    var margetable = function ($eles, opt) {
        this.opt = opt;//User's configuration
        this.defaults = {
            // merge type
            //1: Indicates that the column index to be merged is specified, and the column index that depends on the merged column is given (there must be a sequence)
            //   E.g:
            // colindex:[{
            // index: 2,//Column index to be merged
            // dependent: [0,1]//Merge column dependent column index
            // }]
            //2: Specify the column index to be merged at the same time, and the latter column depends on the former column index when merging
            //   E.g:
            // colindex:[0,1,2]//The merged column, the latter column index depends on the former column index
            type: 1,
            colindex: [{
                index: 0,//Column index to be merged
                dependent: [0]//The column index that the merged column depends on, if the index is 0, this value does not need to be assigned
            }]
        };

        this.options = $.extend({}, this.defaults, this.opt);
        var me = this;

        return $eles.each(function () {
            var $this = $(this);
            var colIndexs = me.options.colindex;
            if (me.options.type == "1") {
                // Loop the configuration to be merged and perform the merge operation
                for (var i = 0; i < colIndexs.length; i++) {
                    margetColumn($this, colIndexs[i]);
                }
            }
            else if (me.options.type == "2") {
                margetColumn2($this, me.options);
            }
        });
    };

    // merge columns
    // $ele table to merge
    // option The option set by the user
    var margetColumn = function ($ele, option) {
        var me = this;
        var $trs = $ele.find('tbody tr');
        var preRecord = {
            index: 0,
            rowspan: 1,
            text: new Object()
        };//Used to record the value when the last value is different
        var curText = new Object();//Used to record the value of the current noon
        var isSame = true;//Whether the value of morning and afternoon is the same
        for (var i = 0; i < $trs.length; i++) {
            if (i == 0) {
                preRecord.index = i;
                preRecord.text = setPreRecord($trs.eq(i), option);
            }
            else {
                isSame = true;
                if (option.index > 0 && option.dependent && option.dependent.length > 0) {
                    for (var deIndex = 0; deIndex < option.dependent.length; deIndex++) {
                        if (preRecord.text['col' + option.dependent[deIndex]] != $trs.eq(i).find('td').eq(option.dependent[deIndex]).text()) {
                            isSame = false;
                        }
                    }
                }
                if (isSame == false || preRecord.text['col' + option.index] != $trs.eq(i).find('td').eq(option.index).text()) {
                    $trs.eq(preRecord.index).find('td').eq(option.index).attr('rowspan', preRecord.rowspan);
                    preRecord.index = i;
                    preRecord.rowspan = 1;
                    preRecord.text = setPreRecord($trs.eq(i), option);
                }
                else {
                    preRecord.rowspan++;
                    $trs.eq(i).find('td').eq(option.index).hide();
                }
            }
        }
        $trs.eq(preRecord.index).find('td').eq(option.index).attr('rowspan', preRecord.rowspan);
    };

    // merge columns
    // $ele table to merge
    // option The option set by the user
    var margetColumn2 = function ($ele, option) {
        var me = this;
        var $trs = $ele.find('tbody tr');
        var preRecord = [];//Used to record the value when the previous value is different
        var curText = "";
        for (var i = 0; i < $trs.length; i++) {
            var $tr = $trs.eq(i);
            if (i == 0) {
                for (var j = 0; j < option.colindex.length; j++) {
                    preRecord.push({
                        index: i,
                        rowspan: 1,
                        text: $tr.find('td').eq(option.colindex[j]).text()
                    });
                }
            }
            else {
                for (var j = 0; j < option.colindex.length; j++) {
                    var curText = $tr.find('td').eq(option.colindex[j]).text();
                    if (preRecord[j].text != curText) {
                        $trs.eq(preRecord[j].index).find('td').eq(option.colindex[j]).attr('rowspan', preRecord[j].rowspan);
                        preRecord[j].index = i;
                        preRecord[j].rowspan = 1;
                        preRecord[j].text = curText;
                        for (var m = j + 1; m < option.colindex.length; m++) {
                            $trs.eq(preRecord[m].index).find('td').eq(option.colindex[m]).attr('rowspan', preRecord[m].rowspan);
                            preRecord[m].index = i;
                            preRecord[m].rowspan = 1;
                            preRecord[m].text = $tr.find('td').eq(option.colindex[m]).text();
                        }
                        break;
                    }
                    else {
                        $tr.find('td').eq(option.colindex[j]).hide();
                        preRecord[j].rowspan++;
                    }
                }
            }
        }
        for (var m = 0; m < option.colindex.length; m++) {
            $trs.eq(preRecord[m].index).find('td').eq(option.colindex[m]).attr('rowspan', preRecord[m].rowspan);
         }
     };

     // record the last distinct value
     // index the current index
     // $tr the current line
     // option The option set by the user
     var setPreRecord = function ($tr, option) {
         var textinfo = new Object();
         textinfo['col' + option.index] = $tr.find('td').eq(option.index).text();
         if (option.index > 0 && option.dependent && option.dependent.length > 0) {
             for (var i = 0; i < option.dependent.length; i++) {
                 textinfo['col' + option.dependent[i]] = $tr.find('td').eq(option.dependent[i]).text();
             }
         }
         return textinfo;
     }

     $.fn.margetable = function (options) {
         new margetable(this, options);
     }
})(jQuery, window, document); 