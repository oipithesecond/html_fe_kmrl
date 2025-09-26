document.addEventListener('DOMContentLoaded', () => {
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
        };
        handleFormSubmit(document.getElementById('trainset-master-form'), '/api/trainset/master', fetchAndDisplayTrainsets);
        fetchAndDisplayTrainsets();
    }

    // --- ADMIN PAGE LOGIC ---
    if (document.getElementById('run-model-form')) {
        const runModelForm = document.getElementById('run-model-form');
        const runModelBtn = document.getElementById('run-model-btn');
        const fetchDataBtn = document.getElementById('fetch-data-btn');
        
        document.querySelectorAll('.button-group').forEach(group => {
            const targetInput = document.getElementById(group.dataset.targetInput);
            const targetDisplay = document.getElementById(group.dataset.targetDisplay);
            const advancedInput = document.getElementById(group.dataset.targetInput);
            group.addEventListener('click', (e) => {
                if (e.target.matches('.preset-btn')) {
                    const button = e.target;
                    targetInput.value = button.dataset.value;
                    targetDisplay.textContent = `(${button.dataset.name}: ${button.dataset.value})`;
                    group.querySelectorAll('.preset-btn, .advanced-btn').forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    advancedInput.classList.remove('visible');
                } else if (e.target.matches('.advanced-btn')) {
                    const button = e.target;
                    advancedInput.classList.toggle('visible');
                    button.classList.toggle('active');
                    group.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
                    targetDisplay.textContent = `(Custom: ${advancedInput.value})`;
                }
            });
            advancedInput.addEventListener('input', () => {
                targetDisplay.textContent = `(Custom: ${advancedInput.value})`;
            });
        });

        const revenueList = document.getElementById('revenue-service-list');
        const standbyList = document.getElementById('standby-list');
        const maintenanceList = document.getElementById('maintenance-list');
        const displayResults = (assignments) => {
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
                            <div class="overview-section">
                                <h4>Master Data</h4>
                                <ul>
                                    <li>Mileage: ${train.cumulative_mileage_km} km</li>
                                    <li>In Service Since: ${train.in_service_date}</li>
                                </ul>
                            </div>
                            <div class="overview-section">
                                <h4>Fitness Certificates</h4>
                                <ul>${certsHTML || '<li>No certificates found</li>'}</ul>
                            </div>
                            <div class="overview-section">
                                <h4>Job Cards</h4>
                                <ul>${jobsHTML || '<li>No job cards found</li>'}</ul>
                            </div>
                            <div class="overview-section">
                                <h4>Branding SLA</h4>
                                <ul>${slaHTML}</ul>
                            </div>
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

                // Logic to close other items
                document.querySelectorAll('.accordion-item').forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                        otherItem.querySelector('.accordion-content').style.maxHeight = null;
                        otherItem.querySelector('.accordion-icon').textContent = '+';
                    }
                });

                // Toggle the clicked item
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
                            rowHTML += `
                                <td>
                                    <button class="action-btn edit-btn" data-type="${dataType}" data-record="${recordData}">Edit</button>
                                    <button class="action-btn delete-btn" data-id="${row[idColumn]}" data-type="${dataType}">Delete</button>
                                </td>
                            `;
                            rowHTML += '</tr>';
                            tbody.innerHTML += rowHTML;
                        });
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
                    formHTML = `
                        <div class="form-group"><label>SLA ID</label><input type="text" value="${record.sla_id}" disabled></div>
                        <div class="form-group"><label>Trainset ID</label><input type="text" name="trainset_id" value="${record.trainset_id}" required></div>
                        <div class="form-group"><label>Target Hours</label><input type="number" name="target_exposure_hours" value="${record.target_exposure_hours}" required></div>
                        <div class="form-group"><label>Current Hours</label><input type="number" name="current_exposure_hours" value="${record.current_exposure_hours}" required></div>
                        <div class="form-group"><label>Penalty/Hour</label><input type="number" name="penalty_per_hour" value="${record.penalty_per_hour}" required></div>
                    `;
                    editForm.action = `/api/marketing/sla/${record.sla_id}`;
                    break;
                case 'layout':
                    formHTML = `
                        <div class="form-group"><label>ID</label><input type="text" value="${record.id}" disabled></div>
                        <div class="form-group"><label>From Location</label><input type="text" name="from_location" value="${record.from_location}" required></div>
                        <div class="form-group"><label>To Location</label><input type="text" name="to_location" value="${record.to_location}" required></div>
                        <div class="form-group"><label>Shunting Cost</label><input type="number" name="shunting_cost" value="${record.shunting_cost}" required></div>
                    `;
                    editForm.action = `/api/depot/layout/${record.id}`;
                    break;
                case 'resource':
                    formHTML = `
                        <div class="form-group"><label>Resource ID</label><input type="text" value="${record.resource_id}" disabled></div>
                        <div class="form-group"><label>Available Capacity</label><input type="number" name="available_capacity" value="${record.available_capacity}" required></div>
                    `;
                    editForm.action = `/api/depot/resource/${record.resource_id}`;
                    break;
                case 'fitness':
                    formHTML = `
                        <div class="form-group"><label>Certificate ID</label><input type="text" value="${record.certificate_id}" disabled></div>
                        <div class="form-group"><label>Trainset ID</label><input type="text" name="trainset_id" value="${record.trainset_id}" required></div>
                        <div class="form-group"><label>Certificate Type</label>
                            <select name="certificate_type" required>
                                <option value="Rolling-Stock" ${record.certificate_type === 'Rolling-Stock' ? 'selected' : ''}>Rolling-Stock</option>
                                <option value="Signalling" ${record.certificate_type === 'Signalling' ? 'selected' : ''}>Signalling</option>
                                <option value="Telecom" ${record.certificate_type === 'Telecom' ? 'selected' : ''}>Telecom</option>
                            </select>
                        </div>
                        <div class="form-group"><label>Expiry Date</label><input type="date" name="expiry_date" value="${record.expiry_date}" required></div>
                    `;
                    editForm.action = `/api/maintenance/fitness/${record.certificate_id}`;
                    break;
                case 'jobcard':
                    formHTML = `
                        <div class="form-group"><label>Job Card ID</label><input type="text" value="${record.job_card_id}" disabled></div>
                        <div class="form-group"><label>Trainset ID</label><input type="text" name="trainset_id" value="${record.trainset_id}" required></div>
                        <div class="form-group"><label>Status</label>
                            <select name="status" required>
                                <option value="CLOSE" ${record.status === 'CLOSE' ? 'selected' : ''}>CLOSE</option>
                                <option value="OPEN" ${record.status === 'OPEN' ? 'selected' : ''}>OPEN</option>
                            </select>
                        </div>
                        <div class="form-group"><label>Is Critical</label>
                            <select name="is_critical" required>
                                <option value="true" ${String(record.is_critical) === 'true' ? 'selected' : ''}>True</option>
                                <option value="false" ${String(record.is_critical) === 'false' ? 'selected' : ''}>False</option>
                            </select>
                        </div>
                        <div class="form-group"><label>Description</label><input type="text" name="description" value="${record.description}" required></div>
                        <div class="form-group"><label>Required Man Hours</label><input type="number" name="required_man_hours" value="${record.required_man_hours}" required></div>
                    `;
                    editForm.action = `/api/maintenance/jobcard/${record.job_card_id}`;
                    break;
                case 'trainset':
                    formHTML = `
                        <div class="form-group"><label>Trainset ID</label><input type="text" value="${record.trainset_id}" disabled></div>
                        <div class="form-group"><label>Cumulative Mileage (km)</label><input type="number" name="cumulative_mileage_km" value="${record.cumulative_mileage_km}" required></div>
                        <div class="form-group"><label>In-Service Date</label><input type="date" name="in_service_date" value="${record.in_service_date}" required></div>
                        <div class="form-group"><label>Has Branding Wrap</label>
                            <select name="has_branding_wrap" required>
                                <option value="true" ${String(record.has_branding_wrap) === 'true' ? 'selected' : ''}>True</option>
                                <option value="false" ${String(record.has_branding_wrap) === 'false' ? 'selected' : ''}>False</option>
                            </select>
                        </div>
                    `;
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
        const typeName = {
            sla: 'SLA',
            layout: 'Layout Cost',
            resource: 'Resource',
            fitness: 'Certificate',
            jobcard: 'Job Card',
            trainset: 'Trainset'
        }[type] || 'record';
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