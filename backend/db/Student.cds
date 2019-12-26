type Id : String(4);
using GradeBook from './GradeBook';
using Address from './Address';

entity Student {
    key studid : Id;
    name : String(40);
    surNm : String(40);
    age : Integer;
    toAddress : association to one Address on toAddress.studid = studid;
    toGradeBook : association to one GradeBook on toGradeBook.studid = studid;
};
