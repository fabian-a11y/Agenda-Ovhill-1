class AppointmentBooking {
    constructor() {
        this.currentStep = 1;
        this.selectedProfessional = null;
        this.selectedDate = null;
        this.selectedTime = null;
        this.professionals = {
            1: { name: 'Dr. Carlos Martínez', specialty: 'Médico General', duration: '15 min' },
            2: { name: 'Dra. Ana Rodríguez', specialty: 'Médico General', duration: '20 min' },
            3: { name: 'Dr. Luis Sánchez', specialty: 'Odontólogo', duration: '30 min' },
            4: { name: 'Dra. María García', specialty: 'Oftalmóloga', duration: '25 min' }
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setMinDate();
        this.generateTimeSlots();
    }

    setupEventListeners() {
        // Professional selection
        document.querySelectorAll('.professional-card').forEach(card => {
            card.addEventListener('click', (e) => this.selectProfessional(e));
        });

        // Navigation buttons
        document.getElementById('next-btn').addEventListener('click', () => this.nextStep());
        document.getElementById('prev-btn').addEventListener('click', () => this.prevStep());
        document.getElementById('confirm-btn').addEventListener('click', () => this.confirmAppointment());

        // Date selection
        document.getElementById('appointment-date').addEventListener('change', (e) => this.selectDate(e));

        // Modal close
        document.getElementById('close-modal').addEventListener('click', () => this.closeModal());
        document.getElementById('success-modal').addEventListener('click', (e) => {
            if (e.target.id === 'success-modal') {
                this.closeModal();
            }
        });

        // Form validation
        document.getElementById('user-form').addEventListener('input', () => this.validateForm());
    }

    setMinDate() {
        const today = new Date();
        const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        const dateInput = document.getElementById('appointment-date');
        dateInput.min = this.localDateToISO(tomorrow);
    }

    selectProfessional(e) {
        const card = e.currentTarget;
        const professionalId = card.dataset.professional;
        
        // Remove previous selection
        document.querySelectorAll('.professional-card').forEach(c => c.classList.remove('selected'));
        
        // Add selection to clicked card
        card.classList.add('selected');
        
        this.selectedProfessional = professionalId;
        this.updateNextButton();
    }

    selectDate(e) {
        const selectedDate = e.target.value;
        if (selectedDate) {
            this.selectedDate = selectedDate;
            this.generateTimeSlots();
            this.updateNextButton();
        }
    }

    generateTimeSlots() {
        const timeSlotsContainer = document.getElementById('time-slots');
        timeSlotsContainer.innerHTML = '';

        const timeSlots = [
            '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
            '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
            '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
            '17:00', '17:30', '18:00', '18:30', '19:00'
        ];

        timeSlots.forEach(time => {
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.textContent = time;
            
            // Randomly disable some slots to simulate unavailable times
            if (Math.random() < 0.3) {
                slot.classList.add('disabled');
            } else {
                slot.addEventListener('click', () => this.selectTime(slot, time));
            }
            
            timeSlotsContainer.appendChild(slot);
        });
    }

    selectTime(slotElement, time) {
        // Remove previous selection
        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        
        // Add selection to clicked slot
        slotElement.classList.add('selected');
        
        this.selectedTime = time;
        this.updateNextButton();
    }

    updateNextButton() {
        const nextBtn = document.getElementById('next-btn');
        let canProceed = false;

        switch (this.currentStep) {
            case 1:
                canProceed = this.selectedProfessional !== null;
                break;
            case 2:
                canProceed = this.selectedDate !== null && this.selectedTime !== null;
                break;
            case 3:
                canProceed = this.validateForm();
                break;
        }

        nextBtn.disabled = !canProceed;
        nextBtn.style.opacity = canProceed ? '1' : '0.6';
        nextBtn.style.cursor = canProceed ? 'pointer' : 'not-allowed';
    }

    validateForm() {
        const name = document.getElementById('user-name').value.trim();
        const email = document.getElementById('user-email').value.trim();
        const phone = document.getElementById('user-phone').value.trim();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{9,15}$/;

        return name.length >= 2 && emailRegex.test(email) && phoneRegex.test(phone);
    }

    nextStep() {
        if (this.currentStep < 3) {
            this.hideStep(this.currentStep);
            this.currentStep++;
            this.showStep(this.currentStep);
            this.updateProgressBar();
            this.updateNavigationButtons();
            this.updateSummary();
            this.updateNextButton();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.hideStep(this.currentStep);
            this.currentStep--;
            this.showStep(this.currentStep);
            this.updateProgressBar();
            this.updateNavigationButtons();
            this.updateNextButton();
        }
    }

    showStep(stepNumber) {
        document.getElementById(`step-${stepNumber}`).classList.add('active');
    }

    hideStep(stepNumber) {
        document.getElementById(`step-${stepNumber}`).classList.remove('active');
    }

    updateProgressBar() {
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNum < this.currentStep) {
                step.classList.add('completed');
            } else if (stepNum === this.currentStep) {
                step.classList.add('active');
            }
        });
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const confirmBtn = document.getElementById('confirm-btn');

        prevBtn.style.display = this.currentStep > 1 ? 'flex' : 'none';
        
        if (this.currentStep === 3) {
            nextBtn.style.display = 'none';
            confirmBtn.style.display = 'flex';
        } else {
            nextBtn.style.display = 'flex';
            confirmBtn.style.display = 'none';
        }
    }

    updateSummary() {
        if (this.currentStep === 3) {
            const professional = this.professionals[this.selectedProfessional];
            
            document.getElementById('summary-professional').textContent = 
                `${professional.name} - ${professional.specialty}`;
            
            document.getElementById('summary-date').textContent = 
                this.formatDate(this.selectedDate);
            
            document.getElementById('summary-time').textContent = this.selectedTime;
            document.getElementById('summary-duration').textContent = professional.duration;
        }
    }

    formatDate(dateString) {
        // Interpretar 'YYYY-MM-DD' como fecha LOCAL para evitar desplazamientos por zona horaria
        const [y, m, d] = (dateString || '').split('-').map(Number);
        const date = new Date(y || 1970, (m || 1) - 1, d || 1);
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('es-ES', options);
    }

    localDateToISO(date) {
        // Devuelve 'YYYY-MM-DD' usando la zona horaria local
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    confirmAppointment() {
        if (!this.validateForm()) {
            this.showFormErrors();
            return;
        }

        // Generate appointment code
        const appointmentCode = this.generateAppointmentCode();
        
        // Show success modal
        this.showSuccessModal(appointmentCode);
        
        // Reset form after successful booking
        setTimeout(() => {
            this.resetForm();
        }, 2000);
    }

    generateAppointmentCode() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `OVH-${timestamp}-${random}`.toUpperCase();
    }

    showSuccessModal(appointmentCode) {
        const modal = document.getElementById('success-modal');
        const professional = this.professionals[this.selectedProfessional];
        
        document.getElementById('appointment-code').textContent = appointmentCode;
        document.getElementById('modal-professional').textContent = 
            `${professional.name} - ${professional.specialty}`;
        document.getElementById('modal-date').textContent = 
            this.formatDate(this.selectedDate);
        document.getElementById('modal-time').textContent = this.selectedTime;
        
        modal.classList.add('show');
    }

    closeModal() {
        const modal = document.getElementById('success-modal');
        modal.classList.remove('show');
    }

    showFormErrors() {
        const form = document.getElementById('user-form');
        const inputs = form.querySelectorAll('input[required]');
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = '#f44336';
                setTimeout(() => {
                    input.style.borderColor = '#e0e0e0';
                }, 3000);
            }
        });
    }

    resetForm() {
        this.currentStep = 1;
        this.selectedProfessional = null;
        this.selectedDate = null;
        this.selectedTime = null;
        
        // Reset UI
        document.querySelectorAll('.professional-card').forEach(card => 
            card.classList.remove('selected'));
        document.querySelectorAll('.time-slot').forEach(slot => 
            slot.classList.remove('selected'));
        document.getElementById('appointment-date').value = '';
        document.getElementById('user-form').reset();
        
        // Reset to first step
        this.hideStep(2);
        this.hideStep(3);
        this.showStep(1);
        this.updateProgressBar();
        this.updateNavigationButtons();
        this.updateNextButton();
    }
}

// Initialize the booking system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AppointmentBooking();
});

// Add some utility functions for better UX
function addLoadingState(button) {
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
}

function removeLoadingState(button, originalContent) {
    button.disabled = false;
    button.innerHTML = originalContent;
}

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        const activeButton = document.querySelector('.btn:not([disabled])');
        if (activeButton && (activeButton.id === 'next-btn' || activeButton.id === 'confirm-btn')) {
            activeButton.click();
        }
    }
    
    if (e.key === 'Escape') {
        const modal = document.getElementById('success-modal');
        if (modal.classList.contains('show')) {
            modal.classList.remove('show');
        }
    }
});

// Add smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
