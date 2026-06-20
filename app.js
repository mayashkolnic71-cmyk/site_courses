// Initialize Lucide Icons
lucide.createIcons();

// Tab Navigation
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        navItems.forEach(nav => nav.classList.remove('active'));
        tabContents.forEach(tab => tab.classList.remove('active'));
        
        item.classList.add('active');
        const tabId = item.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
        
        if(tabId === 'training-calendar' && calendar) {
            setTimeout(() => { calendar.render(); }, 100);
        }
    });
});

// Editable table logic
document.querySelectorAll('.editable-cell').forEach(cell => {
    cell.addEventListener('blur', (e) => {
        console.log('Value updated to:', e.target.innerText);
        e.target.style.background = 'rgba(16, 185, 129, 0.2)'; 
        setTimeout(() => { e.target.style.background = 'rgba(59, 130, 246, 0.1)'; }, 1000);
    });
});

// FullCalendar Initialization
let calendar;

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('fullcalendar-view');

    const events = [
        { title: 'פסח', start: '2026-04-02', end: '2026-04-09', display: 'background', classNames: ['holiday-event'] },
        { title: 'יום העצמאות', start: '2026-04-22', allDay: true, display: 'background', classNames: ['holiday-event'] },
        { title: 'שבועות', start: '2026-05-22', allDay: true, display: 'background', classNames: ['holiday-event'] },
        { title: 'ראש השנה', start: '2026-09-12', end: '2026-09-14', display: 'background', classNames: ['holiday-event'] },
        { title: 'יום כיפור', start: '2026-09-21', allDay: true, display: 'background', classNames: ['holiday-event'] },
        { title: 'סוכות', start: '2026-09-26', end: '2026-10-04', display: 'background', classNames: ['holiday-event'] },
        
        { title: 'פיתוח מקצועי במחלקות (שעה 1)', start: '2026-01-10T10:00:00', end: '2026-01-10T11:00:00', classNames: ['training-event'] },
        { title: 'הדרכות חובה (שעה 1)', start: '2026-01-15T12:00:00', end: '2026-01-15T13:00:00', classNames: ['training-event'] },
        { title: 'פורום נאמני נושא (רבעון 1)', start: '2026-03-01T14:00:00', end: '2026-03-01T15:00:00', classNames: ['training-event'] },
        { title: 'הכשרה פורמלית נאמני נושא (40 שעות)', start: '2026-02-15', end: '2026-02-28', classNames: ['training-event'] },
        { title: 'ועדת בטיחות ומניעת זיהומים', start: '2026-03-10T13:00:00', end: '2026-03-10T14:00:00', classNames: ['training-event'] },
        { title: 'פורום נאמני נושא (רבעון 2)', start: '2026-06-01T14:00:00', end: '2026-06-01T15:00:00', classNames: ['training-event'] }
    ];

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'he', 
        direction: 'rtl',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        buttonText: { today: 'היום', month: 'חודש', week: 'שבוע', day: 'יום' },
        editable: true, 
        droppable: true,
        events: events,
        initialDate: '2026-01-01', 
        eventDrop: function(info) {
            const dateStr = info.event.start.toISOString();
            if(dateStr.includes('04-02') || dateStr.includes('09-12') || dateStr.includes('09-21')) {
                alert('שים לב: תזמנת הדרכה או ועדה על תאריך של חג/מועד!');
            }
        }
    });

    // Chart.js Dashboard Implementation
    const ctxMix = document.getElementById('staffMixChart');
    if(ctxMix) {
        new Chart(ctxMix, {
            type: 'bar',
            data: {
                labels: ['אחים מעשיים', 'בוגרי על בסיסי', 'נאמני נושא', 'תואר שני'],
                datasets: [
                    {
                        label: 'יעד (%)',
                        data: [8, 60, 50, 12],
                        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 1
                    },
                    {
                        label: 'בפועל 2025 (%)',
                        data: [12, 45.6, 36.8, 9.7],
                        backgroundColor: 'rgba(139, 92, 246, 0.5)',
                        borderColor: 'rgb(139, 92, 246)',
                        borderWidth: 1
                    }
                ]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
        });
    }

    const ctxProgress = document.getElementById('trainingProgressChart');
    if(ctxProgress) {
        new Chart(ctxProgress, {
            type: 'doughnut',
            data: {
                labels: ['הושלם (40 שעות)', 'בתהליך', 'טרם התחילו'],
                datasets: [{
                    data: [65, 20, 15],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(239, 68, 68, 0.7)'
                    ],
                    borderWidth: 1
                }]
            },
            options: { responsive: true, cutout: '70%' }
        });
    }
});
