import pandas as pd
from ortools.sat.python import cp_model
import datetime
import json
import sys
import sqlite3
import numpy as np

# --- Configurable Metro Lines ---
METRO_LINES = {
    "Line A (Short: 20km)": 250,
    "Line B (Medium: 40km)": 450,
    "Line C (Long: 60km)": 650,
    "Line D (Express: 80km)": 900,
    "Line E (Long Express: 100km)": 1100,
}

def load_data_from_db(db_path):
    """
    Loads all tables from the SQLite database into a dictionary of Pandas DataFrames.
    """
    try:
        conn = sqlite3.connect(db_path)
        data = {
            "trainsets": pd.read_sql_query("SELECT * from trainsets", conn),
            "certificates": pd.read_sql_query("SELECT * from fitness_certificates", conn),
            "job_cards": pd.read_sql_query("SELECT * from job_cards", conn),
            "slas": pd.read_sql_query("SELECT * from branding_slas", conn),
            "resources": pd.read_sql_query("SELECT * from depot_resources", conn),
            "layout_costs": pd.read_sql_query("SELECT * from depot_layout_costs", conn)
        }
        conn.close()
        return data
    except Exception as e:
        print(json.dumps({"error": f"Database loading failed: {e}"}))
        sys.exit(1)

def assess_train_constraints(data, current_date):
    """
    Enhanced comprehensive assessment of all 6 factors for each train.
    """
    trainsets = data["trainsets"]
    certificates = data["certificates"]
    job_cards = data["job_cards"].copy()
    slas = data["slas"]
    resources = data["resources"]
    
    # Data preprocessing
    job_cards['is_critical'] = job_cards['is_critical'].astype(str).str.lower() == 'true'
    certificates['expiry_date'] = pd.to_datetime(certificates['expiry_date']).dt.date
    
    # Get depot capacity
    total_maintenance_capacity = resources['available_capacity'].sum() if not resources.empty else 100
    
    train_assessments = {}
    
    # Pre-calculate statistics for normalization
    all_mileages = trainsets["cumulative_mileage_km"].tolist()
    avg_mileage = np.mean(all_mileages)
    std_mileage = np.std(all_mileages)
    
    for _, train in trainsets.iterrows():
        train_id = train["trainset_id"]
        
        # 1. FITNESS CERTIFICATES - Hard constraint
        cert_status = "VALID"
        cert_issues = []
        train_certs = certificates[certificates["trainset_id"] == train_id]
        
        if not train_certs.empty:
            expired_certs = train_certs[train_certs["expiry_date"] < current_date]
            if not expired_certs.empty:
                cert_status = "EXPIRED"
                cert_issues = [f"{row['certificate_type']}" for _, row in expired_certs.iterrows()]
            else:
                # Check for soon-expiring certificates (within 7 days)
                soon_expiring = train_certs[
                    (train_certs["expiry_date"] >= current_date) &
                    (train_certs["expiry_date"] <= current_date + datetime.timedelta(days=7))
                ]
                if not soon_expiring.empty:
                    cert_status = "EXPIRING_SOON"
                    cert_issues = [f"{row['certificate_type']}" for _, row in soon_expiring.iterrows()]
        
        # 2. JOB CARD STATUS - Hard constraint for critical jobs
        job_status = "CLEAR"
        pending_work_hours = 0
        critical_jobs = []
        
        train_jobs = job_cards[job_cards["trainset_id"] == train_id]
        if not train_jobs.empty:
            open_jobs = train_jobs[train_jobs["status"] == "OPEN"]
            pending_work_hours = open_jobs['required_man_hours'].sum()
            
            critical_open = open_jobs[open_jobs["is_critical"] == True]
            if not critical_open.empty:
                job_status = "CRITICAL_OPEN"
                critical_jobs = critical_open['description'].tolist()
            elif pending_work_hours > 0:
                job_status = "MINOR_PENDING"
        
        # 3. BRANDING PRIORITIES - Business constraint
        branding_priority = 0
        branding_status = "NO_BRANDING"
        branding_urgency = 0
        
        train_sla = slas[slas["trainset_id"] == train_id]
        if not train_sla.empty:
            sla_row = train_sla.iloc[0]
            target_hours = sla_row["target_exposure_hours"]
            current_hours = sla_row["current_exposure_hours"]
            penalty = sla_row["penalty_per_hour"]
            
            if current_hours < target_hours:
                shortfall = target_hours - current_hours
                branding_priority = shortfall * penalty
                completion_ratio = current_hours / target_hours
                
                if completion_ratio < 0.7:  # Less than 70% complete
                    branding_status = "URGENT_BRANDING"
                    branding_urgency = 100
                elif completion_ratio < 0.9:  # Less than 90% complete
                    branding_status = "MODERATE_BRANDING"
                    branding_urgency = 70
                else:
                    branding_status = "NEAR_COMPLETE"
                    branding_urgency = 30
            else:
                branding_status = "BRANDING_COMPLETE"
                branding_urgency = 0
        
        # Check if train has branding wrap capability
        has_branding_wrap = str(train.get("has_branding_wrap", "false")).lower() == 'true'
        
        # 4. MILEAGE BALANCING - Optimization factor
        mileage = train["cumulative_mileage_km"]
        
        # Calculate mileage score (lower mileage = higher score)
        # Using z-score for better normalization
        if std_mileage > 0:
            mileage_z = (mileage - avg_mileage) / std_mileage
            # Convert to 0-100 scale (lower mileage gets higher score)
            mileage_score = max(0, 100 - (mileage_z * 20 + 50))
        else:
            mileage_score = 50
        
        # 5. MAINTENANCE DEMAND - Resource constraint
        maintenance_demand = pending_work_hours
        
        # 6. AGE FACTOR - Consider in-service date for wear and tear
        in_service_date = pd.to_datetime(train["in_service_date"]).date()
        days_in_service = (current_date - in_service_date).days
        age_factor = min(100, days_in_service / 365 * 10)  # Normalize age
        
        # ELIGIBILITY DETERMINATION
        is_eligible = (cert_status == "VALID" or cert_status == "EXPIRING_SOON") and job_status != "CRITICAL_OPEN"
        
        # COMPREHENSIVE PRIORITY SCORING for eligible trains
        priority_score = 0
        if is_eligible:
            # Base score components
            base_score = mileage_score  # Start with mileage balancing
            
            # Branding boost (only if has branding capability)
            if has_branding_wrap:
                base_score += branding_urgency
            
            # Maintenance penalty (higher pending work = lower priority)
            maintenance_penalty = min(30, pending_work_hours * 2)
            base_score -= maintenance_penalty
            
            # Age consideration (older trains slightly prioritized for rest)
            age_adjustment = -min(10, age_factor / 10)
            base_score += age_adjustment
            
            priority_score = max(1, base_score)  # Ensure positive score
        
        train_assessments[train_id] = {
            "is_eligible": is_eligible,
            "cert_status": cert_status,
            "cert_issues": cert_issues,
            "job_status": job_status,
            "critical_jobs": critical_jobs,
            "pending_work_hours": pending_work_hours,
            "branding_status": branding_status,
            "branding_priority": branding_priority,
            "branding_urgency": branding_urgency,
            "has_branding_wrap": has_branding_wrap,
            "mileage": mileage,
            "mileage_score": mileage_score,
            "age_days": days_in_service,
            "priority_score": priority_score,
            "maintenance_demand": maintenance_demand
        }
    
    return train_assessments

