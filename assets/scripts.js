class Datepicker {
    constructor(datepickerId, inputId) {
        this.datepickerId = datepickerId;
        this.inputId = inputId;
        this.datepickerEl = document.getElementById(this.datepickerId).querySelector('.datepicker-container');
        this.inputEl = document.getElementById(this.inputId);
        this.currentDate = new Date();
        this.selectedDate = new Date(); // По умолчанию выбран сегодня
        this.monthListContainer = null;
        this.render();
    }

    render() {
        this.datepickerEl.innerHTML = '';
        this.renderMonthList();
        this.renderCalendar();
        this.attachEventListeners();
        this.updateInput(); // Обновляем поле ввода
    }

    renderMonthList() {
        const months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];

        this.monthListContainer = document.createElement('div');
        this.monthListContainer.classList.add('datepicker-months');

        const visibleMonths = 9;
        const halfVisible = Math.floor(visibleMonths / 2);
        const currentMonthIndex = this.currentDate.getMonth();

        let displayMonths = [];
        for (let i = -halfVisible; i <= halfVisible; i++) {
            let monthIndex = (currentMonthIndex + i) % 12;
            if (monthIndex < 0) {
                monthIndex += 12;
            }
            displayMonths.push({ index: monthIndex, name: months[monthIndex] });
        }

        displayMonths.reverse();

        displayMonths.forEach((monthData) => {
            const monthEl = document.createElement('div');
            monthEl.classList.add('datepicker-month');
            monthEl.textContent = monthData.name;
            monthEl.dataset.monthIndex = monthData.index;

            if (monthData.index === currentMonthIndex) {
                monthEl.classList.add('current');
            }

            monthEl.addEventListener('click', () => {
                this.currentDate.setMonth(monthData.index);
                this.render();
            });

            this.monthListContainer.appendChild(monthEl);
        });

        this.datepickerEl.appendChild(this.monthListContainer);
        this.scrollToCurrentMonth();

        this.monthListContainer.addEventListener('wheel', (event) => {
            event.preventDefault();
            this.handleMonthScroll(event);
        });
    }

    handleMonthScroll(event) {
        const delta = Math.sign(event.deltaY);
        const currentMonthIndex = this.currentDate.getMonth();
        let newMonthIndex = currentMonthIndex + delta;

        if (newMonthIndex < 0) {
            newMonthIndex = 11;
        } else if (newMonthIndex > 11) {
            newMonthIndex = 0;
        }

        this.currentDate.setMonth(newMonthIndex);
        this.render();
    }

    scrollToCurrentMonth() {
        const currentMonthEl = this.monthListContainer.querySelector('.current');
        if (currentMonthEl) {
            setTimeout(() => {
                currentMonthEl.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }, 0);
        }
    }

    attachEventListeners() {
        const days = this.datepickerEl.querySelectorAll('.datepicker-day:not(.datepicker-day-out-of-month), .datepicker-day-out-of-month');
        days.forEach(day => {
            day.addEventListener('click', () => {
                if (day.classList.contains('datepicker-day-out-of-month')) {
                    const dayNum = parseInt(day.textContent);
                    let month = parseInt(day.dataset.month);
                    let year = parseInt(day.dataset.year);

                    if (!isNaN(dayNum) && !isNaN(month) && !isNaN(year)) {
                        if (dayNum > 20) {
                            month--;
                            if (month < 0) {
                                month = 11;
                                year--;
                            }
                        } else {
                            month++;
                            if (month > 11) {
                                month = 0;
                                year++;
                            }
                        }
                    } else {
                        let currentMonth = this.currentDate.getMonth();
                        let newMonth = currentMonth + (day.textContent > 20 ? -1 : 1);
                        if (newMonth < 0) {
                            newMonth = 11;
                        } else if (newMonth > 11) {
                            newMonth = 0;
                        }
                        this.currentDate.setMonth(newMonth);
                        this.render();
                        return;
                    }

                    this.currentDate.setFullYear(year, month, dayNum);
                    this.selectedDate = new Date(year, month, dayNum); // Обновляем selectedDate
                } else {
                    const dayNum = parseInt(day.dataset.day);
                    const month = parseInt(day.dataset.month);
                    const year = parseInt(day.dataset.year);

                    this.selectedDate = new Date(year, month, dayNum); // Обновляем selectedDate
                }
                this.render(); // Всегда перерисовываем после выбора даты
            });
        });
    }

    renderCalendar() {
        const calendarEl = document.createElement('div');
        calendarEl.classList.add('datepicker-calendar');

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

        const dayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        const dayLabelsEl = document.createElement('div');
        dayLabelsEl.classList.add('datepicker-day-labels');
        dayLabels.forEach(label => {
            const labelEl = document.createElement('div');
            labelEl.classList.add('datepicker-day-label');
            labelEl.textContent = label;
            dayLabelsEl.appendChild(labelEl);
        });
        calendarEl.appendChild(dayLabelsEl);

        const daysContainerEl = document.createElement('div');
        daysContainerEl.classList.add('datepicker-days');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Добавляем дни предыдущего месяца
        for (let i = 0; i < startingDayOfWeek; i++) {
            const prevMonthLastDay = new Date(year, month, 0).getDate();
            const day = prevMonthLastDay - startingDayOfWeek + i + 1;
            const dayEl = document.createElement('div');
            dayEl.classList.add('datepicker-day', 'datepicker-day-out-of-month');
            dayEl.textContent = day;

            const fullDate = new Date(year, month - 1, day);
            if (fullDate.getTime() < today.getTime()) {
                dayEl.classList.add('past-day');
            }
            daysContainerEl.appendChild(dayEl);
        }

        // Добавляем дни текущего месяца
        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = document.createElement('div');
            dayEl.classList.add('datepicker-day');
            dayEl.textContent = i;
            dayEl.dataset.day = i;
            dayEl.dataset.month = month;
            dayEl.dataset.year = year;

            const fullDate = new Date(year, month, i);

            if (fullDate.getTime() < today.getTime()) {
                dayEl.classList.add('past-day');
            }

            if (this.selectedDate && fullDate.getTime() === this.selectedDate.getTime()) {
                dayEl.classList.add('selected');
                if(daysContainerEl.querySelector('.today')) daysContainerEl.querySelector('.today').classList.remove('selected');
            } else if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
                dayEl.classList.add('selected', 'today');
            }

            daysContainerEl.appendChild(dayEl);
        }

        // Добавляем дни следующего месяца
        const remainingDays = 42 - startingDayOfWeek - daysInMonth;
        for (let i = 1; i <= remainingDays; i++) {
            const dayEl = document.createElement('div');
            dayEl.classList.add('datepicker-day', 'datepicker-day-out-of-month');
            dayEl.textContent = i;

            const fullDate = new Date(year, month + 1, i);
            if (fullDate.getTime() < today.getTime()) {
                dayEl.classList.add('past-day');
            }

            daysContainerEl.appendChild(dayEl);
        }

        calendarEl.appendChild(daysContainerEl);
        this.datepickerEl.appendChild(calendarEl);
    }

    updateInput() {
        if (this.selectedDate) {
            this.inputEl.value = this.formatDate(this.selectedDate);
        } else {
            this.inputEl.value = ''; // Очищаем поле ввода, если дата не выбрана
        }
    }

    formatDate(date) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }
}

// Инициализация после загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    if (typeof datepickerConfig !== 'undefined') {
        const datepicker = new Datepicker(datepickerConfig.datepickerId, datepickerConfig.inputId);
    }
    const datepicker = new Datepicker('datepicker', 'datepicker-input');
});