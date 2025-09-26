import pandas as pd
from ortools.sat.python import cp_model
import datetime
import os
import time
import json
import sys
import numpy as np
import sqlite3

# --- Configurable Metro Lines ---
METRO_LINES = {
    "Line A (Short: 20km)": 250,    # Approx. 20km route, multiple trips
    "Line B (Medium: 40km)": 450,   # Approx. 40km route, multiple trips
    "Line C (Long: 60km)": 650,     # Approx. 60km route, multiple trips
    "Line D (Express: 80km)": 900,  # Approx. 80km route, multiple trips
    "Line E (Long Express: 100km)": 1100,  # Approx. 100km route
}

def load_data_from_db(db_path):
    """
    Loads all tables from the SQLite database into a dictionary of Pandas DataFrames.
    """
    conn = sqlite3.connect(db_path)
    
    data = {}
    data["trainsets"] = pd.read_sql_query("SELECT * from trainsets", conn)
    data["certificates"] = pd.read_sql_query("SELECT * from fitness_certificates", conn)
    data["job_cards"] = pd.read_sql_query("SELECT * from job_cards", conn)
    data["slas"] = pd.read_sql_query("SELECT * from branding_slas", conn)
    data["resources"] = pd.read_sql_query("SELECT * from depot_resources", conn)
    data["layout_costs"] = pd.read_sql_query("SELECT * from depot_layout_costs", conn)
    
    conn.close()
    
    data["certificates"]["expiry_date"] = pd.to_datetime(data["certificates"]["expiry_date"]).dt.date
    return data

def preprocess_data_with_reasons(data):
    """
    Processes raw data to determine eligibility and provides specific reasons for ineligibility.
    """
    train_ids = data["trainsets"]["trainset_id"].tolist()
    eligibility_details = {}
    today = datetime.date(2025, 9, 18)
    
    for train_id in train_ids:
        eligibility_details[train_id] = {'is_eligible': True, 'reason': 'Eligible for service'}
        
        certs = data["certificates"][data["certificates"]["trainset_id"] == train_id]
        if len(certs) < 3:
            eligibility_details[train_id] = {'is_eligible': False, 'reason': 'Missing required certificates'}
            continue
        if (certs["expiry_date"] < today).any():
            eligibility_details[train_id] = {'is_eligible': False, 'reason': 'Certificate expired'}
            continue
            
        jobs = data["job_cards"][data["job_cards"]["trainset_id"] == train_id]
        critical_open_jobs = jobs[(jobs["status"] == "OPEN") & (jobs["is_critical"] == True)]
        if not critical_open_jobs.empty:
            eligibility_details[train_id] = {'is_eligible': False, 'reason': 'Critical maintenance open'}
            
    return eligibility_details

def preprocess_shunting_costs(layout_df):
    """Calculates average costs for key shunting moves."""
    to_maintenance_moves = layout_df[layout_df['to_location'].str.contains('IBL_Bay', na=False)]
    avg_cost_to_maintenance = to_maintenance_moves['shunting_cost'].mean() if not to_maintenance_moves.empty else 0
    to_stabling_moves = layout_df[layout_df['to_location'].str.contains('Stabling_Track', na=False)]
    avg_cost_to_stabling = to_stabling_moves['shunting_cost'].mean() if not to_stabling_moves.empty else 0
    return {"maintenance": int(avg_cost_to_maintenance), "stabling": int(avg_cost_to_stabling)}

def solve_primary_assignment(data, eligibility_details, shunting_costs, w_mileage=1, w_branding=10000, w_shunting=10, w_urgency=1000000):
    """
    PHASE 1: Solves the core assignment problem with a penalty for not fixing critical trains.
    """
    start_time = time.time()
    model = cp_model.CpModel()
    train_ids = data["trainsets"]["trainset_id"].tolist()
    avg_mileage = data["trainsets"]["cumulative_mileage_km"].mean()

    assignments = {}
    for train_id in train_ids:
        assignments[train_id] = {
            "service": model.NewBoolVar(f"{train_id}_service"), 
            "standby": model.NewBoolVar(f"{train_id}_standby"), 
            "maintenance": model.NewBoolVar(f"{train_id}_maintenance")
        }
        model.AddExactlyOne(list(assignments[train_id].values()))
        
        if not eligibility_details.get(train_id, {}).get('is_eligible', False):
            model.Add(assignments[train_id]["service"] == 0)

    ibl_bays_capacity = data["resources"].loc[data["resources"]["resource_id"] == "IBL_Bays", "available_capacity"].iloc[0]
    model.Add(sum(assignments[t]["maintenance"] for t in train_ids) <= ibl_bays_capacity)
    
    manpower_capacity = data["resources"].loc[data["resources"]["resource_id"] == "Cleaning_Staff_ManHours", "available_capacity"].iloc[0]
    required_hours = data["job_cards"][data["job_cards"]["status"] == "OPEN"].groupby("trainset_id")["required_man_hours"].sum().to_dict()
    model.Add(sum(assignments[t]["maintenance"] * int(required_hours.get(t, 0)) for t in train_ids) <= manpower_capacity)
    
    critically_failed_trains = [
        train_id for train_id, details in eligibility_details.items() 
        if not details['is_eligible'] and "Critical" in details['reason']
    ]
    urgency_penalty = sum(
        assignments[train_id]["standby"] for train_id in critically_failed_trains
    )

    mileage_deviations = []
    for train_id in train_ids:
        train_mileage = data["trainsets"].loc[data["trainsets"]["trainset_id"] == train_id, "cumulative_mileage_km"].iloc[0]
        dev = int(train_mileage - avg_mileage)
        abs_dev = model.NewIntVar(0, 200000, f'abs_dev_{train_id}')
        model.AddAbsEquality(abs_dev, dev)
        service_mileage_cost = model.NewIntVar(0, 200000, f'serv_mileage_cost_{train_id}')
        model.Add(service_mileage_cost == abs_dev).OnlyEnforceIf(assignments[train_id]["service"])
        model.Add(service_mileage_cost == 0).OnlyEnforceIf(assignments[train_id]["service"].Not())
        mileage_deviations.append(service_mileage_cost)
        
    total_mileage_deviation_cost = sum(mileage_deviations)
    total_branding_penalty = sum((1 - assignments[sla["trainset_id"]]["service"]) * int(sla["penalty_per_hour"]) for _, sla in data["slas"].iterrows() if sla["trainset_id"] in assignments)
    total_shunting_cost = sum(assignments[t]["maintenance"] * shunting_costs["maintenance"] + (assignments[t]["service"] + assignments[t]["standby"]) * shunting_costs["stabling"] for t in train_ids)
    
    model.Minimize(
        w_mileage * total_mileage_deviation_cost + 
        w_branding * total_branding_penalty + 
        w_shunting * total_shunting_cost +
        w_urgency * urgency_penalty
    )
    
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 60.0
    solver.parameters.num_search_workers = 8
    status = solver.solve(model)
    
    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        solution = {}
        for t in train_ids:
            if solver.Value(assignments[t]["service"]) == 1:
                solution[t] = "Revenue Service"
            elif solver.Value(assignments[t]["standby"]) == 1:
                solution[t] = "Standby"
            else:
                solution[t] = "Maintenance"
        return solution, required_hours
    else:
        return None, None

