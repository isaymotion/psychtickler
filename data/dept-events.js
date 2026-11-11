/* Department-wide events built into Psych Tickler: everyone sees them on Department events (and Home's
   "Next event"), they cannot be edited or removed on a phone, and they are never synced to the cloud.
   This file is PUBLIC (GitHub Pages): put nothing here that must stay inside the department.
   Fields: id (stable, never reuse), title, date (YYYY-MM-DD, first day), end (optional last day),
   time (optional HH:MM), place, note, url (optional https link, shown as "Register"),
   lists (optional [{title, names: [..]}], shown as tap-to-open lists under the event).
   Remove an entry once it is long past. */
(function () {
  var annual = ['Dr. Bargas', 'Dr. Capili', 'Dr. Preclaro', 'Dr. Lagrimas', 'Dr. Teves', 'Dr. Triunfante', 'Dr. Jimenez', 'Dr. David', 'Dr. Ocampo', 'Dr. Suson'];
  var midyear = ['Dr. Gigante', 'Dr. Fajutar', 'Dr. Abaya', 'Dr. De Leon', 'Dr. Cajumban', 'Dr. Reyes', 'Dr. Navarro', 'Dr. Manuel'];
  var rules = 'Residents attend one PPA convention a year (Annual in January or Midyear in July) so hospital operations are not disrupted. ' +
    'The hospital sponsors one registration a year by reimbursement: pay first, and the fee is reimbursed once your post-training documents are complete (you will be oriented on this).';
  var lists = [
    { title: 'Annual convention attendees (January 2027)', names: annual },
    { title: 'Midyear convention attendees (July 2027, dates to follow)', names: midyear }
  ];
  window.DEPT_EVENTS = [
    {
      id: 'ppa-2027-reg-deadline',
      title: 'PPA 2027 Annual: registration deadline',
      date: '2026-11-30', time: '', place: '',
      note: 'If you are listed for the Annual convention, pay and register by 30 November 2026. Psychiatry residents early bird: PHP 10,000. ' + rules,
      url: 'https://ppaprcpcongress2027.org/',
      lists: [lists[0]]
    },
    {
      id: 'ppa-prcp-2027',
      title: 'Psychiatry Without Borders: PRCP–PPA Congress 2027',
      date: '2027-01-19', end: '2027-01-22', time: '',
      place: 'Crowne Plaza Hotel Galleria, Philippines',
      note: '22nd International Congress of the Pacific Rim College of Psychiatrists and 53rd Annual Convention of the Philippine Psychiatric Association. Together, we build collaborative mental health systems across the Pacific Rim. ' +
        'Residents on the Annual list: register by 30 November 2026 (early bird PHP 10,000). The Midyear convention is in July; dates to follow.',
      url: 'https://ppaprcpcongress2027.org/',
      lists: lists
    }
  ];
})();
