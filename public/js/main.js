// Theme management
const themeManager = {
    init() {
        this.createThemeToggle();
        this.loadSavedTheme();
        this.addEventListeners();
    },

    createThemeToggle() {
        // Create theme toggle button if it doesn't exist
        if (!document.querySelector('.theme-toggle')) {
            const themeToggle = document.createElement('button');
            themeToggle.className = 'theme-toggle';
            themeToggle.setAttribute('aria-label', 'Toggle dark mode');
            themeToggle.innerHTML = '<span class="material-icons">dark_mode</span>';
            document.body.appendChild(themeToggle);
        }
    },

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
        
        // Add ripple effect to theme toggle
        this.addRippleEffect(document.querySelector('.theme-toggle'));
    },

    updateThemeIcon(theme) {
        const themeToggle = document.querySelector('.theme-toggle');
        const icon = themeToggle?.querySelector('.material-icons');
        if (icon) {
            icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
        }
    },

    addEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.theme-toggle')) {
                this.toggleTheme();
            }
        });
    },

    addRippleEffect(button) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = rect.width / 2 - size / 2 + 'px';
        ripple.style.top = rect.height / 2 - size / 2 + 'px';
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
};

// Enhanced animations and interactions
const uiEnhancements = {
    init() {
        this.addLoadingStates();
        this.enhanceFormValidation();
        this.addMicroInteractions();
        this.improveAccessibility();
    },

    addLoadingStates() {
        // Add loading states to forms and buttons
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
                
                const originalText = submitBtn.textContent;
                submitBtn.innerHTML = '<span class="material-icons">hourglass_empty</span> Loading...';
                
                // Reset after a delay (the actual form submission will handle the real reset)
                setTimeout(() => {
                    if (submitBtn.classList.contains('loading')) {
                        submitBtn.classList.remove('loading');
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    }
                }, 5000);
            }
        });
    },

    enhanceFormValidation() {
        // Add real-time validation feedback
        document.addEventListener('input', (e) => {
            if (e.target.matches('input[required], select[required]')) {
                const input = e.target;
                const isValid = input.checkValidity();
                
                input.style.borderColor = isValid ? 
                    'var(--md-sys-color-outline)' : 
                    'var(--md-sys-color-error)';
                
                // Remove any existing validation message
                const existingMsg = input.parentNode.querySelector('.validation-message');
                if (existingMsg) existingMsg.remove();
                
                if (!isValid && input.value) {
                    const validationMsg = document.createElement('div');
                    validationMsg.className = 'validation-message';
                    validationMsg.style.cssText = `
                        color: var(--md-sys-color-error);
                        font-size: 12px;
                        margin-top: 4px;
                        opacity: 0;
                        animation: fadeIn 0.3s forwards;
                    `;
                    validationMsg.textContent = input.validationMessage;
                    input.parentNode.appendChild(validationMsg);
                }
            }
        });
    },

    addMicroInteractions() {
        // Add hover effects and micro-animations
        document.addEventListener('mouseenter', (e) => {
            if (e.target.matches('.train-card')) {
                e.target.style.transform = 'translateY(-4px)';
            }
            
            if (e.target.matches('button:not(.accordion-header)')) {
                e.target.style.transform = 'translateY(-2px)';
            }
        });
        
        document.addEventListener('mouseleave', (e) => {
            if (e.target.matches('.train-card')) {
                e.target.style.transform = 'translateY(0)';
            }
            
            if (e.target.matches('button:not(.accordion-header)')) {
                e.target.style.transform = 'translateY(0)';
            }
        });

        // Add click animations
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, .tab-button')) {
                this.addClickAnimation(e.target);
            }
        });
    },

    addClickAnimation(element) {
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = '';
        }, 100);
    },

    improveAccessibility() {
        // Add keyboard navigation improvements
        document.addEventListener('keydown', (e) => {
            // Tab navigation for custom elements
            if (e.key === 'Tab') {
                const focusableElements = document.querySelectorAll(
                    'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );
                
                // Add focus indicators
                focusableElements.forEach(el => {
                    el.addEventListener('focus', () => {
                        el.style.outline = '2px solid var(--md-sys-color-primary)';
                        el.style.outlineOffset = '2px';
                    });
                    
                    el.addEventListener('blur', () => {
                        el.style.outline = '';
                        el.style.outlineOffset = '';
                    });
                });
            }
            
            // Escape key to close modals
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal-overlay.visible');
                if (openModal) {
                    openModal.classList.remove('visible');
                }
            }
        });
    }
};