def optimize_train_assignment(data, train_assessments, w_mileage, w_branding):
    """
    Enhanced multi-objective optimization with better weight application.
    """
    # Constants
    REQUIRED_REVENUE = 16
    
    # Separate eligible and ineligible trains
    eligible_trains = [tid for tid, assessment in train_assessments.items() if assessment["is_eligible"]]
    ineligible_trains = [tid for tid, assessment in train_assessments.items() if not assessment["is_eligible"]]
    
    if len(eligible_trains) < REQUIRED_REVENUE:
        return {
            "error": f"Insufficient eligible trains: {len(eligible_trains)} available, {REQUIRED_REVENUE} required"
        }
    
    # Enhanced weighted scoring with user preferences
    weighted_scores = []
    
    for tid in eligible_trains:
        assessment = train_assessments[tid]
        
        # Apply user weights to core factors
        mileage_component = assessment["mileage_score"] * (w_mileage / 10.0)
        
        branding_component = 0
        if assessment["has_branding_wrap"]:
            branding_component = assessment["branding_urgency"] * (w_branding / 100.0)
        
        # Combined score with normalized weights
        total_weight = max(1, (w_mileage / 10.0) + (w_branding / 100.0))
        weighted_score = (mileage_component + branding_component) / total_weight
        
        # Add small random factor to break ties
        tie_breaker = np.random.uniform(0.001, 0.01)
        
        weighted_scores.append((tid, weighted_score + tie_breaker, assessment["mileage_score"], assessment["branding_urgency"]))
    
    # Sort by weighted score (highest first)
    weighted_scores.sort(key=lambda x: x[1], reverse=True)
    
    # Enhanced assignment logic
    solution = {}
    
    # Assign ineligible trains to maintenance
    for tid in ineligible_trains:
        solution[tid] = "Maintenance"
    
    # Assign top eligible trains to revenue service
    revenue_assigned = 0
    for tid, score, mileage_score, branding_urgency in weighted_scores:
        if revenue_assigned < REQUIRED_REVENUE:
            solution[tid] = "Revenue Service"
            revenue_assigned += 1
        else:
            # For remaining trains, decide between Standby and Maintenance
            assessment = train_assessments[tid]
            
            # Trains with high maintenance demand go to maintenance
            if assessment["pending_work_hours"] > 10 or assessment["cert_status"] == "EXPIRING_SOON":
                solution[tid] = "Maintenance"
            else:
                solution[tid] = "Standby"
    
    return solution

