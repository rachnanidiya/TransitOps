from flask import Blueprint, request, jsonify, g
from server.middleware.rbac import roles_required
from server.middleware.auth import token_required
from models import Trip, Vehicle, Driver, FuelLog, Expense, MaintenanceLog, db
from sqlalchemy import func, and_, or_
from datetime import datetime, date
import csv
import io
from flask import make_response

# Create blueprint
reports_bp = Blueprint('reports', __name__)


@reports_bp.route('/dashboard', methods=['GET'])
@token_required
def get_dashboard_stats():
    """Get dashboard KPIs."""
    try:
        # Active vehicles (Available or On Trip)
        active_vehicles = Vehicle.query.filter(
            Vehicle.status.in_(['Available', 'On Trip'])
        ).count()

        # Available vehicles
        available_vehicles = Vehicle.query.filter_by(status='Available').count()

        # Vehicles in maintenance
        maintenance_vehicles = Vehicle.query.filter_by(status='In Shop').count()

        # Active trips (Dispatched)
        active_trips = Trip.query.filter_by(status='Dispatched').count()

        # Pending trips (Draft)
        pending_trips = Trip.query.filter_by(status='Draft').count()

        # Drivers on duty
        drivers_on_duty = Driver.query.filter_by(status='Available').count()

        # Fleet utilization percentage
        total_vehicles = Vehicle.query.count()
        if total_vehicles > 0:
            utilization_rate = (active_vehicles / total_vehicles) * 100
        else:
            utilization_rate = 0

        # Calculate total revenue from completed trips
        total_revenue = db.session.query(func.sum(Trip.revenue)).filter(
            Trip.status == 'Completed'
        ).scalar() or 0

        # Calculate total fuel cost
        total_fuel_cost = db.session.query(func.sum(FuelLog.cost)).scalar() or 0

        # Calculate total maintenance cost
        total_maintenance_cost = db.session.query(func.sum(MaintenanceLog.cost)).filter(
            MaintenanceLog.status == 'Completed'
        ).scalar() or 0

        # Calculate total expenses
        total_expenses = db.session.query(func.sum(Expense.amount)).scalar() or 0

        return jsonify({
            'kpis': {
                'active_vehicles': active_vehicles,
                'available_vehicles': available_vehicles,
                'maintenance_vehicles': maintenance_vehicles,
                'active_trips': active_trips,
                'pending_trips': pending_trips,
                'drivers_on_duty': drivers_on_duty,
                'fleet_utilization_percentage': round(utilization_rate, 2),
                'total_revenue': float(total_revenue),
                'total_fuel_cost': float(total_fuel_cost),
                'total_maintenance_cost': float(total_maintenance_cost),
                'total_expenses': float(total_expenses),
                'net_profit': float(total_revenue - total_expenses)
            }
        }), 200

    except Exception as e:
        return jsonify({'message': 'Failed to generate dashboard stats', 'error': str(e)}), 500


@reports_bp.route('/fuel-efficiency', methods=['GET'])
@token_required
def get_fuel_efficiency():
    """Get fuel efficiency report (distance/fuel ratio) per vehicle."""
    try:
        # Query to get fuel efficiency for each vehicle
        results = db.session.query(
            Vehicle.id,
            Vehicle.registration_number,
            Vehicle.name_model,
            func.sum(Trip.actual_distance).label('total_distance'),
            func.sum(FuelLog.liters).label('total_fuel')
        ).select_from(Vehicle)\
         .outerjoin(Trip, and_(
             Vehicle.id == Trip.vehicle_id,
             Trip.status == 'Completed',
             Trip.actual_distance.isnot(None)
         ))\
         .outerjoin(FuelLog, Vehicle.id == FuelLog.vehicle_id)\
         .group_by(Vehicle.id, Vehicle.registration_number, Vehicle.name_model)\
         .having(func.sum(FuelLog.liters) > 0)\
         .all()

        efficiency_data = []
        for row in results:
            vehicle_id, reg_number, model_name, total_distance, total_fuel = row
            total_distance = float(total_distance or 0)
            total_fuel = float(total_fuel or 0)

            # Calculate fuel efficiency (distance per liter)
            if total_fuel > 0:
                efficiency = total_distance / total_fuel  # km/l or miles/l
            else:
                efficiency = 0

            efficiency_data.append({
                'vehicle_id': vehicle_id,
                'registration_number': reg_number,
                'model_name': model_name,
                'total_distance': total_distance,
                'total_fuel_liters': total_fuel,
                'fuel_efficiency': round(efficiency, 2)
            })

        return jsonify({
            'fuel_efficiency': efficiency_data
        }), 200

    except Exception as e:
        return jsonify({'message': 'Failed to generate fuel efficiency report', 'error': str(e)}), 500