// Smooth scroll and page transitions
const pageTransitions = {
    init() {
        this.addPageTransitions();
        this.enhanceScrolling();
    },

    addPageTransitions() {
        // Add fade-in animation to main content
        const container = document.querySelector('.container');
        if (container) {
            container.style.opacity = '0';
            container.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                container.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                container.style.opacity = '1';
                container.style.transform = 'translateY(0)';
            }, 100);
        }
    },

    enhanceScrolling() {
        // Smooth scroll behavior
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Add scroll-based animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe form sections and result cards
        setTimeout(() => {
            document.querySelectorAll('.form-section, .train-card, .results-column').forEach(el => {
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                el.style.opacity = '0'; // Set initial opacity to 0 for fade-in
                observer.observe(el);
            });
        }, 500);
    }
};

// Enhanced table interactions
const tableEnhancements = {
    init() {
        this.enhanceTableResponsiveness();
    },

    enhanceTableResponsiveness() {
        // Add mobile-friendly table interactions
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            const wrapper = table.closest('.table-container');
            if (wrapper && !wrapper.querySelector('.scroll-indicator')) { // Add check to prevent duplicates
                // Add scroll indicators
                const scrollIndicator = document.createElement('div');
                scrollIndicator.className = 'scroll-indicator';
                scrollIndicator.style.cssText = `
                    position: absolute;
                    right: 0;
                    top: 0;
                    bottom: 0;
                    width: 20px;
                    background: linear-gradient(to left, rgba(0,0,0,0.1), transparent);
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                `;
                wrapper.style.position = 'relative';
                wrapper.appendChild(scrollIndicator);
                
                wrapper.addEventListener('scroll', () => {
                    const maxScrollLeft = wrapper.scrollWidth - wrapper.clientWidth;
                    // Show indicator only if there is something to scroll
                    scrollIndicator.style.opacity = maxScrollLeft > 0 && wrapper.scrollLeft < maxScrollLeft ? '1' : '0';
                });
            }
        });
    }
};

// Enhanced modal with better animations
function enhanceModalExperience() {
    const modal = document.getElementById('edit-modal');
    if (!modal) return;
    
    // Add backdrop click to close with animation
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.animation = 'modalFadeOut 0.3s ease';
            setTimeout(() => {
                modal.classList.remove('visible');
                modal.style.animation = '';
            }, 300);
        }
    });
    
    // Enhance modal opening animation
    const originalObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                if (modal.classList.contains('visible')) {
                    modal.style.animation = 'modalFadeIn 0.4s ease';
                }
            }
        });
    });
    
    originalObserver.observe(modal, { attributes: true });
}

// Function to apply stagger animation to table rows
const applyTableAnimations = (tableSelector) => {
    setTimeout(() => {
        const rows = document.querySelectorAll(`${tableSelector} tbody tr`);
        rows.forEach((row, index) => {
            row.style.opacity = '0';
            row.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                row.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateX(0)';
            }, index * 50);
        });
    }, 100); // Small delay to allow DOM update
};


