	using Id from './Student';

	entity GradeBook {
		    key grdid : Id;
		    studid : String(4);
		    stdate: Date;
		    course : Integer;
		};