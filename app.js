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
        
        // Render calendar if training-calendar tab is selected
        if(tabId === 'training-calendar' && calendar) {
            setTimeout(() => {
                calendar.render();
            }, 100);
        }
    });
});

// Editable table logic simulation (saving to localStorage if desired, currently just visuals)
document.querySelectorAll('.editable-cell').forEach(cell => {
    cell.addEventListener('blur', (e) => {
        console.log('Value updated to:', e.target.innerText);
        // Simulate saving
        e.target.style.background = 'rgba(16, 185, 129, 0.2)'; // Flash green
        setTimeout(() => {
            e.target.style.background = 'rgba(59, 130, 246, 0.1)'; // Back to normal
        }, 1000);
    });
});

// FullCalendar Initialization
let calendar;

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('fullcalendar-view');

    // Mock Events: Holidays and Required Trainings/Forums
    const events = [
        // Holidays (Background events or all-day blockers)
        { title: 'פסח', start: '2026-04-02', end: '2026-04-09', display: 'background', classNames: ['holiday-event'] },
        { title: 'יום העצמאות', start: '2026-04-22', allDay: true, display: 'background', classNames: ['holiday-event'] },
        { title: 'שבועות', start: '2026-05-22', allDay: true, display: 'background', classNames: ['holiday-event'] },
        { title: 'ראש השנה', start: '2026-09-12', end: '2026-09-14', display: 'background', classNames: ['holiday-event'] },
        { title: 'יום כיפור', start: '2026-09-21', allDay: true, display: 'background', classNames: ['holiday-event'] },
        { title: 'סוכות', start: '2026-09-26', end: '2026-10-04', display: 'background', classNames: ['holiday-event'] },
        
        // Training Events (Draggable)
        { title: 'פיתוח מקצועי במחלקות (שעה 1)', start: '2026-01-10T10:00:00', end: '2026-01-10T11:00:00', classNames: ['training-event'] },
        { title: 'הדרכות חובה (שעה 1)', start: '2026-01-15T12:00:00', end: '2026-01-15T13:00:00', classNames: ['training-event'] },
        { title: 'פורום נאמני נושא (רבעון 1)', start: '2026-03-01T14:00:00', end: '2026-03-01T15:00:00', classNames: ['training-event'] },
        { title: 'הכשרה פורמלית נאמני נושא (40 שעות)', start: '2026-02-15', end: '2026-02-28', classNames: ['training-event'] },
        { title: 'ועדת בטיחות ומניעת זיהומים', start: '2026-03-10T13:00:00', end: '2026-03-10T14:00:00', classNames: ['training-event'] },
        { title: 'פורום נאמני נושא (רבעון 2)', start: '2026-06-01T14:00:00', end: '2026-06-01T15:00:00', classNames: ['training-event'] }
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
            // Basic conflict check warning with holidays (naive check)
            const dateStr = info.event.start.toISOString();
            if(dateStr.includes('04-02') || dateStr.includes('09-12') || dateStr.includes('09-21')) {
                alert('שים לב: תזמנת הדרכה או ועדה על תאריך של חג/מועד!');
            }
        }
    });
});
