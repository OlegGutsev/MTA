	using Id from './Student';
    using Subject from './Subject';

	entity GradeBook {
		    key grdid : Id;
		    studid : String(4);
		    stdate: Date;
		    course : Integer;
		    toSubject : association to many Subject on toSubject.grdid = grdid;
		};