def generate_assignment_reasoning(train_id, assessment, assigned_status, w_mileage, w_branding):
    """
    Enhanced context-aware reasoning for assignments.
    """
    if not assessment["is_eligible"]:
        reasons = []
        if assessment["cert_status"] == "EXPIRED":
            reasons.extend([f"Expired {cert}" for cert in assessment["cert_issues"]])
        if assessment["job_status"] == "CRITICAL_OPEN":
            reasons.append("Critical Open Job Card")
        return ", ".join(reasons)
    
    # Enhanced reasoning for eligible trains
    primary_factors = []
    secondary_factors = []
    
    # Primary assignment factors
    if assigned_status == "Revenue Service":
        if assessment["branding_urgency"] > 70 and w_branding > 50:
            primary_factors.append("High Branding Priority")
        elif assessment["mileage_score"] > 70 and w_mileage > 5:
            primary_factors.append("Optimal Mileage")
        else:
            primary_factors.append("Balanced Readiness")
    
    elif assigned_status == "Standby":
        if assessment["pending_work_hours"] > 5:
            primary_factors.append("Maintenance Buffer")
        elif assessment["mileage_score"] < 40:
            primary_factors.append("High Mileage Rotation")
        else:
            primary_factors.append("Operational Reserve")
    
    elif assigned_status == "Maintenance":
        if assessment["pending_work_hours"] > 10:
            primary_factors.append("Substantial Maintenance Needed")
        elif assessment["cert_status"] == "EXPIRING_SOON":
            primary_factors.append("Certification Renewal")
        else:
            primary_factors.append("Scheduled Maintenance")
    
    # Secondary context factors
    if assessment["has_branding_wrap"]:
        if assessment["branding_status"] == "URGENT_BRANDING":
            secondary_factors.append("Branding Urgent")
        elif assessment["branding_status"] == "MODERATE_BRANDING":
            secondary_factors.append("Branding Due")
    
    if assessment["job_status"] == "MINOR_PENDING":
        secondary_factors.append(f"Minor Work: {assessment['pending_work_hours']}h")
    
    if assessment["mileage_score"] > 80:
        secondary_factors.append("Low Mileage")
    elif assessment["mileage_score"] < 30:
        secondary_factors.append("High Mileage")
    
    # Combine reasoning
    reasoning = ", ".join(primary_factors)
    if secondary_factors:
        reasoning += f" [Context: {', '.join(secondary_factors)}]"
    
    return reasoning

