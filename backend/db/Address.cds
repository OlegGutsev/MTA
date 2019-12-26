	using Id from './Student';

	entity Address {
		    key adid : Id;
		    studid : String(4);
		    city : String(100);
		    strt : String(100);
		    hnum : Integer;
		};