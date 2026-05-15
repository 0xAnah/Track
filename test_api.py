#!/usr/bin/env python3
"""
Comprehensive API validation script for Track / VerifyForce
Tests all implemented endpoints and features
"""

import json
import requests
import sys
from datetime import date, timedelta
from decimal import Decimal

BASE_URL = "http://localhost:8000/api/v1"
HR_USER = {"username": "hr1", "password": "testpass123", "email": "hr1@test.com"}
WORKER_USER = {"username": "worker1", "password": "testpass123", "email": "worker1@test.com"}

class APITester:
    def __init__(self):
        self.hr_token = None
        self.worker_token = None
        self.hr_id = None
        self.worker_id = None
        self.passed = 0
        self.failed = 0
        
    def log(self, msg):
        print(msg)
        
    def test_result(self, name, success, msg=""):
        if success:
            self.passed += 1
            self.log(f"✓ {name}")
        else:
            self.failed += 1
            self.log(f"✗ {name}: {msg}")
            
    def make_request(self, method, endpoint, data=None, token=None):
        url = f"{BASE_URL}{endpoint}"
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        try:
            if method == "GET":
                resp = requests.get(url, headers=headers, timeout=10)
            elif method == "POST":
                resp = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == "PATCH":
                resp = requests.patch(url, json=data, headers=headers, timeout=10)
            else:
                return None, "Unknown method"
            return resp, None
        except Exception as e:
            return None, str(e)
    
    def test_auth_signup_and_login(self):
        print("\n=== TESTING AUTH & USERS ===")
        
        # Test HR signup
        resp, err = self.make_request("POST", "/auth/signup/hr/", {
            "username": HR_USER["username"],
            "email": HR_USER["email"],
            "password": HR_USER["password"],
            "first_name": "HR",
            "last_name": "User",
            "department": "Human Resources",
            "employee_id": "HR001",
            "company_name": "Test Company"
        })
        self.test_result("HR Signup", resp and resp.status_code == 201, 
                        f"Status: {resp.status_code if resp else 'No response'}")
        
        hr_signup_key = None
        if resp and resp.status_code == 201:
            hr_signup_key = resp.json().get("user", {}).get("worker_signup_key")
            self.log(f"  HR signup key: {hr_signup_key}")
        
        # Test Worker signup
        if hr_signup_key:
            resp, err = self.make_request("POST", "/auth/signup/worker/", {
                "username": WORKER_USER["username"],
                "email": WORKER_USER["email"],
                "password": WORKER_USER["password"],
                "first_name": "Worker",
                "last_name": "One",
                "department": "Operations",
                "employee_id": "WRK001",
                "hr_signup_key": hr_signup_key
            })
            self.test_result("Worker Signup", resp and resp.status_code == 201,
                            f"Status: {resp.status_code if resp else 'No response'}")
        else:
            self.test_result("Worker Signup", False, "No HR signup key available")
        
        # Test HR login
        resp, err = self.make_request("POST", "/auth/login/", {
            "username": HR_USER["username"],
            "password": HR_USER["password"]
        })
        self.test_result("HR Login", resp and resp.status_code == 200,
                        f"Status: {resp.status_code if resp else 'No response'}")
        if resp and resp.status_code == 200:
            data = resp.json()
            self.hr_token = data.get("access")
            self.test_result("HR Token received", bool(self.hr_token))
            self.hr_id = data.get("user", {}).get("id")
        
        # Test Worker login
        resp, err = self.make_request("POST", "/auth/login/", {
            "username": WORKER_USER["username"],
            "password": WORKER_USER["password"]
        })
        self.test_result("Worker Login", resp and resp.status_code == 200,
                        f"Status: {resp.status_code if resp else 'No response'}")
        if resp and resp.status_code == 200:
            data = resp.json()
            self.worker_token = data.get("access")
            self.test_result("Worker Token received", bool(self.worker_token))
            self.worker_id = data.get("user", {}).get("id")
        
        # Test get current user
        resp, err = self.make_request("GET", "/users/me/", token=self.hr_token)
        self.test_result("Get current HR user", resp and resp.status_code == 200,
                        f"Status: {resp.status_code if resp else 'No response'}")
        
    def test_hr_worker_assignment(self):
        print("\n=== TESTING HR-WORKER ASSIGNMENT ===")
        
        if not (self.hr_token and self.worker_id):
            self.log("⚠ Skipping: HR token or worker ID not available")
            return
            
        # Assign worker to HR
        resp, err = self.make_request("POST", "/users/workers/assign/", {
            "worker_id": self.worker_id
        }, token=self.hr_token)
        self.test_result("HR assigns worker", resp and resp.status_code in [200, 201],
                        f"Status: {resp.status_code if resp else 'No response'}")
        
        # Get list of assigned workers
        resp, err = self.make_request("GET", "/users/workers/", token=self.hr_token)
        self.test_result("HR gets worker list", resp and resp.status_code == 200,
                        f"Status: {resp.status_code if resp else 'No response'}")
        if resp and resp.status_code == 200:
            data = resp.json()
            workers = data.get("results", data) if isinstance(data, dict) else data
            found = any(w.get("id") == self.worker_id for w in workers)
            self.test_result("Worker in HR list", found)
        
        # Get worker details
        resp, err = self.make_request("GET", f"/users/workers/{self.worker_id}/", token=self.hr_token)
        self.test_result("HR gets worker detail", resp and resp.status_code == 200,
                        f"Status: {resp.status_code if resp else 'No response'}")
    
    def test_attendance(self):
        print("\n=== TESTING ATTENDANCE ===")
        
        if not self.worker_token:
            self.log("⚠ Skipping: Worker token not available")
            return
        
        # Sign in
        resp, err = self.make_request("POST", "/attendance/sign-in/", {}, token=self.worker_token)
        self.test_result("Worker sign-in", resp and resp.status_code == 200,
                        f"Status: {resp.status_code if resp else 'No response'}")
        
        # Get today's attendance
        resp, err = self.make_request("GET", "/attendance/today/", token=self.worker_token)
        self.test_result("Get today's attendance", resp and resp.status_code == 200,
                        f"Status: {resp.status_code if resp else 'No response'}")
        
        # Sign out
        resp, err = self.make_request("POST", "/attendance/sign-out/", {}, token=self.worker_token)
        self.test_result("Worker sign-out", resp and resp.status_code == 200,
                        f"Status: {resp.status_code if resp else 'No response'}")
    
    def test_leave(self):
        print("\n=== TESTING LEAVE REQUESTS ===")
        
        if not (self.worker_token and self.hr_token):
            self.log("⚠ Skipping: Tokens not available")
            return
        
        # Request leave
        tomorrow = date.today() + timedelta(days=1)
        resp, err = self.make_request("POST", "/leave/request/", {
            "start_date": str(tomorrow),
            "end_date": str(tomorrow),
            "reason": "Personal leave"
        }, token=self.worker_token)
        self.test_result("Worker requests leave", resp and resp.status_code == 201,
                        f"Status: {resp.status_code if resp else 'No response'}")
        leave_id = None
        if resp and resp.status_code == 201:
            leave_id = resp.json().get("id")
        
        # Get worker's leave requests
        resp, err = self.make_request("GET", "/leave/my-requests/", token=self.worker_token)
        self.test_result("Worker gets leave requests", resp and resp.status_code == 200,
                        f"Status: {resp.status_code if resp else 'No response'}")
        
        # Get pending leave requests (HR)
        resp, err = self.make_request("GET", "/leave/pending/", token=self.hr_token)
        self.test_result("HR gets pending leave", resp and resp.status_code == 200,
                        f"Status: {resp.status_code if resp else 'No response'}")
        
        # Approve leave
        if leave_id:
            resp, err = self.make_request("PATCH", f"/leave/{leave_id}/approve/", {}, token=self.hr_token)
            self.test_result("HR approves leave", resp and resp.status_code == 200,
                            f"Status: {resp.status_code if resp else 'No response'}")
    
    def test_daily_logs(self):
        print("\n=== TESTING DAILY LOGS ===")
        
        if not (self.worker_token and self.hr_token):
            self.log("⚠ Skipping: Tokens not available")
            return
        
        # Submit daily log
        resp, err = self.make_request("POST", "/logs/submit/", {
            "date": str(date.today()),
            "tasks": [
                {
                    "title": "Email responses",
                    "description": "Responded to client inquiries",
                    "initiated_by": "Manager John",
                    "handed_to": "Team Lead Sarah",
                    "start_time": "08:00",
                    "end_time": "09:30"
                }
            ]
        }, token=self.worker_token)
        self.test_result("Worker submits daily log", resp and resp.status_code == 201,
                        f"Status: {resp.status_code if resp else 'No response'}")
        
        # Get today's log
        resp, err = self.make_request("GET", "/logs/today/", token=self.worker_token)
        self.test_result("Worker gets today's log", resp and resp.status_code == 200,
                        f"Status: {resp.status_code if resp else 'No response'}")
        
        # Get log history
        resp, err = self.make_request("GET", "/logs/my-history/", token=self.worker_token)
        self.test_result("Worker gets log history", resp and resp.status_code == 200,
                        f"Status: {resp.status_code if resp else 'No response'}")
    
    def test_scoring(self):
        print("\n=== TESTING SCORING ===")
        
        if not (self.worker_token and self.hr_token):
            self.log("⚠ Skipping: Tokens not available")
            return
        
        # Get worker's score
        resp, err = self.make_request("GET", "/scores/mine/", token=self.worker_token)
        self.test_result("Worker gets own score", resp and resp.status_code == 200,
                        f"Status: {resp.status_code if resp else 'No response'}")
        
        # Get team scores (HR)
        resp, err = self.make_request("GET", "/scores/team/", token=self.hr_token)
        self.test_result("HR gets team scores", resp and resp.status_code == 200,
                        f"Status: {resp.status_code if resp else 'No response'}")
        
        # Get worker deductions
        resp, err = self.make_request("GET", f"/scores/deductions/{self.worker_id}/", token=self.hr_token)
        self.test_result("HR gets worker deductions", resp and resp.status_code == 200,
                        f"Status: {resp.status_code if resp else 'No response'}")
    
    def test_payments(self):
        print("\n=== TESTING PAYMENTS ===")
        
        if not self.worker_token:
            self.log("⚠ Skipping: Worker token not available")
            return
        
        # Get bank list
        resp, err = self.make_request("GET", "/payments/banks/", token=self.worker_token)
        self.test_result("Get bank list", resp and resp.status_code == 200,
                        f"Status: {resp.status_code if resp else 'No response'}")
        
        # Register bank account (will fail due to Squad API key, but should return 502 not 500)
        resp, err = self.make_request("POST", "/payments/bank-account/register/", {
            "account_number": "1234567890",
            "bank_code": "011",
            "monthly_salary": "100000.00"
        }, token=self.worker_token)
        # Expect 502 (Bad Gateway) due to invalid Squad credentials or 200 if mocked
        is_acceptable = resp is not None and resp.status_code in [200, 502, 400]
        self.test_result("Register bank account request handled", is_acceptable,
                        f"Status: {resp.status_code if resp is not None else 'No response'}")
        
        # Request Salary Advance
        resp, err = self.make_request("POST", "/payments/advance/request/", {
            "requested_amount": "5000.00",
            "reason": "Medical emergency"
        }, token=self.worker_token)
        self.test_result("Worker requests salary advance", resp and resp.status_code == 201,
                        f"Status: {resp.status_code if resp else 'No response'}")

        # Get payment status
        resp, err = self.make_request("GET", "/payments/mine/", token=self.worker_token)
        self.test_result("Worker gets payment status", resp and resp.status_code == 200,
                        f"Status: {resp.status_code if resp else 'No response'}")
        
        # Get advance history
        resp, err = self.make_request("GET", "/payments/advance/history/", token=self.worker_token)
        self.test_result("Worker gets advance history", resp and resp.status_code == 200,
                        f"Status: {resp.status_code if resp else 'No response'}")
    
    def test_reports(self):
        print("\n=== TESTING REPORTS ===")
        
        if not self.hr_token:
            self.log("⚠ Skipping: HR token not available")
            return
        
        # Generate monthly report
        resp, err = self.make_request("POST", "/reports/generate/", {
            "month": date.today().month,
            "year": date.today().year
        }, token=self.hr_token)
        self.test_result("HR generates monthly report", resp and resp.status_code == 202,
                        f"Status: {resp.status_code if resp else 'No response'}")
        
        # Get monthly report
        resp, err = self.make_request("GET", "/reports/monthly/", token=self.hr_token)
        self.test_result("HR gets monthly report", resp is not None and resp.status_code in [200, 404],
                        f"Status: {resp.status_code if resp is not None else 'No response'}")
    
    def run_all_tests(self):
        print("=" * 60)
        print("TRACK / VERIFYFORCE - COMPREHENSIVE API TEST SUITE")
        print("=" * 60)
        
        self.test_auth_signup_and_login()
        self.test_hr_worker_assignment()
        self.test_attendance()
        self.test_leave()
        self.test_daily_logs()
        self.test_scoring()
        self.test_payments()
        self.test_reports()
        
        print("\n" + "=" * 60)
        print(f"RESULTS: {self.passed} passed, {self.failed} failed")
        print("=" * 60)
        
        return self.failed == 0

if __name__ == "__main__":
    tester = APITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)