@reports_bp.route('/fleet-utilization', methods=['GET'])
@token_required
def get_fleet_utilization():
    """Get fleet utilization report."""
    try:
        # Get all vehicles with their status and trip counts
        vehicles = Vehicle.query.all()

        utilization_data = []
        for vehicle in vehicles:
            # Count trips by status
            total_trips = Trip.query.filter_by(vehicle_id=vehicle.id).count()
            completed_trips = Trip.query.filter_by(
                vehicle_id=vehicle.id,
                status='Completed'
            ).count()
            dispatched_trips = Trip.query.filter_by(
                vehicle_id=vehicle.id,
                status='Dispatched'
            ).count()

            # Calculate utilization percentage based on days in service
            # For simplicity, we'll use the ratio of completed trips to total possible
            # In a real system, you might track actual days in service
            utilization_percent = 0
            if total_trips > 0:
                utilization_percent = (completed_trips / total_trips) * 100

            utilization_data.append({
                'vehicle_id': vehicle.id,
                'registration_number': vehicle.registration_number,
                'model_name': vehicle.name_model,
                'vehicle_type': vehicle.type,
                'current_status': vehicle.status,
                'total_trips': total_trips,
                'completed_trips': completed_trips,
                'active_trips': dispatched_trips,
                'utilization_percentage': round(utilization_percent, 2)
            })

        # Overall fleet utilization
        total_vehicles = len(utilization_data)
        active_vehicles = len([v for v in utilization_data if v['current_status'] in ['Available', 'On Trip']])
        fleet_utilization = (active_vehicles / total_vehicles * 100) if total_vehicles > 0 else 0

        return jsonify({
            'fleet_utilization': utilization_data,
            'summary': {
                'total_vehicles': total_vehicles,
                'active_vehicles': active_vehicles,
                'fleet_utilization_percentage': round(fleet_utilization, 2)
            }
        }), 200

    except Exception as e:
        return jsonify({'message': 'Failed to generate fleet utilization report', 'error': str(e)}), 500


@reports_bp.route('/operational-cost', methods=['GET'])
@token_required
def get_operational_cost():
    """Get operational cost per vehicle."""
    try:
        # Get all vehicles
        vehicles = Vehicle.query.all()

        cost_data = []
        for vehicle in vehicles:
            # Calculate fuel costs
            fuel_cost = db.session.query(func.sum(FuelLog.cost)).filter(
                FuelLog.vehicle_id == vehicle.id
            ).scalar() or 0

            # Calculate maintenance costs
            maintenance_cost = db.session.query(func.sum(MaintenanceLog.cost)).filter(
                and_(
                    MaintenanceLog.vehicle_id == vehicle.id,
                    MaintenanceLog.status == 'Completed'
                )
            ).scalar() or 0

            # Calculate other expenses
            other_expenses = db.session.query(func.sum(Expense.amount)).filter(
                and_(
                    Expense.vehicle_id == vehicle.id,
                    Expense.category != 'Fuel'
                )
            ).scalar() or 0

            total_cost = float(fuel_cost + maintenance_cost + other_expenses)

            cost_data.append({
                'vehicle_id': vehicle.id,
                'registration_number': vehicle.registration_number,
                'model_name': vehicle.name_model,
                'vehicle_type': vehicle.type,
                'fuel_cost': float(fuel_cost),
                'maintenance_cost': float(maintenance_cost),
                'other_expenses': float(other_expenses),
                'total_operational_cost': total_cost
            })

        return jsonify({
            'operational_costs': cost_data
        }), 200

    except Exception as e:
        return jsonify({'message': 'Failed to generate operational cost report', 'error': str(e)}), 500


@reports_bp.route('/vehicle-roi', methods=['GET'])
@token_required
def get_vehicle_roi():
    """Calculate ROI for each vehicle."""
    try:
        # Get all vehicles
        vehicles = Vehicle.query.all()

        roi_data = []
        for vehicle in vehicles:
            # Calculate total revenue from trips
            total_revenue = db.session.query(func.sum(Trip.revenue)).filter(
                Trip.vehicle_id == vehicle.id
            ).scalar() or 0

            # Calculate total costs
            fuel_cost = db.session.query(func.sum(FuelLog.cost)).filter(
                FuelLog.vehicle_id == vehicle.id
            ).scalar() or 0

            maintenance_cost = db.session.query(func.sum(MaintenanceLog.cost)).filter(
                and_(
                    MaintenanceLog.vehicle_id == vehicle.id,
                    MaintenanceLog.status == 'Completed'
                )
            ).scalar() or 0

            other_expenses = db.session.query(func.sum(Expense.amount)).filter(
                and_(
                    Expense.vehicle_id == vehicle.id,
                    Expense.category != 'Fuel'
                )
            ).scalar() or 0

            total_cost = float(fuel_cost + maintenance_cost + other_expenses)
            total_revenue = float(total_revenue)

            # Calculate ROI: (Revenue - Cost) / Cost * 100
            if total_cost > 0:
                roi = ((total_revenue - total_cost) / total_cost) * 100
            else:
                roi = 0 if total_revenue == 0 else float('inf')

            roi_data.append({
                'vehicle_id': vehicle.id,
                'registration_number': vehicle.registration_number,
                'model_name': vehicle.name_model,
                'vehicle_type': vehicle.type,
                'acquisition_cost': vehicle.acquisition_cost,
                'total_revenue': total_revenue,
                'total_cost': total_cost,
                'net_profit': total_revenue - total_cost,
                'roi_percentage': round(roi, 2) if roi != float('inf') else None
            })

        return jsonify({
            'vehicle_roi': roi_data
        }), 200

    except Exception as e:
        return jsonify({'message': 'Failed to generate ROI report', 'error': str(e)}), 500


