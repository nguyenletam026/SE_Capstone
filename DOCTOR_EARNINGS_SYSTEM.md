# Doctor Earnings and Withdrawal System Documentation

## Overview
The doctor earnings and withdrawal system has been successfully implemented for the healthcare application. This system automatically tracks doctor earnings from chat consultations and provides a comprehensive withdrawal management system with admin approval workflow.

## System Architecture

### Core Components

#### 1. **Entities**
- **`DoctorEarning`**: Tracks individual earnings from chat payments
  - Fields: `totalAmount`, `doctorEarning`, `platformFee`, `commissionPercentage`, `status`, `createdAt`, `confirmedAt`, `withdrawnAt`
  - Relationships: Many-to-One with `User` (doctor), One-to-One with `ChatPayment`
  - Status: `PENDING`, `CONFIRMED`, `WITHDRAWN`

- **`WithdrawalRequest`**: Manages doctor withdrawal requests
  - Fields: `amount`, `bankAccount`, `bankName`, `accountHolderName`, `status`, `requestedAt`, `processedAt`, `rejectionReason`, `transferProofUrl`
  - Status: `PENDING`, `APPROVED`, `REJECTED`, `COMPLETED`

#### 2. **Services**
- **`DoctorEarningService`**: Core earnings management
  - Automatic earnings creation from chat payments (70% commission rate)
  - Earnings confirmation and balance updates
  - Statistics and reporting methods
  - Integration with chat payment flow

- **`WithdrawalRequestService`**: Withdrawal management
  - CRUD operations for withdrawal requests
  - Admin approval/rejection workflow
  - Transfer proof upload handling
  - Status tracking and validation

- **`FileUploadService`**: File management for transfer proofs
  - Cloudinary integration for secure file storage
  - File validation and URL generation

#### 3. **Controllers**
- **`DoctorEarningController`**: REST API for earnings management
  - Doctor endpoints: earnings history, statistics, monthly summaries
  - Admin endpoints: all earnings, platform fees, confirmation

- **`WithdrawalRequestController`**: REST API for withdrawal management
  - Doctor endpoints: create, view, and track withdrawal requests
  - Admin endpoints: approve, reject, complete withdrawals

#### 4. **Repositories**
- **`DoctorEarningRepository`**: Custom queries for earnings statistics
- **`WithdrawalRequestRepository`**: Withdrawal data access with filtering

## Key Features

### 1. **Automatic Earnings Creation**
- Earnings are automatically created when chat payments are processed
- 70% commission rate for doctors, 30% platform fee
- Proper data type conversions (double to BigDecimal)
- Error handling to prevent payment failures

### 2. **Earnings Management**
- **Pending Status**: Initial state when earning is created
- **Confirmed Status**: Admin can confirm earnings, adding to doctor balance
- **Withdrawn Status**: Marked when included in withdrawal requests

### 3. **Withdrawal Workflow**
- Doctors can request withdrawals from their confirmed balance
- Admin approval required for all withdrawal requests
- Bank account information validation
- Transfer proof upload for completion
- Comprehensive status tracking

### 4. **Admin Capabilities**
- View all earnings and withdrawal requests
- Approve/reject withdrawal requests with reasons
- Upload transfer proof documents
- Platform fee statistics and reporting
- Monthly earnings summaries

### 5. **Security & Validation**
- Role-based access control (DOCTOR, ADMIN)
- Input validation for all requests
- Secure file upload with Cloudinary
- Transaction management for data consistency

## API Endpoints

### Doctor Earnings
```
GET /api/doctor-earnings - Get doctor's earnings history
GET /api/doctor-earnings/confirmed - Get confirmed earnings
GET /api/doctor-earnings/stats - Get earnings statistics
GET /api/doctor-earnings/monthly-summary - Get monthly summary
GET /api/doctor-earnings/date-range - Get earnings by date range

Admin:
GET /api/doctor-earnings/admin/all - Get all earnings
GET /api/doctor-earnings/admin/status/{status} - Get by status
GET /api/doctor-earnings/admin/platform-fees - Get platform fees
POST /api/doctor-earnings/admin/confirm/{id} - Confirm earning
```

### Withdrawal Requests
```
POST /api/withdrawal-requests - Create withdrawal request
GET /api/withdrawal-requests - Get doctor's requests
GET /api/withdrawal-requests/{id} - Get specific request

Admin:
GET /api/withdrawal-requests/admin - Get all requests
GET /api/withdrawal-requests/admin/status/{status} - Get by status
PUT /api/withdrawal-requests/admin/{id}/approve - Approve request
PUT /api/withdrawal-requests/admin/{id}/reject - Reject request
PUT /api/withdrawal-requests/admin/{id}/complete - Complete request
```

## Database Changes

### New Fields Added
- **`DoctorEarning`**: Added `confirmedAt` and `withdrawnAt` timestamp fields
- **Repository Methods**: Added custom queries for statistics and filtering

## Integration Points

### 1. **ChatPaymentService Integration**
- `DoctorEarningService` is injected into `ChatPaymentService`
- Earnings are created automatically after successful payment processing
- Error handling prevents payment failures due to earnings creation issues

### 2. **User Balance Management**
- User entity's `doctorBalance` field is updated when earnings are confirmed
- Proper data type conversion between Double (User) and BigDecimal (DoctorEarning)

### 3. **File Management**
- Cloudinary integration for transfer proof uploads
- Secure URL generation and file validation

## Testing

### Integration Test Coverage
- Automatic earnings creation from payments
- Earnings confirmation and balance updates
- Doctor earnings retrieval and statistics
- Commission calculation accuracy
- Data type conversion validation

## Configuration

### Commission Rate
- Default commission rate: 70% for doctors, 30% platform fee
- Configurable via `DoctorEarningService.DEFAULT_COMMISSION_RATE`

### File Upload
- Cloudinary configuration required for transfer proof uploads
- Environment variables needed for cloud storage credentials

## Future Enhancements

1. **Email Notifications**: Notify doctors of earning confirmations and withdrawal status changes
2. **Configurable Commission Rates**: Admin interface to adjust commission rates per doctor
3. **Advanced Reporting**: Detailed analytics dashboard for earnings trends
4. **Automated Transfers**: Integration with banking APIs for automatic transfers
5. **Tax Reporting**: Generate tax documents for doctor earnings

## Deployment Considerations

1. **Database Migration**: Ensure new fields are added to existing tables
2. **Environment Variables**: Configure Cloudinary credentials
3. **Testing**: Run integration tests to verify earnings flow
4. **Monitoring**: Set up logging for earnings creation and withdrawal processing

## Summary

The doctor earnings and withdrawal system is now fully integrated and operational. The system provides:

- ✅ Automatic earnings tracking from chat payments
- ✅ Comprehensive withdrawal management with admin approval
- ✅ Secure file upload for transfer proofs
- ✅ Complete REST API with proper security
- ✅ Integration tests for reliability
- ✅ Proper error handling and logging

The system is ready for production deployment and can handle the complete lifecycle of doctor earnings from consultation payments to final withdrawal processing.
