	using Id from './Student';

	entity Subject {
		    key sbjid : Id;
		    grdid : String(4);
		    name: String(60);
		    mark : Integer;
		};