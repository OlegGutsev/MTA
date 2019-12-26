	using Id from './Student';
	using GradeBook from './GradeBook';

	entity Subject {
		    key sbjid : Id;
		    grdid : String(4);
		    name: String(60);
		    mark : Integer;
		    toGradeBook : association to many GradeBook on toGradeBook.grdid = grdid;
		};