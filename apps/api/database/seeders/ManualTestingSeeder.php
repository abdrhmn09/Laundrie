<?php

namespace Database\Seeders;

use App\Domain\Auth\Enums\UserRole;
use App\Domain\Auth\Enums\UserStatus;
use App\Models\Address;
use App\Models\AdminUser;
use App\Models\AuditLog;
use App\Models\Complaint;
use App\Models\Courier;
use App\Models\CourierJob;
use App\Models\Customer;
use App\Models\DisputeEvidence;
use App\Models\Invoice;
use App\Models\Laundry;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Payment;
use App\Models\PlatformConfig;
use App\Models\Refund;
use App\Models\Review;
use App\Models\Service;
use App\Models\ServicePrice;
use App\Models\Settlement;
use App\Models\Staff;
use App\Models\StaffOpening;
use App\Models\User;
use App\Models\WeightEvidence;
use App\Models\WeightMeasurement;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ManualTestingSeeder extends Seeder
{
    public function run(): void
    {
        $defaultPassword = Hash::make('password123');

        // 1. Core Users (One Account, Multiple Capabilities — PRD §5)
        $usersData = [
            [
                'name' => 'Abdurrahman Marzuki (Super Admin)',
                'email' => 'abdurrahman.marzuki09@gmail.com',
                'phone' => '081269000001',
                'password' => $defaultPassword,
                'role' => UserRole::SuperAdmin->value,
                'status' => UserStatus::Active->value,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Abdurrahman Marzuki (Admin Ops)',
                'email' => 'abdurrahmanmarzuki24@gmail.com',
                'phone' => '081269000002',
                'password' => $defaultPassword,
                'role' => UserRole::OperationsAdmin->value,
                'status' => UserStatus::Active->value,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Abdurrahman Marzuki (Admin Finance)',
                'email' => 'abdur.rhmn.mrzk@gmail.com',
                'phone' => '081269000003',
                'password' => $defaultPassword,
                'role' => UserRole::FinanceAdmin->value,
                'status' => UserStatus::Active->value,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Abdurrahman Marzuki (Manajer Outlet)',
                'email' => 'abdurrahmanmarzuki2@gmail.com',
                'phone' => '081269000004',
                'password' => $defaultPassword,
                'role' => UserRole::Manager->value,
                'status' => UserStatus::Active->value,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Abdurrahman Marzuki (Staf Operasional)',
                'email' => 'a.marzuki@mhs.usk.ac.id',
                'phone' => '081269000005',
                'password' => $defaultPassword,
                'role' => UserRole::Staff->value,
                'status' => UserStatus::Active->value,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Gold D. Roger (Kurir Freelance)',
                'email' => 'gold.d.rogerr7@gmail.com',
                'phone' => '081269000006',
                'password' => $defaultPassword,
                'role' => UserRole::Courier->value,
                'status' => UserStatus::Active->value,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Naruto Uzumaki (Pelanggan VIP)',
                'email' => 'uzmk.naruto19@gmail.com',
                'phone' => '081269000007',
                'password' => $defaultPassword,
                'role' => UserRole::Customer->value,
                'status' => UserStatus::Active->value,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Greyash Wolfe (Pelanggan Regular)',
                'email' => 'wolfegreyash@gmail.com',
                'phone' => '081269000009',
                'password' => $defaultPassword,
                'role' => UserRole::Customer->value,
                'status' => UserStatus::Active->value,
                'email_verified_at' => now(),
            ],
        ];

        foreach ($usersData as $u) {
            $user = User::updateOrCreate(['email' => $u['email']], $u);
            Customer::updateOrCreate(
                ['user_id' => $user->id],
                ['name' => $user->name, 'phone' => $user->phone, 'email' => $user->email]
            );
        }

        // Admin User Mappings
        $adminMap = [
            'abdurrahman.marzuki09@gmail.com' => 'SUPER_ADMIN',
            'abdurrahmanmarzuki24@gmail.com' => 'OPERATIONS_ADMIN',
            'abdur.rhmn.mrzk@gmail.com' => 'FINANCE_ADMIN',
        ];
        foreach ($adminMap as $email => $role) {
            $u = User::where('email', $email)->first();
            if ($u) {
                AdminUser::updateOrCreate(['user_id' => $u->id], ['role' => $role]);
            }
        }

        // 2. Laundry Outlet & Services (Manager: abdurrahmanmarzuki2@gmail.com)
        $manager = User::where('email', 'abdurrahmanmarzuki2@gmail.com')->first();
        $laundry = Laundry::updateOrCreate(
            ['user_id' => $manager->id],
            [
                'business_name' => 'Laundrie Express Peudada',
                'legal_name' => 'CV Laundrie Peudada Utama',
                'address_line' => 'Jl. Merdeka No. 10, Peudada, Bireuen, Aceh',
                'latitude' => 5.2000,
                'longitude' => 96.7000,
                'operating_hours' => ['open' => '07:00', 'close' => '21:00'],
                'status' => 'ACTIVE',
                'contact_phone' => '081269000004',
                'contact_email' => 'peudada@laundrie.id',
            ]
        );

        // Staff & Staff Courier (a.marzuki@mhs.usk.ac.id)
        $staffUser = User::where('email', 'a.marzuki@mhs.usk.ac.id')->first();
        Staff::updateOrCreate(
            ['user_id' => $staffUser->id, 'laundry_id' => $laundry->id],
            ['role' => 'STAFF', 'status' => 'ACTIVE']
        );
        $staffCourier = Courier::updateOrCreate(
            ['user_id' => $staffUser->id],
            [
                'laundry_id' => $laundry->id,
                'courier_type' => 'laundry_staff',
                'vehicle_type' => 'motor',
                'service_area' => ['Peudada', 'Jeunieb'],
                'status' => 'ACTIVE',
            ]
        );

        // Freelance Courier (gold.d.rogerr7@gmail.com)
        $freelanceUser = User::where('email', 'gold.d.rogerr7@gmail.com')->first();
        $freelanceCourier = Courier::updateOrCreate(
            ['user_id' => $freelanceUser->id],
            [
                'laundry_id' => null,
                'courier_type' => 'freelance',
                'vehicle_type' => 'motor',
                'service_area' => ['Banda Aceh', 'Darussalam', 'Bireuen'],
                'status' => 'ACTIVE',
            ]
        );

        // Staff Opening
        StaffOpening::updateOrCreate(
            ['laundry_id' => $laundry->id, 'title' => 'Staf Operasional Laundry'],
            ['description' => 'Dibutuhkan staf cuci & setrika full time.', 'quota' => 2, 'status' => 'OPEN']
        );

        // Services & Prices
        $service1 = Service::updateOrCreate(
            ['laundry_id' => $laundry->id, 'name' => 'Cuci Lipat Kiloan'],
            [
                'service_type' => 'LAUNDRY',
                'pricing_model' => 'PER_KG',
                'base_price' => 8000,
                'price_per_unit' => 8000,
                'unit' => 'kg',
                'minimum_charge' => 8000,
                'estimated_duration' => 24,
                'status' => 'ACTIVE',
            ]
        );
        ServicePrice::updateOrCreate(
            ['service_id' => $service1->id, 'valid_until' => null],
            ['base_price' => 8000, 'price_per_unit' => 8000, 'minimum_charge' => 8000, 'valid_from' => now()]
        );

        $service2 = Service::updateOrCreate(
            ['laundry_id' => $laundry->id, 'name' => 'Cuci Setrika Express'],
            [
                'service_type' => 'LAUNDRY',
                'pricing_model' => 'PER_KG',
                'base_price' => 12000,
                'price_per_unit' => 12000,
                'unit' => 'kg',
                'minimum_charge' => 12000,
                'estimated_duration' => 6,
                'status' => 'ACTIVE',
            ]
        );
        ServicePrice::updateOrCreate(
            ['service_id' => $service2->id, 'valid_until' => null],
            ['base_price' => 12000, 'price_per_unit' => 12000, 'minimum_charge' => 12000, 'valid_from' => now()]
        );

        // Customer Addresses
        $customerUser = User::where('email', 'uzmk.naruto19@gmail.com')->first();
        $customer = Customer::where('user_id', $customerUser->id)->first();

        $address = Address::updateOrCreate(
            ['customer_id' => $customer->id, 'label' => 'Rumah Utama'],
            [
                'recipient_name' => 'Naruto Uzumaki',
                'phone' => '081269000007',
                'address_line' => 'Jl. Syiah Kuala No. 5, Peudada, Bireuen',
                'latitude' => 5.2010,
                'longitude' => 96.7010,
                'delivery_notes' => 'Pagar warna biru',
                'is_default' => true,
                'status' => 'ACTIVE',
            ]
        );

        // 3. Platform Configurations (Super Admin Settings)
        PlatformConfig::updateOrCreate(
            ['key' => 'PLATFORM_COMMISSION_PERCENTAGE'],
            ['value' => '10', 'type' => 'integer', 'group' => 'settlement', 'description' => 'Persentase komisi platform dari setiap transaksi.']
        );
        PlatformConfig::updateOrCreate(
            ['key' => 'DEFAULT_DELIVERY_FEE'],
            ['value' => '5000', 'type' => 'integer', 'group' => 'logistics', 'description' => 'Biaya penjemputan/pengantaran standar kurir.']
        );
        PlatformConfig::updateOrCreate(
            ['key' => 'PLATFORM_SERVICE_FEE'],
            ['value' => '2000', 'type' => 'integer', 'group' => 'payment', 'description' => 'Biaya penanganan platform per order.']
        );

        // 4. Sample Orders in All Key States for Manual Testing

        // ── Order 1: PENDING_WEIGHING (Tested in web-staff) ──
        $order1 = Order::updateOrCreate(
            ['order_number' => 'ORD-TEST-1001'],
            [
                'customer_id' => $customer->id,
                'laundry_id' => $laundry->id,
                'pickup_address_id' => $address->id,
                'delivery_address_id' => $address->id,
                'status' => 'PENDING_WEIGHING',
                'scheduled_pickup_start' => now(),
                'scheduled_pickup_end' => now()->addHours(2),
                'estimated_weight' => 3.5,
                'estimated_total' => 28000,
            ]
        );
        OrderItem::updateOrCreate(
            ['order_id' => $order1->id, 'service_id' => $service1->id],
            ['quantity' => 3.5, 'unit_price' => 8000, 'estimated_amount' => 28000]
        );

        // ── Order 2: WEIGHED & INVOICED (Tested in web-customer -> Invoice & Pay) ──
        $order2 = Order::updateOrCreate(
            ['order_number' => 'ORD-TEST-1002'],
            [
                'customer_id' => $customer->id,
                'laundry_id' => $laundry->id,
                'pickup_address_id' => $address->id,
                'delivery_address_id' => $address->id,
                'status' => 'WEIGHED',
                'scheduled_pickup_start' => now(),
                'scheduled_pickup_end' => now()->addHours(2),
                'estimated_weight' => 4.0,
                'actual_weight' => 4.2,
                'estimated_total' => 33600,
                'final_total' => 33600,
            ]
        );
        OrderItem::updateOrCreate(
            ['order_id' => $order2->id, 'service_id' => $service1->id],
            ['quantity' => 4.2, 'unit_price' => 8000, 'estimated_amount' => 33600, 'final_amount' => 33600]
        );
        // Weight Evidence & Measurement
        $staffObj = Staff::where('user_id', $staffUser->id)->first();
        $wm2 = WeightMeasurement::updateOrCreate(
            ['order_id' => $order2->id],
            [
                'measurement_type' => 'actual',
                'estimated_value' => 4.00,
                'actual_value' => 4.20,
                'unit' => 'kg',
                'recorded_by' => $staffObj->id,
                'recorded_at' => now(),
                'status' => 'VERIFIED',
            ]
        );
        $we2 = WeightEvidence::updateOrCreate(
            ['order_id' => $order2->id],
            [
                'measurement_id' => $wm2->id,
                'laundry_id' => $laundry->id,
                'staff_id' => $staffObj->id,
                'weight' => 4.20,
                'unit' => 'kg',
                'photo_path' => 'evidences/weight_sample_002.jpg',
                'photo_hash' => hash('sha256', 'sample_photo_bytes_002'),
                'captured_at' => now(),
                'confirmed_at' => now(),
                'status' => 'CONFIRMED',
            ]
        );
        $wm2->update(['evidence_id' => $we2->id]);
        // Invoice
        Invoice::updateOrCreate(
            ['order_id' => $order2->id],
            [
                'invoice_number' => 'INV-202609-002',
                'subtotal' => 33600,
                'delivery_fee' => 5000,
                'platform_fee' => 2000,
                'total_amount' => 40600,
                'status' => 'UNPAID',
            ]
        );

        // ── Order 3: PAID (Tested in web-courier -> Pickup Courier Job) ──
        $order3 = Order::updateOrCreate(
            ['order_number' => 'ORD-TEST-1003'],
            [
                'customer_id' => $customer->id,
                'laundry_id' => $laundry->id,
                'pickup_address_id' => $address->id,
                'delivery_address_id' => $address->id,
                'status' => 'PAID',
                'scheduled_pickup_start' => now(),
                'scheduled_pickup_end' => now()->addHours(2),
                'estimated_weight' => 5.0,
                'actual_weight' => 5.0,
                'final_total' => 40000,
            ]
        );
        Invoice::updateOrCreate(
            ['order_id' => $order3->id],
            [
                'invoice_number' => 'INV-202609-003',
                'subtotal' => 40000,
                'delivery_fee' => 5000,
                'platform_fee' => 2000,
                'total_amount' => 47000,
                'status' => 'PAID',
                'paid_at' => now(),
            ]
        );
        Payment::updateOrCreate(
            ['order_id' => $order3->id],
            [
                'payment_number' => 'PAY-202609-003',
                'payment_type' => 'qris',
                'provider' => 'MIDTRANS',
                'provider_reference' => 'TRX-MIDTRANS-1003',
                'amount' => 47000,
                'status' => 'PAID',
                'paid_at' => now(),
            ]
        );
        CourierJob::updateOrCreate(
            ['order_id' => $order3->id, 'job_type' => 'PICKUP'],
            [
                'courier_id' => $staffCourier->id,
                'status' => 'DISPATCHED',
                'notes' => 'Jemput laundry di Rumah Utama',
            ]
        );

        // ── Order 4: READY_FOR_DELIVERY (Tested in web-courier -> Delivery Job) ──
        $order4 = Order::updateOrCreate(
            ['order_number' => 'ORD-TEST-1004'],
            [
                'customer_id' => $customer->id,
                'laundry_id' => $laundry->id,
                'pickup_address_id' => $address->id,
                'delivery_address_id' => $address->id,
                'status' => 'READY_FOR_DELIVERY',
                'scheduled_pickup_start' => now(),
                'scheduled_pickup_end' => now()->addHours(2),
                'estimated_weight' => 2.5,
                'actual_weight' => 2.5,
                'final_total' => 20000,
            ]
        );
        CourierJob::updateOrCreate(
            ['order_id' => $order4->id, 'job_type' => 'DELIVERY'],
            [
                'courier_id' => $freelanceCourier->id,
                'status' => 'DISPATCHED',
                'notes' => 'Antar pakaian bersih ke pelanggan',
            ]
        );

        // ── Order 5: COMPLETED (Tested in web-manager -> Settlement Request) ──
        $order5 = Order::updateOrCreate(
            ['order_number' => 'ORD-TEST-1005'],
            [
                'customer_id' => $customer->id,
                'laundry_id' => $laundry->id,
                'pickup_address_id' => $address->id,
                'delivery_address_id' => $address->id,
                'status' => 'COMPLETED',
                'scheduled_pickup_start' => now(),
                'scheduled_pickup_end' => now()->addHours(2),
                'estimated_weight' => 6.0,
                'actual_weight' => 6.0,
                'final_total' => 48000,
            ]
        );
        Review::updateOrCreate(
            ['order_id' => $order5->id, 'customer_id' => $customer->id],
            [
                'laundry_id' => $laundry->id,
                'courier_id' => $freelanceCourier->id,
                'laundry_rating' => 5,
                'courier_rating' => 5,
                'comment' => 'Pakaian sangat harum, pengantaran cepat tepat waktu!',
            ]
        );
        // Pending Settlement for Manager
        Settlement::updateOrCreate(
            ['settlement_number' => 'STL-202609-001'],
            [
                'laundry_id' => $laundry->id,
                'period_start' => now()->subDays(7),
                'period_end' => now(),
                'gross_amount' => 48000,
                'platform_commission' => 4800,
                'net_amount' => 43200,
                'bank_name' => 'Bank Mandiri',
                'account_number' => '1580001234567',
                'account_holder' => 'CV Laundrie Peudada Utama',
                'status' => 'PENDING',
            ]
        );

        // ── Order 6: DISPUTED (Tested in web-admin -> Arbitrase Komplain) ──
        $order6 = Order::updateOrCreate(
            ['order_number' => 'ORD-TEST-1006'],
            [
                'customer_id' => $customer->id,
                'laundry_id' => $laundry->id,
                'pickup_address_id' => $address->id,
                'delivery_address_id' => $address->id,
                'status' => 'DISPUTED',
                'scheduled_pickup_start' => now(),
                'scheduled_pickup_end' => now()->addHours(2),
                'estimated_weight' => 3.0,
                'actual_weight' => 3.0,
                'final_total' => 24000,
            ]
        );
        $complaint = Complaint::updateOrCreate(
            ['order_id' => $order6->id],
            [
                'customer_id' => $customer->id,
                'category' => 'damaged',
                'description' => 'Baju kemeja putih ada noda luntur setelah dicuci.',
                'requested_resolution' => 'REFUND',
                'status' => 'SUBMITTED',
            ]
        );
        DisputeEvidence::updateOrCreate(
            ['complaint_id' => $complaint->id],
            [
                'uploaded_by' => $customerUser->id,
                'file_path' => 'disputes/noda_kemeja_006.jpg',
                'file_hash' => hash('sha256', 'sample_dispute_photo_bytes'),
                'description' => 'Noda warna biru luntur di bagian lengan.',
            ]
        );

        // 5. Sample Audit Log
        AuditLog::create([
            'user_id' => $manager->id,
            'actor_role' => 'MANAGER',
            'action' => 'order.overridden',
            'subject_type' => 'Order',
            'subject_id' => $order1->id,
            'before_state' => ['status' => 'CREATED'],
            'after_state' => ['status' => 'PENDING_WEIGHING'],
            'justification' => 'Input manual atas permintaan khusus pelanggan di lokasi outlet.',
            'performed_at' => now(),
        ]);

        // 6. In-App Notifications
        Notification::create([
            'user_id' => $customerUser->id,
            'title' => 'Invoice Pembayaran Siap',
            'body' => 'Pesanan #ORD-TEST-1002 telah ditimbang (4.2 kg). Silakan lakukan pembayaran.',
            'type' => 'ORDER_STATUS',
            'read_at' => null,
        ]);
    }
}
