sap.ui.define([
    "sap/ui/core/format/DateFormat"
], function (DateFormat) {
	"use strict";

	return {
        dateFormat : function(sValue){
            var oDateFormat = DateFormat.getDateInstance({pattern: "yyyy-MM-dd"});
            sValue = oDateFormat.format(sValue);
            return sValue;
        },

		numberUnit : function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},

		formatterStudent: function (oStudent) {
            oStudent = Object.keys(oStudent).reduce((c, k) => (c[k.toLowerCase()] = oStudent[k], c), {});
            oStudent.toAddress = {};
            oStudent.toGradeBook = {};
            if (oStudent.adid === null) {
                oStudent.toAddress = null;
            } else {
                oStudent.toAddress.adid = oStudent.adid;
                oStudent.toAddress.city = oStudent.city !== null ? oStudent.city : "";
                oStudent.toAddress.strt = oStudent.strt !== null ? oStudent.strt : "";
                oStudent.toAddress.hnum = oStudent.hnum !== null ? oStudent.hnum : "";
            }

            if (oStudent.grdid === null) {
                oStudent.toGradeBook = null;
            } else {
                oStudent.toGradeBook.grdid = oStudent.grdid;
                oStudent.toGradeBook.course = oStudent.course !== null ? oStudent.course : 0;
                oStudent.toGradeBook.stdate = oStudent.stdate !== null ? oStudent.stdate : this.dateFormat(new Date());                ;
            }

            delete oStudent.adid;
            delete oStudent.city;
            delete oStudent.strt;
            delete oStudent.hnum;
            delete oStudent.grdid;
            delete oStudent.course;
            delete oStudent.stdate;

            return oStudent;
		},
		
		fillInputsData: function (oView, option, aInputs) {
            var sSity = oView.byId(option + "AddressCity").getText();
            var sSityId = oView.byId(option + "AddressCity").getId().replace(option, '');

            var sStreet = oView.byId(option + "AddressStreet").getText();
            var sStreetId = oView.byId(option + "AddressStreet").getId().replace(option, '');

            var sHomeNum = oView.byId(option + "AddressHomeNum").getText();
            var sHomeNumId = oView.byId(option + "AddressHomeNum").getId().replace(option, '');

            var sName = oView.byId(option + "Name").getText();
            var sNameId = oView.byId(option + "Name").getId().replace(option, '');

            var sSurName = oView.byId(option + "SurName").getText();
            var sSurNameId = oView.byId(option + "SurName").getId().replace(option, '');

            var sAge = oView.byId(option + "Age").getText();
            var sAgeId = oView.byId(option + "Age").getId().replace(option, '');

            var sStDate = oView.byId(option + "GradeBookStDate").getText();
            var sStDateId = oView.byId(option + "GradeBookStDate").getId().replace(option, '');

            var sCourse = oView.byId(option + "GradeBookCourse").getText();
            var sCourseId = oView.byId(option + "GradeBookCourse").getId().replace(option, '');

            aInputs.push({
                sId: sSityId,
                sValue: sSity
            }, {
                sId: sStreetId,
                sValue: sStreet
            }, {
                sId: sHomeNumId,
                sValue: sHomeNum
            }, {
                sId: sNameId,
                sValue: sName
            }, {
                sId: sSurNameId,
                sValue: sSurName
            }, {
                sId: sAgeId,
                sValue: sAge
			},  {
                sId: sStDateId,
                sValue: sStDate
			},  {
                sId: sCourseId,
                sValue: sCourse
			}, );
			
			return aInputs;
        },

    }
});