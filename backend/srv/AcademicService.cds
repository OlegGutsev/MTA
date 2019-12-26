using Student as _Student from '../db/Student';
using Address as _Address from '../db/Address';
using Subject as _Subject from '../db/Subject';
using GradeBook as _GradeBook from '../db/GradeBook';

service AcademicService @(path:'/browse') {

  entity Student @(
		title: 'Student',
		Capabilities: {
			InsertRestrictions: {Insertable: false},
			UpdateRestrictions: {Updatable: false},
			DeleteRestrictions: {Deletable: false}
		}
	) as projection on _Student;

  entity Address @(
		title: 'Address',
		Capabilities: {
			InsertRestrictions: {Insertable: false},
			UpdateRestrictions: {Updatable: false},
			DeleteRestrictions: {Deletable: false}
		}
	) as projection on _Address;

    entity Subject @(
		title: 'Subject',
		Capabilities: {
			InsertRestrictions: {Insertable: false},
			UpdateRestrictions: {Updatable: false},
			DeleteRestrictions: {Deletable: false}
		}
	) as projection on _Subject;

	 entity GradeBook @(
    		title: 'GradeBook',
    		Capabilities: {
    			InsertRestrictions: {Insertable: false},
    			UpdateRestrictions: {Updatable: false},
    			DeleteRestrictions: {Deletable: false}
    		}
     ) as projection on _GradeBook;

}