document.addEventListener('DOMContentLoaded', () => {
    // --- INITIALIZE UI/UX ENHANCEMENTS ---
    themeManager.init();
    uiEnhancements.init();
    pageTransitions.init();
    tableEnhancements.init();
    setTimeout(enhanceModalExperience, 100); // Enhance modal after it's in the DOM

    // Add CSS animation keyframes dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple { to { transform: scale(4); opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .loading .material-icons { animation: pulse 1.5s ease-in-out infinite; }
        @keyframes modalFadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes modalFadeOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9); } }
    `;
    document.head.appendChild(style);


    // --- GENERIC FORM SUBMISSION HANDLER ---
    const handleFormSubmit = async (form, url, callback) => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                const result = await response.json();
                alert(result.message || result.error);
                if (response.ok) {
                    form.reset();
                    if (callback) callback();
                }
            } catch (error) {
                console.error('Submission error:', error);
                alert('An error occurred. Please try again.');
            }
        });
    };

    // --- GENERIC TAB SWITCHING LOGIC ---
    const tabContainers = document.querySelectorAll('.tab-container');
    tabContainers.forEach(container => {
        container.addEventListener('click', (e) => {
            if (e.target.matches('.tab-button')) {
                const tab = e.target.dataset.tab;
                container.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                const contentContainer = document.querySelector('.container');
                contentContainer.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                contentContainer.querySelector(`#${tab}`).classList.add('active');
            }
        });
    });

    // --- MARKETING PAGE LOGIC ---
    if (document.getElementById('branding-sla-form')) {
        const fetchAndDisplaySLAs = async () => {
            const response = await fetch('/api/marketing/slas');
            const { data } = await response.json();
            const tbody = document.querySelector('#sla-table tbody');
            tbody.innerHTML = '';
            data.forEach(sla => {
                const recordData = encodeURIComponent(JSON.stringify(sla));
                tbody.innerHTML += `
                    <tr>
                        <td>${sla.sla_id}</td>
                        <td>${sla.trainset_id}</td>
                        <td>${sla.target_exposure_hours}</td>
                        <td>${sla.current_exposure_hours}</td>
                        <td>${sla.penalty_per_hour}</td>
                        <td>
                            <button class="action-btn edit-btn" data-type="sla" data-record="${recordData}">Edit</button>
                            <button class="action-btn delete-btn" data-id="${sla.sla_id}" data-type="sla">Delete</button>
                        </td>
                    </tr>
                `;
            });
            applyTableAnimations('#sla-table');
        };
        handleFormSubmit(document.getElementById('branding-sla-form'), '/api/marketing/sla', fetchAndDisplaySLAs);
        fetchAndDisplaySLAs();
    }

    // --- DEPOT PAGE LOGIC ---
    if (document.getElementById('depot-layout-form')) {
        const fetchAndDisplayLayouts = async () => {
            const response = await fetch('/api/depot/layouts');
            const { data } = await response.json();
            const tbody = document.querySelector('#layout-table tbody');
            tbody.innerHTML = '';
            data.forEach(item => {
                const recordData = encodeURIComponent(JSON.stringify(item));
                tbody.innerHTML += `
                    <tr>
                        <td>${item.from_location}</td>
                        <td>${item.to_location}</td>
                        <td>${item.shunting_cost}</td>
                        <td>
                            <button class="action-btn edit-btn" data-type="layout" data-record="${recordData}">Edit</button>
                            <button class="action-btn delete-btn" data-id="${item.id}" data-type="layout">Delete</button>
                        </td>
                    </tr>
                `;
            });
            applyTableAnimations('#layout-table');
        };
        const fetchAndDisplayResources = async () => {
            const response = await fetch('/api/depot/resources');
            const { data } = await response.json();
            const tbody = document.querySelector('#resource-table tbody');
            tbody.innerHTML = '';
            data.forEach(item => {
                const recordData = encodeURIComponent(JSON.stringify(item));
                tbody.innerHTML += `
                    <tr>
                        <td>${item.resource_id}</td>
                        <td>${item.available_capacity}</td>
                        <td>
                            <button class="action-btn edit-btn" data-type="resource" data-record="${recordData}">Edit</button>
                            <button class="action-btn delete-btn" data-id="${item.resource_id}" data-type="resource">Delete</button>
                        </td>
                    </tr>
                `;
            });
            applyTableAnimations('#resource-table');
        };
        handleFormSubmit(document.getElementById('depot-layout-form'), '/api/depot/layout', fetchAndDisplayLayouts);
        handleFormSubmit(document.getElementById('depot-resource-form'), '/api/depot/resource', fetchAndDisplayResources);
        fetchAndDisplayLayouts();
        fetchAndDisplayResources();
    }

    // --- MAINTENANCE PAGE LOGIC ---
    if (document.getElementById('fitness-cert-form')) {
        const fetchAndDisplayCerts = async () => {
            const response = await fetch('/api/maintenance/fitness');
            const { data } = await response.json();
            const tbody = document.querySelector('#fitness-table tbody');
            tbody.innerHTML = '';
            data.forEach(item => {
                const recordData = encodeURIComponent(JSON.stringify(item));
                tbody.innerHTML += `
                    <tr>
                        <td>${item.certificate_id}</td>
                        <td>${item.trainset_id}</td>
                        <td>${item.certificate_type}</td>
                        <td>${item.expiry_date}</td>
                        <td>
                            <button class="action-btn edit-btn" data-type="fitness" data-record="${recordData}">Edit</button>
                            <button class="action-btn delete-btn" data-id="${item.certificate_id}" data-type="fitness">Delete</button>
                        </td>
                    </tr>
                `;
            });
            applyTableAnimations('#fitness-table');
        };
        const fetchAndDisplayJobCards = async () => {
            const response = await fetch('/api/maintenance/jobcards');
            const { data } = await response.json();
            const tbody = document.querySelector('#job-card-table tbody');
            tbody.innerHTML = '';
            data.forEach(item => {
                const recordData = encodeURIComponent(JSON.stringify(item));
                tbody.innerHTML += `
                    <tr>
                        <td>${item.job_card_id}</td>
                        <td>${item.trainset_id}</td>
                        <td>${item.status}</td>
                        <td>${item.is_critical}</td>
                        <td>${item.description}</td>
                        <td>${item.required_man_hours}</td>
                        <td>
                            <button class="action-btn edit-btn" data-type="jobcard" data-record="${recordData}">Edit</button>
                            <button class="action-btn delete-btn" data-id="${item.job_card_id}" data-type="jobcard">Delete</button>
                        </td>
                    </tr>
                `;
            });
            applyTableAnimations('#job-card-table');
        };
        handleFormSubmit(document.getElementById('fitness-cert-form'), '/api/maintenance/fitness', fetchAndDisplayCerts);
        handleFormSubmit(document.getElementById('job-card-form'), '/api/maintenance/jobcard', fetchAndDisplayJobCards);
        fetchAndDisplayCerts();
        fetchAndDisplayJobCards();
    }

    // --- TRAINSET PAGE LOGIC ---
    if (document.getElementById('trainset-master-form')) {
        const fetchAndDisplayTrainsets = async () => {
            const response = await fetch('/api/trainset/master');
            const { data } = await response.json();
            const tbody = document.querySelector('#trainset-table tbody');
            tbody.innerHTML = '';
            data.forEach(item => {
                const recordData = encodeURIComponent(JSON.stringify(item));
                tbody.innerHTML += `
                    <tr>
                        <td>${item.trainset_id}</td>
                        <td>${item.cumulative_mileage_km}</td>
                        <td>${item.in_service_date}</td>
                        <td>${item.has_branding_wrap}</td>
                        <td>
                            <button class="action-btn edit-btn" data-type="trainset" data-record="${recordData}">Edit</button>
                            <button class="action-btn delete-btn" data-id="${item.trainset_id}" data-type="trainset">Delete</button>
                        </td>
                    </tr>
                `;
            });
            applyTableAnimations('#trainset-table');
        };
        handleFormSubmit(document.getElementById('trainset-master-form'), '/api/trainset/master', fetchAndDisplayTrainsets);
        fetchAndDisplayTrainsets();
    }

    // --- ADMIN PAGE LOGIC ---
    if (document.getElementById('run-model-form')) {
        const runModelForm = document.getElementById('run-model-form');
        const runModelBtn = document.getElementById('run-model-btn');
        const fetchDataBtn = document.getElementById('fetch-data-btn');
        // Get the results wrapper to hide/show it
        const resultsWrapper = document.getElementById('results-wrapper');
        
        document.querySelectorAll('.button-group').forEach(group => {
            const targetInput = document.getElementById(group.dataset.targetInput);
            const targetDisplay = document.getElementById(group.dataset.targetDisplay);
            const actualAdvancedInput = group.nextElementSibling;

            group.addEventListener('click', (e) => {
                if (e.target.matches('.preset-btn')) {
                    const button = e.target;
                    targetInput.value = button.dataset.value;
                    targetDisplay.textContent = `(${button.dataset.name}: ${button.dataset.value})`;
                    group.querySelectorAll('.preset-btn, .advanced-btn').forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    actualAdvancedInput.classList.remove('visible');
                } else if (e.target.matches('.advanced-btn')) {
                    const button = e.target;
                    actualAdvancedInput.classList.toggle('visible');
                    button.classList.toggle('active');
                    group.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
                    targetDisplay.textContent = `(Custom: ${actualAdvancedInput.value})`;
                }
            });
             if (actualAdvancedInput && actualAdvancedInput.matches('.advanced-input')) {
                actualAdvancedInput.addEventListener('input', () => {
                    targetDisplay.textContent = `(Custom: ${actualAdvancedInput.value})`;
                    targetInput.value = actualAdvancedInput.value;
                });
            }
        });

        const displayResults = (assignments) => {
            const revenueList = document.getElementById('revenue-service-list');
            const standbyList = document.getElementById('standby-list');
            const maintenanceList = document.getElementById('maintenance-list');
            revenueList.innerHTML = '';
            standbyList.innerHTML = '';
            maintenanceList.innerHTML = '';
            if (!assignments || assignments.length === 0) return;
            assignments.forEach(train => {
                const cardClass = train['Assigned Status'].toLowerCase().replace(' ', '-');
                const cardHTML = `
                    <div class="train-card ${cardClass}">
                        <strong>${train['Train ID']}</strong>
                        <p>Mileage: ${train['Cumulative Mileage']} km (${train['Mileage vs Avg (%)']}% vs avg)</p>
                        <p>Eligibility: ${train['Is Eligible'] ? 'Yes' : 'No'} (${train['Eligibility Reason']})</p>
                        <p>Pending Work: ${train['Pending Work Hours']} hrs | Next Cert: ${train['Next Cert Expiry']}</p>
                    </div>
                `;
                if (train['Assigned Status'] === 'Revenue Service') {
                    revenueList.innerHTML += cardHTML;
                } else if (train['Assigned Status'] === 'Standby') {
                    standbyList.innerHTML += cardHTML;
                } else {
                    maintenanceList.innerHTML += cardHTML;
                }
            });
        };

        const fetchAndDisplayTrainOverview = async () => {
            const container = document.getElementById('train-overview-container');
            if (!container) return;
            container.innerHTML = '<h4>Loading train data...</h4>';

            try {
                const response = await fetch('/api/admin/train-overview');
                const { data } = await response.json();

                if (!data || data.length === 0) {
                    container.innerHTML = '<h4>No train data found.</h4>';
                    return;
                }
                
                container.innerHTML = ''; // Clear loading message
                data.forEach(train => {
                    const certsHTML = train.certificates.map(c => `<li>${c.certificate_type} (Expires: ${c.expiry_date})</li>`).join('');
                    const jobsHTML = train.jobCards.map(j => `<li class="job-${j.status.toLowerCase()}">${j.description} (Status: ${j.status})</li>`).join('');
                    const slaHTML = train.sla ? `<li>Target: ${train.sla.target_exposure_hours}hrs | Penalty: $${train.sla.penalty_per_hour}/hr</li>` : '<li>No SLA assigned</li>';

                    const item = document.createElement('div');
                    item.className = 'accordion-item';
                    item.innerHTML = `
                        <button class="accordion-header">
                            <span>${train.trainset_id}${train.has_branding_wrap === 'true' ? ' (Branded)' : ''}</span>
                            <span class="accordion-icon">+</span>
                        </button>
                        <div class="accordion-content">
                            <div class="overview-section"><h4>Master Data</h4><ul><li>Mileage: ${train.cumulative_mileage_km} km</li><li>In Service Since: ${train.in_service_date}</li></ul></div>
                            <div class="overview-section"><h4>Fitness Certificates</h4><ul>${certsHTML || '<li>No certificates found</li>'}</ul></div>
                            <div class="overview-section"><h4>Job Cards</h4><ul>${jobsHTML || '<li>No job cards found</li>'}</ul></div>
                            <div class="overview-section"><h4>Branding SLA</h4><ul>${slaHTML}</ul></div>
                        </div>
                    `;
                    container.appendChild(item);
                });
            } catch (error) {
                container.innerHTML = '<h4>Error loading train data.</h4>';
                console.error('Error fetching train overview:', error);
            }
        };
        const overviewContainer = document.getElementById('train-overview-container');
        if(overviewContainer) {
            overviewContainer.addEventListener('click', e => {
                const header = e.target.closest('.accordion-header');
                if (!header) return;

                const item = header.parentElement;
                const content = header.nextElementSibling;
                const icon = header.querySelector('.accordion-icon');

                document.querySelectorAll('.accordion-item').forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                        otherItem.querySelector('.accordion-content').style.maxHeight = null;
                        otherItem.querySelector('.accordion-icon').textContent = '+';
                    }
                });

                item.classList.toggle('active');
                if (item.classList.contains('active')) {
                    content.style.maxHeight = content.scrollHeight + "px";
                    icon.textContent = '−';
                } else {
                    content.style.maxHeight = null;
                    icon.textContent = '+';
                }
            });
        }
        fetchAndDisplayTrainOverview();
        
        runModelForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            runModelBtn.textContent = 'Running...';
            runModelBtn.disabled = true;
            const w_mileage = document.getElementById('w_mileage').value;
            const w_branding = document.getElementById('w_branding').value;
            try {
                const response = await fetch('/api/admin/run-model', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ w_mileage, w_branding }),
                });
                const result = await response.json();
                if (result.error) {
                    throw new Error(result.details || result.error);
                }
                displayResults(result.assignments);
                // **FIX**: Show the results section after a successful run
                if (resultsWrapper) {
                    resultsWrapper.classList.remove('hidden');
                }
            } catch (error) {
                console.error('Run model error:', error);
                alert('An error occurred while running the model: ' + error.message);
            } finally {
                runModelBtn.textContent = 'Run Model';
                runModelBtn.disabled = false;
            }
        });

        fetchDataBtn.addEventListener('click', async () => {
            fetchDataBtn.textContent = 'Fetching...';
            fetchDataBtn.disabled = true;
            try {
                const response = await fetch('/api/admin/data');
                const data = await response.json();
                const populateTable = (tableId, dataArray, columns, idColumn, dataType) => {
                    const tableSection = document.getElementById(tableId)?.closest('.data-table-section');
                    const tbody = document.querySelector(`#${tableId} tbody`);
                    if (!tbody || !tableSection) return;
                    tbody.innerHTML = '';
                    if (dataArray && dataArray.length > 0) {
                        tableSection.style.display = 'block';
                        dataArray.forEach(row => {
                            const recordData = encodeURIComponent(JSON.stringify(row));
                            let rowHTML = '<tr>';
                            columns.forEach(col => {
                                rowHTML += `<td>${row[col] || 'N/A'}</td>`;
                            });
                            rowHTML += `<td><button class="action-btn edit-btn" data-type="${dataType}" data-record="${recordData}">Edit</button><button class="action-btn delete-btn" data-id="${row[idColumn]}" data-type="${dataType}">Delete</button></td>`;
                            rowHTML += '</tr>';
                            tbody.innerHTML += rowHTML;
                        });
                        applyTableAnimations(`#${tableId}`);
                    } else {
                        tableSection.style.display = 'none';
                    }
                };
                populateTable('raw-slas-table', data.slas, ['sla_id', 'trainset_id', 'target_exposure_hours', 'current_exposure_hours', 'penalty_per_hour'], 'sla_id', 'sla');
                populateTable('raw-layout-table', data.layoutCosts, ['id', 'from_location', 'to_location', 'shunting_cost'], 'id', 'layout');
                populateTable('raw-resources-table', data.resources, ['resource_id', 'available_capacity'], 'resource_id', 'resource');
                populateTable('raw-certs-table', data.fitnessCertificates, ['certificate_id', 'trainset_id', 'certificate_type', 'expiry_date'], 'certificate_id', 'fitness');
                populateTable('raw-jobs-table', data.jobCards, ['job_card_id', 'trainset_id', 'status', 'is_critical', 'description', 'required_man_hours'], 'job_card_id', 'jobcard');
                populateTable('raw-trainsets-table', data.trainsets, ['trainset_id', 'cumulative_mileage_km', 'in_service_date', 'has_branding_wrap'], 'trainset_id', 'trainset');

                document.getElementById('db-nav-links').style.display = 'flex';

            } catch (error) {
                console.error('Fetch error:', error);
                alert('Could not fetch data.');
            } finally {
                fetchDataBtn.textContent = 'Fetch All Database Tables';
                fetchDataBtn.disabled = false;
            }
        });
    }

    // --- GLOBAL EDIT MODAL LOGIC ---
    const modal = document.getElementById('edit-modal');
    if (modal) {
        const modalFormContent = document.getElementById('modal-form-content');
        const editForm = document.getElementById('edit-form');
        const modalTitle = document.getElementById('modal-title');

        document.body.addEventListener('click', (e) => {
            if (!e.target.matches('.edit-btn')) return;
            const button = e.target;
            const type = button.dataset.type;
            const record = JSON.parse(decodeURIComponent(button.dataset.record));
            let formHTML = '';
            modalTitle.textContent = `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}`;

            switch (type) {
                case 'sla':
                    formHTML = `<div class="form-group"><label>SLA ID</label><input type="text" value="${record.sla_id}" disabled></div><div class="form-group"><label>Trainset ID</label><input type="text" name="trainset_id" value="${record.trainset_id}" required></div><div class="form-group"><label>Target Hours</label><input type="number" name="target_exposure_hours" value="${record.target_exposure_hours}" required></div><div class="form-group"><label>Current Hours</label><input type="number" name="current_exposure_hours" value="${record.current_exposure_hours}" required></div><div class="form-group"><label>Penalty/Hour</label><input type="number" name="penalty_per_hour" value="${record.penalty_per_hour}" required></div>`;
                    editForm.action = `/api/marketing/sla/${record.sla_id}`;
                    break;
                case 'layout':
                    formHTML = `<div class="form-group"><label>ID</label><input type="text" value="${record.id}" disabled></div><div class="form-group"><label>From Location</label><input type="text" name="from_location" value="${record.from_location}" required></div><div class="form-group"><label>To Location</label><input type="text" name="to_location" value="${record.to_location}" required></div><div class="form-group"><label>Shunting Cost</label><input type="number" name="shunting_cost" value="${record.shunting_cost}" required></div>`;
                    editForm.action = `/api/depot/layout/${record.id}`;
                    break;
                case 'resource':
                    formHTML = `<div class="form-group"><label>Resource ID</label><input type="text" value="${record.resource_id}" disabled></div><div class="form-group"><label>Available Capacity</label><input type="number" name="available_capacity" value="${record.available_capacity}" required></div>`;
                    editForm.action = `/api/depot/resource/${record.resource_id}`;
                    break;
                case 'fitness':
                    formHTML = `<div class="form-group"><label>Certificate ID</label><input type="text" value="${record.certificate_id}" disabled></div><div class="form-group"><label>Trainset ID</label><input type="text" name="trainset_id" value="${record.trainset_id}" required></div><div class="form-group"><label>Certificate Type</label><select name="certificate_type" required><option value="Rolling-Stock" ${record.certificate_type === 'Rolling-Stock' ? 'selected' : ''}>Rolling-Stock</option><option value="Signalling" ${record.certificate_type === 'Signalling' ? 'selected' : ''}>Signalling</option><option value="Telecom" ${record.certificate_type === 'Telecom' ? 'selected' : ''}>Telecom</option></select></div><div class="form-group"><label>Expiry Date</label><input type="date" name="expiry_date" value="${record.expiry_date}" required></div>`;
                    editForm.action = `/api/maintenance/fitness/${record.certificate_id}`;
                    break;
                case 'jobcard':
                    formHTML = `<div class="form-group"><label>Job Card ID</label><input type="text" value="${record.job_card_id}" disabled></div><div class="form-group"><label>Trainset ID</label><input type="text" name="trainset_id" value="${record.trainset_id}" required></div><div class="form-group"><label>Status</label><select name="status" required><option value="CLOSE" ${record.status === 'CLOSE' ? 'selected' : ''}>CLOSE</option><option value="OPEN" ${record.status === 'OPEN' ? 'selected' : ''}>OPEN</option></select></div><div class="form-group"><label>Is Critical</label><select name="is_critical" required><option value="true" ${String(record.is_critical) === 'true' ? 'selected' : ''}>True</option><option value="false" ${String(record.is_critical) === 'false' ? 'selected' : ''}>False</option></select></div><div class="form-group"><label>Description</label><input type="text" name="description" value="${record.description}" required></div><div class="form-group"><label>Required Man Hours</label><input type="number" name="required_man_hours" value="${record.required_man_hours}" required></div>`;
                    editForm.action = `/api/maintenance/jobcard/${record.job_card_id}`;
                    break;
                case 'trainset':
                    formHTML = `<div class="form-group"><label>Trainset ID</label><input type="text" value="${record.trainset_id}" disabled></div><div class="form-group"><label>Cumulative Mileage (km)</label><input type="number" name="cumulative_mileage_km" value="${record.cumulative_mileage_km}" required></div><div class="form-group"><label>In-Service Date</label><input type="date" name="in_service_date" value="${record.in_service_date}" required></div><div class="form-group"><label>Has Branding Wrap</label><select name="has_branding_wrap" required><option value="true" ${String(record.has_branding_wrap) === 'true' ? 'selected' : ''}>True</option><option value="false" ${String(record.has_branding_wrap) === 'false' ? 'selected' : ''}>False</option></select></div>`;
                    editForm.action = `/api/trainset/master/${record.trainset_id}`;
                    break;
            }
            modalFormContent.innerHTML = formHTML;
            modal.classList.add('visible');
        });

        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const url = e.target.action;
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            try {
                const response = await fetch(url, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                alert(result.message);
                if (response.ok) {
                    location.reload();
                }
            } catch (error) {
                console.error("Update error:", error);
                alert('An error occurred while saving changes.');
            }
        });

        modal.querySelector('.modal-close-btn').addEventListener('click', () => {
            modal.classList.remove('visible');
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('visible');
            }
        });
    }

    // --- GLOBAL DELETE BUTTON HANDLER ---
    document.body.addEventListener('click', async (e) => {
        if (!e.target.matches('.delete-btn')) return;
        const button = e.target;
        const id = button.dataset.id;
        const type = button.dataset.type;
        const typeName = { sla: 'SLA', layout: 'Layout Cost', resource: 'Resource', fitness: 'Certificate', jobcard: 'Job Card', trainset: 'Trainset' }[type] || 'record';
        if (!confirm(`Are you sure you want to delete this ${typeName}?`)) return;
        const apiMap = {
            sla: '/api/marketing/sla/',
            layout: '/api/depot/layout/',
            resource: '/api/depot/resource/',
            fitness: '/api/maintenance/fitness/',
            jobcard: '/api/maintenance/jobcard/',
            trainset: '/api/trainset/master/'
        };
        const url = apiMap[type] + id;
        try {
            const response = await fetch(url, { method: 'DELETE' });
            const result = await response.json();
            alert(result.message);
            if (response.ok) {
                location.reload();
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert('An error occurred during deletion.');
        }
    });
});