@reports_bp.route('/export/csv', methods=['GET'])
@token_required
def export_csv():
    """Export data as CSV."""
    export_type = request.args.get('type', 'vehicles')  # vehicles, drivers, trips, expenses, maintenance

    try:
        # Create a file-like buffer to receive CSV data
        si = io.StringIO()
        cw = csv.writer(si)

        if export_type == 'vehicles':
            # Export vehicles
            cw.writerow(['ID', 'Registration Number', 'Model Name', 'Type', 'Max Load Capacity (kg)',
                        'Odometer', 'Acquisition Cost', 'Status', 'Created At'])

            vehicles = Vehicle.query.all()
            for v in vehicles:
                cw.writerow([
                    v.id, v.registration_number, v.name_model, v.type,
                    v.max_load_capacity, v.odometer, v.acquisition_cost,
                    v.status, v.created_at.isoformat() if v.created_at else ''
                ])

        elif export_type == 'drivers':
            # Export drivers
            cw.writerow(['ID', 'Name', 'License Number', 'License Category',
                        'License Expiry Date', 'Contact Number', 'Safety Score', 'Status', 'Created At'])

            drivers = Driver.query.all()
            for d in drivers:
                cw.writerow([
                    d.id, d.name, d.license_number, d.license_category,
                    d.license_expiry_date.isoformat() if d.license_expiry_date else '',
                    d.contact_number, d.safety_score, d.status,
                    d.created_at.isoformat() if d.created_at else ''
                ])

        elif export_type == 'trips':
            # Export trips
            cw.writerow(['ID', 'Source', 'Destination', 'Vehicle ID', 'Driver ID',
                        'Cargo Weight (kg)', 'Planned Distance (km)', 'Actual Distance (km)',
                        'Fuel Consumed (L)', 'Revenue', 'Status',
                        'Dispatched At', 'Completed At', 'Created At'])

            trips = Trip.query.all()
            for t in trips:
                cw.writerow([
                    t.id, t.source, t.destination, t.vehicle_id, t.driver_id,
                    t.cargo_weight, t.planned_distance, t.actual_distance,
                    t.fuel_consumed, t.revenue, t.status,
                    t.dispatched_at.isoformat() if t.dispatched_at else '',
                    t.completed_at.isoformat() if t.completed_at else '',
                    t.created_at.isoformat() if t.created_at else ''
                ])

        elif export_type == 'expenses':
            # Export expenses
            cw.writerow(['ID', 'Vehicle ID', 'Trip ID', 'Category', 'Description',
                        'Amount', 'Date', 'Created At'])

            expenses = Expense.query.all()
            for e in expenses:
                cw.writerow([
                    e.id, e.vehicle_id, e.trip_id, e.category, e.description,
                    e.amount, e.date.isoformat() if e.date else '',
                    e.created_at.isoformat() if e.created_at else ''
                ])

        elif export_type == 'maintenance':
            # Export maintenance logs
            cw.writerow(['ID', 'Vehicle ID', 'Type', 'Description', 'Cost',
                        'Status', 'Scheduled Date', 'Completed Date', 'Created At'])

            maintenance_logs = MaintenanceLog.query.all()
            for m in maintenance_logs:
                cw.writerow([
                    m.id, m.vehicle_id, m.type, m.description, m.cost,
                    m.status, m.scheduled_date.isoformat() if m.scheduled_date else '',
                    m.completed_date.isoformat() if m.completed_date else '',
                    m.created_at.isoformat() if m.created_at else ''
                ])

        else:
            return jsonify({'message': f'Invalid export type: {export_type}'}), 400

        # Prepare response
        output = si.getvalue()
        si.close()

        # Create response with CSV file
        response = make_response(output)
        response.headers["Content-Disposition"] = f"attachment; filename={export_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        response.headers["Content-type"] = "text/csv"

        return response

    except Exception as e:
        return jsonify({'message': 'Failed to export CSV', 'error': str(e)}), 500