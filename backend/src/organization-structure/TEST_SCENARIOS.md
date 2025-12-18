# Test Scenarios for Organization Structure Module

## Test 1: BR-36 Workflow Enforcement

### Test Case 1.1: Non-SYSTEM_ADMIN Cannot Directly Update Department
**Objective:** Verify that HR_ADMIN and HR_MANAGER cannot directly update departments

**Steps:**
1. Login as HR_ADMIN
2. Attempt to update a department via `PUT /organization-structure/departments/:id`
3. Verify response is `403 Forbidden`
4. Verify error message directs to change request workflow

**Expected Result:**
```json
{
  "statusCode": 403,
  "message": "Direct updates are restricted to SYSTEM_ADMIN only. Please use the change request workflow to request updates."
}
```

### Test Case 1.2: SYSTEM_ADMIN Can Directly Update
**Objective:** Verify SYSTEM_ADMIN can still update directly for emergency cases

**Steps:**
1. Login as SYSTEM_ADMIN
2. Update a department via `PUT /organization-structure/departments/:id`
3. Verify response is `200 OK`
4. Verify department is updated

**Expected Result:** Department successfully updated

### Test Case 1.3: Non-SYSTEM_ADMIN Cannot Directly Update Position
**Objective:** Same as 1.1 but for positions

**Steps:**
1. Login as HR_MANAGER
2. Attempt to update a position via `PUT /organization-structure/positions/:id`
3. Verify `403 Forbidden` response

**Expected Result:** Same as 1.1

---

## Test 2: Notification Triggers

### Test Case 2.1: Department Creation Notification
**Objective:** Verify notification is triggered when department is created

**Steps:**
1. Create a department via `POST /organization-structure/departments`
2. Check console logs for notification event
3. Verify stakeholders are identified
4. Check in-app notifications collection

**Expected Result:**
- Console log: `[OrganizationNotification] DEPARTMENT_CREATED`
- In-app notifications created for department head and employees
- Email sent (if email service configured)

### Test Case 2.2: Position Update Notification
**Objective:** Verify notification on position update

**Steps:**
1. Update a position (as SYSTEM_ADMIN)
2. Check console logs
3. Verify stakeholders notified

**Expected Result:** Notification logged and sent

### Test Case 2.3: Change Request Approval Notification
**Objective:** Verify notification when change request is approved

**Steps:**
1. Submit a change request
2. Approve the change request
3. Verify requester and stakeholders are notified

**Expected Result:** Notifications sent to requester and affected stakeholders

---

## Test 3: Manager View Restrictions (REQ-SANV-02)

### Test Case 3.1: DEPARTMENT_HEAD Sees Only Their Team
**Objective:** Verify managers automatically see only their team subtree

**Steps:**
1. Login as DEPARTMENT_HEAD
2. Call `GET /organization-structure/hierarchy` (without managerId parameter)
3. Verify response contains only manager's team subtree
4. Verify full hierarchy is NOT accessible

**Expected Result:**
- Response contains only positions reporting to manager's position
- No access to other departments' hierarchies

### Test Case 3.2: HR Roles See Full Hierarchy
**Objective:** Verify HR roles can see full hierarchy

**Steps:**
1. Login as HR_ADMIN
2. Call `GET /organization-structure/hierarchy`
3. Verify full organizational hierarchy is returned

**Expected Result:** Complete hierarchy tree returned

### Test Case 3.3: Manager Position Auto-Resolution
**Objective:** Verify manager's position is automatically resolved from profile

**Steps:**
1. Login as DEPARTMENT_HEAD
2. Verify employee profile has `primaryPositionId` set
3. Call hierarchy endpoint
4. Verify correct subtree is returned based on `primaryPositionId`

**Expected Result:** Correct subtree based on manager's position

---

## Test 4: BR-30 Reporting Manager Enforcement

### Test Case 4.1: Position Creation Requires Reporting Manager (Non-SYSTEM_ADMIN)
**Objective:** Verify non-SYSTEM_ADMIN users must provide reporting manager

**Steps:**
1. Login as HR_ADMIN
2. Attempt to create position without `reportsToPositionId`
3. Verify `400 BadRequest` response
4. Verify error message

**Expected Result:**
```json
{
  "statusCode": 400,
  "message": "Reporting manager (reportsToPositionId) is required. Top-level positions can only be created by SYSTEM_ADMIN."
}
```

### Test Case 4.2: SYSTEM_ADMIN Can Create Top-Level Positions
**Objective:** Verify SYSTEM_ADMIN exception for top-level positions

**Steps:**
1. Login as SYSTEM_ADMIN
2. Create position without `reportsToPositionId`
3. Verify position is created successfully

**Expected Result:** Position created with no reporting line

### Test Case 4.3: Position Creation with Reporting Manager
**Objective:** Verify normal position creation with reporting manager

**Steps:**
1. Login as HR_ADMIN
2. Create position with valid `reportsToPositionId`
3. Verify position is created

**Expected Result:** Position created successfully

---

## Test 5: Backend Role Enforcement

### Test Case 5.1: DEPARTMENT_HEAD Sees Only Their Department
**Objective:** Verify department filtering for DEPARTMENT_HEAD

**Steps:**
1. Login as DEPARTMENT_HEAD
2. Call `GET /organization-structure/departments`
3. Verify only manager's department is returned

**Expected Result:** Single department matching manager's `primaryDepartmentId`

### Test Case 5.2: DEPARTMENT_HEAD Cannot Access Other Departments
**Objective:** Verify access control for department details

**Steps:**
1. Login as DEPARTMENT_HEAD
2. Attempt to access another department via `GET /organization-structure/departments/:id`
3. Verify `403 Forbidden` if department doesn't match

**Expected Result:** Access denied for other departments

### Test Case 5.3: Positions Filtered by Department
**Objective:** Verify positions are filtered by department for DEPARTMENT_HEAD

**Steps:**
1. Login as DEPARTMENT_HEAD
2. Call `GET /organization-structure/positions`
3. Verify only positions in manager's department are returned

**Expected Result:** Filtered positions list

---

## Integration Test Script

```typescript
// Example integration test
describe('Organization Structure Module', () => {
  it('should enforce BR-36 workflow', async () => {
    // Test BR-36
  });

  it('should send notifications', async () => {
    // Test notifications
  });

  it('should restrict manager views', async () => {
    // Test REQ-SANV-02
  });

  it('should enforce reporting manager requirement', async () => {
    // Test BR-30
  });
});
```

---

## Manual Testing Checklist

- [ ] BR-36: Non-SYSTEM_ADMIN cannot directly update
- [ ] BR-36: SYSTEM_ADMIN can directly update
- [ ] Notifications: Console logs show notification events
- [ ] Notifications: In-app notifications created
- [ ] Notifications: Emails sent (if configured)
- [ ] REQ-SANV-02: Managers see only their team
- [ ] REQ-SANV-02: HR roles see full hierarchy
- [ ] BR-30: Position creation requires reporting manager
- [ ] BR-30: SYSTEM_ADMIN can create top-level positions
- [ ] Role enforcement: DEPARTMENT_HEAD filtered correctly