def format_results_for_frontend(primary_solution, eligibility_details, required_hours, data):
    """
    Formats the results for JSON output to the frontend
    """
    if not primary_solution:
        return {"status": "No solution found", "assignments": [], "metrics": {}}
    
    all_trains_details = []
    avg_fleet_mileage = data["trainsets"]["cumulative_mileage_km"].mean()
    today = datetime.date(2025, 9, 18)
    
    for train_id, status in primary_solution.items():
        mileage = data["trainsets"].loc[data["trainsets"]["trainset_id"] == train_id, "cumulative_mileage_km"].iloc[0]
        mileage_vs_avg = ((mileage - avg_fleet_mileage) / avg_fleet_mileage) * 100
        
        pending_work_hrs = required_hours.get(train_id, 0)
        
        future_certs = data['certificates'][(data['certificates']['trainset_id'] == train_id) & (data['certificates']['expiry_date'] >= today)]
        next_cert_expiry = str(future_certs['expiry_date'].min()) if not future_certs.empty else "N/A"

        all_trains_details.append({
            'Train ID': train_id, 
            'Assigned Status': status, 
            # --- FIX: Convert NumPy int64 to standard Python int ---
            'Cumulative Mileage': int(mileage), 
            'Mileage vs Avg (%)': round(mileage_vs_avg, 1),
            # --- FIX: Convert NumPy int64 to standard Python int ---
            'Pending Work Hours': int(pending_work_hrs),
            'Next Cert Expiry': next_cert_expiry,
            'Is Eligible': eligibility_details[train_id]['is_eligible'],
            'Eligibility Reason': eligibility_details[train_id]['reason']
        })

    # Calculate metrics
    revenue_service_count = len([s for s in primary_solution.values() if s == 'Revenue Service'])
    maintenance_count = len([s for s in primary_solution.values() if s == 'Maintenance'])
    standby_count = len([s for s in primary_solution.values() if s == 'Standby'])
    
    metrics = {
        "total_trains": len(primary_solution),
        "revenue_service_trains": revenue_service_count,
        "maintenance_trains": maintenance_count,
        "standby_trains": standby_count,
        "status": "Success"
    }

    return {
        "status": "Success",
        "assignments": all_trains_details,
        "metrics": metrics,
        "metro_lines": list(METRO_LINES.keys())
    }

if __name__ == "__main__":
    # Add an argument check for robustness
    if len(sys.argv) < 4:
        print(json.dumps({"error": "Usage: python solver2.py <db_path> <w_mileage> <w_branding>"}))
        sys.exit(1)
    
    # The script now takes the database path as the first argument
    db_path = sys.argv[1] 
    w_mileage = int(sys.argv[2])
    w_branding = int(sys.argv[3])
    
    # --- FIX: Define the missing variables ---
    # These can be hardcoded as they are not passed from the frontend
    w_shunting = 10
    w_urgency = 1000000
    # -----------------------------------------
    
    try:
        # Call the new function to load data from the database
        data = load_data_from_db(db_path)
        eligibility_details = preprocess_data_with_reasons(data)
        shunting_costs_dict = preprocess_shunting_costs(data["layout_costs"])
        
        # Call the solver with all required weights
        primary_solution, required_hours = solve_primary_assignment(
            data, eligibility_details, shunting_costs_dict, 
            w_mileage, w_branding, w_shunting, w_urgency
        )
        
        # Format and print the results as JSON
        results = format_results_for_frontend(primary_solution, eligibility_details, required_hours, data)
        print(json.dumps(results))
        
    except Exception as e:
        # Print any errors in JSON format for the Node.js app to catch
        print(json.dumps({"error": str(e)}))
        sys.exit(1)