def get_final_details(data, train_assessments, solution, w_mileage, w_branding):
    """
    Generate final output with enhanced details and reasoning.
    """
    train_df = data["trainsets"]
    avg_mileage = train_df['cumulative_mileage_km'].mean()
    
    all_trains_details = []
    
    for train_id, assigned_status in solution.items():
        train_data = train_df[train_df["trainset_id"] == train_id].iloc[0]
        assessment = train_assessments[train_id]
        
        # Generate enhanced reasoning
        reasoning = generate_assignment_reasoning(train_id, assessment, assigned_status, w_mileage, w_branding)
        
        # Get next certificate expiry
        certificates = data["certificates"]
        train_certs = certificates[certificates['trainset_id'] == train_id]
        if not train_certs.empty:
            next_cert_expiry = train_certs['expiry_date'].min()
        else:
            next_cert_expiry = pd.NaT
        
        # Enhanced details
        details = {
            "Train ID": train_id,
            "Assigned Status": assigned_status,
            "Is Eligible": assessment["is_eligible"],
            "Eligibility Reason": reasoning,
            "Cumulative Mileage": int(assessment["mileage"]),
            "Mileage vs Avg (%)": round((assessment["mileage"] / avg_mileage) * 100),
            "Pending Work Hours": int(assessment["pending_work_hours"]),
            "Branding Priority": int(assessment["branding_priority"]),
            "Next Cert Expiry": next_cert_expiry.strftime('%Y-%m-%d') if pd.notna(next_cert_expiry) else "N/A",
            "Priority Score": round(assessment["priority_score"], 2)
        }
        all_trains_details.append(details)
    
    # Sort by status and then by Train ID
    status_order = {"Revenue Service": 0, "Standby": 1, "Maintenance": 2}
    all_trains_details.sort(key=lambda x: (status_order[x["Assigned Status"]], x["Train ID"]))
    
    return all_trains_details

def main():
    """
    Main execution function with enhanced 6-factor optimization.
    """
    if len(sys.argv) < 4:
        print(json.dumps({"error": "Usage: python solver2.py <db_path> <w_mileage> <w_branding>"}))
        sys.exit(1)
    
    db_path = sys.argv[1]
    try:
        w_mileage = int(sys.argv[2])
        w_branding = int(sys.argv[3])
    except ValueError:
        print(json.dumps({"error": "Weights for mileage and branding must be integers."}))
        sys.exit(1)
    
    # Current date for certificate validation
    current_date = datetime.date(2025, 9, 18)
    
    # Load and analyze data
    data = load_data_from_db(db_path)
    train_assessments = assess_train_constraints(data, current_date)
    
    # Optimize assignments
    solution = optimize_train_assignment(data, train_assessments, w_mileage, w_branding)
    
    if "error" in solution:
        print(json.dumps(solution))
        sys.exit(1)
    
    # Generate final output
    all_trains_details = get_final_details(data, train_assessments, solution, w_mileage, w_branding)
    
    # Enhanced metrics
    revenue_trains = [s for s in solution.values() if s == 'Revenue Service']
    maintenance_trains = [s for s in solution.values() if s == 'Maintenance']
    standby_trains = [s for s in solution.values() if s == 'Standby']
    
    metrics = {
        "revenue_trains": len(revenue_trains),
        "maintenance_trains": len(maintenance_trains),
        "standby_trains": len(standby_trains),
        "avg_mileage_revenue": round(np.mean([train_assessments[tid]["mileage"] for tid in solution if solution[tid] == "Revenue Service"])),
        "avg_mileage_standby": round(np.mean([train_assessments[tid]["mileage"] for tid in solution if solution[tid] == "Standby"])),
        "branding_coverage": len([tid for tid in solution if solution[tid] == "Revenue Service" and train_assessments[tid]["has_branding_wrap"]]),
        "status": "Success"
    }
    
    output = {
        "status": "Success",
        "assignments": all_trains_details,
        "metrics": metrics
    }
    
    print(json.dumps(output, indent=4))

if __name__ == "__main__":
    main()