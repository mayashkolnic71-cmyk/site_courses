// Initialize Lucide Icons
lucide.createIcons();

// Tab Navigation
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all
        navItems.forEach(nav => nav.classList.remove('active'));
        tabContents.forEach(tab => tab.classList.remove('active'));
        
        // Add active class to clicked
        item.classList.add('active');
        const tabId = item.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
        
        // Render calendar if calendar tab is selected
        if(tabId === 'calendar' && calendar) {
            setTimeout(() => {
                calendar.render();
            }, 100);
        }
    });
});

// Mock Staff Data based on generic requirements
const staffData = [
    { name: 'ישראל ישראלי', role: 'אח מוסמך', dept: 'שיקום א', basic: 'בוצע (חת"ש 20 שעות)', empowerment: 'נאמן כאב (3 מפגשים)', status: 'success', statusText: 'כשיר' },
    { name: 'דוד כהן', role: 'מטפל/כוח עזר', dept: 'שיקום ב', basic: 'קורס המשכי (40 שעות)', empowerment: 'אחראי קליטה', status: 'success', statusText: 'כשיר' },
    { name: 'שרה לוי', role: 'אחות מוסמכת', dept: 'מונשמים ג', basic: 'בוצע (חת"ש 20 שעות)', empowerment: 'נאמנת מניעת זיהומים', status: 'success', statusText: 'כשיר' },
    { name: 'אחמד מנסור', role: 'מטפל חדש', dept: 'מונשמים א', basic: 'בהכשרה ראשונית (18 שעות)', empowerment: 'טרם מונה', status: 'warning', statusText: 'בתהליך' },
    { name: 'מיכל דהן', role: 'מרפאה בעיסוק', dept: 'מקצועות הבריאות', basic: 'עדכון ידע (20 שעות)', empowerment: '-', status: 'success', statusText: 'כשיר' },
    { name: 'יעל כץ', role: 'כוח עזר', dept: 'שיקום א', basic: 'חסר עדכון ידע שנתי', empowerment: '-', status: 'danger', statusText: 'חריגה' }
];

const staffTableBody = document.getElementById('staff-table-body');
staffData.forEach(staff => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${staff.name}</td>
        <td>${staff.role}</td>
        <td>${staff.dept}</td>
        <td>${staff.basic}</td>
        <td>${staff.empowerment}</td>
        <td><span class="badge ${staff.status}">${staff.statusText}</span></td>
    `;
    staffTableBody.appendChild(tr);
});

// FullCalendar Initialization
let calendar;

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('fullcalendar-view');

    // Mock Events: Holidays and Trainings for 2026
    const events = [
        // Holidays (Background events or all-day blockers)
        { title: 'פורים', start: '2026-04-02', end: '2026-04-09', display: 'background', classNames: ['holiday-event'] },
        { title: 'יום העצמאות', start: '2026-04-22', allDay: true, display: 'background', classNames: ['holiday-event'] },
        { title: 'שבועות', start: '2026-05-22', allDay: true, display: 'background', classNames: ['holiday-event'] },
        { title: 'ראש השנה', start: '2026-09-12', end: '2026-09-14', display: 'background', classNames: ['holiday-event'] },
        { title: 'יום כיפור', start: '2026-09-21', allDay: true, display: 'background', classNames: ['holiday-event'] },
        { title: 'סוכות', start: '2026-09-26', end: '2026-10-04', display: 'background', classNames: ['holiday-event'] },
        
        // Training Events (Draggable)
        { title: 'קורס ראשוני מטפלים (18 שעות)', start: '2026-01-14', end: '2026-01-17', classNames: ['training-event'] },
        { title: 'קורס המשכי מטפלים (40 שעות)', start: '2026-02-15', end: '2026-02-28', classNames: ['training-event'] },
        { title: 'פיתוח מקצועי אחיות חת"ש', start: '2026-03-05', end: '2026-03-07', classNames: ['training-event'] },
        { title: 'מפגש נאמני כאב ופצע (1/3)', start: '2026-04-15', allDay: true, classNames: ['training-event'] },
        { title: 'הדרכת בטיחות והחייאה (חובה)', start: '2026-05-15', end: '2026-05-20', classNames: ['training-event'] },
        { title: 'עדכון ידע מקצועות הבריאות', start: '2026-06-01', end: '2026-06-10', classNames: ['training-event'] }
    ];

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'he', // Hebrew
        direction: 'rtl',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        buttonText: {
            today: 'היום',
            month: 'חודש',
            week: 'שבוע',
            day: 'יום'
        },
        editable: true, // Enable drag & drop
        droppable: true,
        events: events,
        initialDate: '2026-01-01', // Start looking at 2026
        eventDrop: function(info) {
            console.log(info.event.title + " נגרר ל- " + info.event.start.toISOString());
            
            // Basic conflict check warning with holidays (naive check)
            if(info.event.start.toISOString().includes('04-02') || info.event.start.toISOString().includes('09-12')) {
                alert('שים לב: תזמנת הדרכה על תאריך של חג/מועד!');
            }
        },
        eventResize: function(info) {
            console.log(info.event.title + " שונה ל- " + info.event.end.toISOString());
        }
    });
});
